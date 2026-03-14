"""
Feature and quota enforcement middleware/decorators for subscription access control.

This module provides comprehensive enforcement at both API and data levels:
1. Feature availability validation in the user's plan
2. Lead count quotas per plan tier
3. Subscription expiry verification
4. Access violation logging for abuse detection and analytics

Enforcement applies to:
- UI-driven endpoints
- Direct API endpoints
- Background jobs
"""

import logging
from functools import wraps
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.services.subscription_service import (
    check_feature_access,
    get_user_lead_limit,
    get_user_plan_details,
    get_user_subscription,
)

# Configure logging for access violations
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)


# ============================================================================
# Core Subscription Validation
# ============================================================================


def validate_active_subscription(db: Session, user_id: UUID, product_name: str = "bizlead"):
    """
    Validate that user has an active, non-expired subscription.

    This is the foundational check for all enforcement.

    Args:
        db (Session): Database session
        user_id (UUID): User to validate
        product_name (str): Product name

    Raises:
        HTTPException 403: If subscription expired, inactive, or not found

    Returns:
        dict: Subscription details if valid
    """
    try:
        subscription = get_user_subscription(db, user_id, product_name)
    except Exception:
        subscription = None

    if not subscription:
        logger.warning(
            f"Access denied - No active subscription | user_id={user_id} | product={product_name}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active subscription found. Please subscribe to a plan."
        )

    # ⚠️ CRITICAL: Check subscription expiry
    if subscription.expiry_date < datetime.utcnow():
        logger.warning(
            f"Access denied - Subscription expired | user_id={user_id} | "
            f"product={product_name} | expiry={subscription.expiry_date}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Your subscription expired on {subscription.expiry_date.strftime('%Y-%m-%d')}. "
                f"Please renew your subscription."
            )
        )

    # ⚠️ Check is_active flag
    if not subscription.is_active:
        logger.warning(
            f"Access denied - Inactive subscription | user_id={user_id} | "
            f"product={product_name}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your subscription is inactive. Please contact support."
        )

    return {
        "subscription_id": str(subscription.id),
        "plan_name": subscription.plan_name,
        "is_active": subscription.is_active,
        "expiry_date": subscription.expiry_date
    }


# ============================================================================
# Feature-Based Decorators
# ============================================================================


def require_feature(feature_name: str):
    """
    Decorator to restrict endpoint access based on feature availability.

    Enforces at BOTH levels:
    ✔ API endpoint level (direct URL access)
    ✔ Data level (programmatic access / background jobs)

    Usage:
        @app.get("/analytics")
        @require_feature("analytics")
        async def get_analytics(
            current_user: UUID = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            ...

    Args:
        feature_name (str): The feature to check (e.g., 'csv_export', 'analytics')

    Raises:
        HTTPException 403: If the user's plan doesn't include this feature
        HTTPException 403: If subscription expired
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(
            *args,
            current_user: UUID = None,
            db: Session = None,
            **kwargs
        ):
            # Extract dependencies if not explicitly passed
            if current_user is None or db is None:
                raise ValueError(
                    "require_feature decorator requires current_user and db in function signature"
                )

            # FIRST: Validate active subscription (checks expiry!)
            validate_active_subscription(db, current_user, "bizlead")

            # THEN: Check if feature is enabled for user
            try:
                has_access = check_feature_access(
                    db=db,
                    user_id=current_user,
                    product_name="bizlead",
                    feature_name=feature_name
                )
            except ValueError as e:
                logger.error(
                    f"Error checking feature access | user_id={current_user} | "
                    f"feature={feature_name} | error={str(e)}"
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error checking access"
                )

            if not has_access:
                plan_details = get_user_plan_details(db, current_user, "bizlead")
                
                # 🔴 LOG VIOLATION
                logger.warning(
                    f"Access denied - Feature not included | user_id={current_user} | "
                    f"feature={feature_name} | plan={plan_details['plan_name']} | "
                    f"endpoint={func.__name__}"
                )

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"Feature '{feature_name}' is not available in your "
                        f"'{plan_details['plan_name']}' plan. "
                        f"Please upgrade to access this feature."
                    )
                )

            return await func(*args, current_user=current_user, db=db, **kwargs)

        return wrapper

    return decorator


def require_plan_tier(allowed_plans: list):
    """
    Decorator to restrict endpoint to specific plan tiers.

    Usage:
        @require_plan_tier(["professional"])
        async def get_custom_segments(...):
            ...

    Args:
        allowed_plans (list): List of allowed plan names (e.g., ['professional'])

    Raises:
        HTTPException 403: If user's plan is not in allowed_plans
        HTTPException 403: If subscription expired
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(
            *args,
            current_user: UUID = None,
            db: Session = None,
            **kwargs
        ):
            if current_user is None or db is None:
                raise ValueError(
                    "require_plan_tier decorator requires current_user and db"
                )

            # FIRST: Validate active subscription (checks expiry!)
            validate_active_subscription(db, current_user, "bizlead")

            try:
                plan_details = get_user_plan_details(db, current_user, "bizlead")
            except ValueError as e:
                logger.error(
                    f"Error retrieving plan details | user_id={current_user} | error={str(e)}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=str(e)
                )

            if plan_details["plan_name"] not in allowed_plans:
                # 🔴 LOG VIOLATION
                logger.warning(
                    f"Access denied - Plan tier restriction | user_id={current_user} | "
                    f"current_plan={plan_details['plan_name']} | required={allowed_plans} | "
                    f"endpoint={func.__name__}"
                )

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"This feature is only available for {allowed_plans} plans. "
                        f"You currently have the '{plan_details['plan_name']}' plan."
                    )
                )

            return await func(*args, current_user=current_user, db=db, **kwargs)

        return wrapper

    return decorator


