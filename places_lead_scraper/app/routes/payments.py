"""
FastAPI routes for payment processing and billing management.

This module provides endpoints for:
1. Creating Razorpay payment orders
2. Verifying payment signatures
3. Processing payments
4. Retrieving payment history
5. Managing invoices
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from bson import ObjectId

from app.services.payment_service import (
    create_razorpay_order,
    verify_razorpay_payment,
    process_payment,
    get_payment_history,
    get_invoices,
    RAZORPAY_KEY_ID,
)
from app.dependencies.auth_dependency import get_current_user
from app.models.user import UserResponse
from app.models.payment import Payment
from app.database import get_db
from app.config.mongodb import (
    get_users_collection,
    get_subscriptions_collection,
)


router = APIRouter(prefix="/api/v1/bizlead/payments", tags=["payments"])


# ============================================================================
# Request/Response Models
# ============================================================================


class CreatePaymentRequest(BaseModel):
    """Request to create a payment order"""
    plan_name: str = Field(..., description="Plan: free, starter, or professional")
    email: str | None = Field(None, description="Email for new users")
    full_name: str | None = Field(None, description="Full name for new users")


class PaymentOrderResponse(BaseModel):
    """Response containing order details with GST"""
    order_id: str
    amount: int  # Base amount in paise (before GST)
    gst_amount: int  # GST amount in paise
    total_amount: int  # Total amount in paise (amount + GST)
    gst_percentage: float  # GST percentage (18% for India)
    currency: str
    plan: str
    key_id: str = Field(..., description="Razorpay key ID for frontend")
    payment_id: str = Field(..., description="Payment record ID for tracking")


class VerifyPaymentRequest(BaseModel):
    """Request to verify payment"""
    order_id: str
    payment_id: str
    signature: str
    plan_name: str
    email: str | None = Field(None, description="Email for new users")
    full_name: str | None = Field(None, description="Full name for new users")
    password: str | None = Field(None, description="Password for new users")


class CompletePaymentRequest(BaseModel):
    """Request to complete payment"""
    order_id: str
    plan_name: str
    payment_record_id: str
    email: str | None = Field(None, description="Email for new users")
    full_name: str | None = Field(None, description="Full name for new users")
    password: str | None = Field(None, description="Password for new users")


class PaymentHistoryItem(BaseModel):
    """Payment history item"""
    id: str
    razorpay_order_id: str | None
    amount: float
    currency: str
    status: str
    plan_name: str
    created_at: str
    subscription_id: str | None = None


class InvoiceItem(BaseModel):
    """Invoice item with GST details"""
    id: str
    invoice_number: str
    amount: float  # Base amount before GST
    tax_amount: float  # GST amount
    gst_percentage: float  # GST percentage (18%)
    total_amount: float  # Total including GST
    currency: str
    status: str
    issued_at: str
    due_date: str
    paid_at: str | None


class BillingDetailsResponse(BaseModel):
    """Complete billing details"""
    current_plan: str
    next_payment_date: str | None
    payment_history: list[PaymentHistoryItem]
    invoices: list[InvoiceItem]


# ============================================================================
# Endpoints
# ============================================================================


@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    request: CreatePaymentRequest,
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay payment order.

    Supports both authenticated users and new users signing up for the first time.

    Args:
        plan_name: Plan to purchase (free, starter, professional)
        email: Email address (required for new users)
        full_name: Full name (required for new users)

    Returns:
        PaymentOrderResponse: Order details with Razorpay key
    """
    try:
        # Use provided email/name or generate dummy values
        email = request.email or f"pending-{int(__import__('time').time())}@pending.com"
        full_name = request.full_name or "Pending User"

        order_data = create_razorpay_order(
            db=db,
            user_id=None,  # type: ignore
            plan_name=request.plan_name,
            user_email=email,
            user_name=full_name
        )

        # Return Razorpay key for frontend with GST details
        return PaymentOrderResponse(
            order_id=order_data["order_id"],
            amount=order_data["amount"],
            gst_amount=order_data.get("gst_amount", 0),
            total_amount=order_data.get("total_amount", order_data["amount"]),
            gst_percentage=order_data.get("gst_percentage", 0),
            currency=order_data["currency"],
            plan=order_data["plan"],
            key_id=RAZORPAY_KEY_ID,  # Razorpay key from environment
            payment_id=order_data["payment_id"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating payment order: {str(e)}"
        )


@router.post("/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db)
):
    """
    Verify payment signature.

    Supports both authenticated users and new user signups.

    Args:
        order_id: Razorpay order ID
        payment_id: Razorpay payment ID
        signature: Payment signature from Razorpay
        plan_name: Plan name
        email: Email (for new users)
        full_name: Full name (for new users)
        password: Password (for new users)

    Returns:
        dict: Payment verification status
    """
    try:
        # Verify signature
        is_valid = verify_razorpay_payment(
            order_id=request.order_id,
            payment_id=request.payment_id,
            signature=request.signature,
            db=db,
            user_id=None  # type: ignore
        )

        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed. Invalid signature."
            )

        return JSONResponse({
            "status": "success",
            "message": "Payment verified successfully",
            "order_id": request.order_id,
            "payment_id": request.payment_id,
            "plan": request.plan_name
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying payment: {str(e)}"
        )


@router.post("/complete")
async def complete_payment(
    request: CompletePaymentRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse | None = None  # Optional auth for existing users
):
    """
    Complete payment and activate subscription.

    Handles both authenticated users (renewal) and new user signups.

    Args:
        order_id: Razorpay order ID
        plan_name: Plan name
        payment_record_id: Payment record ID
        email: Email (optional)
        full_name: Full name (optional)
        password: Password (optional)
        current_user: Optional authenticated user (for renewals)

    Returns:
        dict: Subscription activation details or payment confirmation
    """
    try:
        # Get the payment record
        payment = db.query(Payment).filter(
            Payment.id == UUID(request.payment_record_id)
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment record not found"
            )
        
        # Mark payment as completed
        if payment.status != "completed":
            payment.status = "completed"
            db.commit()
        
        # If exising user is logged in, use their ID
        if current_user and current_user.id:
            user_id = UUID(current_user.id)
            # Update payment with user_id
            if not payment.user_id:
                payment.user_id = user_id
                db.commit()
        else:
            user_id = payment.user_id
        
        # If we have a user_id, create subscription
        if user_id:
            try:
                subscription = process_payment(
                    db=db,
                    user_id=user_id,
                    payment_id=request.payment_record_id,
                    plan_name=request.plan_name
                )
                
                # IMPORTANT: Also update MongoDB user record with subscription status
                # This is required for login endpoint to verify active subscription
                users_collection = await get_users_collection()
                
                # Find user by email if we have it
                mongodb_user = None
                if request.email:
                    mongodb_user = await users_collection.find_one(
                        {"email": request.email.lower()}
                    )
                
                # If user found, link subscription
                if mongodb_user:
                    await users_collection.update_one(
                        {"_id": mongodb_user["_id"]},
                        {
                            "$set": {
                                "current_subscription_id": str(subscription.id),
                                "updated_at": __import__("datetime").datetime.utcnow(),
                            }
                        }
                    )
                
                return JSONResponse({
                    "status": "success",
                    "message": "Payment completed and subscription activated",
                    "plan": request.plan_name,
                    "subscription": {
                        "id": str(subscription.id),
                        "user_id": str(subscription.user_id),
                        "plan_name": subscription.plan_name,
                        "is_active": subscription.is_active
                    }
                })
            except ValueError as e:
                # Subscription might already exist
                return JSONResponse({
                    "status": "success",
                    "message": f"Payment completed. {str(e)}",
                    "plan": request.plan_name
                })
        else:
            # Payment recorded with no user yet - inform frontend to log in
            return JSONResponse({
                "status": "success",
                "message": "Payment completed! Please sign up or log in to activate your subscription.",
                "plan": request.plan_name,
                "requires_auth": True
            })

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error completing payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing payment: {str(e)}"
        )


