# Local development helper for the backend

This file contains helpful steps for running the backend locally, using Docker Postgres, system Postgres, or SQLite.

Quick start (Docker Postgres) — recommended:

1. Start the DB using Docker Compose (recommended for dev parity with production)
```bash
cd backend
docker compose up -d
```

2. Set environment variables (or copy `.env.example` to `.env` and edit values)
```bash
cp .env.example .env
export $(grep -v '^#' .env | xargs)
```

3. Run the run_local.sh helper, which will install deps, run migrations and start the dev server. `run_local.sh` accepts `--no-docker` to skip Docker (useful when you already have a DB):
```bash
./run_local.sh
```

Alternative: Use `--no-docker` to skip Docker (use existing Postgres or SQLite):
```bash
./run_local.sh --no-docker
```

Additional options / notes:
- If you prefer to use system-installed Postgres, create the DB and user (update `DATABASE_URL`), then run migrations and server as below.
- Use SQLite for quick testing by setting `DATABASE_URL` to `sqlite:///dev.db`.
- If you plan to run the app in production, use a production WSGI server (gunicorn/uwsgi) and secure credentials via a secrets manager.

Commands (system Postgres path):
```bash
# Create a user and DB then run migrations
sudo -u postgres psql -c "CREATE DATABASE flower_delivery;"
sudo -u postgres psql -c "CREATE USER appuser WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flower_delivery TO appuser;"
export DATABASE_URL="postgresql://appuser:your_password@localhost:5432/flower_delivery"
./run_local.sh --no-docker
```

Commands (SQLite quick path):
```bash
export DATABASE_URL="sqlite:///dev.db"
./run_local.sh --no-docker
```
