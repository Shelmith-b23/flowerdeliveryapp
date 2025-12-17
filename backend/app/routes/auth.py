import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app
from ..models import User, db

auth_bp = Blueprint('auth', __name__)

# 🔹 Generate JWT token
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, current_app.config.get('SECRET_KEY'), algorithm='HS256')


# 🔹 Register route
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'buyer')  # Default to buyer

    if not all([name, email, password]):
        return jsonify({'error': 'Missing name, email or password'}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    try:
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Success'}), 201
    except Exception as e:
        db.session.rollback()  # 🔹 Important: rollback on exception
        return jsonify({'error': str(e)}), 500


# 🔹 Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        token = generate_token(user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401
