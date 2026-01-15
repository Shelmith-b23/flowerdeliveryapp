"""Add stock_status to flowers

Revision ID: add_stock_status
Revises: edef582d8750
Create Date: 2026-01-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_stock_status'
down_revision = 'edef582d8750'
branch_labels = None
depends_on = None


def upgrade():
    # Check if column exists before adding (handles both fresh and existing DBs)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('flowers')]
    
    if 'stock_status' not in columns:
        op.add_column('flowers', sa.Column('stock_status', sa.String(length=20), nullable=True, server_default='in_stock'))
        # Set default value for existing rows
        op.execute("UPDATE flowers SET stock_status = 'in_stock' WHERE stock_status IS NULL")


def downgrade():
    # Only drop if it exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('flowers')]
    
    if 'stock_status' in columns:
        op.drop_column('flowers', 'stock_status')

