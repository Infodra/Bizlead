# BizLead Signup and Plan-Based Access Guide

## Overview
The signup flow has been restructured to:
1. Collect user account information
2. Present plan selection (Free, Starter, Professional)
3. Handle payment for paid plans
4. Enforce plan-based feature access after login

## Signup Flow

### Step 1: Account Details
Users enter:
- First Name
- Last Name
- Email
- Password (min 8 characters)
- Confirm Password

### Step 2: Plan Selection
Three plans available:

**Free Plan ($0/month)**
- 50 leads per month
- Basic lead info
- Manual search

**Starter Plan ($29/month)**
- 500 leads per month
- All Free features
- Advanced filters
- CSV export

**Professional Plan ($99/month)**
- 2000 leads per month
- All Starter features
- Analytics
- API access
- Custom segments

### Step 3: Payment
- Free plan: Skip payment, create account immediately
- Paid plans: Process payment (Stripe/Razorpay integration coming soon)

### Step 4: Confirmation
- Account created
- Redirects to dashboard
- User login persisted with plan info

## Backend Implementation

### Updated Endpoints

#### POST `/api/v1/auth/signup`
Request:
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "plan": "starter"
}
```

Response:
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "plan": "starter",
    "created_at": "2026-01-25T10:00:00"
  },
  "expires_in": 3600
}
```

#### POST `/api/v1/auth/login`
Returns same response format with user plan included.

### Required Backend Changes

1. **User Model** - Add plan field:
   ```python
   plan = Column(String(50), default="free")  # free, starter, professional
   ```

2. **Subscription Creation** - Auto-create subscription on signup:
   ```python
   subscription = Subscription(
       user_id=user.id,
       product_name="bizlead",
       plan_name=plan,
       is_active=True
   )
   ```

3. **Validation** - Ensure only valid plans are accepted:
   ```python
   VALID_PLANS = ["free", "starter", "professional"]
   if request.plan not in VALID_PLANS:
       raise HTTPException(detail="Invalid plan")
   ```

## Frontend Implementation

### Using Plan-Based Features

#### 1. Using the `usePlanFeatures` Hook
```tsx
import { usePlanFeatures } from '@/lib/usePlanFeatures';

export default function MyComponent() {
  const { plan, hasFeature, leadLimit, features } = usePlanFeatures();

  if (hasFeature('csv_export')) {
    // Show CSV export button
  }
  
  return (
    <div>
      <p>Current Plan: {plan}</p>
      <p>Lead Limit: {leadLimit}</p>
    </div>
  );
}
```

#### 2. Using FeatureGate Component
```tsx
import FeatureGate from '@/components/FeatureGate';

export default function Dashboard() {
  return (
    <div>
      <FeatureGate feature="csv_export">
        <button>Export to CSV</button>
      </FeatureGate>

      <FeatureGate 
        feature="analytics"
        fallback={
          <div>Analytics available in Starter plan</div>
        }
      >
        <Analytics />
      </FeatureGate>
    </div>
  );
}
```

## Plan Features Matrix

| Feature | Free | Starter | Professional |
|---------|------|---------|--------------|
| Basic Info | ✓ | ✓ | ✓ |
| Advanced Filters | ✗ | ✓ | ✓ |
| CSV Export | ✗ | ✓ | ✓ |
| Analytics | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |
| Custom Segments | ✗ | ✗ | ✓ |

## Payment Integration (TODO)

### Stripe Integration
```typescript
// frontend/lib/stripe.ts
import { loadStripe } from '@stripe/js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export async function handlePayment(plan: string) {
  const stripe = await stripePromise;
  // Create payment intent
  // Redirect to Stripe checkout
}
```

### Razorpay Integration
```typescript
// Similar implementation for Razorpay
export async function handleRazorpayPayment(plan: string) {
  // Load Razorpay script
  // Create order
  // Open payment dialog
}
```

## Testing

### Test Signup Flow
1. Go to `/auth/signup`
2. Fill account details
3. Select plan
4. Complete payment (skip for free)
5. Verify redirected to dashboard
6. Check localStorage for token and user info

### Test Feature Access
1. Login with free plan user
2. Try accessing paid features
3. Should see feature gate overlay
4. Click upgrade prompt

## Troubleshooting

### Signup Fails
- Check backend `/auth/signup` endpoint
- Verify plan is valid (free/starter/professional)
- Check database connection

### Plan Not Showing
- Ensure user data includes `plan` field
- Check `useAuthStore` has plan persisted
- Verify token storage in localStorage

### Features Not Gated
- Check `usePlanFeatures` hook
- Verify `FEATURE_ACCESS` object updated
- Ensure plan name matches exactly

## Future Enhancements

1. **Trial Period** - Add 14-day free trial for paid plans
2. **Dunning** - Handle failed payments with retry logic
3. **Plan Changes** - Allow users to upgrade/downgrade
4. **Invoicing** - Generate and send payment receipts
5. **Analytics** - Track plan usage and conversions
