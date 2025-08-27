# Travel Booking System

A comprehensive Django-based travel booking web application that allows users to search, book, and manage travel options including flights, trains, and buses.

## Features

### User Management
- User registration and authentication
- User profile management
- Password change functionality
- Secure login/logout system

### Travel Options
- Browse available travel options (flights, trains, buses)
- Advanced search and filtering capabilities
- Detailed travel information display
- Real-time seat availability

### Booking System
- Easy booking process with form validation
- Booking confirmation and management
- Booking history and status tracking
- Cancellation functionality (before departure date)

### Dashboard
- User-friendly dashboard with booking statistics
- Upcoming and past travel management
- Quick actions for common tasks

### Additional Features
- Responsive design for all devices
- Print-friendly booking confirmations
- Search autocomplete for cities
- Modern, clean UI with Bootstrap 5
- AJAX functionality for enhanced user experience

## Technology Stack

- **Backend**: Django 5.2.5
- **Database**: SQLite (development) / MySQL (production)
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Icons**: Font Awesome 6
- **Authentication**: Django built-in auth system

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TravelBooker
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   
   # On Windows
   .venv\Scripts\activate
   
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install django djangorestframework mysqlclient pillow python-decouple
   ```

4. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Populate with sample data**
   ```bash
   python manage.py populate_travel_data
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```

9. **Access the application**
   - Main site: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

### MySQL Configuration (Production)

For production deployment with MySQL:

1. **Install MySQL and create database**
   ```sql
   CREATE DATABASE travel_booking_db;
   CREATE USER 'travel_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON travel_booking_db.* TO 'travel_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Update settings.py**
   Uncomment the MySQL configuration in `travel_booking/settings.py` and update with your credentials.

3. **Install MySQL client**
   ```bash
   pip install mysqlclient
   ```

## Project Structure

```
TravelBooker/
├── travel_booking/          # Project configuration
│   ├── __init__.py
│   ├── settings.py         # Django settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI configuration
├── bookings/              # Main booking app
│   ├── models.py          # Database models
│   ├── views.py           # View functions
│   ├── forms.py           # Django forms
│   ├── admin.py           # Admin configuration
│   ├── urls.py            # App URL patterns
│   └── management/        # Custom management commands
├── accounts/              # User management app
│   ├── views.py           # User-related views
│   └── urls.py            # Account URL patterns
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── bookings/          # Booking templates
│   ├── accounts/          # Account templates
│   └── registration/      # Auth templates
├── static/                # Static files
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript files
├── media/                 # User uploaded files
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Usage

### For Users

1. **Registration/Login**
   - Create an account or login with existing credentials
   - Update profile information in the profile section

2. **Searching Travel Options**
   - Use the search form on the homepage
   - Apply filters for travel type, date, price, etc.
   - View detailed information for each travel option

3. **Booking Process**
   - Select a travel option and click "Book Now"
   - Fill in passenger details and number of seats
   - Review and confirm booking
   - Receive booking confirmation

4. **Managing Bookings**
   - View all bookings in the dashboard
   - Check booking details and status
   - Cancel bookings (if eligible)
   - Print or download booking confirmations

### For Administrators

1. **Admin Panel Access**
   - Login to `/admin/` with superuser credentials
   - Manage users, travel options, and bookings

2. **Adding Travel Options**
   - Use the admin panel to add new travel options
   - Set pricing, schedules, and availability

3. **Managing Bookings**
   - View and modify booking statuses
   - Handle cancellations and refunds

## API Endpoints

The application includes RESTful API endpoints:

- `GET /api/travel-options/` - List travel options with filters
- Travel option details and booking status via AJAX

## Testing

Run the test suite:
```bash
python manage.py test
```

## Deployment

### AWS Deployment

1. **Create EC2 instance** with Ubuntu/Amazon Linux
2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx mysql-server
   ```
3. **Configure database and environment**
4. **Set up Gunicorn and Nginx**
5. **Configure static files serving**

### PythonAnywhere Deployment

1. **Upload code** to PythonAnywhere
2. **Create web app** with Django
3. **Configure database** in settings
4. **Set up static files** mapping
5. **Run migrations** in console

## Security Features

- CSRF protection on all forms
- SQL injection prevention through Django ORM
- XSS protection with template escaping
- Secure authentication system
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue in the repository
- Contact: admin@travelbooker.com

## Screenshots

### Homepage
- Clean, modern interface with search functionality
- Featured travel options
- Responsive design

### Search Results
- Advanced filtering options
- Detailed travel information
- Easy booking process

### Dashboard
- User-friendly booking management
- Statistics and quick actions
- Booking history

### Booking Process
- Step-by-step booking form
- Real-time price calculation
- Secure confirmation process

## Future Enhancements

- Payment gateway integration
- Email notifications
- Mobile app development
- Multi-language support
- Advanced analytics dashboard
- Integration with external travel APIs
