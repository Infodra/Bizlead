"""
Business logic for subscription management and plan access control.

This module provides functions to manage user subscriptions, activate plans,
and retrieve subscription details integrated with the PLAN_CONFIG system.
"""

from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.subscription import Subscription
from app.config.plans import get_plan_limits, get_plan_features


def activate_subscription(
    db: Session,
    user_id: UUID,
    product_name: str,
    plan_name: str,
    duration_days: int = 30
) -> Subscription:
    """
    Activate a new subscription for a user, deactivating any existing active subscription.

    This function:
    1. Deactivates any currently active subscription for the same user & product
    2. Creates a new subscription record
    3. Sets expiry date to duration_days from now
    4. Commits changes to the database

    Args:
        db (Session): SQLAlchemy database session
        user_id (UUID): The user's unique identifier
        product_name (str): Name of the product (e.g., 'bizlead')
        plan_name (str): Name of the plan tier (e.g., 'free', 'starter', 'professional')
        duration_days (int): Number of days until subscription expires (default: 30)

    Returns:
        Subscription: The newly created subscription object

    Raises:
        ValueError: If the product or plan does not exist in PLAN_CONFIG

    Example:
        >>> sub = activate_subscription(db, user_id, "bizlead", "starter")
        >>> sub.plan_name
        'starter'
    """
    # Validate product and plan exist in PLAN_CONFIG
    get_plan_limits(product_name, plan_name)

    # Deactivate any existing active subscription for this user & product
    existing_subscriptions = db.query(Subscription).filter(
        and_(
            Subscription.user_id == user_id,
            Subscription.product_name == product_name,
            Subscription.is_active == True
        )
    ).all()

    for sub in existing_subscriptions:
        sub.is_active = False

    # Create new subscription
    new_subscription = Subscription(
        user_id=user_id,
        product_name=product_name,
        plan_name=plan_name,
        start_date=datetime.utcnow(),
        expiry_date=datetime.utcnow() + timedelta(days=duration_days),
        is_active=True
    )

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return new_subscription


def get_user_subscription(
    db: Session,
    user_id: UUID,
    product_name: str
) -> Subscription | None:
    """
    Retrieve the active subscription for a user and product.

    This function returns the currently active subscription for a given user
    and product. If no active subscription exists or it has expired, returns None.

    Args:
        db (Session): SQLAlchemy database session
        user_id (UUID): The user's unique identifier
        product_name (str): Name of the product (e.g., 'bizlead')

    Returns:
        Subscription | None: Active subscription if found, None otherwise

    Example:
        >>> sub = get_user_subscription(db, user_id, "bizlead")
        >>> if sub:
        ...     print(f"User has {sub.plan_name} plan")
    """
    subscription = db.query(Subscription).filter(
        and_(
            Subscription.user_id == user_id,
            Subscription.product_name == product_name,
            Subscription.is_active == True,
            Subscription.expiry_date > datetime.utcnow()
        )
    ).first()

    return subscription


def get_user_plan_details(db: Session, user_id: UUID, product_name: str) -> dict:
    """
    Get complete plan details for a user including limits and features.

    This function retrieves the user's active subscription and returns
    comprehensive plan information by looking up the PLAN_CONFIG.

    Args:
        db (Session): SQLAlchemy database session
        user_id (UUID): The user's unique identifier
        product_name (str): Name of the product (e.g., 'bizlead')

    Returns:
        dict: Plan details containing:
            - plan_name: Name of the current plan
            - lead_limit: Maximum number of leads allowed
            - features: Dictionary of enabled/disabled features

    Raises:
        ValueError: If no active subscription found for the user & product

    Example:
        >>> details = get_user_plan_details(db, user_id, "bizlead")
        >>> details['plan_name']
        'starter'
        >>> details['lead_limit']
        500
    """
    subscription = get_user_subscription(db, user_id, product_name)

    if not subscription:
        raise ValueError(
            f"No active subscription found for user {user_id} on product '{product_name}'. "
            f"User must subscribe to a plan first."
        )

    # Retrieve plan configuration
    lead_limit = get_plan_limits(product_name, subscription.plan_name)
    features = get_plan_features(product_name, subscription.plan_name)

    return {
        "plan_name": subscription.plan_name,
        "lead_limit": lead_limit,
        "features": features,
        "subscription_id": str(subscription.id),
        "start_date": subscription.start_date.isoformat(),
        "expiry_date": subscription.expiry_date.isoformat(),
        "is_active": subscription.is_active
    }


def check_feature_access(
    db: Session,
    user_id: UUID,
    product_name: str,
    feature_name: str
) -> bool:
    """
    Check if a user has access to a specific feature based on their subscription.

    This is a convenience function that combines subscription retrieval
    and feature validation.

    Args:
        db (Session): SQLAlchemy database session
        user_id (UUID): The user's unique identifier
        product_name (str): Name of the product (e.g., 'bizlead')
        feature_name (str): Name of the feature to check (e.g., 'csv_export')

    Returns:
        bool: True if the user has access to the feature, False otherwise

    Example:
        >>> has_access = check_feature_access(db, user_id, "bizlead", "analytics")
        >>> if has_access:
        ...     return analytics_data()
    """
    try:
        plan_details = get_user_plan_details(db, user_id, product_name)
        return plan_details["features"].get(feature_name, False)
    except ValueError:
        # No active subscription
        return False


def get_user_lead_limit(db: Session, user_id: UUID, product_name: str) -> int:
    """
    Get the lead limit for a user's current subscription.

    Convenience function to quickly retrieve just the lead limit.

    Args:
        db (Session): SQLAlchemy database session
        user_id (UUID): The user's unique identifier
        product_name (str): Name of the product (e.g., 'bizlead')

    Returns:
        int: Maximum number of leads allowed for the user's plan

    Raises:
        ValueError: If no active subscription found

    Example:
        >>> limit = get_user_lead_limit(db, user_id, "bizlead")
        >>> current_leads = count_user_leads(user_id)
        >>> if current_leads >= limit:
        ...     raise QuotaExceededError()
    """
    plan_details = get_user_plan_details(db, user_id, product_name)
    return plan_details["lead_limit"]


def renew_subscription(
    db: Session,
    subscription_id: UUID,
    duration_days: int = 30
) -> Subscription:
    """
    Renew an existing subscription by extending its expiry date.

    Args:
        db (Session): SQLAlchemy database session
        subscription_id (UUID): The subscription to renew
        duration_days (int): Number of days to extend (default: 30)

    Returns:
        Subscription: The updated subscription object

    Raises:
        ValueError: If subscription not found

    Example:
        >>> renewed = renew_subscription(db, sub_id)
        >>> print(renewed.expiry_date)
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()

    if not subscription:
        raise ValueError(f"Subscription {subscription_id} not found")

    subscription.expiry_date = datetime.utcnow() + timedelta(days=duration_days)
    subscription.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(subscription)

    return subscription
