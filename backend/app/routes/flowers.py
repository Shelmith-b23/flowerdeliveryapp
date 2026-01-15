from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Flower, User

flowers_bp = Blueprint("flowers", __name__, url_prefix="/api/flowers")

# Florist adds flower
@flowers_bp.route("", methods=["POST"])
@jwt_required()
def add_flower():
    florist_id = get_jwt_identity()

    flower = Flower(
        name=request.json["name"],
        price=request.json["price"],
        image_url=request.json.get("image_url"),
        description=request.json.get("description"),
        stock_status=request.json.get("stock_status", "in_stock"),
        florist_id=florist_id
    )

    db.session.add(flower)
    db.session.commit()

    return jsonify({
        "message": "Flower added",
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "stock_status": flower.stock_status
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


# Get single flower details
@flowers_bp.route("/<int:flower_id>", methods=["GET"])
def get_flower(flower_id):
    flower = Flower.query.get(flower_id)
    if not flower:
        return jsonify({"error": "Flower not found"}), 404

    florist = User.query.get(flower.florist_id)
    return jsonify({
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "image_url": flower.image_url,
        "description": flower.description,
        "stock_status": flower.stock_status,
        "florist_id": flower.florist_id,
        "florist": {
            "id": florist.id,
            "name": florist.name,
            "shop_name": florist.shop_name
        } if florist else None,
        "created_at": flower.created_at.isoformat()
    }), 200


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


# Update flower (edit)
@flowers_bp.route("/<int:flower_id>", methods=["PUT"])
@jwt_required()
def update_flower(flower_id):
    florist_id = get_jwt_identity()
    flower = Flower.query.get(flower_id)
    
    if not flower:
        return jsonify({"error": "Flower not found"}), 404
    
    if flower.florist_id != florist_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    flower.name = request.json.get("name", flower.name)
    flower.price = request.json.get("price", flower.price)
    flower.image_url = request.json.get("image_url", flower.image_url)
    flower.description = request.json.get("description", flower.description)
    flower.stock_status = request.json.get("stock_status", flower.stock_status)
    
    db.session.commit()
    
    return jsonify({
        "message": "Flower updated",
        "id": flower.id,
        "name": flower.name,
        "price": flower.price,
        "stock_status": flower.stock_status
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
