from flask import Blueprint, request, jsonify
from ..models import Flower, db

flowers_bp = Blueprint('flowers', __name__)

@flowers_bp.route('/', methods=['GET'])
def get_flowers():
    flowers = Flower.query.all()
    return jsonify([{
        'id': f.id,
        'name': f.name,
        'description': f.description,
        'price': float(f.price),
        'image_url': f.image_url,
        'florist_id': f.florist_id
    } for f in flowers])

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
