from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import TravelOption, Booking
from .forms import BookingForm, TravelSearchForm
import uuid

def home(request):
    """Home page with search form"""
    form = TravelSearchForm()
    featured_options = TravelOption.objects.filter(
        status='active',
        departure_date__gte=timezone.now().date()
    )[:6]
    
    context = {
        'form': form,
        'featured_options': featured_options,
    }
    return render(request, 'bookings/home.html', context)

def search_results(request):
    """Search and filter travel options"""
    form = TravelSearchForm(request.GET)
    travel_options = TravelOption.objects.filter(
        status='active',
        departure_date__gte=timezone.now().date()
    )
    
    # Apply filters
    if form.is_valid():
        if form.cleaned_data['source']:
            travel_options = travel_options.filter(
                source__icontains=form.cleaned_data['source']
            )
        if form.cleaned_data['destination']:
            travel_options = travel_options.filter(
                destination__icontains=form.cleaned_data['destination']
            )
        if form.cleaned_data['departure_date']:
            travel_options = travel_options.filter(
                departure_date=form.cleaned_data['departure_date']
            )
        if form.cleaned_data['travel_type']:
            travel_options = travel_options.filter(
                travel_type=form.cleaned_data['travel_type']
            )
        if form.cleaned_data['max_price']:
            travel_options = travel_options.filter(
                price__lte=form.cleaned_data['max_price']
            )
    
    # Pagination
    paginator = Paginator(travel_options, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'form': form,
        'page_obj': page_obj,
        'travel_options': page_obj,
    }
    return render(request, 'bookings/search_results.html', context)

def travel_option_detail(request, travel_id):
    """Detail view for a travel option"""
    travel_option = get_object_or_404(TravelOption, travel_id=travel_id, status='active')
    
    context = {
        'travel_option': travel_option,
    }
    return render(request, 'bookings/travel_detail.html', context)

@login_required
def book_travel(request, travel_id):
    """Handle travel booking"""
    travel_option = get_object_or_404(TravelOption, travel_id=travel_id, status='active')

    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.user = request.user
            booking.travel_option = travel_option
            booking.total_price = booking.number_of_seats * travel_option.price

            if booking.number_of_seats > travel_option.available_seats:
                messages.error(request, 'Not enough seats available.')
                return render(request, 'bookings/book_travel.html', {
                    'form': form,
                    'travel_option': travel_option,
                })

            # Update available seats
            travel_option.available_seats -= booking.number_of_seats
            travel_option.save()

            booking.booking_id = str(uuid.uuid4())
            booking.save()

            messages.success(request, 'Booking confirmed!')
            return redirect('bookings:booking_detail', booking_id=booking.booking_id)
    else:
        form = BookingForm()

    context = {
        'form': form,
        'travel_option': travel_option,
    }
    return render(request, 'bookings/book_travel.html', context)

@login_required
def dashboard(request):
    """User dashboard with bookings"""
    bookings = Booking.objects.filter(user=request.user)
    upcoming_bookings = bookings.filter(
        travel_option__departure_date__gte=timezone.now().date(),
        status='confirmed'
    )
    past_bookings = bookings.filter(
        travel_option__departure_date__lt=timezone.now().date()
    )
    
    context = {
        'upcoming_bookings': upcoming_bookings,
        'past_bookings': past_bookings,
        'total_bookings': bookings.count(),
    }
    return render(request, 'bookings/dashboard.html', context)

@login_required
def booking_detail(request, booking_id):
    """Detail view for a booking"""
    booking = get_object_or_404(Booking, booking_id=booking_id, user=request.user)
    
    context = {
        'booking': booking,
    }
    return render(request, 'bookings/booking_detail.html', context)

@login_required
@require_POST
def cancel_booking(request, booking_id):
    """Cancel a booking"""
    booking = get_object_or_404(Booking, booking_id=booking_id, user=request.user)
    
    if not booking.can_cancel():
        messages.error(request, 'This booking cannot be cancelled.')
        return redirect('bookings:booking_detail', booking_id=booking_id)
    
    # Cancel booking and restore seats
    booking.status = 'cancelled'
    booking.save()
    
    travel_option = booking.travel_option
    travel_option.available_seats += booking.number_of_seats
    travel_option.save()
    
    messages.success(request, 'Booking cancelled successfully.')
    return redirect('bookings:dashboard')

def api_travel_options(request):
    """API endpoint for travel options (for AJAX calls)"""
    source = request.GET.get('source', '')
    destination = request.GET.get('destination', '')
    departure_date = request.GET.get('departure_date', '')
    
    travel_options = TravelOption.objects.filter(
        status='active',
        departure_date__gte=timezone.now().date()
    )
    
    if source:
        travel_options = travel_options.filter(source__icontains=source)
    if destination:
        travel_options = travel_options.filter(destination__icontains=destination)
    if departure_date:
        travel_options = travel_options.filter(departure_date=departure_date)
    
    data = []
    for option in travel_options[:20]:  # Limit results
        data.append({
            'travel_id': option.travel_id,
            'travel_type': option.get_travel_type_display(),
            'source': option.source,
            'destination': option.destination,
            'departure_date': option.departure_date.strftime('%Y-%m-%d'),
            'departure_time': option.departure_time.strftime('%H:%M'),
            'price': str(option.price),
            'available_seats': option.available_seats,
        })
    
    return JsonResponse({'travel_options': data})
