from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import OperationalError
from ..models import User
from .. import db

auth_bp = Blueprint("auth_bp", __name__)

# ======================
# REGISTER -> /api/auth/register
# ======================
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

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
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed"}), 500

# ======================
# LOGIN -> /api/auth/login
# ======================
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        user = User.query.filter_by(email=data.get("email")).first()

        if not user or not user.check_password(data.get("password")):
            return jsonify({"error": "Invalid email or password"}), 401

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "shop_name": getattr(user, 'shop_name', None),
                "shop_address": getattr(user, 'shop_address', None)
            }
        }), 200
    
    except Exception as e:
        return jsonify({"error": "Login failed"}), 500