"""
Example FastAPI routes for subscription and plan access management.

This module demonstrates how to use the subscription service in protected
endpoints with proper authentication and error handling.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.services.subscription_service import (
    activate_subscription,
    get_user_plan_details,
    get_user_lead_limit,
    check_feature_access,
)
from app.dependencies.auth_dependency import get_current_user
from app.models.user import UserResponse


router = APIRouter(prefix="", tags=["bizlead"])


# ============================================================================
# Response Models (Pydantic)
# ============================================================================


class FeatureAccessResponse(BaseModel):
    """Response model for feature access check."""
    feature_name: str
    is_enabled: bool


class PlanDetailsResponse(BaseModel):
    """Response model for plan details."""
    plan_name: str
    lead_limit: int
    features: dict = Field(description="Feature flags: {feature_name: bool}")
    subscription_id: str
    start_date: str
    expiry_date: str
    is_active: bool


class SubscriptionActivationRequest(BaseModel):
    """Request model for subscription activation."""
    plan_name: str = Field(..., description="Plan tier: free, starter, or professional")


class SubscriptionActivationResponse(BaseModel):
    """Response model for subscription activation."""
    subscription_id: str
    user_id: str
    product_name: str
    plan_name: str
    start_date: str
    expiry_date: str
    is_active: bool


# ============================================================================
# Placeholder dependency for database
# ============================================================================


def get_db() -> Session:
    """
    Placeholder dependency to get database session.

    Replace this with your actual database dependency.

    Yields:
        Session: SQLAlchemy database session
    """
    # Example: This would be your actual DB session
    # from app.database import SessionLocal
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()
    pass


# ============================================================================
# Protected Endpoints
# ============================================================================


@router.get("/check-access", response_model=PlanDetailsResponse)
async def check_plan_access(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check the current user's plan and access details for BizLead.

    This endpoint retrieves the user's active subscription and returns
    comprehensive plan information including lead limits and enabled features.

    Returns:
        PlanDetailsResponse: User's current plan details

    Raises:
        HTTPException 403: If user has no active subscription
        HTTPException 500: If plan configuration is invalid

    Example:
        GET /api/v1/bizlead/check-access
        Response:
        {
            "plan_name": "starter",
            "lead_limit": 500,
            "features": {
                "basic_info": true,
                "advanced_filters": true,
                "csv_export": true,
                "analytics": false,
                "api_access": false,
                "custom_segments": false
            },
            "subscription_id": "550e8400-e29b-41d4-a716-446655440000",
            "start_date": "2026-01-24T10:30:00",
            "expiry_date": "2026-02-24T10:30:00",
            "is_active": true
        }
    """
    try:
        plan_details = get_user_plan_details(db, current_user, "bizlead")
        return PlanDetailsResponse(**plan_details)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.post("/activate-plan", response_model=SubscriptionActivationResponse)
async def activate_plan(
    request: SubscriptionActivationRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Activate a subscription plan for the current user.

    This endpoint deactivates any existing subscription and creates a new one
    for the specified plan. The subscription is valid for 30 days.

    Parameters:
        plan_name (str): The plan to activate (free, starter, or professional)

    Returns:
        SubscriptionActivationResponse: Newly activated subscription details

    Raises:
        HTTPException 400: If plan_name is invalid
        HTTPException 500: If database error occurs

    Example:
        POST /api/v1/bizlead/activate-plan
        {
            "plan_name": "professional"
        }
        Response:
        {
            "subscription_id": "550e8400-e29b-41d4-a716-446655440000",
            "user_id": "660e8400-e29b-41d4-a716-446655440000",
            "product_name": "bizlead",
            "plan_name": "professional",
            "start_date": "2026-01-24T10:30:00",
            "expiry_date": "2026-02-24T10:30:00",
            "is_active": true
        }
    """
    try:
        subscription = activate_subscription(
            db=db,
            user_id=current_user,
            product_name="bizlead",
            plan_name=request.plan_name,
            duration_days=30
        )

        return SubscriptionActivationResponse(
            subscription_id=str(subscription.id),
            user_id=str(subscription.user_id),
            product_name=subscription.product_name,
            plan_name=subscription.plan_name,
            start_date=subscription.start_date.isoformat(),
            expiry_date=subscription.expiry_date.isoformat(),
            is_active=subscription.is_active
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate subscription"
        )


@router.get("/feature/{feature_name}", response_model=FeatureAccessResponse)
async def check_feature(
    feature_name: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if the current user has access to a specific feature.

    This endpoint quickly checks if a feature is enabled for the user's
    current subscription plan.

    Parameters:
        feature_name (str): Name of the feature to check (e.g., 'csv_export')

    Returns:
        FeatureAccessResponse: Feature name and access status (true/false)

    Example:
        GET /api/v1/bizlead/feature/analytics
        Response:
        {
            "feature_name": "analytics",
            "is_enabled": true
        }
    """
    try:
        is_enabled = check_feature_access(
            db=db,
            user_id=current_user,
            product_name="bizlead",
            feature_name=feature_name
        )

        return FeatureAccessResponse(
            feature_name=feature_name,
            is_enabled=is_enabled
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check feature access"
        )


@router.get("/lead-limit")
async def get_lead_limit(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's lead limit.

    Quick endpoint to retrieve just the lead limit for quota checking.

    Returns:
        dict: Lead limit information

    Raises:
        HTTPException 403: If user has no active subscription

    Example:
        GET /api/v1/bizlead/lead-limit
        Response:
        {
            "lead_limit": 500
        }
    """
    try:
        limit = get_user_lead_limit(db, current_user, "bizlead")
        return {"lead_limit": limit}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )



