@echo off
REM Travel Booking System Deployment Script for Windows
REM This script sets up the Django travel booking application

echo 🚀 Starting Travel Booking System Setup...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv .venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

echo ✅ Virtual environment activated

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Run migrations
echo 🗄️ Setting up database...
python manage.py makemigrations
python manage.py migrate

if errorlevel 1 (
    echo ❌ Failed to run migrations
    pause
    exit /b 1
)

echo ✅ Database setup complete

REM Create superuser
echo 👤 Creating superuser...
echo You can skip this by pressing Ctrl+C
python manage.py createsuperuser --username admin --email admin@travelbooker.com

REM Populate sample data
echo 📊 Adding sample travel data...
python manage.py populate_travel_data

if errorlevel 1 (
    echo ❌ Failed to populate sample data
    pause
    exit /b 1
)

echo ✅ Sample data added

REM Collect static files
echo 🎨 Collecting static files...
python manage.py collectstatic --noinput

echo ✅ Static files collected

REM Run tests
echo 🧪 Running tests...
python manage.py test

if errorlevel 1 (
    echo ⚠️ Some tests failed, but setup can continue
) else (
    echo ✅ All tests passed
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   python manage.py runserver
echo.
echo Then visit: http://127.0.0.1:8000
echo.
echo Admin panel: http://127.0.0.1:8000/admin
echo Username: admin
echo.
echo 📚 Check README.md for more information
echo.
echo Happy coding! 🚀
pause
