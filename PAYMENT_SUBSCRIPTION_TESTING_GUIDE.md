# Payment Subscription Flow - Complete Testing Guide

## Overview

This guide covers the complete payment subscription workflow for BizLead. The flow involves:

1. **Pricing Page** → Select plan and click "Start" button
2. **Payment Gateway** → Razorpay payment initialization
3. **Login/Registration** → User creates account or logs in
4. **Dashboard Access** → Plan-based dashboard features
5. **Billing Page** → View subscription and payment history
6. **Auto-Renewal** → Automatic payment every month

---

## System Architecture

```
Frontend (Next.js)
├── Pricing Page (/billing, /payment)
├── Payment Page (/payment?plan=starter|professional)
└── Dashboard & Billing Pages

↓ (HTTP API Calls)

Backend (FastAPI)
├── Razorpay Integration
├── Payment Service (app/services/payment_service.py)
├── Subscription Service (app/services/subscription_service.py)
└── Database (PostgreSQL + SQLAlchemy ORM)

↓ (API Endpoints)

Services
├── Razorpay (Payment Processing)
├── Email Service (Receipts & Notifications)
└── Job Scheduler (Auto-Renewal)
```

---

## Payment Flow Diagram

```
┌─────────────────┐
│  Pricing Page   │
│  (Free/Starter/ │
│ Professional)   │
└────────┬────────┘
         │ Click "Start"
         ▼
┌─────────────────────────┐
│  Payment Page           │
│ - Personal Info         │
│ - Email & Password      │
│ - Plan Selection        │
└────────┬────────────────┘
         │ Submit Payment
         ▼
┌──────────────────────────────┐
│  Backend: Create Order       │
│  POST /api/v1/bizlead/       │
│        payments/create-order │
│ ← Returns: order_id, key_id  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Razorpay Checkout Modal     │
│  - Payment Details           │
│  - Card/UPI/Other Methods    │
└────────┬─────────────────────┘
         │ User Completes Payment
         ▼
┌──────────────────────────────┐
│  Backend: Verify Signature   │
│  POST /api/v1/bizlead/       │
│        payments/verify       │
│ - Validate HMAC signature    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Backend: Activate Sub       │
│  POST /api/v1/bizlead/       │
│        payments/complete     │
│ - Create subscription        │
│ - Update plan               │
│ - Create invoice            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Success Page            │
│ - Plan Activated         │
│ - Redirect to Dashboard  │
└──────────────────────────┘
```

---

## Step-by-Step Testing Guide

### 1. Test Pricing Page

**URL:** `http://localhost:3000/billing`

**Actions:**
- View pricing cards for Free, Starter, and Professional plans
- Click "Upgrade" or "Start" button for Starter plan
- Click "Upgrade" or "Start" button for Professional plan

**Expected Result:**
- Buttons redirect to `/payment?plan=starter` or `/payment?plan=professional`

---

### 2. Test Payment Page

**URL:** `http://localhost:3000/payment?plan=starter`

**Flow:**
1. **Fill Personal Information**
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Company: "Acme Corp"
   - Phone: "+91 9876543210"

2. **Create Account**
   - Password: "Test@123"
   - Confirm Password: "Test@123"

3. **Review Order Summary**
   - Plan: Starter
   - Amount: ₹3,000
   - Features listed

4. **Click "Pay ₹3,000"**

**Expected Result:**
- Razorpay Checkout modal opens
- Order details displayed

---

### 3. Test Razorpay Checkout (Test Mode)

**Test Card Details:**
```
Card Number:    4111 1111 1111 1111
Expiry Date:    12/26
CVV:            123
```

**Alternative Methods:**
- UPI: `success@razorpay`
- Netbanking: Any bank option
- Wallet: Test wallets

**Expected Result:**
- Payment successful message displayed
- Backend processes payment
- Subscription activated

---

### 4. Test Payment Success Flow

After successful payment:

1. **Success Page Displayed**
   - Green checkmark icon
   - "Payment Successful!" message
   - "Click here to continue to Dashboard" button

2. **Dashboard Redirect**
   - **URL:** `http://localhost:3000/dashboard`
   - User dashboard loads with plan details
   - Plan-based features available based on tier

