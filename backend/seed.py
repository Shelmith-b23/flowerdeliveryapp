#!/usr/bin/env python
"""
Database seeding script - runs safely and idempotently
"""
import os
import sys

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import User, Flower, Order, OrderItem

def seed_database():
    """Seed the database with initial data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if database already has users (to avoid duplicates)
        if User.query.first() is not None:
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create sample users
        buyer = User(
            name="Test Buyer",
            email="buyer@example.com",
            password_hash="hashed_password",
            role="buyer"
        )
        
        florist = User(
            name="Test Florist",
            email="florist@example.com",
            password_hash="hashed_password",
            role="florist",
            shop_name="Beautiful Blooms",
            shop_address="123 Flower Street",
            shop_contact="+254712345678"
        )
        
        db.session.add(buyer)
        db.session.add(florist)
        db.session.commit()
        
        # Create sample flowers
        flower = Flower(
            name="Red Roses",
            description="Beautiful red roses",
            price=2500,
            category="Roses",
            florist_id=florist.id,
            stock_status="in_stock"
        )
        
        db.session.add(flower)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
