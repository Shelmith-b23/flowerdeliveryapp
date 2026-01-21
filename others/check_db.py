#!/usr/bin/env python3
import sys
sys.path.insert(0, '/home/wambui/flowerdeliveryapp/backend')

from app import create_app, db
from app.models import Flower, User, Order, OrderItem

app = create_app()
with app.app_context():
    print("\n🌸 Flowers in database:")
    flowers = Flower.query.all()
    for flower in flowers:
        owner = User.query.get(flower.florist_id)
        print(f'   - {flower.name} (ID: {flower.id}) owned by {owner.email} (ID: {flower.florist_id})')
    
    print("\n👥 Users in database:")
    users = User.query.all()
    for user in users:
        print(f'   - {user.name} ({user.email}) - Role: {user.role}')
    
    print("\n📦 Orders in database:")
    orders = Order.query.all()
    for order in orders:
        buyer = User.query.get(order.buyer_id)
        buyer_email = buyer.email if buyer else "Unknown"
        print(f'   - Order #{order.id} from {order.buyer_name} (Buyer: {buyer_email})')
        print(f'     Status: {order.status}, Paid: {order.paid}')
        for item in order.items:
            florist = User.query.get(item.florist_id)
            florist_email = florist.email if florist else "Unknown"
            print(f'       - {item.flower_name} x{item.quantity} by {florist_email} (ID: {item.florist_id})')
