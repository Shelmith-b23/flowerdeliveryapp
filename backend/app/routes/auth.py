import jwt
import datetime
from flask import Blueprint, request, jsonify, current_app
from ..models import User, db
import pyotp
import qrcode
import base64
from io import BytesIO
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

# 🔹 Generate JWT token
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, current_app.config.get('SECRET_KEY'), algorithm='HS256')


def get_user_from_token():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ', 1)[1]
    try:
        data = jwt.decode(token, current_app.config.get('SECRET_KEY'), algorithms=['HS256'])
        user_id = data.get('sub')
        if not user_id:
            return None
        return User.query.get(user_id)
    except Exception:
        return None


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
    try:
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        # Likely DB schema not up to date (missing new columns). Provide helpful message.
        current_app.logger.exception('Database error during register existence check')
        return jsonify({'error': 'Database schema out of date. Please run migrations (flask db upgrade).', 'detail': str(e)}), 500

    try:
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Success'}), 201
    except Exception as e:
        db.session.rollback()  # 🔹 Important: rollback on exception
        current_app.logger.exception('Error creating user')
        return jsonify({'error': str(e)}), 500


# 🔹 TOTP setup (generate secret and QR)
@auth_bp.route('/totp/setup', methods=['POST'])
def totp_setup():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    # generate secret and store it (not enabled until verified)
    secret = pyotp.random_base32()
    user.totp_secret = secret
    user.totp_enabled = False
    db.session.commit()

    totp = pyotp.TOTP(secret)
    otpauth_url = totp.provisioning_uri(name=user.email, issuer_name=current_app.config.get('APP_NAME', 'FlowerDelivery'))

    # generate QR PNG and encode as base64
    img = qrcode.make(otpauth_url)
    buf = BytesIO()
    img.save(buf, format='PNG')
    qr_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    return jsonify({'otpauth_url': otpauth_url, 'qr_code': f'data:image/png;base64,{qr_b64}'}), 200


# 🔹 Current user
@auth_bp.route('/me', methods=['GET'])
def me():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    return jsonify({'user': {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'totp_enabled': bool(user.totp_enabled)
    }}), 200


# 🔹 TOTP verify (confirm code and enable)
@auth_bp.route('/totp/verify', methods=['POST'])
def totp_verify():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    code = data.get('code')
    if not code:
        return jsonify({'error': 'Missing code'}), 400

    if not user.totp_secret:
        return jsonify({'error': 'TOTP not setup'}), 400

    totp = pyotp.TOTP(user.totp_secret)
    if totp.verify(str(code).strip(), valid_window=1):
        user.totp_enabled = True
        db.session.commit()
        return jsonify({'message': 'TOTP enabled'}), 200

    return jsonify({'error': 'Invalid code'}), 400


# 🔹 TOTP disable
@auth_bp.route('/totp/disable', methods=['POST'])
def totp_disable():
    user = get_user_from_token()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    code = data.get('code')
    if not code:
        return jsonify({'error': 'Missing code'}), 400

    if not user.totp_secret or not user.totp_enabled:
        return jsonify({'error': 'TOTP not enabled'}), 400

    totp = pyotp.TOTP(user.totp_secret)
    if totp.verify(str(code).strip(), valid_window=1):
        user.totp_enabled = False
        user.totp_secret = None
        db.session.commit()
        return jsonify({'message': 'TOTP disabled'}), 200

    return jsonify({'error': 'Invalid code'}), 400


# 🔹 Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    totp_code = data.get('totp')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # If TOTP enabled, require totp code
        if user.totp_enabled:
            if not totp_code:
                return jsonify({'error': '2FA required', '2fa_required': True}), 401
            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(str(totp_code).strip(), valid_window=1):
                return jsonify({'error': 'Invalid 2FA code'}), 401

        token = generate_token(user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'totp_enabled': bool(user.totp_enabled)
            }
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401
