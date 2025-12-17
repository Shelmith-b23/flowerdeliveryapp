#!/usr/bin/env bash
set -euo pipefail

# Run the backend locally with a Docker Postgres, migrations and seed.
# Usage: ./run_local.sh [--no-docker] (default is to start Docker Compose)

BASEDIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$BASEDIR"

NO_DOCKER=0
if [[ ${1:-} == "--no-docker" ]]; then
  NO_DOCKER=1
fi

source venv/bin/activate 2>/dev/null || true

if [ $NO_DOCKER -eq 0 ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker isn't installed or not on PATH. Run with --no-docker to skip starting DB container."
    exit 1
  fi
  echo "Starting DB via Docker Compose..."
  docker compose up -d db
  echo "Waiting for Postgres to become available..."
  # Check health endpoint via 'docker compose exec' so it works with compose-managed containers
  until docker compose exec db pg_isready -U "${POSTGRES_USER:-appuser}" -d "${POSTGRES_DB:-flower_delivery}" >/dev/null 2>&1; do
    sleep 1
    echo -n '.'
  done
  echo "Postgres is available."
fi

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

export DATABASE_URL=${DATABASE_URL:-"postgresql://appuser:your_password@localhost:5432/flower_delivery"}
export SECRET_KEY=${SECRET_KEY:-"dev_secret"}

echo "Using DATABASE_URL=$DATABASE_URL"

if [ ! -d venv ]; then
  echo "Creating Python venv and installing dependencies..."
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
else
  # If venv exists, activate it
  source venv/bin/activate || true
fi

# Ensure key packages installed (avoid subtle runtime failures)
if ! ./venv/bin/python -c "import importlib.util, sys; sys.exit(0) if importlib.util.find_spec('flask_sqlalchemy') else sys.exit(1)"; then
  echo "Some backend packages appear missing; installing requirements..."
  ./venv/bin/pip install -r requirements.txt
fi

export FLASK_APP=run.py

# Default backend port and host
PORT=${PORT:-5000}
HOST=${HOST:-127.0.0.1}

# If migrations is a file (unlikely) rename it to avoid conflict
if [ -f migrations ] && [ ! -d migrations ]; then
  echo "Renaming stray 'migrations' file to 'migrations.bak'"
  mv migrations migrations.bak
fi

echo "Running migrations..."
# `migrations` can be a stray file or missing; handle both cases.
if [ -f migrations ] && [ ! -d migrations ]; then
  echo "Renaming stray 'migrations' file to 'migrations.bak'"
  mv migrations migrations.bak
fi
if [ ! -d migrations ]; then
  echo "migrations directory missing; initializing a new migration folder"
  flask db init || true
  flask db migrate -m "initial" || true
fi
flask db upgrade || true

if [ -f seed_data.sql ]; then
  if [[ $DATABASE_URL == sqlite* ]]; then
    sqlite3 ${DATABASE_URL#sqlite:///} < seed_data.sql || true
  else
    psql "$DATABASE_URL" -f seed_data.sql || true
  fi
fi

# Ensure no leftover process is listening on the port (avoid defunct/reloader conflicts)
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN || true)
else
  PIDS=""
fi
if [ -n "$PIDS" ]; then
  echo "Found existing process(es) on port $PORT: $PIDS. Terminating..."
  kill $PIDS || true
  sleep 1
  # Force kill if still present
  if command -v lsof >/dev/null 2>&1; then
    STILL=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN || true)
    if [ -n "$STILL" ]; then
      echo "Processes still present; forcing kill: $STILL"
      kill -9 $STILL || true
    fi
  fi
fi

echo "Starting Flask dev server on http://${HOST}:${PORT}..."
LOGFILE="/tmp/backend_${PORT}.log"
nohup ./venv/bin/python -c "from app import create_app; create_app().run(debug=False, host='${HOST}', port=${PORT})" > "$LOGFILE" 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID (logs: $LOGFILE)"

# Wait for server to be reachable
echo -n "Waiting for server to respond on http://${HOST}:${PORT}..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" "http://${HOST}:${PORT}/" | grep -q "200"; then
    echo " OK"
    break
  fi
  echo -n "."
  sleep 1
done
echo "Backend started (PID: $SERVER_PID). Tail logs with: tail -f $LOGFILE"