# backend/app/config.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend root (if present)
basedir = Path(__file__).resolve().parents[1]
envfile = basedir / '.env'
if envfile.exists():
    load_dotenv(envfile)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')

    # 🔹 Use SQLite by default for local dev, override with DATABASE_URL for production
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + str(basedir / 'flower_delivery.db')
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
