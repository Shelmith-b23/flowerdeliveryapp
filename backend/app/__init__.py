from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    
    # 1. Allow React (port 3000) to talk to Flask
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp

    # 2. strict_slashes=False stops the "Redirect not allowed" CORS error
    app.register_blueprint(auth_bp, url_prefix='/api/auth', strict_slashes=False)
    app.register_blueprint(flowers_bp, url_prefix='/api/flowers', strict_slashes=False)

    return app