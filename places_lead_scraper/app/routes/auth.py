"""
Authentication routes - User Registration and Login.

Handles user registration with free trial subscription,
token generation, and authentication endpoints.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
from bson import ObjectId
import logging
import secrets
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

from app.models.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    UserWithToken,
)
from app.models.subscription import TrialSubscription
from app.auth.password_handler import password_handler
from app.auth.jwt_handler import jwt_handler
from app.config.mongodb import (
    get_users_collection,
    get_subscriptions_collection,
)
from app.dependencies.auth_dependency import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

security = HTTPBearer()


# ============================================================================
# REGISTRATION ENDPOINT
# ============================================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register new user - payment required",
    description="Creates a new user account. Payment required to activate.",
)
async def register(user_data: UserRegister):
    """
    Register a new user and create free trial subscription.
    
    REGISTRATION FLOW:
    1. Validate input data
    2. Check if email already exists (409 Conflict if exists)
    3. Hash password using bcrypt
    4. Create user in bizlead_users collection
    5. Create free trial subscription in bizlead_subscriptions
    6. Generate JWT tokens (access + refresh)
    7. Return user with tokens and subscription info
    
    Args:
        user_data: User registration data
        
    Returns:
        UserWithToken: User object with access token, refresh token, and subscription info
        
    Raises:
        HTTPException: 400 Bad Request if validation fails
                      409 Conflict if email already exists
                      500 Internal Server Error for database issues
    """
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 1: Validate input
    # ──────────────────────────────────────────────────────────────────────
    
    if not user_data.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms and conditions to register",
        )
    
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )
    
    # Validate password strength
    is_valid, message = password_handler.validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 2: Check if email already exists
    # ──────────────────────────────────────────────────────────────────────
    
    try:
        users_collection = await get_users_collection()
        existing_user = await users_collection.find_one(
            {"email": user_data.email.lower()}
        )
        
        if existing_user:
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered. Please login or use a different email.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking existing email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during registration",
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 3: Hash password
    # ──────────────────────────────────────────────────────────────────────
    
    try:
        password_hash = password_handler.hash_password(user_data.password)
    except Exception as e:
        logger.error(f"Error hashing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password",
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 4: Create user in database
    # ──────────────────────────────────────────────────────────────────────
    
    now = datetime.utcnow()
    user_doc = {
        "full_name": user_data.full_name,
        "email": user_data.email.lower(),
        "password_hash": password_hash,
        "company_name": user_data.company_name,
        "phone": user_data.phone,
        "gstin": user_data.gstin,
        "role": "user",
        "is_active": True,
        "current_subscription_id": None,  # Will be updated after subscription creation
        "created_at": now,
        "updated_at": now,
        "last_login": None,
    }
    
    try:
        result = await users_collection.insert_one(user_doc)
        user_id = result.inserted_id
        logger.info(f"User created successfully: {user_id}")
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account",
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 5: Payment required - tokens NOT generated yet
    # User must complete payment before login is possible
    # ──────────────────────────────────────────────────────────────────────
    
    logger.info(f"User account created (payment required): {user_id}")
    
    # Return response indicating payment is required
    # NO TOKENS ARE GENERATED - User must complete payment first
    return {
        "status": "success",
        "message": "Account created successfully. Complete payment to activate your account.",
        "user_id": str(user_id),
        "email": user_data.email,
        "full_name": user_data.full_name,
        "payment_required": True,
    }


# ============================================================================
# LOGIN ENDPOINT
# ============================================================================

@router.post(
    "/login",
    response_model=UserWithToken,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user with email and password, return tokens",
)
async def login(credentials: UserLogin) -> UserWithToken:
    """
    Login with email and password.
    
    LOGIN FLOW:
    1. Find user by email
    2. Verify password
    3. Update last_login timestamp
    4. Generate JWT tokens
    5. Get subscription info
    6. Return user with tokens
    
    Args:
        credentials: User login credentials (email and password)
        
    Returns:
        UserWithToken: User object with access token, refresh token, and subscription info
        
    Raises:
        HTTPException: 401 Unauthorized if credentials are invalid
                      404 Not Found if user doesn't exist
    """
    
    print(f"\n{'='*70}")
    print(f"🔐 [LOGIN] LOGIN ENDPOINT CALLED - Email: {credentials.email}")  
    print(f"{'='*70}")
    logger.warning(f"🔐 [LOGIN] Attempting login for {credentials.email}")
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 1: Find user by email
    # ──────────────────────────────────────────────────────────────────────
    
    print(f"[STEP 1] Looking up user in database...")
    users_collection = await get_users_collection()
    
    user = await users_collection.find_one({"email": credentials.email.lower()})
    
    if not user:
        logger.warning(f"Login attempt with non-existent email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 2: Verify password
    # ──────────────────────────────────────────────────────────────────────
    
    is_password_valid = password_handler.verify_password(credentials.password, user["password_hash"])
    
    if not is_password_valid:
        logger.warning(f"Login attempt with invalid password: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 3: Update last_login
    # ──────────────────────────────────────────────────────────────────────
    
    now = datetime.utcnow()
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": now, "updated_at": now}}
    )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 4: Generate JWT tokens
    # ──────────────────────────────────────────────────────────────────────
    
    tokens = jwt_handler.create_tokens(
        user_id=str(user["_id"]),
        email=user["email"]
    )
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 5: Verify active paid subscription exists
    # ──────────────────────────────────────────────────────────────────────
    
    if not user.get("current_subscription_id"):
        logger.warning(f"Login attempt without active subscription: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required. Please complete your subscription payment to login.",
        )
    
    subscriptions_collection = await get_subscriptions_collection()
    subscription = await subscriptions_collection.find_one(
        {"_id": ObjectId(user["current_subscription_id"])}
    )
    
    if not subscription or subscription.get("status") not in ["active", "renewed"]:
        logger.warning(f"Login attempt with inactive subscription: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No active subscription found. Please complete payment to login.",
        )
    
    subscription_status = subscription.get("status", "active")
    leads_limit = subscription.get("leads_limit", 0)
    trial_end_date = subscription.get("renewal_date")
    
    # ──────────────────────────────────────────────────────────────────────
    # STEP 6: Build response
    # ──────────────────────────────────────────────────────────────────────
    
    user_response = UserResponse(
        _id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        company_name=user.get("company_name", ""),
        phone=user.get("phone", ""),
        role=user.get("role", "user"),
        is_active=user.get("is_active", True),
        current_subscription_id=str(user["current_subscription_id"]) if user.get("current_subscription_id") else None,
        created_at=user["created_at"],
        updated_at=now,
        last_login=now,
    )
    
    logger.info(f"User logged in successfully: {user['_id']}")
    
    return UserWithToken(
        user=user_response,
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        subscription_status=subscription_status,
        leads_limit=leads_limit,
    )


# ============================================================================
# TOKEN REFRESH ENDPOINT
# ============================================================================

@router.post(
    "/refresh",
    summary="Refresh access token",
    description="Generate a new access token using refresh token",
)
async def refresh_token_endpoint(
    refresh_token_str: str = Query(...),
) -> Dict[str, str]:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_token_str: Valid refresh token
        
    Returns:
        Dictionary with new access_token
        
    Raises:
        HTTPException: 401 if refresh token is invalid or expired
    """
    
    payload = jwt_handler.verify_token(refresh_token_str)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Generate new access token
    new_access_token = jwt_handler.create_access_token({
        "sub": user_id,
        "email": email,
    })
    
    logger.info(f"Access token refreshed for user: {user_id}")
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


