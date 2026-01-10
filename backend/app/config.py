import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
basedir = Path(__file__).resolve().parents[1]
envfile = basedir / ".env"
if envfile.exists():
    load_dotenv(envfile)

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")

    # ✅ SQLite by default (SAFE)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{basedir / 'flower_delivery.db'}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ✅ MAIL SETTINGS
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = "Flower Delivery <no-reply@flowerdelivery.com>"
    MAIL_SUPPRESS_SEND = False
    MAIL_DEBUG = False