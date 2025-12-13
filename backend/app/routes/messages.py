from flask import Blueprint, request, jsonify
from ..models import Message, db

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/', methods=['POST'])
def send_message():
    data = request.json
    message = Message(
        sender_id=data['sender_id'],
        receiver_id=data['receiver_id'],
        order_id=data['order_id'],
        content=data['content']
    )
    db.session.add(message)
    db.session.commit()
    return jsonify({'message': 'Message sent', 'id': message.id})

@messages_bp.route('/order/<int:order_id>', methods=['GET'])
def get_messages(order_id):
    messages = Message.query.filter_by(order_id=order_id).order_by(Message.timestamp).all()
    return jsonify([{
        'id': m.id,
        'sender_id': m.sender_id,
        'receiver_id': m.receiver_id,
        'content': m.content,
        'timestamp': m.timestamp.isoformat()
    } for m in messages])
