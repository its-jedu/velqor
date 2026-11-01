# Velqor

eSports tournament platform with real-money prizes.

## Project structure
```
velqor/
├─ backend/     # Django DRF backend – auth, roles/permissions, admin API
├─ frontend/    # Next.js frontend
└─ run_server.ps1 / run_server.sh  # one-command dev launcher
```

## First time setup

1. **Create your own branch**
   ```bash
   git checkout -b feature/your-name-<short-desc>
   ```
   Never work on `main`. Create a new branch for your work and open a PR when ready.

2. **Backend dependencies**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env   # fill DATABASE_URL, RESEND_API_KEY, AWS R2 vars, FRONTEND_URL
   ```

3. **Frontend dependencies**
   ```powershell
   cd ../frontend
   npm install
   ```

4. **Run everything**
   ```powershell
   cd ..
   .\run_server
   ```
   or bash:
   ```bash
   ./run_server
   ```
   The script will install missing deps once and start:
   * Django on http://127.0.0.1:8000
   * Next.js on http://localhost:3000

## API bases
* Base Api: `http://127.0.0.1:8000`

All IDs are UUIDs. Admin creation is done via `POST /api/v1/admin/users/` by a superadmin. New admins receive a set-password email link – no password is set at creation.

## Expectations for contributors
* Create a feature branch from `main` using `feature/your-name-<desc>` naming.
* Keep backend and frontend changes separate and test locally with `run_server.ps1`.
* Never commit secrets. Use `.env` locally.
* Admin actions require JWT `Authorization: Bearer <access>`.
* Role-based access is enforced – only superadmin can create other admins; moderators are just a Role with assigned Permissions.
* Run `python manage.py check` and migrations before pushing.

## Core values
Security, efficiency, and role-based access control.