# ============================================================================
# FORGOT PASSWORD ENDPOINT
# ============================================================================

from pydantic import BaseModel, EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Forgot password - send new password via email",
    description="Generate a new password and send it to the user's registered email",
)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Forgot password flow:
    1. Look up user by email
    2. Generate a secure random password
    3. Hash and update in database
    4. Send new password via email
    """
    from app.config.settings import settings

    users_collection = await get_users_collection()
    user = await users_collection.find_one({"email": request.email.lower()})

    if not user:
        # Return success even if user not found to prevent email enumeration
        return {
            "status": "success",
            "message": "If an account with this email exists, a new password has been sent.",
        }

    # Generate a secure random password (12 chars)
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    new_password = ''.join(secrets.choice(alphabet) for _ in range(12))

    # Hash and update in database
    new_hash = password_handler.hash_password(new_password)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()}},
    )

    # Send email with new password
    try:
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            logger.warning("SMTP not configured — cannot send password reset email")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service is not configured. Please contact support.",
            )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "BizLead - Your New Password"
        msg["From"] = f'"BizLead by Infodra" <{settings.SMTP_FROM_EMAIL}>'
        msg["Reply-To"] = "noreply@infodra.ai"
        msg["To"] = request.email

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #0F172A; color: #E2E8F0; border-radius: 12px;">
            <h2 style="color: #60A5FA;">BizLead Password Reset</h2>
            <p>Hi {user.get('full_name', 'User')},</p>
            <p>Your password has been reset. Here is your new password:</p>
            <div style="background: #1E293B; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
                <code style="font-size: 18px; color: #60A5FA; letter-spacing: 2px;">{new_password}</code>
            </div>
            <p>Please log in with this password and change it from your account settings for security.</p>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">If you did not request this, please contact support immediately.</p>
        </div>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, request.email, msg.as_string())

        logger.info(f"Password reset email sent to {request.email}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email. Please try again later.",
        )

    return {
        "status": "success",
        "message": "If an account with this email exists, a new password has been sent.",
    }


# ============================================================================
# CHANGE PASSWORD ENDPOINT (Protected)
# ============================================================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password",
    description="Change the authenticated user's password",
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"email": current_user.email.lower()})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Verify current password
    if not password_handler.verify_password(request.current_password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    # Validate new password length
    if len(request.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters")

    # Hash and update
    new_hash = password_handler.hash_password(request.new_password)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.utcnow()}},
    )

    return {"status": "success", "message": "Password changed successfully"}


# ============================================================================
# UPDATE PROFILE ENDPOINT (Protected)
# ============================================================================

class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str = ""


@router.put(
    "/profile",
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Update the authenticated user's first and last name",
)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    first = request.first_name.strip()
    last = request.last_name.strip()
    if not first:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="First name is required")
    full_name = f"{first} {last}".strip()

    users_collection = await get_users_collection()
    await users_collection.update_one(
        {"email": current_user.email.lower()},
        {"$set": {"full_name": full_name, "first_name": first, "last_name": last, "updated_at": datetime.utcnow()}},
    )
    return {"status": "success", "message": "Profile updated", "full_name": full_name}


# ============================================================================
# PROFILE ENDPOINT (Protected)
# ============================================================================

@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Retrieve the authenticated user's profile information",
)
async def get_profile(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """
    Get current user's profile.
    
    Args:
        current_user: Authenticated user (from JWT token)
        
    Returns:
        UserResponse: User profile data
    """
    return current_user
