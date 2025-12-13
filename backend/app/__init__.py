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
    CORS(app)

    from .routes.auth import auth_bp
    from .routes.flowers import flowers_bp
    from .routes.orders import orders_bp
    from .routes.messages import messages_bp
    from .routes.tracking import tracking_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(flowers_bp, url_prefix='/api/flowers')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(tracking_bp, url_prefix='/api/tracking')

    return app
