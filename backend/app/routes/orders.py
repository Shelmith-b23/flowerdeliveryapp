from flask import Blueprint, request, jsonify
from ..models import Order, db, Flower

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
def create_order():
    data = request.json
    flower = Flower.query.get(data['flower_id'])
    if not flower:
        return jsonify({'error': 'Flower not found'}), 404
    total_price = float(flower.price) * int(data['quantity'])
    order = Order(
        buyer_id=data['buyer_id'],
        florist_id=flower.florist_id,
        flower_id=flower.id,
        quantity=data['quantity'],
        total_price=total_price,
        status='pending',
        delivery_lat=data.get('delivery_lat'),
        delivery_lng=data.get('delivery_lng')
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({'message': 'Order created', 'id': order.id})

@orders_bp.route('/buyer/<int:buyer_id>', methods=['GET'])
def get_orders_by_buyer(buyer_id):
    orders = Order.query.filter_by(buyer_id=buyer_id).all()
    return jsonify([{
        'id': o.id,
        'flower_id': o.flower_id,
        'quantity': o.quantity,
        'total_price': float(o.total_price),
        'status': o.status,
        'delivery_lat': float(o.delivery_lat) if o.delivery_lat else None,
        'delivery_lng': float(o.delivery_lng) if o.delivery_lng else None
    } for o in orders])

@orders_bp.route('/florist/<int:florist_id>', methods=['GET'])
def get_orders_by_florist(florist_id):
    orders = Order.query.filter_by(florist_id=florist_id).all()
    return jsonify([{
        'id': o.id,
        'flower_id': o.flower_id,
        'buyer_id': o.buyer_id,
        'quantity': o.quantity,
        'total_price': float(o.total_price),
        'status': o.status
    } for o in orders])

@orders_bp.route('/<int:id>', methods=['PUT'])
def update_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    data = request.json
    order.status = data.get('status', order.status)
    db.session.commit()
    return jsonify({'message': 'Order updated'})
