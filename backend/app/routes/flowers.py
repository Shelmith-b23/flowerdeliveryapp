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
    
    # NEW: Update shop details for the florist
    florist = User.query.get(florist_id)
    if florist:
        florist.shop_name = request.form.get("shop_name") or florist.shop_name
        florist.shop_address = request.form.get("shop_address") or florist.shop_address
        florist.shop_contact = request.form.get("shop_contact") or florist.shop_contact
    
    db.session.commit()
    return jsonify({"message": "Flower added and shop updated", "id": new_flower.id}), 201

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
        "shop_name": User.query.get(f.florist_id).name if User.query.get(f.florist_id) else "Unknown",
        "florist_id": f.florist_id  # NEW: Added for buyers to fetch shop details
    } for f in flowers]), 200

# NEW: URL: GET /api/flowers/<int:flower_id>
# Allows buyers (and anyone) to view details of a specific flower, including the florist's uploaded image
@flowers_bp.route("/<int:flower_id>", methods=["GET"])
def get_flower(flower_id):
    flower = Flower.query.get(flower_id)
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    # Construct image URL for buyers to see
    image_url = (flower.image_url if (flower.image_url and flower.image_url.startswith('http')) else (request.url_root.rstrip('/') + flower.image_url if flower.image_url and flower.image_url.startswith('/') else (request.url_root.rstrip('/') + '/static/uploads/' + flower.image_url if flower.image_url else None)))
    
    return jsonify({
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "image_url": image_url,  # Buyers can now see the florist's image here
        "description": flower.description,
        "shop_name": User.query.get(flower.florist_id).name if User.query.get(flower.florist_id) else "Unknown",
        "stock_status": getattr(flower, "stock_status", "in_stock")
    }), 200

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

# URL: PUT /api/flowers/<id>
# Update a flower (florist only)
@flowers_bp.route("/<int:flower_id>", methods=["PUT", "OPTIONS"])
@jwt_required()
def update_flower(flower_id):
    # Handle OPTIONS preflight quickly
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    florist_id = get_jwt_identity()
    flower = Flower.query.get(flower_id)
    
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    if flower.florist_id != int(florist_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    # Update fields from form/JSON
    if request.form:
        # Handle multipart/form-data (file upload)
        if request.form.get("name"):
            flower.name = request.form.get("name")
        if request.form.get("price"):
            flower.price = request.form.get("price")
        if request.form.get("description"):
            flower.description = request.form.get("description")
        if request.form.get("stock_status"):
            flower.stock_status = request.form.get("stock_status")
        
        # Handle file upload
        file = request.files.get("image_file")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            try:
                flower.image_url = url_for('static', filename=f'uploads/{filename}', _external=True)
            except Exception:
                flower.image_url = request.url_root.rstrip('/') + f"/static/uploads/{filename}"
        
        # NEW: Update shop details for the florist
        florist = User.query.get(florist_id)
        if florist:
            florist.shop_name = request.form.get("shop_name") or florist.shop_name
            florist.shop_address = request.form.get("shop_address") or florist.shop_address
            florist.shop_contact = request.form.get("shop_contact") or florist.shop_contact
    else:
        # Handle JSON request body
        data = request.get_json() or {}
        if data.get("name"):
            flower.name = data["name"]
        if data.get("price"):
            flower.price = data["price"]
        if data.get("description"):
            flower.description = data["description"]
        if data.get("stock_status"):
            flower.stock_status = data["stock_status"]
    
    db.session.commit()
    return jsonify({"message": "Flower and shop updated", "id": flower.id}), 200

# URL: DELETE /api/flowers/<id>
# Delete a flower (florist only)
@flowers_bp.route("/<int:flower_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def delete_flower(flower_id):
    # Handle OPTIONS preflight quickly
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    florist_id = get_jwt_identity()
    flower = Flower.query.get(flower_id)
    
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    if flower.florist_id != int(florist_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(flower)
    db.session.commit()
    return jsonify({"message": "Flower deleted"}), 200