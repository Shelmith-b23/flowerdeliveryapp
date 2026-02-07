import os
import sys

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Use environment variable or a strong default for development
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-prod")
    
    # Render uses 'postgres://', SQLAlchemy requires 'postgresql://'
    database_url = os.getenv("DATABASE_URL", "").strip()
    
    # Debug: Log the DATABASE_URL for troubleshooting
    if not database_url:
        print("WARNING: DATABASE_URL not set, using SQLite fallback", file=sys.stderr)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'app.db')}"
    elif database_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = database_url.replace("postgres://", "postgresql://", 1)
        print(f"Using PostgreSQL database (converted from postgres://)", file=sys.stderr)
    else:
        SQLALCHEMY_DATABASE_URI = database_url
        print(f"Using database from DATABASE_URL", file=sys.stderr)
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-replace-in-prod")
    
    # CORS: Load from env or use defaults
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "https://flowerdeliveryapp-aid0.onrender.com,https://flora-x.pages.dev"
    ).split(",")
    
    # File Uploads
    # We use 'static/uploads' so Flask can serve them automatically via /static/
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit