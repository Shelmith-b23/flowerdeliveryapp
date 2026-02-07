import os
import sys
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Load config
    from .config import Config
    app.config.from_object(Config)
    
    # Debug: print resolved DB URI
    print(f"[DEBUG] SQLALCHEMY_DATABASE_URI={app.config.get('SQLALCHEMY_DATABASE_URI')}", file=sys.stderr)

    # Init extensions
    try:
        db.init_app(app)
    except Exception as e:
        print(f"[ERROR] db.init_app failed: {e}", file=sys.stderr)
        raise
    
    migrate.init_app(app, db)
    jwt.init_app(app)

    # 🔹 AUTO-CREATE TABLES LOGIC
    # This runs every time the server starts and ensures the DB is ready
    with app.app_context():
        try:
            from . import models  # Import models so SQLAlchemy knows the tables
            db.create_all()
            print("[INFO] Database tables verified/created successfully.", file=sys.stderr)
        except Exception as e:
            print(f"[ERROR] Database table creation failed: {e}", file=sys.stderr)

    # CORS configuration
    cors_origins = [
        "https://flora-x.pages.dev",
        "https://flowerdeliveryapp-aid0.onrender.com",
        "http://localhost:3000",
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=True,
    )

    app.url_map.strict_slashes = False

    # 🔹 HEALTH CHECK ROUTE
    # Prevents 404 when opening the base backend URL
    @app.route('/')
    def index():
        return jsonify({"status": "online", "message": "Flower Delivery API is running"}), 200

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers")

    return app