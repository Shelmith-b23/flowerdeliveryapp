import os

# Base directory of the app folder
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
    
    # Use PostgreSQL in production, SQLite in development
    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
    
    # Only use DATABASE_URL if it's a valid PostgreSQL URL
    if DATABASE_URL and DATABASE_URL.startswith(("postgresql://", "postgres://")):
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "../instance/flowerdb.db")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key_here")
    
    # CORS origins from environment or default to localhost
    cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://flowerdeliveryapp-aid0.onrender.com")
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_str.split(",")]
    
    # File upload folder
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size