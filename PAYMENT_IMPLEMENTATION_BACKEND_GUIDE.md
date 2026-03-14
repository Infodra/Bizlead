# Backend Implementation Guide - Remaining Features

## 1. Auto-Renewal Scheduler

### File: `app/services/auto_renewal_service.py`

This service handles automatic monthly payments for subscriptions.

```python
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from app.models.subscription import Subscription
from app.models.payment import Payment
from app.services.payment_service import create_razorpay_order, PLAN_PRICING

def schedule_auto_renewals(db: Session):
    """
    Check for subscriptions due for renewal today and schedule payments.
    Queries subscriptions where expiry_date == today
    """
    from app.dependencies.database import get_db
    
    try:
        subscriptions = db.query(Subscription).filter(
            Subscription.is_active == True,
            Subscription.expiry_date <= datetime.utcnow(),
        ).all()
        
        for sub in subscriptions:
            process_renewal(db, sub)
    except Exception as e:
        print(f"Error in auto-renewal: {str(e)}")

def process_renewal(db: Session, subscription: Subscription):
    """Process renewal for a single subscription"""
    try:
        plan_amount = PLAN_PRICING[subscription.plan_name]["amount"] / 100  # Convert to rupees
        
        # Create payment record
        payment = Payment(
            user_id=subscription.user_id,
            subscription_id=subscription.id,
            amount=plan_amount,
            currency="INR",
            status="auto_renewal_pending",
            plan_name=subscription.plan_name,
            is_recurring=True,
            next_payment_date=datetime.utcnow() + timedelta(days=30)
        )
        
        db.add(payment)
        db.commit()
        
        # Attempt automatic payment through Razorpay Subscriptions API
        # In production, use Razorpay's recurring payments or webhooks
        
        # Extend subscription
        subscription.expiry_date = datetime.utcnow() + timedelta(days=30)
        subscription.updated_at = datetime.utcnow()
        db.commit()
        
        # Send email notification
        send_renewal_email(subscription.user_id, subscription.plan_name, plan_amount)
        
        print(f"Auto-renewal processed for subscription {subscription.id}")
        
    except Exception as e:
        print(f"Error processing renewal for {subscription.id}: {str(e)}")

def send_renewal_email(user_id, plan_name, amount):
    """Send renewal confirmation email"""
    # Implement email service
    pass

# Initialize scheduler on app startup
def init_scheduler():
    """Initialize background scheduler for auto-renewals"""
    scheduler = BackgroundScheduler()
    
    # Run every day at 2 AM UTC
    scheduler.add_job(
        schedule_auto_renewals,
        'cron',
        hour=2,
        minute=0,
        id='auto_renewal_job'
    )
    
    scheduler.start()
    return scheduler
```

### Integration in `main.py`:

```python
from app.services.auto_renewal_service import init_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting BizLead application...")
    
    # Initialize scheduler
    scheduler = init_scheduler()
    
    yield
    
    # Shutdown scheduler
    scheduler.shutdown()
    logger.info("Application shutdown complete")
```

---

## 2. Subscription Cancellation Endpoint

### File: `app/routes/subscriptions.py` (Add)

```python
@router.post("/cancel-subscription")
async def cancel_subscription(
    reason: str = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel user's subscription and move to Free plan.
    
    Args:
        reason: Cancellation reason (optional)
    
    Returns:
        dict: Confirmation message
    """
    try:
        user_id = UUID(current_user.id)
        
        # Get active subscription
        subscription = get_user_subscription(db, user_id, "bizlead")
        if not subscription:
            raise ValueError("No active subscription found")
        
        # Mark subscription as inactive
        subscription.is_active = False
        subscription.updated_at = datetime.utcnow()
        
        # Move user to Free plan
        free_subscription = activate_subscription(
            db=db,
            user_id=user_id,
            product_name="bizlead",
            plan_name="free",
            duration_days=99999  # Essentially unlimited for free plan
        )
        
        # Log cancellation reason
        if reason:
            # Could store in a cancellation_feedback table
            pass
        
        # Send cancellation email
        send_cancellation_email(user_id, subscription.plan_name)
        
        return {
            "status": "success",
            "message": f"Subscription cancelled. Plan downgraded to Free.",
            "new_plan": "free"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def send_cancellation_email(user_id, plan_name):
    """Send cancellation confirmation email"""
    # Implement email service
    pass
```

---

## 3. Plan-Based Dashboard Access

### File: `lib/usePlanFeatures.ts` (Frontend)

Already exists in the codebase. It checks for features based on plan.

