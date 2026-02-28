# Backend Signup Implementation Guide

## Current State
The auth endpoints are currently placeholders. This guide shows how to implement them properly with payment validation and plan-based access.

## 1. User Model Update

**File:** `app/database.py` or create `app/models/user.py`

```python
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime
from uuid import uuid4

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    plan = Column(String, default="free")  # free, starter, professional
    payment_status = Column(String, default="pending")  # pending, completed, failed
    stripe_customer_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## 2. Complete Signup Endpoint

**File:** `app/routes/auth.py`

```python
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import uuid
from app.models.subscription import Subscription
from app.config.plans import get_plan_limits

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/signup", response_model=SignupResponse, tags=["Authentication"])
async def signup(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Complete signup with plan selection and subscription creation.
    """
    try:
        # Validate plan
        VALID_PLANS = ["free", "starter", "professional"]
        if request.plan not in VALID_PLANS:
            raise ValueError(f"Invalid plan: {request.plan}")

        # Check if email already exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise ValueError("Email already registered")

        # For paid plans, payment should be validated before this
        # In production, payment status would come from Stripe/Razorpay webhook
        payment_status = "completed" if request.plan == "free" else "pending"

        # Create user
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=request.email,
            password_hash=hash_password(request.password),
            first_name=request.first_name,
            last_name=request.last_name,
            plan=request.plan,
            payment_status=payment_status,
            is_active=True
        )
        
        db.add(user)
        db.flush()

        # Create subscription record
        subscription = Subscription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            product_name="bizlead",
            plan_name=request.plan,
            start_date=datetime.now(timezone.utc),
            expiry_date=datetime.now(timezone.utc) + timedelta(days=30),
            is_active=True
        )
        
        db.add(subscription)
        db.commit()

        # Generate JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        # TODO: Implement JWT creation with user_id and plan
        access_token = create_access_token(
            data={"sub": user.id, "plan": user.plan},
            expires_delta=access_token_expires
        )

        logger.info(f"User registered: {request.email} with plan: {request.plan}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "plan": user.plan,
                "created_at": user.created_at
            },
            "expires_in": int(access_token_expires.total_seconds())
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed"
        )
```

## 3. Login with Plan Validation

```python
@router.post("/login", response_model=SignupResponse, tags=["Authentication"])
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with plan validation and feature enforcement.
    """
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check payment status for paid plans
        if user.plan != "free" and user.payment_status != "completed":
            # Payment not completed yet
            logger.warning(f"Login attempt with incomplete payment: {request.email}")
            # Optionally block login or allow with limited features

        # Get active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.product_name == "bizlead"
        ).first()

        if not subscription or not subscription.is_active:
            raise ValueError("No active subscription found")

        # Check if subscription expired
        if subscription.expiry_date < datetime.now(timezone.utc):
            subscription.is_active = False
            db.commit()
            # User needs to renew

        # Generate token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "plan": user.plan},
            expires_delta=access_token_expires
        )

        logger.info(f"User login: {request.email}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "plan": user.plan,
                "created_at": user.created_at
            },
            "expires_in": int(access_token_expires.total_seconds())
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed"
        )
```

## 4. Payment Validation Middleware

```python
def validate_payment_for_plan(plan: str, payment_status: str) -> bool:
    """
    Validate that user has completed payment for their plan.
    """
    if plan == "free":
        return True
    
    if payment_status == "completed":
        return True
    
    return False


# Dependency for protected routes
async def require_plan(
    plan: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify user has valid plan and payment completed.
    """
    if not validate_payment_for_plan(current_user.plan, current_user.payment_status):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required to access this feature"
        )
    
    if plan and current_user.plan != plan:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This feature requires {plan} plan"
        )
    
    return current_user
```

## 5. Test the Signup

```bash
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "plan": "starter"
  }'
```

## 6. Database Migrations (Alembic)

```bash
# Generate migration
alembic revision --autogenerate -m "Add user and subscription tables"

# Apply migration
alembic upgrade head
```

## Key Points

1. **Password Hashing** - Always hash passwords with bcrypt
2. **Plan Validation** - Only accept valid plan names
3. **Subscription Creation** - Automatically create subscription record
4. **Payment Status** - Track payment completion before granting access
5. **Token Generation** - Include plan in JWT for feature checking
6. **Error Handling** - Clear error messages for signup failures

## Production Considerations

1. **Email Verification** - Send verification email before account activation
2. **Rate Limiting** - Prevent signup spam
3. **CAPTCHA** - Add for bot protection
4. **Audit Logging** - Log all signup/login attempts
5. **2FA** - Implement two-factor authentication
6. **Password Policy** - Enforce strong password requirements
7. **Session Management** - Handle concurrent sessions
8. **Subscription Renewal** - Implement automatic renewal logic
