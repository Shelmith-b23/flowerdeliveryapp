from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
import os

# Initialize extensions here, **but don't import models yet**
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)

    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    # Import routes and models **after db is defined**
    from . import models  # ⚡ Import models here to avoid circular import

    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp
    from .routes.orders import orders_bp
    from .routes.payment import payment_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth", strict_slashes=False)
    app.register_blueprint(flowers_bp, url_prefix="/api/flowers", strict_slashes=False)
    app.register_blueprint(orders_bp, strict_slashes=False)
    app.register_blueprint(payment_bp, strict_slashes=False)

    return app