@router.get("/history", response_model=list[PaymentHistoryItem])
async def get_payment_history_endpoint(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """
    Get payment history for current user.

    Args:
        limit: Number of records to return

    Returns:
        list[PaymentHistoryItem]: Payment history
    """
    try:
        user_id = UUID(current_user.id)
        payments = get_payment_history(db, user_id, limit)

        return [
            PaymentHistoryItem(
                id=str(p.id),
                razorpay_order_id=p.razorpay_order_id,
                amount=p.amount,
                currency=p.currency,
                status=p.status,
                plan_name=p.plan_name,
                created_at=p.created_at.isoformat(),
                subscription_id=str(p.subscription_id) if p.subscription_id else None
            )
            for p in payments
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/invoices", response_model=list[InvoiceItem])
async def get_user_invoices(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """
    Get invoices for current user.

    Args:
        limit: Number of records to return

    Returns:
        list[InvoiceItem]: User invoices
    """
    try:
        user_id = UUID(current_user.id)
        invoices = get_invoices(db, user_id, limit)

        return [
            InvoiceItem(
                id=str(inv.id),
                invoice_number=inv.invoice_number,
                amount=inv.amount,
                tax_amount=inv.tax_amount,
                total_amount=inv.total_amount,
                status=inv.status,
                issued_at=inv.issued_at.isoformat(),
                due_date=inv.due_date.isoformat(),
                paid_at=inv.paid_at.isoformat() if inv.paid_at else None
            )
            for inv in invoices
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/billing-details")
async def get_billing_details(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete billing details for current user.

    Returns:
        dict: Current plan, next payment date, payment history, and invoices
    """
    try:
        user_id = UUID(current_user.id)
        
        # Get payment history and invoices
        payments = get_payment_history(db, user_id, 10)
        invoices = get_invoices(db, user_id, 20)

        # Format response
        return {
            "current_plan": current_user.plan or "starter",
            "next_payment_date": None,  # Would be fetched from active subscription
            "payment_history": [
                {
                    "id": str(p.id),
                    "amount": p.amount,
                    "currency": p.currency,
                    "status": p.status,
                    "plan_name": p.plan_name,
                    "created_at": p.created_at.isoformat(),
                }
                for p in payments
            ],
            "invoices": [
                {
                    "id": str(inv.id),
                    "invoice_number": inv.invoice_number,
                    "amount": inv.total_amount,
                    "status": inv.status,
                    "issued_at": inv.issued_at.isoformat(),
                    "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
                }
                for inv in invoices
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/invoice/{invoice_id}/download", tags=["invoices"])
async def download_invoice(
    invoice_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download invoice as HTML with GST details.
    
    Returns invoice with complete payment and tax information.
    
    Args:
        invoice_id: Invoice ID to download
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        HTMLResponse: Invoice HTML file for download
    """
    from fastapi.responses import HTMLResponse
    from app.services.invoice_service import get_invoice_html
    
    try:
        from uuid import UUID
        user_id = UUID(current_user.id)
        invoice_uuid = UUID(invoice_id)
        
        # Get invoice
        invoice = db.query(Invoice).filter(
            Invoice.id == invoice_uuid,
            Invoice.user_id == user_id
        ).first()
        
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )
        
        # Generate HTML
        html_content = get_invoice_html(invoice)
        
        # Return as downloadable HTML
        return HTMLResponse(
            content=html_content,
            headers={
                "Content-Disposition": f"attachment; filename={invoice.invoice_number}.html"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/invoices", tags=["invoices"])
async def get_user_invoices(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    skip: int = 0
):
    """
    Get all invoices for current user with GST details.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        limit: Number of invoices to return
        skip: Number of invoices to skip (for pagination)
    
    Returns:
        list[InvoiceItem]: User's invoices with GST information
    """
    from uuid import UUID
    from app.services.invoice_service import get_invoice_data
    
    try:
        user_id = UUID(current_user.id)
        
        # Get invoices
        invoices = db.query(Invoice).filter(
            Invoice.user_id == user_id
        ).order_by(
            Invoice.issued_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Format response
        return [get_invoice_data(inv) for inv in invoices]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
