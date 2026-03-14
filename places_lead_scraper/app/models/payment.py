"""
SQLAlchemy ORM models for payment and billing management.

This module defines models for tracking payments, invoices, and billing history.
"""

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Float, Integer, Index
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

from app.database import Base


class Payment(Base):
    """
    Payment model for tracking payment transactions.

    Attributes:
        id: Unique identifier (UUID primary key)
        user_id: Reference to the user making the payment
        subscription_id: Reference to the subscription being paid for
        razorpay_order_id: Razorpay order ID
        razorpay_payment_id: Razorpay payment ID
        razorpay_signature: Razorpay payment signature for verification
        amount: Payment amount in smallest currency unit (paise)
        currency: Currency code (INR)
        status: Payment status (pending, completed, failed, refunded)
        plan_name: Plan name at time of payment
        payment_method: Payment method used
        is_recurring: Whether this is a recurring payment
        next_payment_date: Date for next recurring payment
        created_at: When the payment was created
        updated_at: When the payment was last updated
    """

    __tablename__ = "payments"

    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
        nullable=False
    )

    user_id = Column(
        String(50),
        nullable=True,  # MongoDB ObjectId as string, null for new users during signup
        index=True
    )

    subscription_id = Column(
        String(50),
        nullable=True,
        index=True
    )

    razorpay_order_id = Column(
        String(100),
        nullable=True,
        index=True
    )

    razorpay_payment_id = Column(
        String(100),
        nullable=True,
        unique=True,
        index=True
    )

    razorpay_signature = Column(
        String(500),
        nullable=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    # GST (Goods and Services Tax) fields for India
    gst_amount = Column(
        Float,
        default=0,
        nullable=False
    )

    gst_percentage = Column(
        Float,
        default=18,
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR",
        nullable=False
    )

    status = Column(
        String(20),
        default="pending",
        nullable=False,
        index=True
    )  # pending, completed, failed, refunded

    plan_name = Column(
        String(50),
        nullable=False
    )

    payment_method = Column(
        String(50),
        default="razorpay",
        nullable=False
    )

    is_recurring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    next_payment_date = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Composite index for fast lookups
    __table_args__ = (
        Index("idx_user_status", "user_id", "status"),
        Index("idx_payment_date", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<Payment {self.id} | User: {self.user_id} | "
            f"Amount: {self.amount} {self.currency} | Status: {self.status}>"
        )


class Invoice(Base):
    """
    Invoice model for billing records.

    Attributes:
        id: Unique identifier (UUID primary key)
        user_id: User who received the invoice
        payment_id: Reference to the payment
        subscription_id: Reference to the subscription
        invoice_number: Unique invoice number
        amount: Invoice amount
        tax_amount: Tax amount (if applicable)
        total_amount: Total amount including tax
        status: Invoice status (drafted, issued, paid, overdue)
        issued_at: When invoice was issued
        due_date: When payment is due
        paid_at: When invoice was paid
    """

    __tablename__ = "invoices"

    id = Column(
        PostgresUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
        nullable=False
    )

    user_id = Column(
        String(50),
        nullable=False,  # MongoDB ObjectId as string
        index=True
    )

    payment_id = Column(
        PostgresUUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="SET NULL"),
        nullable=True
    )

    subscription_id = Column(
        String(50),
        nullable=False,
        index=True
    )

    invoice_number = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    tax_amount = Column(
        Float,
        default=0,
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False
    )

    status = Column(
        String(20),
        default="issued",
        nullable=False
    )  # drafted, issued, paid, overdue, cancelled

    issued_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    due_date = Column(
        DateTime,
        nullable=False
    )

    paid_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    __table_args__ = (
        Index("idx_invoice_user_status", "user_id", "status"),
        Index("idx_invoice_date", "issued_at"),
    )

    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_number} | Amount: {self.total_amount} | Status: {self.status}>"
