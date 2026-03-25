from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from app.models import (
    SubscriptionTier, FailureCode, PaymentStatus, RetryResult,
    RetryMethod, EmailStatus, EmailTemplate, StatsPeriod
)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    company_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    company_name: Optional[str]
    subscription_tier: SubscriptionTier
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class ConnectedAccountResponse(BaseModel):
    id: int
    stripe_account_id: str
    is_active: bool
    connected_at: datetime

    class Config:
        from_attributes = True


class RetryAttemptResponse(BaseModel):
    id: int
    attempt_number: int
    scheduled_at: datetime
    executed_at: Optional[datetime]
    result: Optional[RetryResult]
    failure_reason: Optional[str]
    retry_method: RetryMethod

    class Config:
        from_attributes = True


class DunningEmailResponse(BaseModel):
    id: int
    template_name: EmailTemplate
    sent_at: datetime
    opened_at: Optional[datetime]
    clicked_at: Optional[datetime]
    status: EmailStatus

    class Config:
        from_attributes = True


class FailedPaymentResponse(BaseModel):
    id: int
    stripe_invoice_id: str
    stripe_customer_id: str
    customer_email: str
    customer_name: Optional[str]
    amount_cents: int
    currency: str
    failure_code: FailureCode
    failure_message: Optional[str]
    failed_at: datetime
    status: PaymentStatus
    recovery_method: Optional[RetryMethod]
    recovered_at: Optional[datetime]
    created_at: datetime
    retry_attempts: List[RetryAttemptResponse] = []
    dunning_emails: List[DunningEmailResponse] = []

    class Config:
        from_attributes = True


class FailedPaymentListResponse(BaseModel):
    id: int
    stripe_customer_id: str
    customer_email: str
    customer_name: Optional[str]
    amount_cents: int
    currency: str
    failure_code: FailureCode
    failed_at: datetime
    status: PaymentStatus
    retry_count: int = 0

    class Config:
        from_attributes = True


class RecoveryStatsResponse(BaseModel):
    total_failed_amount: int
    total_recovered_amount: int
    total_failed_count: int
    total_recovered_count: int
    recovery_rate_percent: float
    revenue_at_risk: int
    active_retries: int


class TimelineDataPoint(BaseModel):
    date: str
    recovered_amount: int
    failed_amount: int


class FailureBreakdown(BaseModel):
    failure_code: str
    count: int
    percentage: float


class DashboardStatsResponse(BaseModel):
    revenue_at_risk: int
    revenue_recovered: int
    recovery_rate: float
    active_retries: int
    timeline: List[TimelineDataPoint]
    failure_breakdown: List[FailureBreakdown]


class UserSettingsResponse(BaseModel):
    id: int
    max_retry_attempts: int
    retry_interval_1_hours: int
    retry_interval_2_hours: int
    retry_interval_3_hours: int
    retry_interval_4_hours: int
    retry_interval_5_hours: int
    send_friendly_reminder: bool
    send_urgent_notice: bool
    send_card_update_request: bool
    send_final_warning: bool
    support_email: Optional[str]

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    max_retry_attempts: Optional[int] = None
    retry_interval_1_hours: Optional[int] = None
    retry_interval_2_hours: Optional[int] = None
    retry_interval_3_hours: Optional[int] = None
    retry_interval_4_hours: Optional[int] = None
    retry_interval_5_hours: Optional[int] = None
    send_friendly_reminder: Optional[bool] = None
    send_urgent_notice: Optional[bool] = None
    send_card_update_request: Optional[bool] = None
    send_final_warning: Optional[bool] = None
    support_email: Optional[str] = None


class EmailTemplateResponse(BaseModel):
    name: EmailTemplate
    subject: str
    body_html: str


class StripeWebhookEvent(BaseModel):
    type: str
    data: dict
