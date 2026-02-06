from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    from .config import Config
    app.config.from_object(Config)

    # Database and Extensions initialization
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # 1. Expand origins to include all possible variations
    # Make sure there are NO trailing slashes here
    cors_origins = [
        "https://flowerdeliveryapp-aid0.onrender.com", 
        "https://flora-x.pages.dev",
        "http://localhost:3000"
    ]
    
    # 2. Robust CORS Configuration
    # Adding allow_headers and methods ensures the OPTIONS preflight succeeds
    CORS(
        app, 
        resources={r"/api/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"]
        }}, 
        supports_credentials=True
    )

    # 3. Disable strict slashes globally
    # This prevents Flask from redirecting /api/auth/login to /api/auth/login/
    # Redirects often break CORS preflight requests
    app.url_map.strict_slashes = False

    # Import blueprints
    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers")

    return app