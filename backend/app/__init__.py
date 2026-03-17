import os
import sys
import flask
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
    
    print(f"[DEBUG] SQLALCHEMY_DATABASE_URI={app.config.get('SQLALCHEMY_DATABASE_URI')}", file=sys.stderr)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS configuration (specific origins + credentials)
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:3000",
                    "https://flora-x.pages.dev"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        },
        supports_credentials=True  # ✅ Allow Authorization headers
    )

    # Handle OPTIONS preflight globally
    @app.before_request
    def handle_options():
        if flask.request.method == "OPTIONS":
            resp = flask.make_response()
            resp.status_code = 200
            return resp

    app.url_map.strict_slashes = False

    # Global error handlers
    @app.errorhandler(OperationalError)
    def handle_database_error(e):
        db.session.rollback()
        print(f"[ERROR] Database operational error: {str(e)}", file=sys.stderr)
        return jsonify({
            "error": "Database connection error",
            "message": "Unable to connect to database. Please try again later."
        }), 503

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def handle_internal_error(e):
        db.session.rollback()
        print(f"[ERROR] Unhandled error: {str(e)}", file=sys.stderr)
        return jsonify({"error": "Internal server error"}), 500

    # Health check
    @app.route('/')
    def index():
        return jsonify({"status": "online", "message": "Flower Delivery API is running"}), 200

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp
    from .routes.orders import orders_bp
    from .routes.payment import payment_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers")
    app.register_blueprint(orders_bp)  # Already has url_prefix="/api/orders"
    app.register_blueprint(payment_bp)  # Already has url_prefix="/api/payment"

    return app