3. **Plan Features Verification**

   **Starter Plan (₹3,000):**
   - ✅ 500 leads/month
   - ✅ Advanced filters
   - ✅ CSV export
   - ✅ Priority support
   - ❌ API access
   - ❌ Custom segments

   **Professional Plan (₹9,500):**
   - ✅ 2,000 leads/month
   - ✅ Advanced filters
   - ✅ CSV export
   - ✅ Priority support
   - ✅ API access
   - ✅ Custom segments
   - ✅ Advanced analytics

---

### 5. Test Billing Page

**URL:** `http://localhost:3000/dashboard/billing`

**Content to Verify:**

1. **Current Subscription**
   - Plan name: Starter/Professional
   - Next billing date
   - Amount per month
   - Auto-renewal status

2. **Payment History**
   - Payment date
   - Amount paid
   - Payment method
   - Transaction status
   - Invoice number

3. **Invoices**
   - Invoice number
   - Issued date
   - Amount
   - Download PDF option
   - Payment status

4. **Actions Available**
   - Upgrade Plan button
   - Cancel Subscription button
   - Download Invoice button

---

### 6. Test Plan Upgrade

**From:** Starter ($300,000 paise annually converted to monthly)
**To:** Professional ($950,000 paise)

**Steps:**
1. Go to `/dashboard/billing`
2. Click "Upgrade to Professional" for Professional plan
3. Process new payment for difference
4. Verify plan upgraded immediately
5. Check invoice for prorated charges

**Expected Result:**
- New subscription created
- Old subscription marked inactive
- Invoice generated for upgrade
- Dashboard updates with new plan limits

---

### 7. Test Plan Downgrade

**From:** Professional
**To:** Starter

**Steps:**
1. Go to `/dashboard/billing`
2. Click "Downgrade Plan"
3. Confirm downgrade message
4. Changes effective next billing cycle

**Expected Result:**
- Current plan remains active until next renewal
- Next billing shows Starter price
- Features appropriately locked/honored until next cycle

---

### 8. Test Subscription Cancellation

**Steps:**
1. Go to `/dashboard/billing`
2. Click "Cancel Subscription"
3. Confirm cancellation dialog
4. Select cancellation reason (optional)
5. Account transitions to Free plan

**Expected Result:**
- Subscription marked as inactive
- User placed on Free plan
- Last invoice marked as final
- Option to reactivate provided

---

### 9. Test Auto-Renewal

**Scheduled for:** 30 days after subscription start

**Backend Process:**
```python
# Automatic payment triggered at subscription expiry
POST /api/v1/bizlead/payments/auto-renew
   - User ID
   - Subscription ID
   - Plan name
   - Amount
```

**Expected Result:**
- Payment processed automatically
- New invoice generated
- Subscription extended for another 30 days
- Email notification sent to user

---

### 10. Test Free Plan Access

**Actions:**
1. Logout from paid account
2. Create new account with Free plan (no payment)
3. Verify Free plan limits applied
4. Check limited feature access

**Free Plan Limits:**
- 50 leads/month
- Basic info only
- Email support
- No exports
- No analytics

---

## API Endpoint Testing

### Testing with cURL

#### Create Payment Order
```bash
curl -X POST http://localhost:8000/api/v1/bizlead/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_name": "starter"
  }'

# Response:
{
  "order_id": "order_xxxxxxxxxxx",
  "amount": 300000,
  "currency": "INR",
  "plan": "starter",
  "key_id": "rzp_test_xxxxxxx",
  "payment_id": "uuid-here"
}
```

#### Verify Payment
```bash
curl -X POST http://localhost:8000/api/v1/bizlead/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_xxxxxxxxx",
    "payment_id": "pay_xxxxxxxxx",
    "signature": "signature_here",
    "plan_name": "starter"
  }'
```

#### Complete Payment
```bash
curl -X POST http://localhost:8000/api/v1/bizlead/payments/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_xxxxxxxxx",
    "plan_name": "starter",
    "payment_record_id": "uuid-here"
  }'

# Response:
{
  "status": "success",
  "subscription": {
    "id": "sub-uuid",
    "user_id": "user-uuid",
    "plan_name": "starter",
    "start_date": "2024-01-24T10:30:00",
    "expiry_date": "2024-02-24T10:30:00",
    "is_active": true
  }
}
```

