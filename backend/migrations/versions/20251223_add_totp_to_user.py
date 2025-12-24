"""add totp columns to user

Revision ID: 20251223_add_totp_to_user
Revises: db414f9b08d0
Create Date: 2025-12-23 11:20:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251223_add_totp_to_user'
down_revision = 'db414f9b08d0'
branch_labels = None
depends_on = None


def upgrade():
    # Add totp_secret and totp_enabled to user
    op.add_column('user', sa.Column('totp_secret', sa.String(length=64), nullable=True))
    op.add_column('user', sa.Column('totp_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade():
    op.drop_column('user', 'totp_enabled')
    op.drop_column('user', 'totp_secret')
