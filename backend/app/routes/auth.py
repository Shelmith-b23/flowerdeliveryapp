from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
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

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if User.query.filter_by(email=data["email"]).first():
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


# ======================
# LOGIN -> Final URL: /api/auth/login
# ======================
# Added "OPTIONS" to methods to satisfy CORS preflight checks
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Handle the OPTIONS preflight request immediately
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

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