#!/bin/bash

# Travel Booking System Deployment Script
# This script sets up the Django travel booking application

echo "🚀 Starting Travel Booking System Setup..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv .venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source .venv/Scripts/activate
else
    # macOS/Linux
    source .venv/bin/activate
fi

echo "✅ Virtual environment activated"

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Run migrations
echo "🗄️ Setting up database..."
python manage.py makemigrations
python manage.py migrate

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi

echo "✅ Database setup complete"

# Create superuser (optional)
echo "👤 Creating superuser..."
echo "You can skip this by pressing Ctrl+C"
python manage.py createsuperuser --username admin --email admin@travelbooker.com || echo "Skipping superuser creation"

# Populate sample data
echo "📊 Adding sample travel data..."
python manage.py populate_travel_data

if [ $? -ne 0 ]; then
    echo "❌ Failed to populate sample data"
    exit 1
fi

echo "✅ Sample data added"

# Collect static files (for production)
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Static files collected"

# Run tests
echo "🧪 Running tests..."
python manage.py test

if [ $? -ne 0 ]; then
    echo "⚠️ Some tests failed, but setup can continue"
else
    echo "✅ All tests passed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  python manage.py runserver"
echo ""
echo "Then visit: http://127.0.0.1:8000"
echo ""
echo "Admin panel: http://127.0.0.1:8000/admin"
echo "Username: admin"
echo ""
echo "📚 Check README.md for more information"
echo ""
echo "Happy coding! 🚀"
