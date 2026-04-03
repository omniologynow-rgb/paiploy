from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum, BigInteger, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class FailureCode(str, enum.Enum):
    CARD_DECLINED = "card_declined"
    INSUFFICIENT_FUNDS = "insufficient_funds"
    EXPIRED_CARD = "expired_card"
    PROCESSING_ERROR = "processing_error"
    AUTHENTICATION_REQUIRED = "authentication_required"
    STOLEN_CARD = "stolen_card"
    FRAUDULENT = "fraudulent"
    OTHER = "other"


class PaymentStatus(str, enum.Enum):
    DETECTED = "detected"
    RETRYING = "retrying"
    RECOVERED = "recovered"
    EXHAUSTED = "exhausted"
    CANCELED = "canceled"


class RetryResult(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class RetryMethod(str, enum.Enum):
    AUTO_RETRY = "auto_retry"
    CARD_UPDATE_LINK = "card_update_link"
    MANUAL = "manual"


class EmailStatus(str, enum.Enum):
    SENT = "sent"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"


class EmailTemplate(str, enum.Enum):
    FRIENDLY_REMINDER = "friendly_reminder"
    URGENT_NOTICE = "urgent_notice"
    FINAL_WARNING = "final_warning"
    CARD_UPDATE_REQUEST = "card_update_request"


class StatsPeriod(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    stripe_connect_id = Column(String, nullable=True)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    stripe_customer_id = Column(String, nullable=True)

    # Email verification
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String, nullable=True)

    # Password reset
    reset_password_token = Column(String, nullable=True)
    reset_password_expires = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    connected_accounts = relationship("ConnectedAccount", back_populates="user")
    failed_payments = relationship("FailedPayment", back_populates="user")
    recovery_stats = relationship("RecoveryStats", back_populates="user")


class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_account_id = Column(String, unique=True, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="connected_accounts")
    failed_payments = relationship("FailedPayment", back_populates="connected_account")


class FailedPayment(Base):
    __tablename__ = "failed_payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connected_account_id = Column(Integer, ForeignKey("connected_accounts.id"), nullable=False)
    stripe_invoice_id = Column(String, nullable=False, index=True)
    stripe_customer_id = Column(String, nullable=False, index=True)
    stripe_subscription_id = Column(String, nullable=True)
    customer_email = Column(String, nullable=False)
    customer_name = Column(String, nullable=True)
    amount_cents = Column(BigInteger, nullable=False)
    currency = Column(String(3), default="usd")
    failure_code = Column(Enum(FailureCode), nullable=False)
    failure_message = Column(String, nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.DETECTED, index=True)
    recovery_method = Column(Enum(RetryMethod), nullable=True)
    recovered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="failed_payments")
    connected_account = relationship("ConnectedAccount", back_populates="failed_payments")
    retry_attempts = relationship("RetryAttempt", back_populates="failed_payment", cascade="all, delete-orphan")
    dunning_emails = relationship("DunningEmail", back_populates="failed_payment", cascade="all, delete-orphan")


class RetryAttempt(Base):
    __tablename__ = "retry_attempts"

    id = Column(Integer, primary_key=True, index=True)
    failed_payment_id = Column(Integer, ForeignKey("failed_payments.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    result = Column(Enum(RetryResult), nullable=True)
    failure_reason = Column(String, nullable=True)
    retry_method = Column(Enum(RetryMethod), default=RetryMethod.AUTO_RETRY)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    failed_payment = relationship("FailedPayment", back_populates="retry_attempts")


class DunningEmail(Base):
    __tablename__ = "dunning_emails"

    id = Column(Integer, primary_key=True, index=True)
    failed_payment_id = Column(Integer, ForeignKey("failed_payments.id"), nullable=False)
    template_name = Column(Enum(EmailTemplate), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(EmailStatus), default=EmailStatus.SENT)

    failed_payment = relationship("FailedPayment", back_populates="dunning_emails")


class RecoveryStats(Base):
    __tablename__ = "recovery_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period = Column(Enum(StatsPeriod), nullable=False)
    period_date = Column(DateTime(timezone=True), nullable=False)
    total_failed_amount = Column(BigInteger, default=0)
    total_recovered_amount = Column(BigInteger, default=0)
    total_failed_count = Column(Integer, default=0)
    total_recovered_count = Column(Integer, default=0)
    recovery_rate_percent = Column(Numeric(5, 2), default=0.0)

    user = relationship("User", back_populates="recovery_stats")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    max_retry_attempts = Column(Integer, default=5)
    retry_interval_1_hours = Column(Integer, default=4)
    retry_interval_2_hours = Column(Integer, default=24)
    retry_interval_3_hours = Column(Integer, default=72)
    retry_interval_4_hours = Column(Integer, default=168)
    retry_interval_5_hours = Column(Integer, default=336)
    send_friendly_reminder = Column(Boolean, default=True)
    send_urgent_notice = Column(Boolean, default=True)
    send_card_update_request = Column(Boolean, default=True)
    send_final_warning = Column(Boolean, default=True)
    support_email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