```typescript
export function usePlanFeatures(plan: string) {
  const features = {
    free: {
      maxLeads: 50,
      advancedFilters: false,
      csvExport: false,
      apiAccess: false,
      customSegments: false,
      analytics: false,
      prioritySupport: false,
    },
    starter: {
      maxLeads: 500,
      advancedFilters: true,
      csvExport: true,
      apiAccess: false,
      customSegments: false,
      analytics: false,
      prioritySupport: true,
    },
    professional: {
      maxLeads: 2000,
      advancedFilters: true,
      csvExport: true,
      apiAccess: true,
      customSegments: true,
      analytics: true,
      prioritySupport: true,
    },
  };

  return features[plan] || features.free;
}
```

### Backend Validation: `app/services/quota_enforcement.py`

Already implemented. Validates feature access on API calls.

---

## 4. Enhanced Billing Page

### File: `frontend/app/dashboard/billing/page.tsx` (Update)

Create comprehensive billing page with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function EnhancedBillingPage() {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingDetails();
  }, []);

  const fetchBillingDetails = async () => {
    try {
      const response = await apiClient.get(
        '/api/v1/bizlead/payments/billing-details'
      );
      setBillingData(response.data);
    } catch (error) {
      console.error('Error fetching billing details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="billing-page">
      {/* Current Subscription */}
      <section className="current-subscription">
        <h2>Current Subscription</h2>
        <div className="subscription-card">
          <p>Plan: {billingData?.current_plan}</p>
          <p>Next Billing: {billingData?.next_payment_date}</p>
          <button onClick={upgradeClick}>Upgrade Plan</button>
          <button onClick={cancelClick}>Cancel Subscription</button>
        </div>
      </section>

      {/* Payment History */}
      <section className="payment-history">
        <h2>Payment History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Plan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {billingData?.payment_history.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.created_at}</td>
                <td>₹{payment.amount}</td>
                <td>{payment.plan_name}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Invoices */}
      <section className="invoices">
        <h2>Invoices</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {billingData?.invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoice_number}</td>
                <td>{invoice.issued_at}</td>
                <td>₹{invoice.amount}</td>
                <td>{invoice.status}</td>
                <td>
                  <button onClick={() => downloadInvoice(invoice.id)}>
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
```

---

## 5. Email Service Integration

### File: `app/services/email_service.py` (Create)

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    def __init__(self):
        self.sender = os.getenv('EMAIL_FROM', 'noreply@bizlead.com')
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.username = os.getenv('SMTP_USER')
        self.password = os.getenv('SMTP_PASSWORD')
    
    def send_payment_receipt(self, user_email, payment_data):
        """Send payment receipt email"""
        subject = f"Payment Confirmation - ₹{payment_data['amount']}"
        html_content = self._render_receipt_template(payment_data)
        self._send_email(user_email, subject, html_content)
    
    def send_renewal_notification(self, user_email, plan, amount):
        """Send auto-renewal notification"""
        subject = f"Your {plan} plan has been renewed"
        html_content = f"""
        <h2>Subscription Renewed</h2>
        <p>Your {plan.title()} plan subscription has been renewed.</p>
        <p>Amount: ₹{amount}</p>
        <p>Your service is active for another 30 days.</p>
        """
        self._send_email(user_email, subject, html_content)
    
    def send_cancellation_confirmation(self, user_email, plan):
        """Send cancellation confirmation"""
        subject = "Subscription Cancelled"
        html_content = f"""
        <h2>Subscription Cancelled</h2>
        <p>Your {plan.title()} plan has been cancelled.</p>
        <p>You've been downgraded to our Free plan.</p>
        <p>If you change your mind, you can upgrade anytime.</p>
        """
        self._send_email(user_email, subject, html_content)
    
    def _send_email(self, recipient, subject, html_content):
        """Internal method to send email via SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender
            msg['To'] = recipient
            
            # Attach HTML content
            part = MIMEText(html_content, 'html')
            msg.attach(part)
            
            # Send via SMTP
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
                
        except Exception as e:
            print(f"Error sending email: {str(e)}")
    
    def _render_receipt_template(self, payment_data):
        """Render HTML receipt template"""
        return f"""
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment!</p>
        <ul>
            <li>Plan: {payment_data['plan_name']}</li>
            <li>Amount: ₹{payment_data['amount']}</li>
            <li>Date: {payment_data['date']}</li>
            <li>Transaction ID: {payment_data['transaction_id']}</li>
        </ul>
        <p>Your subscription is now active.</p>
        """

# Initialize email service
email_service = EmailService()
```

---

## 6. Webhook Handler for Razorpay

### File: `app/routes/webhooks.py` (Create)

```python
from fastapi import APIRouter, Request, HTTPException
from hashlib import sha256
import hmac
import os

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

@router.post("/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Razorpay webhook events for:
    - payment.authorized
    - payment.failed
    - subscription.authenticated
    - subscription.completed
    """
    
    # Verify webhook signature
    webhook_body = await request.body()
    webhook_signature = request.headers.get('X-Razorpay-Signature')
    
    if not verify_webhook_signature(webhook_body, webhook_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    # Parse webhook data
    import json
    webhook_data = json.loads(webhook_body)
    event = webhook_data.get('event')
    payload = webhook_data.get('payload', {})
    
    if event == 'payment.authorized':
        handle_payment_authorized(payload, db)
    elif event == 'payment.failed':
        handle_payment_failed(payload, db)
    
    return {"status": "ok"}

def verify_webhook_signature(body, signature):
    """Verify Razorpay webhook signature"""
    expected = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## 7. Invoice Generation Service

### File: `app/services/invoice_service.py` (Create)

```python
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.payment import Invoice
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_invoice_number(user_id: UUID) -> str:
    """Generate unique invoice number"""
    timestamp = int(datetime.utcnow().timestamp())
    return f"INV-{timestamp}-{user_id.hex[:8].upper()}"

def create_pdf_invoice(invoice_data) -> bytes:
    """Generate PDF invoice"""
    from io import BytesIO
    
    pdf_buffer= BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    
    # Add invoice details
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "INVOICE")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, 700, f"Invoice #: {invoice_data['invoice_number']}")
    c.drawString(50, 680, f"Date: {invoice_data['issued_at']}")
    
    # Add customer info
    c.drawString(50, 630, f"Customer: {invoice_data['customer_name']}")
    c.drawString(50, 610, f"Email: {invoice_data['customer_email']}")
    
    # Add line items
    c.drawString(50, 560, "Description")
    c.drawString(300, 560, "Amount")
    
    y = 540
    for item in invoice_data['items']:
        c.drawString(50, y, item['description'])
        c.drawString(300, y, f"₹{item['amount']}")
        y -= 20
    
    # Add total
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "TOTAL")
    c.drawString(300, y, f"₹{invoice_data['total_amount']}")
    
    c.save()
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()
```

---

## Database Migrations

### File: `alembic/versions/xxx_add_payment_tables.py` (Create)

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'payments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('subscription_id', sa.UUID(), nullable=True),
        sa.Column('razorpay_order_id', sa.String(100), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(100), nullable=True),
        sa.Column('razorpay_signature', sa.String(500), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(10), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('plan_name', sa.String(50), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), nullable=False),
        sa.Column('next_payment_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_payments_user_id', 'user_id'),
        sa.Index('ix_payments_razorpay_order_id', 'razorpay_order_id'),
        sa.Index('ix_payments_status', 'status'),
    )
    
    op.create_index('idx_user_status', 'payments', ['user_id', 'status'])

def downgrade():
    op.drop_table('payments')
```

