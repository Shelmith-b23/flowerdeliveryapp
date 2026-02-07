from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import OperationalError
from ..models import User
from .. import db

auth_bp = Blueprint("auth_bp", __name__)

# ======================
# REGISTER -> Final URL: /api/auth/register
# ======================
# Added "OPTIONS" to methods to satisfy CORS preflight checks
@auth_bp.route("/register", methods=["POST", "OPTIONS"])
def register():
    # Handle the OPTIONS preflight request immediately
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify({"error": "Email already exists"}), 409

        user = User(
            name=data["name"],
            email=data["email"],
            role=data["role"]
        )
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    
    except OperationalError as e:
        db.session.rollback()
        print(f"[ERROR] Database connection error during registration: {str(e)}")
        return jsonify({"error": "Database connection error. Please try again."}), 503
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Registration error: {str(e)}")
        return jsonify({"error": "Registration failed. Please try again."}), 500


# ======================
# LOGIN -> Final URL: /api/auth/login
# ======================
# Added "OPTIONS" to methods to satisfy CORS preflight checks
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Handle the OPTIONS preflight request immediately
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Flask-JWT-Extended usually expects a string for identity
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 200
    
    except OperationalError as e:
        db.session.rollback()
        print(f"[ERROR] Database connection error during login: {str(e)}")
        return jsonify({"error": "Database connection error. Please try again."}), 503
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Login error: {str(e)}")
        return jsonify({"error": "Login failed. Please try again."}), 500