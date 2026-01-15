from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    # Normalize email to prevent login mismatches
    email = data["email"].strip().lower()
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    user = User(
        name=data["name"],
        email=email,
        role=data["role"],
        shop_name=data.get("shop_name"),
        shop_address=data.get("shop_address"),
        shop_contact=data.get("shop_contact"),
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    token = create_access_token(identity=user.id)

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "shop_name": user.shop_name
        }
    }), 200