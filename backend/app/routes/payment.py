"""
Payment routes for handling M-Pesa Daraja integration
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Order, User
from app.payment import daraja

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")


def _get_order_for_buyer(order_id, buyer_id):
    order = Order.query.get(order_id)
    if not order:
        return None, (jsonify({"error": "Order not found"}), 404)
    if order.buyer_id != buyer_id:
        return None, (jsonify({"error": "Unauthorized"}), 403)
    return order, None


@payment_bp.route("/daraja/initialize", methods=["POST"])
@jwt_required()
def initialize_daraja_payment():
    """Initialize an M-Pesa Daraja STK push for an order"""
    buyer_id = get_jwt_identity()
    data = request.get_json() or {}
    order_id = data.get("order_id")

    if not order_id:
        return jsonify({"error": "Order ID is required"}), 400

    order, error = _get_order_for_buyer(order_id, buyer_id)
    if error:
        return error

    buyer = User.query.get(buyer_id)
    if not buyer:
        return jsonify({"error": "Buyer not found"}), 404

    result = daraja.trigger_stk_push(order.buyer_phone, order.total_price, order.id)

    if not result.get("success"):
        return jsonify({"error": result.get("error", "STK push failed")}), 500

    order.payment_method = "mpesa"
    order.pesapal_reference = result.get("CheckoutRequestID") or result.get("reference")
    db.session.commit()

    return jsonify({
        "success": True,
        "message": result.get("CustomerMessage", "STK Push initiated"),
        "checkout_request_id": result.get("CheckoutRequestID"),
        "order_id": order.id
    }), 200


@payment_bp.route("/daraja/check-status/<int:order_id>", methods=["GET"])
@jwt_required()
def check_daraja_status(order_id):
    """Check order payment status"""
    buyer_id = get_jwt_identity()

    order, error = _get_order_for_buyer(order_id, buyer_id)
    if error:
        return error

    return jsonify({
        "order_id": order.id,
        "paid": order.paid,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_reference": order.pesapal_reference,
        "total_price": order.total_price
    }), 200


@payment_bp.route("/daraja/callback", methods=["POST"])
def daraja_callback():
    """Handle M-Pesa Daraja callback (STK Push result)"""
    data = request.get_json() or {}

    body = data.get("Body") or {}
    stk_callback = body.get("stkCallback") if body else None
    if not stk_callback:
        return jsonify({"error": "Invalid callback payload"}), 400

    checkout_id = stk_callback.get("CheckoutRequestID")
    result_code = stk_callback.get("ResultCode")
    result_desc = stk_callback.get("ResultDesc")

    order = Order.query.filter_by(pesapal_reference=checkout_id).first()
    if not order:
        return jsonify({"error": "Order not found for callback"}), 404

    if result_code == 0:
        order.paid = True
        order.status = "paid"
    else:
        order.status = "failed"

    # keep latest payment reference and status
    order.pesapal_reference = checkout_id
    db.session.commit()

    return jsonify({
        "success": True,
        "result_code": result_code,
        "result_desc": result_desc,
        "order_id": order.id,
        "status": order.status
    }), 200


@payment_bp.route("/daraja/verify", methods=["POST"])
@jwt_required()
def verify_daraja_payment():
    """Legacy-compatible verification endpoint for Daraja: returns order status"""
    buyer_id = get_jwt_identity()
    data = request.get_json() or {}
    order_id = data.get("order_id")

    if not order_id:
        return jsonify({"error": "Order ID is required"}), 400

    order, error = _get_order_for_buyer(order_id, buyer_id)
    if error:
        return error

    return jsonify({
        "success": True,
        "status": order.status,
        "paid": order.paid,
        "order_id": order.id
    }), 200


# Backward compatibility routes (pesapal -> daraja)
@payment_bp.route("/pesapal/initialize", methods=["POST"])
@jwt_required()
def initialize_pesapal_payment():
    return initialize_daraja_payment()


@payment_bp.route("/pesapal/verify", methods=["POST"])
@jwt_required()
def verify_pesapal_payment():
    return verify_daraja_payment()


@payment_bp.route("/pesapal/check-status/<int:order_id>", methods=["GET"])
@jwt_required()
def check_pesapal_status(order_id):
    return check_daraja_status(order_id)


@payment_bp.route("/pesapal/callback", methods=["POST"])
def pesapal_callback():
    return daraja_callback()

