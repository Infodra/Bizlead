"""
Payment service for handling Razorpay integration and payment processing.

This module provides functions to:
1. Create Razorpay orders
2. Verify payment signatures
3. Process payments and activate subscriptions
4. Track payment history
5. Handle recurring payments with GST
"""

import hmac
import hashlib
import os
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
import requests

from app.models.payment import Payment, Invoice
from app.models.subscription import Subscription
from app.services.subscription_service import activate_subscription
from app.config.gst_config import calculate_gst_from_paise
from app.services.invoice_service import create_invoice
from app.config.settings import settings


# Razorpay API Keys from settings (loaded from .env via Pydantic BaseSettings)
RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID or ""
RAZORPAY_KEY_SECRET = settings.RAZORPAY_KEY_SECRET or ""
RAZORPAY_API_URL = "https://api.razorpay.com/v1"

# Plan pricing configuration (amount in paise, before GST)
PLAN_PRICING = {
    "starter": {"amount": 300000, "max_leads": 500},       # ₹3,000 in paise
    "professional": {"amount": 950000, "max_leads": 2000},  # ₹9,500 in paise
}


def get_plan_amount(plan_name: str) -> int:
    """Get amount in paise for a plan (before GST)"""
    if plan_name not in PLAN_PRICING:
        raise ValueError(f"Invalid plan: {plan_name}")
    return PLAN_PRICING[plan_name]["amount"]


def get_plan_with_gst(plan_name: str) -> dict:
    """
    Get plan pricing including GST calculation.
    
    Returns:
        dict: {
            'plan_name': str,
            'base_amount': int (paise),
            'gst_amount': int (paise),
            'total_amount': int (paise),
            'max_leads': int,
            'gst_percentage': float
        }
    """
    if plan_name not in PLAN_PRICING:
        raise ValueError(f"Invalid plan: {plan_name}")
    
    base_amount_paise = PLAN_PRICING[plan_name]["amount"]
    
    # Calculate GST
    gst_calc = calculate_gst_from_paise(base_amount_paise)
    
    return {
        'plan_name': plan_name,
        'base_amount': gst_calc['base_amount_paise'],
        'gst_amount': gst_calc['gst_amount_paise'],
        'total_amount': gst_calc['total_amount_paise'],
        'max_leads': PLAN_PRICING[plan_name]["max_leads"],
        'gst_percentage': gst_calc['gst_percentage'],
        'currency': 'INR'
    }


def create_razorpay_order(
    db: Session,
    user_id: UUID | None,
    plan_name: str,
    user_email: str,
    user_name: str
) -> dict:
    """
    Create a Razorpay order for payment.

    Supports both authenticated users and new users signing up.

    Args:
        db: SQLAlchemy database session
        user_id: User ID (optional, None for new users)
        plan_name: Plan to purchase (free, starter, professional)
        user_email: User email for receipt
        user_name: User full name

    Returns:
        dict: Razorpay order details with order_id

    Raises:
        ValueError: If plan is invalid or API call fails
    """
    # Get plan details with GST calculation
    plan_gst = get_plan_with_gst(plan_name)
    base_amount = plan_gst['base_amount']
    gst_amount = plan_gst['gst_amount']
    total_amount = plan_gst['total_amount']
    gst_percentage = plan_gst['gst_percentage']

    # For free plan, no payment needed - still create payment record for tracking
    if total_amount == 0:
        timestamp = int(datetime.utcnow().timestamp())
        receipt_id = f"free_{user_id or 'new'}_{timestamp}"
        
        # Create payment record for free plan
        payment = Payment(
            user_id=user_id,
            razorpay_order_id=receipt_id,
            amount=0,
            gst_amount=0,
            gst_percentage=0,
            total_amount=0,
            currency="INR",
            status="completed",  # Free plans are auto-completed
            plan_name=plan_name,
            is_recurring=False,
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        return {
            "order_id": receipt_id,
            "amount": 0,
            "gst_amount": 0,
            "total_amount": 0,
            "gst_percentage": 0,
            "currency": "INR",
            "plan": plan_name,
            "payment_id": str(payment.id)
        }

    # Create Razorpay order with GST
    try:
        timestamp = int(datetime.utcnow().timestamp())
        receipt_id = f"order_{user_id or 'new'}_{timestamp}"
        
        response = requests.post(
            f"{RAZORPAY_API_URL}/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount": total_amount,  # Total amount including GST in paise
                "currency": "INR",
                "receipt": receipt_id,
                "notes": {
                    "user_id": str(user_id) if user_id else "new_user",
                    "plan": plan_name,
                    "email": user_email,
                    "name": user_name,
                    "base_amount": base_amount,
                    "gst_amount": gst_amount,
                    "gst_percentage": gst_percentage
                }
            },
            timeout=10
        )
        
        if response.status_code != 200:
            raise ValueError(f"Razorpay API error: {response.text}")

        order_data = response.json()
        
        # Store pending payment record with GST details
        payment = Payment(
            user_id=user_id,
            razorpay_order_id=order_data["id"],
            amount=base_amount / 100,  # Convert paise to rupees
            gst_amount=gst_amount / 100,  # Convert paise to rupees
            gst_percentage=gst_percentage,
            total_amount=total_amount / 100,  # Convert paise to rupees
            currency="INR",
            status="pending",
            plan_name=plan_name,
            is_recurring=True,
            next_payment_date=datetime.utcnow() + timedelta(days=30)
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)

        return {
            "order_id": order_data["id"],
            "amount": base_amount,
            "gst_amount": gst_amount,
            "total_amount": total_amount,
            "gst_percentage": gst_percentage,
            "currency": "INR",
            "plan": plan_name,
            "payment_id": str(payment.id)
        }

    except requests.RequestException as e:
        raise ValueError(f"Failed to create Razorpay order: {str(e)}")


