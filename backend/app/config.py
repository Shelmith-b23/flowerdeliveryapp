import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Use environment variable or a strong default for development
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-prod")
    
    # Render uses 'postgres://', SQLAlchemy requires 'postgresql://'
    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = database_url.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URI = database_url or f"sqlite:///{os.path.join(basedir, 'app.db')}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-replace-in-prod")
    
    # CORS: Load from env or use defaults
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://flowerdeliveryapp-aid0.onrender.com,https://flora-x.pages.dev/").split(",")
    
    # File Uploads
    # We use 'static/uploads' so Flask can serve them automatically via /static/
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit