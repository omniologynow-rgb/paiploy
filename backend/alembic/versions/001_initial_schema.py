"""Initial schema for RecoverPay

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('company_name', sa.String(), nullable=True),
        sa.Column('stripe_connect_id', sa.String(), nullable=True),
        sa.Column('subscription_tier', sa.Enum('free', 'pro', 'enterprise', name='subscriptiontier'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'connected_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('stripe_account_id', sa.String(), nullable=False),
        sa.Column('access_token', sa.String(), nullable=False),
        sa.Column('refresh_token', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('connected_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_account_id')
    )
    op.create_index(op.f('ix_connected_accounts_id'), 'connected_accounts', ['id'], unique=False)

    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('max_retry_attempts', sa.Integer(), nullable=True),
        sa.Column('retry_interval_1_hours', sa.Integer(), nullable=True),
        sa.Column('retry_interval_2_hours', sa.Integer(), nullable=True),
        sa.Column('retry_interval_3_hours', sa.Integer(), nullable=True),
        sa.Column('retry_interval_4_hours', sa.Integer(), nullable=True),
        sa.Column('retry_interval_5_hours', sa.Integer(), nullable=True),
        sa.Column('send_friendly_reminder', sa.Boolean(), nullable=True),
        sa.Column('send_urgent_notice', sa.Boolean(), nullable=True),
        sa.Column('send_card_update_request', sa.Boolean(), nullable=True),
        sa.Column('send_final_warning', sa.Boolean(), nullable=True),
        sa.Column('support_email', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_settings_id'), 'user_settings', ['id'], unique=False)

    op.create_table(
        'recovery_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('period', sa.Enum('daily', 'weekly', 'monthly', name='statsperiod'), nullable=False),
        sa.Column('period_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('total_failed_amount', sa.BigInteger(), nullable=True),
        sa.Column('total_recovered_amount', sa.BigInteger(), nullable=True),
        sa.Column('total_failed_count', sa.Integer(), nullable=True),
        sa.Column('total_recovered_count', sa.Integer(), nullable=True),
        sa.Column('recovery_rate_percent', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recovery_stats_id'), 'recovery_stats', ['id'], unique=False)

    op.create_table(
        'failed_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('connected_account_id', sa.Integer(), nullable=False),
        sa.Column('stripe_invoice_id', sa.String(), nullable=False),
        sa.Column('stripe_customer_id', sa.String(), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(), nullable=True),
        sa.Column('customer_email', sa.String(), nullable=False),
        sa.Column('customer_name', sa.String(), nullable=True),
        sa.Column('amount_cents', sa.BigInteger(), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('failure_code', sa.Enum('card_declined', 'insufficient_funds', 'expired_card', 'processing_error', 'authentication_required', 'stolen_card', 'fraudulent', 'other', name='failurecode'), nullable=False),
        sa.Column('failure_message', sa.String(), nullable=True),
        sa.Column('failed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.Enum('detected', 'retrying', 'recovered', 'exhausted', 'canceled', name='paymentstatus'), nullable=True),
        sa.Column('recovery_method', sa.Enum('auto_retry', 'card_update_link', 'manual', name='retrymethod'), nullable=True),
        sa.Column('recovered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['connected_account_id'], ['connected_accounts.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_failed_payments_id'), 'failed_payments', ['id'], unique=False)
    op.create_index(op.f('ix_failed_payments_status'), 'failed_payments', ['status'], unique=False)
    op.create_index(op.f('ix_failed_payments_stripe_customer_id'), 'failed_payments', ['stripe_customer_id'], unique=False)
    op.create_index(op.f('ix_failed_payments_stripe_invoice_id'), 'failed_payments', ['stripe_invoice_id'], unique=False)

    op.create_table(
        'retry_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('failed_payment_id', sa.Integer(), nullable=False),
        sa.Column('attempt_number', sa.Integer(), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('executed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('result', sa.Enum('success', 'failed', 'skipped', name='retryresult'), nullable=True),
        sa.Column('failure_reason', sa.String(), nullable=True),
        sa.Column('retry_method', sa.Enum('auto_retry', 'card_update_link', 'manual', name='retrymethod'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['failed_payment_id'], ['failed_payments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_retry_attempts_id'), 'retry_attempts', ['id'], unique=False)

    op.create_table(
        'dunning_emails',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('failed_payment_id', sa.Integer(), nullable=False),
        sa.Column('template_name', sa.Enum('friendly_reminder', 'urgent_notice', 'final_warning', 'card_update_request', name='emailtemplate'), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('opened_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('sent', 'opened', 'clicked', 'bounced', name='emailstatus'), nullable=True),
        sa.ForeignKeyConstraint(['failed_payment_id'], ['failed_payments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dunning_emails_id'), 'dunning_emails', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_dunning_emails_id'), table_name='dunning_emails')
    op.drop_table('dunning_emails')
    op.drop_index(op.f('ix_retry_attempts_id'), table_name='retry_attempts')
    op.drop_table('retry_attempts')
    op.drop_index(op.f('ix_failed_payments_stripe_invoice_id'), table_name='failed_payments')
    op.drop_index(op.f('ix_failed_payments_stripe_customer_id'), table_name='failed_payments')
    op.drop_index(op.f('ix_failed_payments_status'), table_name='failed_payments')
    op.drop_index(op.f('ix_failed_payments_id'), table_name='failed_payments')
    op.drop_table('failed_payments')
    op.drop_index(op.f('ix_recovery_stats_id'), table_name='recovery_stats')
    op.drop_table('recovery_stats')
    op.drop_index(op.f('ix_user_settings_id'), table_name='user_settings')
    op.drop_table('user_settings')
    op.drop_index(op.f('ix_connected_accounts_id'), table_name='connected_accounts')
    op.drop_table('connected_accounts')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
