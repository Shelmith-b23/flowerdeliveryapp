from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db 

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "buyer" or "florist"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Florist-specific fields
    shop_name = db.Column(db.String(120))
    shop_address = db.Column(db.String(200))
    shop_contact = db.Column(db.String(50))

    # Fix: Explicitly tell SQLAlchemy which foreign key to use for this relationship
    flowers = db.relationship(
        "Flower", 
        backref="owner", 
        lazy=True, 
        foreign_keys="Flower.florist_id"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.email} - {self.role}>"


class Flower(db.Model):
    __tablename__ = "flowers"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(250))
    description = db.Column(db.String(250))
    stock_status = db.Column(db.String(20), default="in_stock")  # "in_stock" or "out_of_stock"
    
    # Foreign Keys
    # We keep florist_id as the primary link to the seller
    florist_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # user_id is often used if a flower is "assigned" to a specific buyer/order
    # If you don't need two separate links to Users, you can remove this one.
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True) 
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Flower {self.name} - ${self.price}>"


class Order(db.Model):
    __tablename__ = "orders"
    
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    buyer_name = db.Column(db.String(120), nullable=False)
    buyer_email = db.Column(db.String(120), nullable=False)
    buyer_phone = db.Column(db.String(20), nullable=False)
    delivery_address = db.Column(db.String(300), nullable=False)
    
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="pending")  # pending, paid, processing, delivered
    paid = db.Column(db.Boolean, default=False)
    payment_method = db.Column(db.String(50), default="pesapal")  # pesapal, cash, card, etc.
    pesapal_reference = db.Column(db.String(100), nullable=True)  # PesaPal reference ID
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    buyer = db.relationship("User", backref="orders", foreign_keys=[buyer_id])
    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order #{self.id} - {self.buyer_email}>"


class OrderItem(db.Model):
    __tablename__ = "order_items"
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    flower_id = db.Column(db.Integer, db.ForeignKey("flowers.id"), nullable=False)
    florist_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    flower_name = db.Column(db.String(120), nullable=False)
    florist_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    flower = db.relationship("Flower")
    florist = db.relationship("User", backref="items_sold", foreign_keys=[florist_id])
    
    def __repr__(self):
        return f"<OrderItem {self.flower_name} x{self.quantity}>"