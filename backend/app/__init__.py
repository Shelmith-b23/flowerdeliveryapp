import os
import sys
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError

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
    # Commented out in favor of using Flask-Migrate for schema management
    # with app.app_context():
    #     try:
    #         from . import models  # Import models so SQLAlchemy knows the tables
    #         db.create_all()
    #         print("[INFO] Database tables verified/created successfully.", file=sys.stderr)
    #     except Exception as e:
    #         print(f"[ERROR] Database table creation failed: {e}", file=sys.stderr)

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

    # 🔹 GLOBAL ERROR HANDLERS
    @app.errorhandler(OperationalError)
    def handle_database_error(e):
        """Handle database connection errors"""
        db.session.rollback()
        print(f"[ERROR] Database operational error: {str(e)}", file=sys.stderr)
        return jsonify({
            "error": "Database connection error",
            "message": "Unable to connect to database. Please try again later."
        }), 503

    @app.errorhandler(404)
    def handle_not_found(e):
        """Handle 404 errors"""
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def handle_internal_error(e):
        """Handle unhandled 500 errors"""
        db.session.rollback()
        print(f"[ERROR] Unhandled error: {str(e)}", file=sys.stderr)
        return jsonify({"error": "Internal server error"}), 500

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