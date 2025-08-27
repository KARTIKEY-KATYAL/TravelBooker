from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta, time
from decimal import Decimal
import random
from bookings.models import TravelOption

class Command(BaseCommand):
    help = 'Populate the database with sample travel options'

    def handle(self, *args, **options):
        # Clear existing travel options
        TravelOption.objects.all().delete()
        
        # Sample cities
        cities = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
            'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
            'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
            'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
            'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
            'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore'
        ]
        
        travel_types = ['flight', 'train', 'bus']
        
        # Generate travel options for the next 60 days
        start_date = timezone.now().date()
        
        travel_options = []
        for i in range(200):  # Create 200 travel options
            # Random source and destination (different cities)
            source = random.choice(cities)
            destination = random.choice([city for city in cities if city != source])
            
            # Random date within next 60 days
            departure_date = start_date + timedelta(days=random.randint(0, 60))
            
            # Random departure time
            departure_hour = random.randint(6, 23)
            departure_minute = random.choice([0, 15, 30, 45])
            departure_time = time(departure_hour, departure_minute)
            
            # Calculate arrival time (2-12 hours later depending on travel type)
            travel_type = random.choice(travel_types)
            if travel_type == 'flight':
                duration_hours = random.randint(1, 6)
            elif travel_type == 'train':
                duration_hours = random.randint(3, 12)
            else:  # bus
                duration_hours = random.randint(4, 15)
            
            departure_datetime = datetime.combine(departure_date, departure_time)
            arrival_datetime = departure_datetime + timedelta(hours=duration_hours, minutes=random.randint(0, 59))
            arrival_date = arrival_datetime.date()
            arrival_time = arrival_datetime.time()
            
            # Random pricing based on travel type
            if travel_type == 'flight':
                base_price = random.randint(150, 800)
            elif travel_type == 'train':
                base_price = random.randint(50, 300)
            else:  # bus
                base_price = random.randint(25, 150)
            
            price = Decimal(str(base_price + random.randint(-20, 50)))
            
            # Random seat configuration
            if travel_type == 'flight':
                total_seats = random.choice([120, 150, 180, 220, 300])
            elif travel_type == 'train':
                total_seats = random.choice([200, 300, 400, 500])
            else:  # bus
                total_seats = random.choice([30, 40, 50, 55])
            
            # Random availability (70-100% of total seats)
            available_seats = random.randint(int(total_seats * 0.7), total_seats)
            
            # Generate unique travel ID
            travel_id = f"{travel_type.upper()[:2]}{random.randint(1000, 9999)}"
            while TravelOption.objects.filter(travel_id=travel_id).exists():
                travel_id = f"{travel_type.upper()[:2]}{random.randint(1000, 9999)}"
            
            travel_option = TravelOption(
                travel_id=travel_id,
                travel_type=travel_type,
                source=source,
                destination=destination,
                departure_date=departure_date,
                departure_time=departure_time,
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                price=price,
                available_seats=available_seats,
                total_seats=total_seats,
                status='active'
            )
            
            travel_options.append(travel_option)
        
        # Bulk create all travel options
        TravelOption.objects.bulk_create(travel_options)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(travel_options)} travel options')
        )
        
        # Print some statistics
        flights = TravelOption.objects.filter(travel_type='flight').count()
        trains = TravelOption.objects.filter(travel_type='train').count()
        buses = TravelOption.objects.filter(travel_type='bus').count()
        
        self.stdout.write(f'Created:')
        self.stdout.write(f'  - {flights} flights')
        self.stdout.write(f'  - {trains} trains')
        self.stdout.write(f'  - {buses} buses')
