"""Increase password_hash field length to accommodate scrypt hashes

Revision ID: increase_password_hash_length
Revises: add_stock_status
Create Date: 2026-02-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'increase_password_hash_length'
down_revision = 'add_stock_status'
branch_labels = None
depends_on = None


def upgrade():
    # Get the database dialect
    dialect_name = op.get_context().dialect.name
    
    if dialect_name == 'sqlite':
        # SQLite requires batch mode for column type changes
        with op.batch_alter_table('users', schema=None) as batch_op:
            batch_op.alter_column('password_hash',
                           existing_type=sa.String(length=128),
                           type_=sa.String(length=255),
                           existing_nullable=False)
    else:
        # PostgreSQL and other databases can use direct ALTER
        op.alter_column('users', 'password_hash',
                       existing_type=sa.String(length=128),
                       type_=sa.String(length=255),
                       existing_nullable=False)


def downgrade():
    # Get the database dialect
    dialect_name = op.get_context().dialect.name
    
    if dialect_name == 'sqlite':
        # SQLite requires batch mode for column type changes
        with op.batch_alter_table('users', schema=None) as batch_op:
            batch_op.alter_column('password_hash',
                           existing_type=sa.String(length=255),
                           type_=sa.String(length=128),
                           existing_nullable=False)
    else:
        # PostgreSQL and other databases can use direct ALTER
        op.alter_column('users', 'password_hash',
                       existing_type=sa.String(length=255),
                       type_=sa.String(length=128),
                       existing_nullable=False)
