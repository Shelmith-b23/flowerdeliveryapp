import os

# Base directory of the app folder
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "your_secret_key_here"
    # Point SQLite DB to instance folder
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "../instance/flowerdb.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "your_jwt_secret_key_here"
    CORS_ORIGINS = ["http://localhost:3000"]
    