def verify_razorpay_payment(
    order_id: str,
    payment_id: str,
    signature: str,
    db: Session,
    user_id: UUID | None
) -> bool:
    """
    Verify Razorpay payment signature.

    Supports both authenticated users and new user signups.

    Args:
        order_id: Razorpay order ID
        payment_id: Razorpay payment ID
        signature: Payment signature from Razorpay
        db: SQLAlchemy database session
        user_id: User ID (optional, None for new users)

    Returns:
        bool: True if signature is valid, False otherwise
    """
    # Create message string
    message = f"{order_id}|{payment_id}"
    
    # Compute the signature
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Compare signatures
    is_valid = hmac.compare_digest(expected_signature, signature)
    
    if is_valid:
        # Update payment record
        # For new users (user_id=None), find by order_id only
        if user_id:
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id,
                Payment.user_id == user_id
            ).first()
        else:
            # For new users, find most recent payment with this order_id
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).order_by(Payment.created_at.desc()).first()
        
        if payment:
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = "completed"
            db.commit()
    
    return is_valid


def process_payment(
    db: Session,
    user_id: UUID,
    payment_id: str,
    plan_name: str,
    duration_days: int = 30
) -> Subscription:
    """
    Process payment and activate subscription.

    Args:
        db: SQLAlchemy database session
        user_id: User ID
        payment_id: Payment record ID
        plan_name: Plan to activate
        duration_days: Subscription duration in days

    Returns:
        Subscription: Activated subscription

    Raises:
        ValueError: If payment is not completed or plan is invalid
    """
    # Get payment record
    payment = db.query(Payment).filter(
        Payment.id == UUID(payment_id),
        Payment.user_id == user_id
    ).first()
    
    if not payment:
        raise ValueError("Payment not found")
    
    if payment.status != "completed":
        raise ValueError(f"Payment status is {payment.status}, expected completed")
    
    # Activate subscription
    subscription = activate_subscription(
        db=db,
        user_id=user_id,
        product_name="bizlead",
        plan_name=plan_name,
        duration_days=duration_days
    )
    
    # Link subscription to payment
    payment.subscription_id = subscription.id
    db.commit()
    
    # Create invoice
    create_invoice(db, user_id, payment, subscription)
    
    return subscription


def create_invoice(
    db: Session,
    user_id: UUID,
    payment: Payment,
    subscription: Subscription
) -> Invoice:
    """
    Create an invoice for the payment with GST details.

    Args:
        db: SQLAlchemy database session
        user_id: User ID
        payment: Payment record
        subscription: Subscription record

    Returns:
        Invoice: Created invoice
    """
    from app.services.invoice_service import generate_invoice_number
    
    # Get GST amount from payment record
    gst_amount = payment.gst_amount if payment.gst_amount else 0
    total_amount = payment.total_amount if payment.total_amount else payment.amount
    base_amount = payment.amount
    
    invoice_number = generate_invoice_number(db)
    
    invoice = Invoice(
        user_id=user_id,
        payment_id=payment.id,
        subscription_id=subscription.id,
        invoice_number=invoice_number,
        amount=base_amount,
        tax_amount=gst_amount,
        total_amount=total_amount,
        status="paid" if payment.status == "completed" else "issued",
        issued_at=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=30),
        paid_at=datetime.utcnow() if payment.status == "completed" else None
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    return invoice


def get_payment_history(
    db: Session,
    user_id: UUID,
    limit: int = 10
) -> list[Payment]:
    """
    Get payment history for a user.

    Args:
        db: SQLAlchemy database session
        user_id: User ID
        limit: Number of records to return

    Returns:
        list[Payment]: Payment records
    """
    return db.query(Payment).filter(
        Payment.user_id == user_id
    ).order_by(
        Payment.created_at.desc()
    ).limit(limit).all()


def get_invoices(
    db: Session,
    user_id: UUID,
    limit: int = 20
) -> list[Invoice]:
    """
    Get invoices for a user.

    Args:
        db: SQLAlchemy database session
        user_id: User ID
        limit: Number of records to return

    Returns:
        list[Invoice]: Invoice records
    """
    return db.query(Invoice).filter(
        Invoice.user_id == user_id
    ).order_by(
        Invoice.issued_at.desc()
    ).limit(limit).all()


def schedule_next_payment(
    db: Session,
    payment_id: UUID
):
    """
    Schedule the next recurring payment.

    Args:
        db: SQLAlchemy database session
        payment_id: Payment record ID
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment or not payment.is_recurring:
        return
    
    # Set next payment date to 30 days from now
    payment.next_payment_date = datetime.utcnow() + timedelta(days=30)
    db.commit()