---

## Testing Auto-Renewal

### File: `tests/test_auto_renewal.py`

```python
import pytest
from datetime import datetime, timedelta
from app.services.auto_renewal_service import process_renewal

@pytest.mark.asyncio
async def test_auto_renewal(db_session):
    """Test auto-renewal process"""
    # Create expired subscription
    subscription = Subscription(
        user_id=test_user_id,
        product_name="bizlead",
        plan_name="starter",
        start_date=datetime.utcnow() - timedelta(days=30),
        expiry_date=datetime.utcnow() - timedelta(days=1),
        is_active=True
    )
    
    db_session.add(subscription)
    db_session.commit()
    
    # Process renewal
    process_renewal(db_session, subscription)
    
    # Verify subscription extended
    db_session.refresh(subscription)
    assert subscription.expiry_date > datetime.utcnow()
    assert subscription.is_active == True
```

---

## Summary of Files Created/Updated

| File | Action | Purpose |
|------|--------|---------|
| `app/models/payment.py` | Create | Payment and Invoice models |
| `app/services/payment_service.py` | Create | Razorpay integration and payment processing |
| `app/routes/payments.py` | Create | Payment API endpoints |
| `app/services/auto_renewal_service.py` | Create | Auto-renewal scheduler |
| `app/services/email_service.py` | Create | Email notifications |
| `app/services/invoice_service.py` | Create | Invoice generation |
| `app/routes/webhooks.py` | Create | Razorpay webhooks |
| `main.py` | Update | Include payment routes |
| `frontend/app/layout.tsx` | Update | Add Razorpay script |
| `frontend/app/payment/payment-content.tsx` | Update | Integrate Razorpay checkout |

---

## Deployment Checklist

- [ ] Get Razorpay API credentials (https://razorpay.com)
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Deploy payment models
- [x] Deploy payment routes
- [ ] Deploy payment service
- [ ] Configure email service
- [ ] Setup auto-renewal scheduler
- [ ] Add webhook endpoint to Razorpay dashboard
- [ ] Test all payment flows
- [ ] Monitor payments in production
