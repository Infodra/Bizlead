# Payment-First Authentication Migration (Feb 28, 2026)

## Overview
Removed free trial system and implemented **payment-required authentication**. Users must complete paid subscription before login access.

---

## Changes Made

### 1. Registration Endpoint (`/auth/register`)

**File:** `places_lead_scraper/app/routes/auth.py`

**Old Flow:**
- Create user account
- Auto-create FREE TRIAL subscription (7 days, 50 leads)
- Generate JWT tokens
- Return user with tokens and subscription info

**New Flow:**
- Create user account ONLY
- ❌ NO subscription created
- ❌ NO JWT tokens generated
- Return status message with user ID and email
- Frontend redirects to payment page

**Response Changed:**
```python
# OLD
{
    "user": {...},
    "access_token": "...",
    "subscription_status": "trial",
    "trial_end_date": "..."
}

# NEW
{
    "status": "success",
    "message": "Account created. Complete payment to activate.",
    "user_id": "uuid",
    "email": "user@example.com",
    "payment_required": True
}
```

---

### 2. Login Endpoint (`/auth/login`)

**File:** `places_lead_scraper/app/routes/auth.py`

**New Payment Validation (STEP 5):**

Checks REQUIRED before generating login tokens:
1. User has `current_subscription_id` in MongoDB
2. Subscription exists and status is "active" or "renewed"
3. If checks fail → HTTP 402 Payment Required

```python
if not user.get("current_subscription_id"):
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="Payment required. Please complete your subscription payment to login."
    )

subscription = await subscriptions_collection.find_one(
    {"_id": ObjectId(user["current_subscription_id"])}
)

if not subscription or subscription.get("status") not in ["active", "renewed"]:
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="No active subscription found. Please complete payment to login."
    )
```

**Only After Validation:** JWT tokens generated and returned.

---

### 3. Payment Complete Endpoint (`/payments/complete`)

**File:** `places_lead_scraper/app/routes/payments.py`

**New MongoDB Sync (Lines 300-320):**

After SQL subscription is created, also update MongoDB user:
```python
users_collection = await get_users_collection()
mongodb_user = await users_collection.find_one(
    {"email": request.email.lower()}
)

if mongodb_user:
    await users_collection.update_one(
        {"_id": mongodb_user["_id"]},
        {
            "$set": {
                "current_subscription_id": str(subscription.id),
                "updated_at": datetime.utcnow(),
            }
        }
    )
```

**Why?** Login endpoint checks MongoDB for active subscription. SQL subscription must be synced to MongoDB.

---

## Authentication Flow (New)

### Scenario 1: NEW USER
```
1. Sign Up (no payment yet)
   POST /auth/register
   → Account created in MongoDB
   → NO subscription created
   → Return: { "payment_required": True }

2. Navigate to Pricing → Select Plan

3. Complete Payment
   POST /payments/complete
   → Subscription created in SQL (Subscriptions table)
   → Subscription ID synced to MongoDB user
   → Return: { "status": "success", subscription_data }

4. Login with Email/Password
   POST /auth/login
   → Verify password ✓
   → Check MongoDB for current_subscription_id ✓
   → Check subscription status is "active" ✓
   → Generate JWT tokens & login
   → Return: access_token + user data
```

### Scenario 2: EXISTING USER (Renewal)
```
1. User logged in with active subscription

2. New plan purchased
   POST /payments/create-order
   POST /payments/verify
   POST /payments/complete
   → New subscription created in SQL
   → MongoDB current_subscription_id updated
   
3. User stays logged in (tokens still valid)

4. On next API call or re-login:
   → Checks latest subscription status
   → Access granted with new plan limits
```

**Invalid Login Attempts:**
```
❌ User exists but NO subscription (never paid)
   → 402 Payment Required

❌ User exists but subscription expired/inactive
   → 402 Payment Required

❌ Payment initiated but not completed
   → User cannot login
   → Must complete payment to verify subscription
```

---

## Database Changes

### MongoDB (bizlead_users)
**Field: `current_subscription_id`**
- Before: Always set (even for free trial)
- Now: NULL until payment completed
- Login checks: Must be NOT NULL and active

### MongoDB (bizlead_subscriptions) - REMOVED
- ❌ No longer creating free trial subscriptions
- Subscriptions now only in SQL after payment

### SQL (payments)
**Unchanged** - Existing structure maintained

### SQL (subscriptions)  
**Now synced with MongoDB**
- Created by `process_payment()` after payment verification
- status: "active" | "renewed" | "cancelled"
- Linked to MongoDB user via email in `/complete` endpoint

---

## HTTP Status Codes

| Endpoint | Scenario | Status | Message |
|----------|----------|--------|---------|
| POST /register | Success | 201 | "Account created. Complete payment." |
| POST /login | No subscription | 402 | "Payment required..." |
| POST /login | Inactive subscription | 402 | "No active subscription..." |
| POST /login | Valid | 200 | JWT tokens + user data |
| POST /payments/complete | Success | 200 | Subscription activated |

---

## Frontend Changes Required

### Registration Page
```javascript
// OLD
const register = async () => {
    const res = await fetch('/auth/register', {...});
    const { access_token } = await res.json(); // Had tokens
    navigate('/dashboard');
};

// NEW
const register = async () => {
    const res = await fetch('/auth/register', {...});
    const { payment_required } = await res.json(); // NO tokens
    if (payment_required) {
        navigate('/pricing', { state: { email, fullName } }); // Go to payment
    }
};
```

### Login Page
```javascript
// Login unchanged - but now will fail with 402 if payment not completed
// Frontend can catch 402 and show: "Complete payment to login"
const login = async () => {
    const res = await fetch('/auth/login', {...});
    
    if (res.status === 402) {
        // Payment required
        alert('Complete payment before login');
        navigate('/pricing');
    }
    
    const { access_token } = await res.json();
    navigate('/dashboard');
};
```

### Pricing Page
```javascript
// Now REQUIRED - must complete payment for new accounts
// Can be accessed by:
// 1. Non-registered users (create account first)
// 2. Users with payment_required=True from registration
// 3. Already logged-in users (renewal)
```

---

## Testing Checklist

- [ ] Register new user → No tokens returned
- [ ] Try login without payment → 402 Payment Required
- [ ] Complete payment → Subscription in SQL + MongoDB synced
- [ ] Login after payment → Success with tokens
- [ ] Existing user tries renewal → Can login + navigate to pricing
- [ ] Payment fails → Subscription not created → Login blocked
- [ ] Logout + Re-login → Still requires active subscription check

---

## Backward Compatibility

⚠️ **NOT BACKWARD COMPATIBLE**

Existing free trial users:
- Cannot login (no active subscription in MongoDB)
- Must complete payment to regain access
- **Migration needed:** Either create grace period or notify users

---

## Security Benefits

1. **Revenue Protection:** No free access without payment
2. **Account Activation:** Prevents inactive account abuse
3. **Dual Verification:** Login checks subscription status + JWT validity
4. **Payment Verification:** Must complete Razorpay flow before access

---

## Next Steps

1. ✅ Remove free trial from codebase
2. ✅ Enforce payment at login  
3. ✅ Sync subscriptions between SQL and MongoDB
4. 🔄 Update frontend registration/login/pricing flows
5. ⚠️ Handle existing free trial users (notification/migration)
6. 📊 Monitor payment completion rates
