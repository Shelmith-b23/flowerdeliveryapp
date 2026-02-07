import os
from flask import Flask
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
    # Debug: print resolved DB URI so deploy logs show what SQLAlchemy sees
    import sys
    print(f"[DEBUG] SQLALCHEMY_DATABASE_URI={app.config.get('SQLALCHEMY_DATABASE_URI')}", file=sys.stderr)

    # Init extensions (catch and log errors to aid debugging on Render)
    try:
        db.init_app(app)
    except Exception as e:
        print(f"[ERROR] db.init_app failed: {e}", file=sys.stderr)
        print(f"[ERROR] Raw DATABASE_URL env: {os.getenv('DATABASE_URL')}", file=sys.stderr)
        raise
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Allowed frontend origins (NO trailing slashes)
    cors_origins = [
        "https://flora-x.pages.dev",
        "https://flowerdeliveryapp-aid0.onrender.com",
        "http://localhost:3000",
    ]

    # CORS configuration (preflight-safe)
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

    # Prevent /login vs /login/ redirect issues (CORS killer)
    app.url_map.strict_slashes = False

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers")

    return app
