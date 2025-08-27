from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import date, time, timedelta
from decimal import Decimal
from bookings.models import TravelOption, Booking, UserProfile

class TravelBookingTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = Client()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create user profile
        self.profile = UserProfile.objects.create(user=self.user)
        
        # Create test travel option
        self.travel_option = TravelOption.objects.create(
            travel_id='FL1234',
            travel_type='flight',
            source='New York',
            destination='Los Angeles',
            departure_date=date.today() + timedelta(days=1),  # Tomorrow
            departure_time=time(10, 0),
            arrival_date=date.today() + timedelta(days=1),    # Tomorrow
            arrival_time=time(13, 0),
            price=Decimal('299.99'),
            available_seats=50,
            total_seats=100,
            status='active'
        )

    def test_home_page(self):
        """Test home page loads correctly"""
        response = self.client.get(reverse('bookings:home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'TravelBooker')

    def test_search_results(self):
        """Test search functionality"""
        response = self.client.get(reverse('bookings:search_results'))
        self.assertEqual(response.status_code, 200)
        
        # Test with search parameters
        response = self.client.get(reverse('bookings:search_results'), {
            'source': 'New York',
            'destination': 'Los Angeles'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'FL1234')

    def test_travel_detail(self):
        """Test travel option detail page"""
        response = self.client.get(
            reverse('bookings:travel_detail', args=[self.travel_option.travel_id])
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'New York')
        self.assertContains(response, 'Los Angeles')

    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post(reverse('accounts:register'), {
            'username': 'newuser',
            'password1': 'complexpass123',
            'password2': 'complexpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful registration
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        """Test user login"""
        response = self.client.post(reverse('accounts:login'), {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful login

    def test_booking_creation(self):
        """Test booking creation"""
        self.client.login(username='testuser', password='testpass123')
        
        response = self.client.post(
            reverse('bookings:book_travel', args=[self.travel_option.travel_id]),
            {
                'number_of_seats': 2,
                'passenger_name': 'John Doe',
                'passenger_email': 'john@example.com',
                'passenger_phone': '1234567890'
            }
        )
        
        # Should redirect to booking detail page after successful booking
        self.assertEqual(response.status_code, 302)
        
        # Check if booking was created
        booking = Booking.objects.filter(user=self.user).first()
        self.assertIsNotNone(booking)
        self.assertEqual(booking.number_of_seats, 2)
        self.assertEqual(booking.passenger_name, 'John Doe')

    def test_dashboard_access(self):
        """Test dashboard access for logged in user"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('bookings:dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Welcome back')

    def test_dashboard_redirect_for_anonymous(self):
        """Test dashboard redirects for anonymous users"""
        response = self.client.get(reverse('bookings:dashboard'))
        self.assertEqual(response.status_code, 302)  # Redirect to login

    def test_travel_option_model(self):
        """Test TravelOption model methods"""
        self.assertTrue(self.travel_option.is_available())
        duration = self.travel_option.get_duration()
        self.assertIsNotNone(duration)

    def test_booking_model(self):
        """Test Booking model methods"""
        booking = Booking.objects.create(
            user=self.user,
            travel_option=self.travel_option,
            number_of_seats=1,
            passenger_name='Test Passenger',
            passenger_email='passenger@example.com',
            passenger_phone='1234567890'
        )
        
        self.assertIsNotNone(booking.booking_id)
        self.assertEqual(booking.total_price, self.travel_option.price)
        self.assertTrue(booking.can_cancel())

    def test_book_travel(self):
        """Test booking a travel option"""
        self.client.login(username='testuser', password='testpass123')

        # Valid booking
        response = self.client.post(reverse('bookings:book_travel', args=[self.travel_option.travel_id]), {
            'number_of_seats': 2,
            'passenger_name': 'John Doe',
            'passenger_email': 'johndoe@example.com',
            'passenger_phone': '1234567890'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful booking
        self.assertEqual(Booking.objects.count(), 1)
        booking = Booking.objects.first()
        self.assertEqual(booking.number_of_seats, 2)
        self.assertEqual(booking.total_price, self.travel_option.price * 2)
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.travel_option, self.travel_option)

        # Invalid booking (exceeding available seats)
        response = self.client.post(reverse('bookings:book_travel', args=[self.travel_option.travel_id]), {
            'number_of_seats': 100,
            'passenger_name': 'Jane Doe',
            'passenger_email': 'janedoe@example.com',
            'passenger_phone': '0987654321'
        })
        self.assertEqual(response.status_code, 200)  # Form re-rendered with errors
        self.assertContains(response, 'Not enough seats available.')
        self.assertEqual(Booking.objects.count(), 1)  # No new booking created

class TravelOptionModelTest(TestCase):
    def test_travel_option_creation(self):
        """Test creating a travel option"""
        travel_option = TravelOption.objects.create(
            travel_id='TR5678',
            travel_type='train',
            source='Chicago',
            destination='Denver',
            departure_date=date.today(),
            departure_time=time(9, 0),
            arrival_date=date.today(),
            arrival_time=time(17, 0),
            price=Decimal('149.99'),
            available_seats=80,
            total_seats=120,
            status='active'
        )
        
        self.assertEqual(str(travel_option), 'TR5678 - Chicago to Denver')
        self.assertTrue(travel_option.is_available())

class BookingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='bookinguser',
            email='booking@example.com',
            password='pass123'
        )
        
        self.travel_option = TravelOption.objects.create(
            travel_id='BU9999',
            travel_type='bus',
            source='Miami',
            destination='Orlando',
            departure_date=date.today(),
            departure_time=time(8, 0),
            arrival_date=date.today(),
            arrival_time=time(12, 0),
            price=Decimal('49.99'),
            available_seats=30,
            total_seats=40,
            status='active'
        )

    def test_booking_creation_and_id_generation(self):
        """Test booking creation and automatic ID generation"""
        booking = Booking.objects.create(
            user=self.user,
            travel_option=self.travel_option,
            number_of_seats=2,
            passenger_name='Jane Smith',
            passenger_email='jane@example.com',
            passenger_phone='9876543210'
        )
        
        self.assertIsNotNone(booking.booking_id)
        self.assertTrue(booking.booking_id.startswith('BK'))
        self.assertEqual(booking.total_price, Decimal('99.98'))  # 2 * 49.99

    def test_booking_string_representation(self):
        """Test booking string representation"""
        booking = Booking.objects.create(
            user=self.user,
            travel_option=self.travel_option,
            number_of_seats=1,
            passenger_name='Test User',
            passenger_email='test@example.com',
            passenger_phone='1111111111'
        )
        
        expected_str = f"Booking {booking.booking_id} - {self.user.username}"
        self.assertEqual(str(booking), expected_str)
