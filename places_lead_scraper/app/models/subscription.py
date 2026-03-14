"""
SQLAlchemy ORM models for subscription management.

This module defines the Subscription model which tracks user subscriptions
to different products and plans in the SaaS backend.
"""

from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, String, DateTime, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from pydantic import BaseModel

from app.database import Base


class Subscription(Base):
    """
    Subscription model for tracking user plan subscriptions.

    Attributes:
        id: Unique identifier (UUID primary key)
        user_id: Reference to the user who owns this subscription
        product_name: Name of the product (e.g., 'bizlead')
        plan_name: Name of the plan tier (e.g., 'free', 'starter', 'professional')
        start_date: When the subscription started
        expiry_date: When the subscription expires
        is_active: Whether this subscription is currently active
    """

    __tablename__ = "subscriptions"

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

    product_name = Column(
        String(50),
        nullable=False,
        index=True
    )

    plan_name = Column(
        String(50),
        nullable=False
    )

    start_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    expiry_date = Column(
        DateTime,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True
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

    # Composite index for fast lookups of active subscriptions
    __table_args__ = (
        Index("idx_user_product_active", "user_id", "product_name", "is_active"),
        Index("idx_user_product_expiry", "user_id", "product_name", "expiry_date"),
    )

    def __repr__(self) -> str:
        """String representation of Subscription."""
        return (
            f"<Subscription(id={self.id}, user_id={self.user_id}, "
            f"product={self.product_name}, plan={self.plan_name}, "
            f"active={self.is_active})>"
        )


# ============================================================================
# PYDANTIC MODELS FOR API RESPONSES
# ============================================================================


class TrialSubscription(BaseModel):
    """Trial subscription response model."""
    plan_name: str
    leads_limit: int
    trial_days: int
    is_active: bool
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True
