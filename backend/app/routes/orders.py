from flask import Blueprint, request, jsonify
from flask_mail import Message
from app import db, mail
from app.models import Order, OrderItem

orders_bp = Blueprint("orders", __name__)

def send_order_email(user_email, order):
    items_html = "".join(
        f"<li>{item.flower_name} × {item.quantity} — KES {item.price}</li>"
        for item in order.items
    )

    msg = Message(
        subject="Order Confirmation 🌸",
        recipients=[user_email],
        html=f"""
        <h2>Thank you for your order!</h2>
        <p><strong>Order ID:</strong> #{order.id}</p>

        <h3>Items Ordered</h3>
        <ul>{items_html}</ul>

        <p><strong>Total:</strong> KES {order.total}</p>
        """
    )

    mail.send(msg)
@orders_bp.route("/", methods=["POST"])
def create_order():
    data = request.get_json()
    user_email = data.get("user_email")
    items_data = data.get("items", [])

    if not user_email or not items_data:
        return jsonify({"error": "Invalid order data"}), 400

    order = Order(user_email=user_email, total=0)
    db.session.add(order)
    db.session.flush()  # Get order ID before committing

    total = 0
    for item_data in items_data:
        flower_name = item_data.get("flower_name")
        quantity = item_data.get("quantity")
        price = item_data.get("price")

        if not flower_name or not quantity or not price:
            continue

        order_item = OrderItem(
            order_id=order.id,
            flower_name=flower_name,
            quantity=quantity,
            price=price
        )
        db.session.add(order_item)
        total += price * quantity

    order.total = total
    db.session.commit()

    send_order_email(user_email, order)

    return jsonify({"message": "Order created successfully", "order_id": order.id}), 201    
