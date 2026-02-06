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

    # Init extensions
    db.init_app(app)
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
