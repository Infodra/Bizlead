"""
INTEGRATION GUIDE: Adding Plan Display & Upgrade to Your Streamlit App

This shows how to integrate the plan display component into your existing
BizLead Streamlit application.
"""

# ============================================================================
# STEP 1: Create Navigation with Plan Page
# ============================================================================

"""
In your app.py or main page, add plan management to navigation:

import streamlit as st
from app.ui.plan_display import (
    display_plan_card,
    display_subscription_selector,
    show_upgrade_modal,
    display_plan_comparison
)

# Initialize session state for navigation
if "page" not in st.session_state:
    st.session_state.page = "dashboard"

if "user_id" not in st.session_state:
    st.session_state.user_id = None  # Set after login

# Sidebar navigation
with st.sidebar:
    st.title("🚀 BizLead")
    
    if st.session_state.user_id:
        page = st.radio(
            "Navigation",
            ["Dashboard", "My Plan", "Browse Plans", "Billing"]
        )
        
        if page == "Dashboard":
            st.session_state.page = "dashboard"
        elif page == "My Plan":
            st.session_state.page = "my_plan"
        elif page == "Browse Plans":
            st.session_state.page = "browse_plans"
        elif page == "Billing":
            st.session_state.page = "billing"

# Main content based on page
if not st.session_state.user_id:
    # Show login page
    show_login_page()
else:
    # Show selected page
    if st.session_state.page == "dashboard":
        show_dashboard()
    elif st.session_state.page == "my_plan":
        show_my_plan()
    elif st.session_state.page == "browse_plans":
        show_browse_plans()
    elif st.session_state.page == "billing":
        show_billing()
"""

# ============================================================================
# STEP 2: Implement Page Functions
# ============================================================================

"""
def show_login_page():
    '''Display login page'''
    st.title("Login to BizLead")
    
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")
    
    if st.button("Login"):
        # Replace with actual auth logic
        st.session_state.user_id = "user-123"  # Mock user ID
        st.rerun()


def show_dashboard():
    '''Main dashboard page'''
    st.title("📊 Dashboard")
    
    # Your existing dashboard content
    st.write("Welcome to BizLead!")
    
    # Show quick plan status
    with st.expander("📈 Plan Status"):
        from app.ui.plan_display import display_plan_card
        from app.database import SessionLocal
        from uuid import UUID
        
        db = SessionLocal()
        try:
            display_plan_card(db, UUID(st.session_state.user_id))
        finally:
            db.close()


def show_my_plan():
    '''Plan and subscription management page'''
    st.title("📈 My Plan & Subscription")
    
    from app.ui.plan_display import display_plan_card
    from app.database import SessionLocal
    from uuid import UUID
    
    db = SessionLocal()
    try:
        display_plan_card(db, UUID(st.session_state.user_id))
    finally:
        db.close()


def show_browse_plans():
    '''Browse and select plans page'''
    st.title("🎯 Browse Plans")
    
    from app.ui.plan_display import display_subscription_selector
    display_subscription_selector()


def show_billing():
    '''Billing and payment page'''
    st.title("💳 Billing & Payments")
    
    from app.ui.plan_display import show_billing_history
    show_billing_history()
"""

# ============================================================================
# STEP 3: After Login, Show Plan Selector
# ============================================================================

"""
After successful login, if user has no active plan:

from app.services.subscription_service import get_user_subscription
from app.ui.plan_display import display_subscription_selector

db = SessionLocal()
try:
    subscription = get_user_subscription(db, user_id, "bizlead")
    
    if not subscription:
        # No active subscription - show plan selector
        st.warning("⚠️ You don't have an active subscription")
        display_subscription_selector()
    else:
        # Has active subscription - show plan details
        display_plan_card(db, user_id)
finally:
    db.close()
"""

# ============================================================================
# STEP 4: Add Upgrade Button to Main Pages
# ============================================================================