#### Get Payment History
```bash
curl -X GET http://localhost:8000/api/v1/bizlead/payments/history?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Invoices
```bash
curl -X GET http://localhost:8000/api/v1/bizlead/payments/invoices?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Billing Details
```bash
curl -X GET http://localhost:8000/api/v1/bizlead/payments/billing-details \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    amount FLOAT NOT NULL,
    currency VARCHAR(10),
    status VARCHAR(20), -- pending, completed, failed, refunded
    plan_name VARCHAR(50),
    payment_method VARCHAR(50),
    is_recurring BOOLEAN,
    next_payment_date DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

### Invoices Table
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    payment_id UUID REFERENCES payments(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE,
    amount FLOAT,
    tax_amount FLOAT,
    total_amount FLOAT,
    status VARCHAR(20), -- drafted, issued, paid, overdue
    issued_at DATETIME,
    due_date DATETIME,
    paid_at DATETIME,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

---

## Troubleshooting

### Issue: "Payment verification failed"
**Solution:** 
- Check RAZORPAY_KEY_SECRET in environment
- Verify order_id and payment_id match
- Check signature algorithm (SHA256 HMAC)

### Issue: "Subscription not activated"
**Solution:**
- Verify payment status is 'completed'
- Check user_id is correct UUID
- Ensure subscription is created after payment

### Issue: "Razorpay modal not opening"
**Solution:**
- Verify Razorpay script loaded: `<script src="https://checkout.razorpay.com/v1/checkout.js">`
- Check order_id is returned from backend
- Verify key_id is valid

### Issue: "Auto-renewal not working"
**Solution:**
- Check APScheduler is running
- Verify next_payment_date is set
- Check database for scheduled jobs
- Review job execution logs

---

## Environment Variables

Create `.env` file in `places_lead_scraper/`:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here

# Database
DATABASE_URL=postgresql://user:password@localhost/bizlead

# JWT
SECRET_KEY=your-secret-key-here

# Email (for receipts)
EMAIL_FROM=noreply@bizlead.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Success Criteria Checklist

- [ ] Pricing page displays correctly
- [ ] "Start" buttons navigate to payment page
- [ ] Payment page loads selected plan
- [ ] Razorpay modal opens with correct amount
- [ ] Payment succeeds with test card
- [ ] Backend verifies signature correctly
- [ ] Subscription activated after payment
- [ ] User redirected to dashboard
- [ ] Dashboard shows correct plan features
- [ ] Billing page displays payment history
- [ ] Invoices generated correctly
- [ ] Auto-renewal scheduled for next month
- [ ] Plan upgrade/downgrade works
- [ ] Subscription cancellation works
- [ ] Email receipts sent
- [ ] All API endpoints tested successfully

---

## Performance Benchmarks

- Payment order creation: < 500ms
- Payment verification: < 300ms
- Subscription activation: < 200ms
- Billing page load: < 1000ms
- Invoice generation: < 100ms

---

## Security Checklist

- [ ] RAZORPAY_KEY_SECRET never exposed in frontend
- [ ] Payment verification uses HMAC-SHA256
- [ ] All payment endpoints require authentication
- [ ] User can only access their own invoices/payments
- [ ] Payment amounts validated server-side
- [ ] Signature verification mandatory before activation
- [ ] Rate limiting on payment endpoints
- [ ] All API calls use HTTPS
- [ ] Sensitive data encrypted in database

---

## Next Steps

1. **Configure Razorpay Account:**
   - Sign up at https://razorpay.com
   - Get test mode credentials
   - Switch to live mode for production

2. **Setup Database:**
   - Run migrations: `alembic upgrade head`
   - Verify tables created

3. **Configure Email Service:**
   - Setup SMTP for payment receipts
   - Create email templates

4. **Setup Auto-Renewal:**
   - Configure APScheduler
   - Create cron jobs for renewal

5. **Deploy to Production:**
   - Update Razorpay credentials
   - Enable HTTPS
   - Setup monitoring and alerting
   - Configure backup strategy
