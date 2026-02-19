from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
# Use the db instance from your extensions/init file
from .. import db 
from ..models import Order, OrderItem, Flower, User

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@orders_bp.route("/create", methods=["POST"]) # Removed OPTIONS
@jwt_required()
def create_order():
    buyer_id = get_jwt_identity()
    data = request.get_json()
    
    buyer_name = data.get("buyer_name", "").strip()
    buyer_phone = data.get("buyer_phone", "").strip()
    delivery_address = data.get("delivery_address", "").strip()
    items = data.get("items", [])
    
    if not buyer_name or not buyer_phone or not delivery_address or not items:
        return jsonify({"error": "Missing required fields"}), 400
    
    buyer = User.query.get(buyer_id)
    if not buyer:
        return jsonify({"error": "Buyer not found"}), 404
    
    total_price = 0
    order_items_data = []
    
    for item in items:
        flower_id = item.get("flower_id")
        quantity = item.get("quantity", 1)
        
        flower = Flower.query.get(flower_id)
        if not flower:
            return jsonify({"error": f"Flower {flower_id} not found"}), 404
        
        total_price += (flower.price * quantity)
        order_items_data.append({"flower": flower, "quantity": quantity})
    
    order = Order(
        buyer_id=buyer_id,
        buyer_name=buyer_name,
        buyer_email=buyer.email,
        buyer_phone=buyer_phone,
        delivery_address=delivery_address,
        total_price=total_price,
        status="pending",
        paid=False
    )
    db.session.add(order)
    db.session.flush() 
    
    for item_data in order_items_data:
        flower = item_data["flower"]
        florist = User.query.get(flower.florist_id)
        
        order_item = OrderItem(
            order_id=order.id,
            flower_id=flower.id,
            florist_id=flower.florist_id,
            flower_name=flower.name,
            florist_name=florist.shop_name or florist.name,
            quantity=item_data["quantity"],
            unit_price=flower.price
        )
        db.session.add(order_item)
    
    db.session.commit()
    return jsonify({"message": "Order created!", "order_id": order.id}), 201

@orders_bp.route("/buyer", methods=["GET"]) # Removed OPTIONS
@jwt_required()
def get_buyer_orders():
    buyer_id = get_jwt_identity()
    orders = Order.query.filter_by(buyer_id=buyer_id).order_by(Order.created_at.desc()).all()
    
    return jsonify([{
        "id": o.id,
        "total_price": o.total_price,
        "status": o.status,
        "paid": o.paid,
        "created_at": o.created_at.isoformat(),
        "items": [{"flower_name": i.flower_name, "quantity": i.quantity} for i in o.items]
    } for o in orders]), 200

@orders_bp.route("/florist", methods=["GET"]) # Removed OPTIONS
@jwt_required()
def get_florist_orders():
    florist_id = get_jwt_identity()
    
    # Efficiently get orders belonging to this florist
    orders = Order.query.join(OrderItem).filter(OrderItem.florist_id == florist_id).distinct().all()
    
    result = []
    for order in orders:
        florist_items = [i for i in order.items if i.florist_id == florist_id]
        result.append({
            "id": order.id,
            "buyer_name": order.buyer_name,
            "status": order.status,
            "items": [{"flower_name": i.flower_name, "quantity": i.quantity} for i in florist_items]
        })
    
    return jsonify(result), 200

@orders_bp.route("/<int:order_id>/status", methods=["PUT"]) # Removed OPTIONS
@jwt_required()
def update_order_status(order_id):
    florist_id = get_jwt_identity()
    data = request.get_json()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Ownership check
    has_item = OrderItem.query.filter_by(order_id=order_id, florist_id=florist_id).first()
    if not has_item:
        return jsonify({"error": "Unauthorized"}), 403
    
    order.status = data.get("status", "pending")
    db.session.commit()
    return jsonify({"message": "Status updated", "status": order.status}), 200