"""
Add upgrade button to your main pages (dashboard, leads, etc.):

import streamlit as st
from app.ui.plan_display import display_plan_card
from app.services.subscription_service import check_feature_access

def show_analytics():
    '''Analytics page with feature check'''
    from app.database import SessionLocal
    from uuid import UUID
    
    db = SessionLocal()
    try:
        user_id = UUID(st.session_state.user_id)
        
        # Check if user has analytics feature
        has_analytics = check_feature_access(db, user_id, "bizlead", "analytics")
        
        if not has_analytics:
            st.warning("📊 Analytics not available in your plan")
            
            with st.expander("🔓 Unlock Analytics"):
                display_plan_card(db, user_id)
        else:
            st.title("📊 Analytics")
            # Show analytics content
    finally:
        db.close()
"""

# ============================================================================
# STEP 5: Integration Points Checklist
# ============================================================================

"""
☐ Add plan display to sidebar after login
☐ Add "My Plan" page/navigation option
☐ Show upgrade button on restricted features
☐ Display quota usage in dashboard
☐ Show subscription status/expiry
☐ Add billing/payment page
☐ Show plan comparison
☐ Implement feature gates:
  - CSV export → check feature access
  - Analytics → check feature access
  - API → check feature access
  - Custom segments → check feature access
☐ Connect to payment processor (Stripe/Razorpay)
☐ Send upgrade reminders when quota near limit
☐ Show renewal reminders before expiry
"""

# ============================================================================
# STEP 6: Quick Integration Example
# ============================================================================

"""
# Minimal integration in existing app.py:

import streamlit as st
from app.ui.plan_display import display_plan_card

st.set_page_config(page_title="BizLead", layout="wide")

# User authentication
if "user_id" not in st.session_state:
    st.stop()  # User not logged in

# Sidebar - show plan status
with st.sidebar:
    st.subheader("📈 Your Plan")
    
    from app.database import SessionLocal
    from uuid import UUID
    
    db = SessionLocal()
    try:
        display_plan_card(db, UUID(st.session_state.user_id))
    finally:
        db.close()

# Main content
st.title("🚀 BizLead Dashboard")

# Rest of your app...
"""

# ============================================================================
# STEP 7: Payment Integration (Stripe Example)
# ============================================================================

"""
# When user clicks "Upgrade" or "Subscribe", handle payment:

import stripe
from app.config.settings import settings

stripe.api_key = settings.STRIPE_API_KEY

def handle_upgrade(plan_name: str, user_id: str):
    '''Handle upgrade payment'''
    
    prices = {
        "starter": "price_starter_monthly",  # From Stripe Dashboard
        "professional": "price_professional_monthly"
    }
    
    # Create checkout session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price": prices.get(plan_name),
                "quantity": 1,
            }
        ],
        mode="subscription",
        success_url="https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="https://yourapp.com/cancel",
        metadata={"user_id": user_id, "plan": plan_name}
    )
    
    # Redirect to checkout
    st.switch_page(f"https://{session.url}")
"""

# ============================================================================
# STEP 8: Webhook Handler for Payment Success
# ============================================================================

"""
# FastAPI endpoint to handle Stripe webhook:

from fastapi import FastAPI, Request
from app.services.subscription_service import activate_subscription
from app.database import SessionLocal

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    '''Handle Stripe webhook events'''
    import stripe
    from app.config.settings import settings
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"status": "invalid_payload"}
    
    # Handle subscription created
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        plan = session["metadata"]["plan"]
        
        db = SessionLocal()
        try:
            activate_subscription(db, UUID(user_id), "bizlead", plan)
        finally:
            db.close()
        
        return {"status": "success"}
    
    return {"status": "received"}
"""

# ============================================================================
# STEP 9: Testing Locally
# ============================================================================

"""
Test with Stripe test keys:

1. Get test keys from https://dashboard.stripe.com/test/apikeys

2. Set in .env:
   STRIPE_API_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...

3. Test webhook locally with Stripe CLI:
   stripe listen --forward-to localhost:8000/webhooks/stripe
   
4. Simulate payment event:
   stripe trigger payment_intent.succeeded

5. Check webhook was processed in your database
"""

# ============================================================================
# STEP 10: Production Deployment
# ============================================================================

"""
Before going live:

1. Switch to Stripe live keys (sk_live_...)
2. Set up proper error handling
3. Add proper logging
4. Test all payment scenarios
5. Add email notifications
6. Monitor webhook delivery
7. Set up payment failure handling
8. Add subscription management UI (pause, cancel, etc.)
9. Implement auto-renewal
10. Add dunning (retry logic for failed payments)
"""
