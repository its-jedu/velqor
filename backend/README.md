# Velqor Backend – Django DRF

Production-ready backend for Velqor eSports tournament platform. Authentication, roles & permissions, admin panel and secure password flows built with Django 5 + Django REST Framework, PostgreSQL, SimpleJWT, django-axes, drf-spectacular.

## Project structure
```
back/
├─ config/                 # Django project settings, urls
├─ authentication/         # Users, auth, roles & permissions
│  ├─ permissions.py       # RoleChoices + DRF permission classes
│  ├─ models.py            # User, Role, Permission
│  ├─ serializers.py       # Register, Login, Forgot/Reset/Change password
│  ├─ views.py             # Register, Login, Me, Logout, Forgot, Reset, Change
│  └─ urls.py
├─ adminpanel/             # Admin-only management APIs
│  ├─ permissions.py       # IsAdminUser, IsModeratorOrAdmin
│  ├─ serializers.py       # UserAdmin, Role, Permission
│  ├─ views.py             # Users/Roles/Permissions CRUD + dashboards
│  └─ urls.py
├─ requirements.txt
├─ .env.example
├─ .env
└─ manage.py
```

## Features implemented

### Authentication
* `POST /api/v1/auth/register/` – create player account, JWT returned
* `POST /api/v1/auth/login/` – email/password, JWT pair
* `GET /api/v1/auth/me/` – current user
* `POST /api/v1/auth/logout/`
* `POST /api/v1/auth/forgot-password/` – unauthenticated, email only, sends reset link via Resend SMTP
* `POST /api/v1/auth/reset-password/` – uid + token + new_password + confirm, sets password
* `PATCH /api/v1/auth/change-password/` – authenticated, current + new + confirm

### Roles & Permissions
* Centralised `authentication/permissions.RoleChoices` : `player`, `admin`, `moderator`
* DRF permission classes: `IsAdmin`, `IsModeratorOrAdmin`, `IsAuthenticatedPlayer`, `IsOwnerOrAdmin`
* Models: `User`, `Role`, `Permission` with M2M Role ↔ Permission

### Security
* PostgreSQL via `python-decouple`
* Django REST Framework throttling: anon 100/min, user 1000/min
* django-axes brute force protection: 5 failures → 30 min lockout
* SimpleJWT: access 15m, refresh 7d, rotate + blacklist
* CORS, Helmet style middleware, custom exception handler
* Password validators enforced

### Admin Panel
All under `/api/v1/adminpanel/` – `IsAuthenticated + IsAdminUser`

* `GET /dashboard/` – admin welcome
* `GET /moderator/` – moderator/admin area
* Users CRUD
  * `GET /users/` – list
  * `POST /users/` – create admin/user without password → email sent to set password via Forgot Password
  * `GET/PATCH/DELETE /users/<id>/`
* Roles CRUD
  * `GET/POST /roles/` , `GET/PATCH/DELETE /roles/<id>/`
* Permissions CRUD
  * `GET/POST /permissions/` , `GET/PATCH/DELETE /permissions/<id>/`
  * Permissions can be assigned to roles via `roles` M2M

Creating an admin without password triggers email:
> Your Velqor admin account has been created. Please use Forgot Password to set your password.

### Email
SMTP via Resend:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=noreply@novaedgefinance.com
FRONTEND_URL=http://localhost:3000
```

OpenAPI docs:
* Schema: `GET /api/schema/`
* Swagger UI: `GET /api/docs/`

## First time setup

1. **Create virtual environment**
```powershell
cd C:\Users\user\Documents\jedu\velqor\back
python -m venv venv
.\venv\Scripts\activate
```

2. **Install dependencies**
```powershell
pip install -r requirements.txt
```

3. **Configure environment**
Copy `.env.example` to `.env` and fill values:
```
DEBUG=True
SECRET_KEY=...
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=velqor
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
EMAIL_BACKEND=...
```
Email settings as above.

4. **Run migrations**
```powershell
python manage.py makemigrations authentication adminpanel
python manage.py migrate
```

5. **Create superuser**
```powershell
python manage.py createsuperuser
```

6. **Run dev server**
```powershell
python manage.py runserver
```
API base: `http://127.0.0.1:8000/api/v1/`

## Authentication flow

Register → login → JWT in Authorization: Bearer <access>
Forgot password → email with reset link → POST reset-password with uid/token/new password
Change password → authenticated PATCH with current/new/confirm

## Admin workflow

Login as admin → `POST /api/v1/adminpanel/users/` to create new admin without password → admin receives email to reset password → admin can manage roles/permissions via `/api/v1/adminpanel/roles/` and `/api/v1/adminpanel/permissions/`

## Testing endpoints

Use Swagger at `/api/docs/` or curl/Postman.

Example login:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@example.com","password":"secret"}'
```

Example forgot password:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/forgot-password/ \
 -H "Content-Type: application/json" \
 -d '{"email":"user@example.com"}'
```

Next steps: wallet, tournaments, matches, payouts.
