# run_server.ps1 starts Django backend and Next.js frontend
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
Write-Host "Starting Velqor dev servers..." -ForegroundColor Yellow

# Backend
$backend = Join-Path $root "backend"
Push-Location $backend

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtualenv..." -ForegroundColor Yellow
    python -m venv venv
}
$python = Join-Path $backend "venv\Scripts\python.exe"
if (-not (Test-Path $python)) { $python = "python" }

$req = Join-Path $backend "requirements.txt"
$marker = Join-Path $backend ".venv_installed"
$installBack = $true
if (Test-Path $marker) {
    if ((Get-Item $req).LastWriteTime -le (Get-Item $marker).LastWriteTime) { $installBack = $false }
}
if ($installBack) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    & $python -m pip install -r $req
    New-Item -ItemType File -Path $marker -Force | Out-Null
} else {
    Write-Host "Backend dependencies already installed" -ForegroundColor Green
}

Write-Host "Starting Django on http://127.0.0.1:8000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$backend`"; & `"$python`" manage.py runserver 127.0.0.1:8000"

# Frontend
Pop-Location
$frontend = Join-Path $root "frontend"
Push-Location $frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}

Write-Host "Starting Next.js on http://localhost:3000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$frontend`"; npm run dev"
Write-Host "Both servers launched in separate windows." -ForegroundColor Green
