from django.contrib import admin
from .models import TravelOption, Booking, UserProfile

@admin.register(TravelOption)
class TravelOptionAdmin(admin.ModelAdmin):
    list_display = ['travel_id', 'travel_type', 'source', 'destination', 
                   'departure_date', 'departure_time', 'price', 'available_seats', 'status']
    list_filter = ['travel_type', 'status', 'departure_date']
    search_fields = ['travel_id', 'source', 'destination']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('travel_id', 'travel_type', 'status')
        }),
        ('Route Details', {
            'fields': ('source', 'destination')
        }),
        ('Schedule', {
            'fields': ('departure_date', 'departure_time', 'arrival_date', 'arrival_time')
        }),
        ('Pricing & Capacity', {
            'fields': ('price', 'total_seats', 'available_seats')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'user', 'travel_option', 'number_of_seats', 
                   'total_price', 'status', 'booking_date']
    list_filter = ['status', 'booking_date', 'travel_option__travel_type']
    search_fields = ['booking_id', 'user__username', 'passenger_name', 'passenger_email']
    readonly_fields = ['booking_id', 'booking_date', 'updated_at', 'total_price']
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'user', 'travel_option', 'status')
        }),
        ('Booking Details', {
            'fields': ('number_of_seats', 'total_price')
        }),
        ('Passenger Information', {
            'fields': ('passenger_name', 'passenger_email', 'passenger_phone')
        }),
        ('Timestamps', {
            'fields': ('booking_date', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'date_of_birth']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
