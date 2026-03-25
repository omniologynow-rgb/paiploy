from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app.models import User, DunningEmail, FailedPayment
from app.schemas import DunningEmailResponse, EmailTemplateResponse
from app.auth import get_current_user
from app.models import EmailTemplate

router = APIRouter(prefix="/api/dunning", tags=["dunning"])


EMAIL_TEMPLATES = {
    EmailTemplate.FRIENDLY_REMINDER: {
        "subject": "Payment Update - {company_name}",
        "body_html": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Hi {customer_name},</h2>
            <p>We noticed that your recent payment of <strong>{amount} {currency}</strong> didn't go through. These things happen!</p>
            <p>Don't worry - we'll automatically retry the payment for you. If you'd like to update your payment method, you can do so anytime.</p>
            <p>If you have any questions, feel free to reach out to us at {support_email}.</p>
            <p>Thanks for being a valued customer!</p>
            <p style="margin-top: 30px;">Best regards,<br>The {company_name} Team</p>
        </body>
        </html>
        """
    },
    EmailTemplate.URGENT_NOTICE: {
        "subject": "Action Required: Payment Failed - {company_name}",
        "body_html": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Action Needed</h2>
            <p>Hi {customer_name},</p>
            <p>Your {product_name} subscription payment of <strong>{amount} {currency}</strong> has failed multiple times.</p>
            <p>To avoid any interruption to your service, please update your payment information as soon as possible.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{update_payment_url}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Payment Method</a>
            </div>
            <p>If you have questions or need assistance, please contact us at {support_email}.</p>
            <p style="margin-top: 30px;">Best regards,<br>The {company_name} Team</p>
        </body>
        </html>
        """
    },
    EmailTemplate.CARD_UPDATE_REQUEST: {
        "subject": "Update Your Payment Method - {company_name}",
        "body_html": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Update Your Payment Method</h2>
            <p>Hi {customer_name},</p>
            <p>We've been unable to process your payment of <strong>{amount} {currency}</strong> for your {product_name} subscription.</p>
            <p>This could be due to an expired card, insufficient funds, or other payment issues.</p>
            <p>Please update your payment method to keep your subscription active:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{update_payment_url}" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Payment Method Now</a>
            </div>
            <p>This secure link will take you directly to your payment settings.</p>
            <p>Need help? Contact us at {support_email}.</p>
            <p style="margin-top: 30px;">Best regards,<br>The {company_name} Team</p>
        </body>
        </html>
        """
    },
    EmailTemplate.FINAL_WARNING: {
        "subject": "Final Notice: Payment Required - {company_name}",
        "body_html": """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Final Notice</h2>
            <p>Hi {customer_name},</p>
            <p>This is a final reminder that we've been unable to process your payment of <strong>{amount} {currency}</strong>.</p>
            <p style="color: #d32f2f; font-weight: bold;">Your subscription will be canceled in 48 hours unless payment is resolved.</p>
            <p>To prevent service interruption, please update your payment method immediately:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{update_payment_url}" style="background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Update Payment Method</a>
            </div>
            <p>If you no longer wish to continue your subscription, you can safely ignore this email.</p>
            <p>For immediate assistance, please contact {support_email}.</p>
            <p style="margin-top: 30px;">Best regards,<br>The {company_name} Team</p>
        </body>
        </html>
        """
    }
}


@router.get("/templates", response_model=List[EmailTemplateResponse])
async def get_email_templates(current_user: User = Depends(get_current_user)):
    templates = []
    for template_name, template_data in EMAIL_TEMPLATES.items():
        templates.append(EmailTemplateResponse(
            name=template_name,
            subject=template_data["subject"],
            body_html=template_data["body_html"]
        ))
    return templates


@router.get("/templates/{template_name}", response_model=EmailTemplateResponse)
async def get_email_template(
    template_name: EmailTemplate,
    current_user: User = Depends(get_current_user)
):
    if template_name not in EMAIL_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")

    template_data = EMAIL_TEMPLATES[template_name]
    return EmailTemplateResponse(
        name=template_name,
        subject=template_data["subject"],
        body_html=template_data["body_html"]
    )


@router.get("/history", response_model=List[DunningEmailResponse])
async def get_dunning_email_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emails = db.query(DunningEmail).join(FailedPayment).filter(
        FailedPayment.user_id == current_user.id
    ).order_by(desc(DunningEmail.sent_at)).limit(100).all()

    return emails
