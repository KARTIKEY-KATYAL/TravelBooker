from django.core.management.base import BaseCommand
from bookings.models import TravelOption
from datetime import datetime, timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate the database with dummy travel options'

    def handle(self, *args, **kwargs):
        # Clear existing data
        TravelOption.objects.all().delete()

        # Create dummy travel options
        travel_options = [
            {
                'travel_id': 'FL123',
                'travel_type': 'flight',
                'source': 'New York',
                'destination': 'Los Angeles',
                'departure_date': datetime.now().date() + timedelta(days=1),
                'departure_time': '10:00:00',
                'arrival_date': datetime.now().date() + timedelta(days=1),
                'arrival_time': '13:00:00',
                'price': Decimal('299.99'),
                'available_seats': 50,
                'total_seats': 100,
                'status': 'active',
            },
            {
                'travel_id': 'TR456',
                'travel_type': 'train',
                'source': 'Chicago',
                'destination': 'San Francisco',
                'departure_date': datetime.now().date() + timedelta(days=2),
                'departure_time': '08:00:00',
                'arrival_date': datetime.now().date() + timedelta(days=2),
                'arrival_time': '20:00:00',
                'price': Decimal('199.99'),
                'available_seats': 75,
                'total_seats': 150,
                'status': 'active',
            },
        ]

        for option in travel_options:
            TravelOption.objects.create(**option)

        self.stdout.write(self.style.SUCCESS('Successfully added dummy travel options!'))
