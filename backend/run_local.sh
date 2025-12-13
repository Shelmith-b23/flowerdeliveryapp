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

export FLASK_APP=run.py

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

echo "Starting Flask dev server (http://localhost:5000)..."
python run.py
