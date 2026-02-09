from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from ..models import db, Flower, User

flowers_bp = Blueprint("flowers", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# URL: POST /api/flowers
@flowers_bp.route("", methods=["POST"])
@jwt_required()
def add_flower():
    florist_id = get_jwt_identity()
    
    # Use request.form for multipart/form-data (required for files)
    name = request.form.get("name")
    price = request.form.get("price")
    description = request.form.get("description")
    
    file = request.files.get("image_file")
    image_url = request.form.get("image_url")
    saved_path = None

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Ensure directory exists
        os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
        # Use absolute URL so frontend (hosted elsewhere) can load the image
        try:
            saved_path = url_for('static', filename=f'uploads/{filename}', _external=True)
        except Exception:
            # Fallback: construct using request.url_root
            saved_path = request.url_root.rstrip('/') + f"/static/uploads/{filename}"
    elif image_url:
        saved_path = image_url
    else:
        return jsonify({"error": "Image required"}), 400

    new_flower = Flower(
        name=name,
        price=price,
        description=description,
        image_url=saved_path,
        florist_id=florist_id
    )
    db.session.add(new_flower)
    db.session.commit()
    return jsonify({"message": "Flower added", "id": new_flower.id}), 201

# URL: GET /api/flowers
@flowers_bp.route("", methods=["GET"])
def get_flowers():
    flowers = Flower.query.all()
    return jsonify([{
        "id": f.id,
        "name": f.name,
        "price": f.price,
        "image_url": (f.image_url if (f.image_url and f.image_url.startswith('http')) else (request.url_root.rstrip('/') + f.image_url if f.image_url and f.image_url.startswith('/') else (request.url_root.rstrip('/') + '/static/uploads/' + f.image_url if f.image_url else None))),
        "description": f.description,
        "shop_name": User.query.get(f.florist_id).name if User.query.get(f.florist_id) else "Unknown"
    } for f in flowers]), 200


# URL: GET /api/flowers/florist/my-flowers
# Returns flowers belonging to the authenticated florist
@flowers_bp.route("/florist/my-flowers", methods=["GET", "OPTIONS"])
@jwt_required()
def get_my_flowers():
    # Handle OPTIONS preflight quickly
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    florist_id = get_jwt_identity()
    my_flowers = Flower.query.filter_by(florist_id=florist_id).all()
    result = []
    for f in my_flowers:
        result.append({
            "id": f.id,
            "name": f.name,
            "price": f.price,
            "image_url": (f.image_url if (f.image_url and f.image_url.startswith('http')) else (request.url_root.rstrip('/') + f.image_url if f.image_url and f.image_url.startswith('/') else (request.url_root.rstrip('/') + '/static/uploads/' + f.image_url if f.image_url else None))),
            "description": f.description,
            "stock_status": getattr(f, "stock_status", "in_stock")
        })
    return jsonify(result), 200