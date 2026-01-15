"""
Payment routes for handling PesaPal integration
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Order, User
from app.payment import pesapal

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")


@payment_bp.route("/pesapal/initialize", methods=["POST"])
@jwt_required()
def initialize_pesapal_payment():
    """Initialize a PesaPal payment for an order"""
    buyer_id = get_jwt_identity()
    data = request.get_json()
    
    order_id = data.get("order_id")
    if not order_id:
        return jsonify({"error": "Order ID is required"}), 400
    
    # Get the order
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Verify the order belongs to the current buyer
    if order.buyer_id != buyer_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # Get buyer details
    buyer = User.query.get(buyer_id)
    if not buyer:
        return jsonify({"error": "Buyer not found"}), 404
    
    # Parse buyer name into first and last name
    name_parts = order.buyer_name.split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else name_parts[0]
    
    # Create PesaPal payment iframe
    payment_result = pesapal.create_payment_iframe(
        order_id=order_id,
        amount=order.total_price,
        email=order.buyer_email,
        phone=order.buyer_phone,
        first_name=first_name,
        last_name=last_name
    )
    
    if not payment_result.get("success"):
        return jsonify({
            "error": payment_result.get("error", "Failed to create payment")
        }), 500
    
    # Update order with payment method
    order.payment_method = "pesapal"
    order.pesapal_reference = payment_result.get("reference")
    db.session.commit()
    
    return jsonify({
        "iframe_url": payment_result.get("iframe_url"),
        "reference": payment_result.get("reference"),
        "order_id": order_id
    }), 200


@payment_bp.route("/pesapal/verify", methods=["POST"])
@jwt_required()
def verify_pesapal_payment():
    """Verify a PesaPal payment"""
    buyer_id = get_jwt_identity()
    data = request.get_json()
    
    order_id = data.get("order_id")
    reference_id = data.get("reference_id")
    
    if not order_id or not reference_id:
        return jsonify({"error": "Order ID and Reference ID are required"}), 400
    
    # Get the order
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    # Verify the order belongs to the current buyer
    if order.buyer_id != buyer_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # Verify payment with PesaPal
    payment_verification = pesapal.verify_payment(reference_id, "")
    
    if not payment_verification.get("success"):
        return jsonify({
            "error": payment_verification.get("error", "Payment verification failed")
        }), 500
    
    status = payment_verification.get("status", "").lower()
    
    # Update order based on payment status
    if status == "completed" or status == "payment received":
        order.paid = True
        order.status = "paid"
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Payment verified successfully",
            "status": "completed",
            "order_id": order_id
        }), 200
    elif status == "pending":
        return jsonify({
            "success": True,
            "message": "Payment is pending",
            "status": "pending",
            "order_id": order_id
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": f"Payment status: {status}",
            "status": status,
            "order_id": order_id
        }), 400


@payment_bp.route("/pesapal/callback", methods=["POST"])
def pesapal_callback():
    """Handle PesaPal callback after payment"""
    try:
        data = request.get_json() or request.form.to_dict()
        
        reference_id = data.get("pesapal_transaction_tracking_id")
        merchant_reference = data.get("pesapal_merchant_reference")
        status = data.get("pesapal_status")
        
        if not merchant_reference:
            return jsonify({"error": "Missing merchant reference"}), 400
        
        # Extract order ID from merchant reference
        # Format is usually: ORD_{order_id}_{timestamp}
        parts = merchant_reference.split("_")
        if len(parts) < 2:
            return jsonify({"error": "Invalid merchant reference format"}), 400
        
        order_id = parts[1]
        
        # Get the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        # Update order with PesaPal reference
        order.pesapal_reference = reference_id
        
        # Parse status and update order
        status_lower = status.lower() if status else ""
        if status_lower in ["completed", "payment received"]:
            order.paid = True
            order.status = "paid"
        elif status_lower == "pending":
            order.status = "pending"
        else:
            order.status = "failed"
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Payment processed",
            "order_id": order_id,
            "status": status
        }), 200
        
    except Exception as e:
        print(f"Error processing PesaPal callback: {str(e)}")
        return jsonify({"error": str(e)}), 500


@payment_bp.route("/pesapal/check-status/<int:order_id>", methods=["GET"])
@jwt_required()
def check_payment_status(order_id):
    """Check the payment status of an order"""
    buyer_id = get_jwt_identity()
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    if order.buyer_id != buyer_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    return jsonify({
        "order_id": order_id,
        "paid": order.paid,
        "status": order.status,
        "payment_method": order.payment_method,
        "pesapal_reference": order.pesapal_reference,
        "total_price": order.total_price
    }), 200
