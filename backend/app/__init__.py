# backend/app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
import os

# Initialize extensions globally
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)

    # Ensure upload folder exists for flower images
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

    # Initialize extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # 🔹 Proper CORS setup 
    # Removed trailing slashes and added localhost for testing
    cors_origins = [
        "https://flora-x.pages.dev",
        "http://localhost:3000"
    ]
    
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins,
                "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
                "expose_headers": ["Content-Type", "Authorization"]
            }
        },
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    # Import models after db initialization to avoid circular imports
    from . import models

    # Import and register blueprints
    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp
    from .routes.orders import orders_bp
    from .routes.payment import payment_bp

    # Registering blueprints with strict_slashes=False to prevent 405/301 redirect errors
    app.register_blueprint(auth_bp, url_prefix="/api/auth", strict_slashes=False)
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers", strict_slashes=False)
    app.register_blueprint(orders_bp, url_prefix="/api/orders", strict_slashes=False)
    app.register_blueprint(payment_bp, url_prefix="/api/payment", strict_slashes=False)

    return app