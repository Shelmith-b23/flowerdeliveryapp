import os
import sys
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Use environment variable or a strong default for development
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-prod")
    
    # Render uses 'postgres://', SQLAlchemy requires 'postgresql://'
    database_url = os.getenv("DATABASE_URL", "").strip()
    
    # Parse database URL if provided, otherwise use SQLite
    if not database_url:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'app.db')}"
    else:
        # Normalize postgres:// to postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        # Parse the URL to add/modify SSL parameters
        parsed = urlparse(database_url)
        
        # Parse query parameters
        params = parse_qs(parsed.query, keep_blank_values=True)
        
        # Add sslmode if not already present
        if 'sslmode' not in params:
            params['sslmode'] = ['prefer']  # Prefer SSL but fallback to non-SSL
        
        # Reconstruct query string
        new_query = urlencode([(k, v[0] if isinstance(v, list) else v) for k, v in params.items()], doseq=True)
        
        # Reconstruct the URL with the new query string
        SQLALCHEMY_DATABASE_URI = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection pooling settings - vary by database type
    if not database_url or database_url.startswith("sqlite"):
        # SQLite doesn't support connect_timeout or options
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 3600,
        }
    else:
        # PostgreSQL supports advanced connection options
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,  # Test connections before using them
            "pool_recycle": 3600,   # Recycle connections every hour
            "pool_size": 10,
            "max_overflow": 20,
            "connect_args": {
                "connect_timeout": 10,
                "options": "-c statement_timeout=30000"  # 30 second timeout
            }
        }
    
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-replace-in-prod")
        # CORS: Load from env or use defaults
    CORS_ORIGINS = os.getenv(
            "CORS_ORIGINS",
            "https://api.flora-x.pages.dev,https://flora-x.pages.dev,http://localhost:3000"
        ).split(",")
    

    # File Uploads
    # We use 'static/uploads' so Flask can serve them automatically via /static/
    UPLOAD_FOLDER = os.path.join(basedir, "static", "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit