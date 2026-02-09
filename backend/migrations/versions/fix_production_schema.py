"""Fix production database schema - ensure password_hash is VARCHAR(255)

Revision ID: fix_production_schema
Revises: 
Create Date: 2026-02-09

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'fix_production_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """
    This migration handles both fresh and existing databases.
    For existing production DBs, it fixes the password_hash column size.
    For new DBs, it creates all tables with correct schema.
    """
    
    dialect_name = op.get_context().dialect.name
    connection = op.get_context().bind
    inspector = inspect(connection)
    
    # Check if users table exists
    tables = inspector.get_table_names()
    users_exists = 'users' in tables
    
    if not users_exists:
        # Create all tables if they don't exist
        op.create_table('users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=120), nullable=False),
            sa.Column('email', sa.String(length=120), nullable=False),
            sa.Column('password_hash', sa.String(length=255), nullable=False),
            sa.Column('role', sa.String(length=20), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('shop_name', sa.String(length=120), nullable=True),
            sa.Column('shop_address', sa.String(length=200), nullable=True),
            sa.Column('shop_contact', sa.String(length=50), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('email')
        )
        op.create_table('flowers',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=120), nullable=False),
            sa.Column('price', sa.Float(), nullable=False),
            sa.Column('image_url', sa.String(length=250), nullable=True),
            sa.Column('description', sa.String(length=250), nullable=True),
            sa.Column('stock_status', sa.String(length=20), nullable=True),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('florist_id', sa.Integer(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['florist_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_table('orders',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('buyer_id', sa.Integer(), nullable=False),
            sa.Column('buyer_name', sa.String(length=120), nullable=False),
            sa.Column('buyer_email', sa.String(length=120), nullable=False),
            sa.Column('buyer_phone', sa.String(length=20), nullable=False),
            sa.Column('delivery_address', sa.String(length=300), nullable=False),
            sa.Column('total_price', sa.Float(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=True),
            sa.Column('paid', sa.Boolean(), nullable=True),
            sa.Column('payment_method', sa.String(length=50), nullable=True),
            sa.Column('pesapal_reference', sa.String(length=100), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['buyer_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_table('order_items',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('order_id', sa.Integer(), nullable=False),
            sa.Column('flower_id', sa.Integer(), nullable=False),
            sa.Column('florist_id', sa.Integer(), nullable=False),
            sa.Column('flower_name', sa.String(length=120), nullable=False),
            sa.Column('florist_name', sa.String(length=120), nullable=False),
            sa.Column('quantity', sa.Integer(), nullable=False),
            sa.Column('unit_price', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['florist_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['flower_id'], ['flowers.id'], ),
            sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        # Table exists - fix the password_hash column if needed
        columns = {col['name']: col for col in inspector.get_columns('users')}
        
        if 'password_hash' in columns:
            password_hash_col = columns['password_hash']
            # Check if it needs to be enlarged (PostgreSQL type_string is different)
            col_type_str = str(password_hash_col['type'])
            
            # If it's VARCHAR(128) or smaller, fix it
            if 'VARCHAR(128)' in col_type_str or 'VARCHAR' in col_type_str and '128' in col_type_str:
                if dialect_name == 'sqlite':
                    with op.batch_alter_table('users', schema=None) as batch_op:
                        batch_op.alter_column('password_hash',
                                       existing_type=sa.String(length=128),
                                       type_=sa.String(length=255),
                                       existing_nullable=False)
                else:
                    # PostgreSQL
                    op.alter_column('users', 'password_hash',
                                   existing_type=sa.String(length=128),
                                   type_=sa.String(length=255),
                                   existing_nullable=False)


def downgrade():
    # Don't downgrade - this is a production fix
    pass