# ============================================================================
# Quota Enforcement
# ============================================================================


def check_lead_quota(db: Session, user_id: UUID, product_name: str = "bizlead"):
    """
    Check if user has reached their lead limit.

    This should be called before creating a new lead at ANY level:
    - API endpoints
    - Background jobs
    - Batch imports

    Args:
        db (Session): Database session
        user_id (UUID): User to check
        product_name (str): Product name

    Returns:
        dict: {current_count, limit, remaining}

    Raises:
        HTTPException 403: If quota exceeded or subscription invalid
        HTTPException 429: If quota exceeded
    """
    from app.models.lead import Lead  # Import where your Lead model is

    # FIRST: Validate active subscription (checks expiry!)
    validate_active_subscription(db, user_id, product_name)

    try:
        limit = get_user_lead_limit(db, user_id, product_name)
    except ValueError as e:
        logger.error(
            f"Error retrieving lead limit | user_id={user_id} | product={product_name} | error={str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

    # Count current leads (adjust query based on your Lead model)
    current_count = db.query(Lead).filter(Lead.user_id == user_id).count()

    if current_count >= limit:
        # 🔴 LOG QUOTA VIOLATION
        logger.warning(
            f"Lead quota exceeded | user_id={user_id} | product={product_name} | "
            f"current={current_count} | limit={limit}"
        )

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Lead limit reached ({current_count}/{limit}). "
                f"Please upgrade your plan to add more leads."
            )
        )

    return {
        "current_count": current_count,
        "limit": limit,
        "remaining": limit - current_count
    }


def enforce_lead_quota(func):
    """
    Decorator to enforce lead quota before creating/importing leads.

    Protects at BOTH levels:
    ✔ API endpoints
    ✔ Background jobs
    ✔ Batch operations

    Usage:
        @app.post("/leads")
        @enforce_lead_quota
        async def create_lead(
            lead_data: LeadCreate,
            current_user: UUID = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            ...

    Raises:
        HTTPException 429: If lead quota exceeded
        HTTPException 403: If subscription expired/inactive
    """

    @wraps(func)
    async def wrapper(
        *args,
        current_user: UUID = None,
        db: Session = None,
        **kwargs
    ):
        if current_user is None or db is None:
            raise ValueError(
                "enforce_lead_quota requires current_user and db in function signature"
            )

        # Check quota before proceeding (includes expiry check)
        check_lead_quota(db, current_user, "bizlead")

        return await func(*args, current_user=current_user, db=db, **kwargs)

    return wrapper


# ============================================================================
# Feature-Specific Enforcement Functions
# ============================================================================


def enforce_csv_export_access(db: Session, user_id: UUID):
    """
    Enforce CSV export feature access.

    Protects at data level - prevents programmatic exports even if user
    tries to call the query directly.

    Raises HTTPException if user doesn't have this feature.
    """
    # Validate subscription first
    validate_active_subscription(db, user_id, "bizlead")

    if not check_feature_access(db, user_id, "bizlead", "csv_export"):
        plan_details = get_user_plan_details(db, user_id, "bizlead")
        
        # 🔴 LOG VIOLATION
        logger.warning(
            f"CSV export blocked | user_id={user_id} | plan={plan_details['plan_name']}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "CSV export is not available in your current plan. "
                "Please upgrade to Starter or Professional plan."
            )
        )


