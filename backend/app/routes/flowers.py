from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from app.models import db, Flower, User

flowers_bp = Blueprint("flowers", __name__)

# Allowed image extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Florist adds a flower
@flowers_bp.route("", methods=["POST"])
@jwt_required()
def add_flower():
    florist_id = get_jwt_identity()

    # Get form data
    name = request.form.get("name")
    price = request.form.get("price")
    description = request.form.get("description")
    stock_status = request.form.get("stock_status", "in_stock")

    # Handle image: either file upload or URL
    file = request.files.get("image_file")
    image_url = request.form.get("image_url")  # optional

    saved_image_path = None

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        file.save(os.path.join(upload_folder, filename))
        # Save relative path so frontend can access via /static/uploads/filename
        saved_image_path = f"/static/uploads/{filename}"
    elif image_url:
        saved_image_path = image_url
    else:
        return jsonify({"error": "No image provided"}), 400

    # Create flower
    flower = Flower(
        name=name,
        price=price,
        image_url=saved_image_path,
        description=description,
        stock_status=stock_status,
        florist_id=florist_id
    )

    db.session.add(flower)
    db.session.commit()

    return jsonify({
        "message": "Flower added",
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "stock_status": flower.stock_status,
        "image_url": flower.image_url
    }), 201


# Buyers view all flowers
@flowers_bp.route("", methods=["GET"])
def get_flowers():
    flowers = Flower.query.all()
    results = []

    for f in flowers:
        florist = User.query.get(f.florist_id)
        results.append({
            "id": f.id,
            "name": f.name,
            "price": f.price,
            "image_url": f.image_url,
            "description": f.description,
            "stock_status": f.stock_status,
            "florist_id": f.florist_id,
            "florist": {
                "id": florist.id,
                "name": florist.name,
                "shop_name": florist.shop_name
            } if florist else None,
            "shop_name": florist.shop_name if florist else "Unknown shop"
        })

    return jsonify(results), 200


# Get florist's flowers
@flowers_bp.route("/florist/my-flowers", methods=["GET"])
@jwt_required()
def get_florist_flowers():
    florist_id = get_jwt_identity()
    flowers = Flower.query.filter_by(florist_id=florist_id).all()
    
    results = [{
        "id": f.id,
        "name": f.name,
        "price": f.price,
        "image_url": f.image_url,
        "description": f.description,
        "stock_status": f.stock_status,
        "created_at": f.created_at.isoformat(),
        "updated_at": f.updated_at.isoformat()
    } for f in flowers]
    
    return jsonify(results), 200


# Update flower
@flowers_bp.route("/<int:flower_id>", methods=["PUT"])
@jwt_required()
def update_flower(flower_id):
    florist_id = get_jwt_identity()
    flower = Flower.query.get(flower_id)
    
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    if flower.florist_id != florist_id:
        return jsonify({"error": "Unauthorized"}), 403

    # Update fields
    flower.name = request.form.get("name", flower.name)
    flower.price = request.form.get("price", flower.price)
    flower.description = request.form.get("description", flower.description)
    flower.stock_status = request.form.get("stock_status", flower.stock_status)

    # Handle image update
    file = request.files.get("image_file")
    image_url = request.form.get("image_url")

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        file.save(os.path.join(upload_folder, filename))
        flower.image_url = f"/static/uploads/{filename}"
    elif image_url:
        flower.image_url = image_url

    db.session.commit()

    return jsonify({
        "message": "Flower updated",
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "stock_status": flower.stock_status,
        "image_url": flower.image_url
    }), 200


# Delete flower
@flowers_bp.route("/<int:flower_id>", methods=["DELETE"])
@jwt_required()
def delete_flower(flower_id):
    florist_id = get_jwt_identity()
    flower = Flower.query.get(flower_id)
    
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    if flower.florist_id != florist_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(flower)
    db.session.commit()
    
    return jsonify({"message": "Flower deleted"}), 200
