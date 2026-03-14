"""
Authentication dependencies for FastAPI.

Provides get_current_user dependency for protecting routes
and validating JWT tokens.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime
from app.auth.jwt_handler import jwt_handler
from app.config.mongodb import get_users_collection, get_subscriptions_collection
from app.models.user import UserResponse
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserResponse:
    """
    Dependency to get current authenticated user.
    
    Validates JWT token and checks if user exists in database.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        UserResponse: Current user object
        
    Raises:
        HTTPException: 401 if token is invalid or expired
                      403 if user is inactive
                      404 if user not found
    """
    token = credentials.credentials
    
    # Verify token
    payload = jwt_handler.verify_token(token)
    
    if not payload:
        logger.warning(f"Invalid token attempted")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if token is expired
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    try:
        from bson import ObjectId
        users_collection = await get_users_collection()
        
        # Try to convert user_id to ObjectId
        try:
            user_obj_id = ObjectId(user_id)
        except Exception as convert_error:
            logger.error(f"Invalid user_id format in token: {user_id}, error: {str(convert_error)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = await users_collection.find_one({"_id": user_obj_id})
        
        if not user:
            logger.warning(f"User not found in database: {user_id}")
            logger.debug(f"Attempted lookup with ObjectId: {user_obj_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.get("is_active"):
            logger.warning(f"Inactive user attempted access: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        
        # Convert to UserResponse
        user["_id"] = str(user["_id"])
        if user.get("current_subscription_id"):
            user["current_subscription_id"] = str(user["current_subscription_id"])
        
        logger.debug(f"User authenticated successfully: {user_id}")
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}, user_id: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_valid_subscription(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """
    Dependency to get current user with valid, non-expired subscription.
    
    Checks if user's trial is still active and not expired.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: User object if subscription is valid
        
    Raises:
        HTTPException: 403 if trial/subscription is expired
    """
    try:
        from bson import ObjectId
        subscriptions_collection = await get_subscriptions_collection()
        
        subscription = await subscriptions_collection.find_one(
            {"_id": ObjectId(current_user.current_subscription_id)}
        )
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No active subscription found",
            )
        
        # Check if trial/subscription is expired
        trial_end_date = subscription.get("trial_end_date")
        if trial_end_date and trial_end_date < datetime.utcnow():
            # Update subscription status
            await subscriptions_collection.update_one(
                {"_id": ObjectId(current_user.current_subscription_id)},
                {"$set": {"status": "expired", "updated_at": datetime.utcnow()}}
            )
            
            logger.warning(f"Trial expired for user: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your trial has expired. Please upgrade to continue using BizLead.",
            )
        
        return current_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate subscription",
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[UserResponse]:
    """
    Optional version of get_current_user.
    
    Allows endpoints to work with or without authentication.
    
    Args:
        credentials: Optional HTTP Bearer token
        
    Returns:
        UserResponse if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
