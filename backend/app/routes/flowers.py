from flask import Blueprint, request, jsonify
from sqlalchemy import func
from ..models import Flower, Order, db
from ..models import User

flowers_bp = Blueprint('flowers', __name__)

@flowers_bp.route('/', methods=['GET'])
def get_flowers():
    """Return all flowers with created_at so clients can show 'new arrivals'."""
    flowers = Flower.query.order_by(Flower.created_at.desc()).all()
    return jsonify([{
        'id': f.id,
        'name': f.name,
        'description': f.description,
        'price': float(f.price),
        'image_url': f.image_url,
        'florist_id': f.florist_id,
        'created_at': f.created_at.isoformat() if f.created_at else None
    } for f in flowers])

@flowers_bp.route('/best_selling', methods=['GET'])
def best_selling():
    """Return top N best-selling flowers aggregated by orders."""
    limit = int(request.args.get('limit', 6))
    # Aggregate total quantity sold per flower
    sold = db.session.query(
        Order.flower_id,
        func.sum(Order.quantity).label('total_sold')
    ).group_by(Order.flower_id).order_by(func.sum(Order.quantity).desc()).limit(limit).all()

    # Build list of flower details with total_sold
    results = []
    for flower_id, total_sold in sold:
        f = Flower.query.get(flower_id)
        if not f:
            continue
        results.append({
            'id': f.id,
            'name': f.name,
            'description': f.description,
            'price': float(f.price),
            'image_url': f.image_url,
            'florist_id': f.florist_id,
            'total_sold': int(total_sold)
        })

    return jsonify(results)

@flowers_bp.route('/florist/<int:florist_id>', methods=['GET'])
def get_flowers_by_florist(florist_id):
    flowers = Flower.query.filter_by(florist_id=florist_id).all()
    return jsonify([{
        'id': f.id,
        'name': f.name,
        'description': f.description,
        'price': float(f.price),
        'image_url': f.image_url
    } for f in flowers])


@flowers_bp.route('/by_florist', methods=['GET'])
def flowers_by_florist():
    """Return a list of florists and the flowers they sell."""
    florists = User.query.filter_by(role='florist').all()
    results = []
    for florist in florists:
        flowers = Flower.query.filter_by(florist_id=florist.id).all()
        results.append({
            'florist_id': florist.id,
            'florist_name': florist.name,
            'flowers': [{
                'id': f.id,
                'name': f.name,
                'description': f.description,
                'price': float(f.price),
                'image_url': f.image_url
            } for f in flowers]
        })

    return jsonify(results)

@flowers_bp.route('/', methods=['POST'])
def add_flower():
    data = request.json
    flower = Flower(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        image_url=data.get('image_url', ''),
        florist_id=data['florist_id']
    )
    db.session.add(flower)
    db.session.commit()
    return jsonify({'message': 'Flower added', 'id': flower.id})

@flowers_bp.route('/<int:id>', methods=['PUT'])
def update_flower(id):
    flower = Flower.query.get(id)
    if not flower:
        return jsonify({'error': 'Flower not found'}), 404
    data = request.json
    flower.name = data.get('name', flower.name)
    flower.description = data.get('description', flower.description)
    flower.price = data.get('price', flower.price)
    flower.image_url = data.get('image_url', flower.image_url)
    db.session.commit()
    return jsonify({'message': 'Flower updated'})

@flowers_bp.route('/<int:id>', methods=['DELETE'])
def delete_flower(id):
    flower = Flower.query.get(id)
    if not flower:
        return jsonify({'error': 'Flower not found'}), 404
    db.session.delete(flower)
    db.session.commit()
    return jsonify({'message': 'Flower deleted'})
