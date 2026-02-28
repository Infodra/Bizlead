# Quick Reference - Plan-Based Access Control

## 🚀 Quick Start

### Frontend Setup (✅ DONE)
```tsx
// Use in any component
import { usePlanFeatures } from '@/lib/usePlanFeatures';

const { hasFeature, plan, leadLimit } = usePlanFeatures();

// Gate features
import FeatureGate from '@/components/FeatureGate';
<FeatureGate feature="csv_export">
  <ExportButton />
</FeatureGate>
```

### Backend Setup (⚠️ TODO)
1. Create `User` model with `plan` field
2. Implement signup with plan creation
3. Create subscription automatically
4. Return plan in JWT and responses

---

## 📋 Plans & Limits

### Free ($0)
- **Leads:** 50/month
- **Features:** Basic info only

### Starter ($29)
- **Leads:** 500/month
- **Features:** Basic + Filters + CSV

### Professional ($99)
- **Leads:** 2000/month
- **Features:** All + Analytics + API + Segments

---

## 🔐 Feature Matrix

```
csv_export       ✗ free    | ✓ starter  | ✓ pro
advanced_filters ✗ free    | ✓ starter  | ✓ pro
analytics        ✗ free    | ✗ starter  | ✓ pro
api_access       ✗ free    | ✗ starter  | ✓ pro
custom_segments  ✗ free    | ✗ starter  | ✓ pro
```

---

## 💻 API Endpoints

### Signup
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "plan": "starter"
}

Response:
{
  "access_token": "jwt...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "plan": "starter",
    ...
  }
}
```

### Login
```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: Same as signup
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend/app/auth/signup/page.tsx` | Multi-step signup UI ✅ |
| `frontend/lib/usePlanFeatures.ts` | Feature access hook ✅ |
| `frontend/components/FeatureGate.tsx` | Feature gating component ✅ |
| `app/routes/auth.py` | Auth endpoints ⚠️ |
| `app/models/user.py` | User model ⚠️ (create) |

---

## 🔧 Implementation Checklist

### Backend (Priority Order)

#### 1️⃣ User Model
```python
# app/models/user.py
class User:
    id: String (PK)
    email: String (unique)
    password_hash: String
    first_name: String
    last_name: String
    plan: String (default="free")
    payment_status: String (default="pending")
    is_active: Boolean
```

#### 2️⃣ Signup Implementation
```python
# In app/routes/auth.py
@router.post("/signup")
async def signup(request: RegisterRequest, db: Session):
    # 1. Validate plan
    # 2. Hash password
    # 3. Create user
    # 4. Create subscription
    # 5. Generate JWT
    # 6. Return token + user
```

#### 3️⃣ Login Implementation
```python
@router.post("/login")
async def login(request: LoginRequest, db: Session):
    # 1. Find user
    # 2. Verify password
    # 3. Check subscription
    # 4. Validate payment status
    # 5. Generate JWT with plan
    # 6. Return token + user
```

#### 4️⃣ Database
```sql
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    plan VARCHAR DEFAULT 'free',
    payment_status VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);
```

---

## 🧪 Testing Commands

### Test Signup
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "plan": "free"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test Feature Access
```javascript
// In browser console
import { usePlanFeatures } from '@/lib/usePlanFeatures';
const { hasFeature } = usePlanFeatures();
console.log(hasFeature('csv_export')); // true/false
```

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| Signup fails | Check backend implements signup logic |
| No plan in response | Ensure user model has plan field |
| Features not gating | Check localStorage for token |
| Payment not processed | Payment integration TODO |
| Subscription not created | Check subscription creation in signup |

---

## 📚 Documentation

- `IMPLEMENTATION_SUMMARY.md` - What was done, what's left
- `BACKEND_SIGNUP_IMPLEMENTATION.md` - Backend code examples
- `SIGNUP_FLOW_GUIDE.md` - Complete signup flow guide
- `SIGNUP_ERROR_FIX.md` - Troubleshooting signup errors
- `SIGNUP_FLOW_VISUAL.md` - Visual diagrams

---

## 🔄 Signup Flow (User Perspective)

1. Visit `/auth/signup`
2. Enter account details
3. Select plan
4. Complete payment (if needed)
5. See confirmation
6. Redirected to dashboard
7. Features limited by plan
8. Can upgrade anytime

---

## ✨ Future Enhancements

- [ ] Email verification on signup
- [ ] Stripe/Razorpay integration
- [ ] Plan upgrade/downgrade
- [ ] Automatic subscription renewal
- [ ] Usage tracking and alerts
- [ ] Trial period (14 days)
- [ ] Admin dashboard
- [ ] Audit logging

---

## 🎯 Success Metrics

After implementation:
- ✓ Users can sign up
- ✓ Plan selected on signup
- ✓ Payment validated
- ✓ Features gated by plan
- ✓ Lead count enforced
- ✓ Users can't access paid features without payment
- ✓ Upgrade prompts shown

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error messages in frontend
3. Check backend logs
4. Test with curl commands

---

Last Updated: January 25, 2026
Status: ✅ Frontend Ready | ⚠️ Backend In Progress
