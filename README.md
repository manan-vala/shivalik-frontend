# Frontend-Shivalik

## Setup

First, create a superuser:

```bash
cd backend-shivalik
source ../.venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

## Whitelist Local Address

Then whitelist your local address:

```bash
python manage.py shell -c "from staff_auth.models import WhitelistedIP; WhitelistedIP.objects.get_or_create(ip_address='127.0.0.1')"
```
