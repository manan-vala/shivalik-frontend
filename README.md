# Frontend-Shivalik
To start first create a superuser
cd backend-shivalik
source ../.venv/bin/activate
python manage.py migrate
python manage.py createsuperuser

Then whitelist your local adress

python manage.py shell -c "from staff_auth.models import WhitelistedIP; WhitelistedIP.objects.get_or_create(ip_address='127.0.0.1')"
