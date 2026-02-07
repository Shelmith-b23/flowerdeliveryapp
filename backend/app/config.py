import os
import sys

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Use environment variable or a strong default for development
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-prod")
    
    # Render uses 'postgres://', SQLAlchemy requires 'postgresql://'
    database_url = os.getenv("DATABASE_URL", "").strip()
    
    # Parse database URL if provided, otherwise use SQLite
    if not database_url:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'app.db')}"
    elif database_url.startswith("postgres://"):
        # Replace postgres:// with postgresql:// and add SSL settings
        db_uri = database_url.replace("postgres://", "postgresql://", 1)
        # Add ?sslmode=allow to handle SSL gracefully (allow but don't require)
        if "?" not in db_uri:
            db_uri += "?sslmode=allow"
        SQLALCHEMY_DATABASE_URI = db_uri
    else:
        # Ensure postgresql:// scheme and add SSL settings if not already present
        db_uri = database_url
        if db_uri.startswith("postgresql://") and "?" not in db_uri:
            db_uri += "?sslmode=allow"
        SQLALCHEMY_DATABASE_URI = db_uri
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-replace-in-prod")
        # CORS: Load from env or use defaults
    CORS_ORIGINS = os.getenv(
            "CORS_ORIGINS",
            "https://flowerdeliveryapp-aid0.onrender.com,https://flora-x.pages.dev,http://localhost:3000"
        ).split(",")
    

    # File Uploads
    # We use 'static/uploads' so Flask can serve them automatically via /static/
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit