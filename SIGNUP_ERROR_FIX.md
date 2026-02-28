# Signup Error Resolution Checklist

## Issue
Getting "Signup failed" error when attempting to create account.

## Root Causes & Solutions

### ✅ Frontend Fix (Already Implemented)
- [x] Updated signup to include plan selection
- [x] Created multi-step signup flow (Account → Plan → Payment → Confirmation)
- [x] Added form validation before submission
- [x] Pass `plan` parameter in signup request

### ⚠️ Backend Fixes (ACTION REQUIRED)

#### 1. Update Auth Route to Accept New Fields
**File:** `places_lead_scraper/app/routes/auth.py`

- [x] Updated `RegisterRequest` model to include:
  - `first_name` (was `full_name`)
  - `last_name` (new field)
  - `plan` (new field with default "free")
- [x] Created `SignupResponse` model with user and plan info
- [x] Updated `/signup` endpoint signature

**Next Step:** Implement the actual logic (see `BACKEND_SIGNUP_IMPLEMENTATION.md`)

#### 2. Create User Model
**File:** `places_lead_scraper/app/models/user.py` (NEW)

Needs:
- `id` (UUID)
- `email` (unique)
- `password_hash`
- `first_name`
- `last_name`
- `plan` (default "free")
- `payment_status`
- `is_active`
- `created_at`

#### 3. Implement Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)
```

#### 4. Create Subscription on Signup
Auto-create subscription record when user signs up:
```python
subscription = Subscription(
    user_id=user.id,
    product_name="bizlead",
    plan_name=request.plan,
    is_active=True
)
```

#### 5. Generate JWT Token
Implement `create_access_token()` function to generate JWT with user ID and plan.

#### 6. Database Setup
Ensure `users` table exists with all required fields.

---

## Testing Signup Flow

### Step 1: Frontend
```
1. Go to http://localhost:3000/auth/signup
2. Fill account details
3. Select plan (e.g., "Free")
4. Click "Continue"
5. Click "Complete Payment"
```

### Step 2: Backend Validation
Check that backend receives:
```json
POST /api/v1/auth/signup
{
  "email": "test@example.com",
  "password": "TestPass123",
  "first_name": "Test",
  "last_name": "User",
  "plan": "free"
}
```

### Step 3: Check Response
Should return:
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "plan": "free",
    "created_at": "2026-01-25T..."
  },
  "expires_in": 3600
}
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Missing fields | Ensure all fields sent: email, password, first_name, last_name, plan |
| 422 Unprocessable Entity | Invalid email format | Use valid email format |
| 409 Conflict | Email already exists | Check database, use different email |
| 500 Internal Server | Database error | Check database connection, migrations |
| 501 Not Implemented | Endpoint not ready | Implement auth logic in backend |

---

## Implementation Priority

1. **HIGH** - Create User model and implement signup logic
2. **HIGH** - Setup password hashing with bcrypt
3. **HIGH** - Auto-create subscription on signup
4. **MEDIUM** - Implement JWT token generation
5. **MEDIUM** - Add payment status validation for login
6. **LOW** - Add email verification
7. **LOW** - Implement actual Stripe/Razorpay integration

---

## Quick Implementation Path

```python
# 1. Create tables
# - users
# - subscriptions (already exists)

# 2. Implement signup endpoint
@router.post("/signup")
async def signup(request: RegisterRequest, db: Session):
    # Hash password
    # Check email doesn't exist
    # Create user
    # Create subscription
    # Generate token
    # Return response

# 3. Implement login endpoint with plan
@router.post("/login")
async def login(request: LoginRequest, db: Session):
    # Find user
    # Verify password
    # Check subscription
    # Generate token
    # Return response with plan

# 4. Test with frontend
# Frontend will automatically persist plan in auth store
```

---

## Files Already Updated

- ✅ `frontend/app/auth/signup/page.tsx` - Multi-step signup UI
- ✅ `frontend/lib/usePlanFeatures.ts` - Plan feature management
- ✅ `frontend/components/FeatureGate.tsx` - Feature gating component
- ✅ `places_lead_scraper/app/routes/auth.py` - Auth endpoint signatures

## Files Still Need Implementation

- ⚠️ `places_lead_scraper/app/routes/auth.py` - Actual signup/login logic
- ⚠️ User model (create if doesn't exist)
- ⚠️ Database tables (users)

---

## Support

For detailed implementation, see:
- `SIGNUP_FLOW_GUIDE.md` - Frontend/UX flow
- `BACKEND_SIGNUP_IMPLEMENTATION.md` - Backend code examples