def enforce_advanced_filters_access(db: Session, user_id: UUID):
    """
    Enforce advanced filters feature access.

    Protects at data level - prevents advanced queries even if attempted
    directly through API or background jobs.

    Raises HTTPException if user doesn't have this feature.
    """
    # Validate subscription first
    validate_active_subscription(db, user_id, "bizlead")

    if not check_feature_access(db, user_id, "bizlead", "advanced_filters"):
        plan_details = get_user_plan_details(db, user_id, "bizlead")
        
        # 🔴 LOG VIOLATION
        logger.warning(
            f"Advanced filters blocked | user_id={user_id} | plan={plan_details['plan_name']}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Advanced filters are not available in your current plan. "
                "Please upgrade to Starter or Professional plan."
            )
        )


def enforce_analytics_access(db: Session, user_id: UUID):
    """
    Enforce analytics feature access.

    Protects at data level - prevents analytics computation even in
    background jobs or direct database queries.

    Raises HTTPException if user doesn't have this feature.
    """
    # Validate subscription first
    validate_active_subscription(db, user_id, "bizlead")

    if not check_feature_access(db, user_id, "bizlead", "analytics"):
        plan_details = get_user_plan_details(db, user_id, "bizlead")
        
        # 🔴 LOG VIOLATION
        logger.warning(
            f"Analytics blocked | user_id={user_id} | plan={plan_details['plan_name']}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Advanced analytics is not available in your current plan. "
                "Please upgrade to the Professional plan."
            )
        )


def enforce_api_access(db: Session, user_id: UUID):
    """
    Enforce API access feature access.

    Protects at data level - prevents API key generation and invalidates
    existing API calls from users without access.

    Raises HTTPException if user doesn't have this feature.
    """
    # Validate subscription first
    validate_active_subscription(db, user_id, "bizlead")

    if not check_feature_access(db, user_id, "bizlead", "api_access"):
        plan_details = get_user_plan_details(db, user_id, "bizlead")
        
        # 🔴 LOG VIOLATION
        logger.warning(
            f"API access blocked | user_id={user_id} | plan={plan_details['plan_name']}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "API access is not available in your current plan. "
                "Please upgrade to the Professional plan."
            )
        )


def enforce_custom_segments_access(db: Session, user_id: UUID):
    """
    Enforce custom segments feature access.

    Protects at data level - prevents segment creation and queries even
    if attempted directly through background jobs.

    Raises HTTPException if user doesn't have this feature.
    """
    # Validate subscription first
    validate_active_subscription(db, user_id, "bizlead")

    if not check_feature_access(db, user_id, "bizlead", "custom_segments"):
        plan_details = get_user_plan_details(db, user_id, "bizlead")
        
        # 🔴 LOG VIOLATION
        logger.warning(
            f"Custom segments blocked | user_id={user_id} | plan={plan_details['plan_name']}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Custom segments are not available in your current plan. "
                "Please upgrade to the Professional plan."
            )
        )


def get_quota_info(db: Session, user_id: UUID, product_name: str = "bizlead") -> dict:
    """
    Get detailed quota and feature information for a user.

    Includes validation of subscription expiry before returning info.

    Args:
        db (Session): Database session
        user_id (UUID): User ID
        product_name (str): Product name

    Returns:
        dict: Complete quota and feature information

    Raises:
        HTTPException 403: If no active subscription or expired
    """
    from app.models.lead import Lead  # Import where your Lead model is

    # Validate subscription (includes expiry check)
    validate_active_subscription(db, user_id, product_name)

    try:
        plan_details = get_user_plan_details(db, user_id, product_name)
    except ValueError as e:
        logger.error(
            f"Error retrieving quota info | user_id={user_id} | error={str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

    current_leads = db.query(Lead).filter(Lead.user_id == user_id).count()

    return {
        "plan_name": plan_details["plan_name"],
        "lead_limit": plan_details["lead_limit"],
        "current_leads": current_leads,
        "remaining_leads": plan_details["lead_limit"] - current_leads,
        "features": plan_details["features"],
        "subscription_id": plan_details["subscription_id"],
        "expiry_date": plan_details["expiry_date"],
    }
