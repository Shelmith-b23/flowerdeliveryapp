import os

# Base directory of the app folder
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
    
    # Get Database URL from Render environment
    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
    
    # Fix Render's 'postgres://' to 'postgresql://' for SQLAlchemy 1.4+
    if DATABASE_URL:
        if DATABASE_URL.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        else:
            SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Fallback for local development only
        SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "../instance/flowerdb.db")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key_here")
    
    # 🔹 CORS origins logic (matches the app.py clean version)
    cors_origins_str = os.getenv("CORS_ORIGINS", "https://flora-x.pages.dev,http://localhost:3000")
    CORS_ORIGINS = [origin.strip().rstrip('/') for origin in cors_origins_str.split(",")]
    
    # File upload folder
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB