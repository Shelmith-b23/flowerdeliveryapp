from flask import Blueprint, request, jsonify
from ..models import Order, db

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/<int:order_id>', methods=['PUT'])
def update_location(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    data = request.json
    order.delivery_lat = data.get('delivery_lat', order.delivery_lat)
    order.delivery_lng = data.get('delivery_lng', order.delivery_lng)
    db.session.commit()
    return jsonify({'message': 'Delivery location updated'})
