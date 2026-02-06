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

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Allow your specific Render frontend and local dev
    cors_origins = [
        "https://flowerdeliveryapp-aid0.onrender.com", 
        "https://flora-x.pages.dev",
        "http://localhost:3000"
    ]
    
    CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp

    # Registering blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers")

    return app