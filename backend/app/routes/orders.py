from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Order, OrderItem, Flower, User

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@orders_bp.route("/create", methods=["POST"])
@jwt_required()
def create_order():
    """Create a new order from cart items"""
    buyer_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    buyer_name = data.get("buyer_name", "").strip()
    buyer_phone = data.get("buyer_phone", "").strip()
    delivery_address = data.get("delivery_address", "").strip()
    items = data.get("items", [])
    
    if not buyer_name or not buyer_phone or not delivery_address or not items:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Get buyer info
    buyer = User.query.get(buyer_id)
    if not buyer:
        return jsonify({"error": "Buyer not found"}), 404
    
    # Calculate total and validate items
    total_price = 0
    order_items_data = []
    
    for item in items:
        flower_id = item.get("flower_id")
        quantity = item.get("quantity", 1)
        
        flower = Flower.query.get(flower_id)
        if not flower:
            return jsonify({"error": f"Flower {flower_id} not found"}), 404
        
        item_total = flower.price * quantity
        total_price += item_total
        
        order_items_data.append({
            "flower": flower,
            "quantity": quantity,
            "florist_id": flower.florist_id
        })
    
    # Create order
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
    db.session.flush()  # Get order ID
    
    # Create order items
    for item_data in order_items_data:
        flower = item_data["flower"]
        florist = User.query.get(item_data["florist_id"])
        
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
    
    return jsonify({
        "message": "Order created successfully",
        "order_id": order.id,
        "total_price": total_price
    }), 201


@orders_bp.route("/<int:order_id>/pay", methods=["POST"])
@jwt_required()
def mark_order_paid(order_id):
    """Mark order as paid"""
    buyer_id = get_jwt_identity()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    if order.buyer_id != buyer_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    order.paid = True
    order.status = "paid"
    db.session.commit()
    
    return jsonify({"message": "Payment confirmed", "order_id": order.id}), 200


@orders_bp.route("/buyer", methods=["GET"])
@jwt_required()
def get_buyer_orders():
    """Get all orders for the logged-in buyer"""
    buyer_id = get_jwt_identity()
    
    orders = Order.query.filter_by(buyer_id=buyer_id).order_by(Order.created_at.desc()).all()
    
    return jsonify([{
        "id": order.id,
        "buyer_name": order.buyer_name,
        "delivery_address": order.delivery_address,
        "total_price": order.total_price,
        "status": order.status,
        "paid": order.paid,
        "created_at": order.created_at.isoformat(),
        "items": [{
            "flower_name": item.flower_name,
            "florist_name": item.florist_name,
            "quantity": item.quantity,
            "unit_price": item.unit_price
        } for item in order.items]
    } for order in orders]), 200


@orders_bp.route("/florist", methods=["GET"])
@jwt_required()
def get_florist_orders():
    """Get all orders containing this florist's flowers"""
    florist_id = get_jwt_identity()
    
    # Get order IDs where this florist has items
    order_ids = db.session.query(OrderItem.order_id).filter_by(florist_id=florist_id).all()
    order_ids = [o[0] for o in order_ids]
    
    if not order_ids:
        return jsonify([]), 200
    
    orders = Order.query.filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        # Only include items from this florist
        florist_items = [item for item in order.items if item.florist_id == florist_id]
        
        result.append({
            "id": order.id,
            "buyer_name": order.buyer_name,
            "buyer_email": order.buyer_email,
            "buyer_phone": order.buyer_phone,
            "delivery_address": order.delivery_address,
            "total_price": order.total_price,
            "status": order.status,
            "paid": order.paid,
            "created_at": order.created_at.isoformat(),
            "items": [{
                "id": item.id,
                "flower_name": item.flower_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price
            } for item in florist_items]
        })
    
    return jsonify(result), 200


@orders_bp.route("/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):
    """Update order status (for florist)"""
    florist_id = get_jwt_identity()
    data = request.get_json()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Verify florist owns items in this order
    florist_items = OrderItem.query.filter_by(order_id=order_id, florist_id=florist_id).first()
    if not florist_items:
        return jsonify({"error": "Unauthorized"}), 403
    
    new_status = data.get("status", "").strip()
    if new_status not in ["pending", "paid", "processing", "delivered"]:
        return jsonify({"error": "Invalid status"}), 400
    
    order.status = new_status
    db.session.commit()
    
    return jsonify({"message": "Order status updated", "status": new_status}), 200    
