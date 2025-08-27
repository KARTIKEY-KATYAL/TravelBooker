from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search_results, name='search_results'),
    path('travel/<str:travel_id>/', views.travel_option_detail, name='travel_detail'),
    path('book/<str:travel_id>/', views.book_travel, name='book_travel'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('booking/<str:booking_id>/', views.booking_detail, name='booking_detail'),
    path('booking/<str:booking_id>/cancel/', views.cancel_booking, name='cancel_booking'),
    path('api/travel-options/', views.api_travel_options, name='api_travel_options'),
]
