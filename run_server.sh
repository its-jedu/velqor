#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Velqor dev servers...${NC}"

# --- Backend ---
cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
  echo -e "${YELLOW}Creating Python virtualenv...${NC}"
  python3 -m venv venv
fi

# Activate venv
# shellcheck source=/dev/null
source venv/bin/activate

# Install deps only if requirements.txt changed or venv is fresh
if [ ! -f ".venv_installed" ] || [ "requirements.txt" -nt ".venv_installed" ]; then
  echo -e "${YELLOW}Installing backend dependencies...${NC}"
  pip install -r requirements.txt
  touch .venv_installed
else
  echo -e "${GREEN}Backend dependencies already installed${NC}"
fi

# Start Django in background
echo -e "${GREEN}Starting Django on http://127.0.0.1:8000${NC}"
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# --- Frontend ---
cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
else
  echo -e "${GREEN}Frontend dependencies already installed${NC}"
fi

echo -e "${GREEN}Starting Next.js on http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for both
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait $BACKEND_PID $FRONTEND_PID
