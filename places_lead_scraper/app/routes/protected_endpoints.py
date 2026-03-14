"""
Example protected endpoints with feature and quota enforcement.

These examples demonstrate how to use the enforcement system
to block users from accessing features not in their plan.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from scraper import search_places
from app.config.settings import settings
from app.services.quota_enforcement import (
    require_feature,
    enforce_lead_quota,
    enforce_csv_export_access,
    enforce_advanced_filters_access,
    enforce_analytics_access,
    enforce_api_access,
    enforce_custom_segments_access,
    get_quota_info,
    check_lead_quota,
)
from app.services.email_finder import find_email_for_lead
from app.dependencies.auth_dependency import get_current_user
from app.models.user import UserResponse

# Placeholder dependency for database
def get_db() -> Session:
    pass

router = APIRouter(prefix="/bizlead", tags=["bizlead-protected"])


# ============================================================================
# Request/Response Models
# ============================================================================


class LeadCreate(BaseModel):
    """Request model for creating a new lead."""
    company_name: str
    contact_email: str
    phone: str | None = None


class CSVExportRequest(BaseModel):
    """Request model for CSV export."""
    filters: dict | None = None


class SaveSearchResultsRequest(BaseModel):
    """Request model for saving search results with validation."""
    query: str
    leads: list[dict] | list
    
    class Config:
        """Validation configuration."""
        str_strip_whitespace = True
    
    def __init__(self, **data):
        super().__init__(**data)
        # Validate query
        if not self.query or len(self.query.strip()) < 2:
            raise ValueError("Search query must be at least 2 characters long")
        if len(self.query) > 100:
            raise ValueError("Search query must not exceed 100 characters")
        # Validate leads is not empty
        if not isinstance(self.leads, list):
            raise ValueError("Leads must be a list")


class ScraperSearchRequest(BaseModel):
    """Request model for scraper search with validation."""
    query: str
    max_results: int = 10
    
    class Config:
        """Validation configuration."""
        str_strip_whitespace = True
    
    def __init__(self, **data):
        super().__init__(**data)
        # Validate query length
        if not self.query or len(self.query.strip()) < 2:
            raise ValueError("Search query must be at least 2 characters long")
        if len(self.query) > 100:
            raise ValueError("Search query must not exceed 100 characters")
        # Validate max_results
        if self.max_results < 1 or self.max_results > 100:
            raise ValueError("Max results must be between 1 and 100")


class QuotaInfoResponse(BaseModel):
    """Response model for quota information."""
    plan_name: str
    lead_limit: int
    current_leads: int
    remaining_leads: int
    features: dict
    subscription_id: str
    expiry_date: str


# ============================================================================
# Lead Management Endpoints
# ============================================================================


@router.post("/leads")
@enforce_lead_quota
async def create_lead(
    lead_data: LeadCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new lead (respects lead quota for all plans).

    This endpoint enforces the lead limit based on subscription tier:
    - Free: 50 leads per month
    - Starter: 500 leads per month
    - Professional: 2,000 leads per month

    Raises:
        HTTPException 429: If lead quota exceeded

    Example:
        POST /api/v1/bizlead/leads
        {
            "company_name": "Acme Corp",
            "contact_email": "john@acme.com",
            "phone": "+1-555-0123"
        }
    """
    # Create lead logic here
    return {
        "message": "Lead created successfully",
        "lead_id": "550e8400-e29b-41d4-a716-446655440000"
    }


@router.get("/quota-status")
async def get_quota_status(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current quota usage and remaining leads.

    Returns comprehensive quota information including:
    - Current lead count
    - Plan limit
    - Remaining quota
    - All feature availability

    Example:
        GET /api/v1/bizlead/quota-status
        Response:
        {
            "plan_name": "starter",
            "lead_limit": 500,
            "current_leads": 245,
            "remaining_leads": 255,
            "features": {...},
            "expiry_date": "2026-02-24T10:30:00"
        }
    """
    return get_quota_info(db, current_user, "bizlead")


# ============================================================================
# CSV Export Endpoint (Feature-Restricted)
# ============================================================================


@router.post("/export/csv")
async def export_leads_csv(
    export_request: CSVExportRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export leads to CSV format (Starter & Professional only).

    ❌ Blocked for: Free plan
    ✅ Available for: Starter, Professional

    Raises:
        HTTPException 403: If user has Free plan

    Example:
        POST /api/v1/bizlead/export/csv
        {
            "filters": {"location": "US", "industry": "Tech"}
        }
        Response: CSV file download
    """
    # Enforce feature access
    enforce_csv_export_access(db, current_user)

    # CSV export logic here
    return {
        "message": "CSV export prepared",
        "file_url": "/downloads/leads-export-123456.csv",
        "record_count": 245
    }


# ============================================================================
# Advanced Filters Endpoint (Feature-Restricted)
# ============================================================================


@router.post("/leads/search")
async def search_with_advanced_filters(
    filters: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search leads with advanced filtering (Starter & Professional only).

    ❌ Blocked for: Free plan
    ✅ Available for: Starter, Professional

    Allowed filters:
    - industry
    - location
    - company_size
    - revenue_range
    - custom_tags

    Raises:
        HTTPException 403: If user has Free plan

    Example:
        POST /api/v1/bizlead/leads/search
        {
            "industry": "SaaS",
            "location": "California",
            "company_size": "1-50"
        }
    """
    # Enforce feature access
    enforce_advanced_filters_access(db, current_user)

    # Advanced search logic here
    return {
        "results_count": 45,
        "leads": []  # Lead data
    }


# ============================================================================
# Analytics Endpoints (Feature-Restricted)
# ============================================================================


@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics dashboard (Professional only).

    ❌ Blocked for: Free, Starter plans
    ✅ Available for: Professional

    Returns:
    - Lead conversion metrics
    - Engagement statistics
    - Trend analysis
    - Performance insights

    Raises:
        HTTPException 403: If user doesn't have Professional plan

    Example:
        GET /api/v1/bizlead/analytics/dashboard
        Response:
        {
            "total_leads": 2000,
            "conversion_rate": 0.12,
            "avg_response_time": "2.5 hours",
            "top_sources": [...]
        }
    """
    # Enforce feature access
    enforce_analytics_access(db, current_user)

    # Analytics logic here
    return {
        "total_leads": 2000,
        "conversion_rate": 0.12,
        "avg_response_time": "2.5 hours",
        "top_sources": ["LinkedIn", "Google", "Direct"]
    }


@router.get("/analytics/reports/{report_type}")
async def get_analytics_report(
    report_type: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate advanced analytics reports (Professional only).

    Report types: monthly, quarterly, annual, custom

    Raises:
        HTTPException 403: If user doesn't have Professional plan
    """
    enforce_analytics_access(db, current_user)

    return {
        "report_type": report_type,
        "period": "2026-01",
        "data": {}  # Report data
    }


# ============================================================================
# Custom Segments Endpoint (Feature-Restricted)
# ============================================================================


@router.post("/segments/create")
async def create_custom_segment(
    segment_data: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create custom lead segments (Professional only).

    ❌ Blocked for: Free, Starter plans
    ✅ Available for: Professional

    Custom segments allow:
    - Complex filtering rules
    - Saved segment templates
    - Bulk operations on segments

    Raises:
        HTTPException 403: If user doesn't have Professional plan

    Example:
        POST /api/v1/bizlead/segments/create
        {
            "name": "High-Value Tech",
            "rules": [
                {"field": "industry", "operator": "equals", "value": "Technology"},
                {"field": "revenue", "operator": "gt", "value": 1000000}
            ]
        }
    """
    # Enforce feature access
    enforce_custom_segments_access(db, current_user)

    # Create segment logic here
    return {
        "segment_id": "seg-123456",
        "name": "High-Value Tech",
        "lead_count": 567
    }


@router.get("/segments")
async def list_custom_segments(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all custom segments (Professional only).

    Raises:
        HTTPException 403: If user doesn't have Professional plan
    """
    enforce_custom_segments_access(db, current_user)

    return {
        "segments": []  # List of segments
    }


# ============================================================================
# API Access Endpoints (Feature-Restricted)
# ============================================================================


@router.post("/api-key/generate")
async def generate_api_key(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate API key for programmatic access (Professional only).

    ❌ Blocked for: Free, Starter plans
    ✅ Available for: Professional

    API access allows:
    - Programmatic lead creation/retrieval
    - Webhook integrations
    - Third-party tool integrations

    Raises:
        HTTPException 403: If user doesn't have Professional plan

    Example:
        POST /api/v1/bizlead/api-key/generate
        Response:
        {
            "api_key": "bz_live_sk_3a42b58e4c8d9f...",
            "created_at": "2026-01-24T10:30:00"
        }
    """
    # Enforce feature access
    enforce_api_access(db, current_user)

    # Generate API key logic here
    return {
        "api_key": "bz_live_sk_3a42b58e4c8d9f1234567890abcdef",
        "created_at": "2026-01-24T10:30:00",
        "status": "active"
    }


@router.get("/api-keys")
async def list_api_keys(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all API keys for the user (Professional only).

    Raises:
        HTTPException 403: If user doesn't have Professional plan
    """
    enforce_api_access(db, current_user)

    return {
        "api_keys": []  # List of API keys
    }


# ============================================================================
# Basic Lead Information (Available to All Plans)
# ============================================================================


@router.get("/leads/{lead_id}")
async def get_lead(
    lead_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get basic lead information (Available to all plans).

    ✅ Available for: Free, Starter, Professional

    Returns basic lead information:
    - Company name
    - Contact email
    - Phone
    - Basic metadata

    Example:
        GET /api/v1/bizlead/leads/550e8400-e29b-41d4-a716-446655440000
        Response:
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "company_name": "Acme Corp",
            "contact_email": "john@acme.com",
            "phone": "+1-555-0123"
        }
    """
    # No feature check needed - available to all
    return {
        "id": lead_id,
        "company_name": "Acme Corp",
        "contact_email": "john@acme.com",
        "phone": "+1-555-0123"
    }


@router.get("/leads")
async def list_leads(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all leads with basic information (Available to all plans).

    ✅ Available for: Free, Starter, Professional

    Returns paginated list of basic lead information.

    Example:
        GET /api/v1/bizlead/leads?page=1&limit=20
        Response:
        {
            "leads": [...],
            "total": 245,
            "page": 1,
            "limit": 20
        }
    """
    # No feature check needed - available to all
    return {
        "leads": [],
        "total": 245,
        "page": 1
    }


# ============================================================================
# Dashboard Endpoints
# ============================================================================

class DashboardResponse(BaseModel):
    """Response model for dashboard data."""
    plan_id: str
    plan_name: str
    max_leads: int
    leads_used: int
    status: str
    created_at: str
    features: dict = {}


@router.get("/dashboard")
async def get_dashboard_data(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's dashboard data including subscription and usage.
    
    Returns:
        DashboardResponse: User's subscription and usage information
        
    Note: Returns fallback data if user lookup fails, rather than 401 error
    """
    from app.config.mongodb import get_subscriptions_collection
    from bson import ObjectId
    
    try:
        if not current_user or not current_user.id:
            # No fallback to free plan - require authentication
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication required"
            )
        
        # Get user's subscription from MongoDB
        subscriptions_collection = await get_subscriptions_collection()
        
        # Query for the user's subscription
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        subscription = await subscriptions_collection.find_one({"user_id": user_id_str})
        
        # Count leads from CRM, search results, and database leads
        try:
            from app.config.mongodb import get_crm_leads_collection, get_search_results_collection, get_database_leads_collection
            from datetime import datetime
            
            crm_leads_collection = await get_crm_leads_collection()
            search_results_collection = await get_search_results_collection()
            database_leads_collection = await get_database_leads_collection()
            
            crm_count = await crm_leads_collection.count_documents({"user_id": user_id_str})
            
            # Count active (non-expired) leads from database_leads collection
            database_count = await database_leads_collection.count_documents({
                "user_id": user_id_str,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            
            # Count total unique leads from search results
            search_results = await search_results_collection.find({"user_id": user_id_str}).to_list(None)
            search_lead_count = 0
            seen_emails = set()
            for result in search_results:
                for lead in result.get("leads", []):
                    email = lead.get("email", "").lower()
                    if email and email not in seen_emails:
                        seen_emails.add(email)
                        search_lead_count += 1
            
            # Total leads used = CRM + Database + Search (avoiding double counting)
            leads_used = crm_count + database_count + search_lead_count
        except Exception as e:
            print(f"Error counting leads: {str(e)}")
            leads_used = 0
        
        # Get plan info from subscription (required - no free plan fallback)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="No active subscription found. Please complete your subscription payment."
            )
        
        plan = (subscription.get("plan") or subscription.get("plan_id") or subscription.get("plan_name") or "").lower()
        plan_name = (subscription.get("plan_name") or subscription.get("plan") or "").title()
        status_val = subscription.get("status", "inactive")
        
        # Ensure only paid plans (no free)
        if plan == "free":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Free plan is no longer available. Please upgrade to a paid plan."
            )
        
        created_at = subscription.get("created_at", subscription.get("start_date", datetime.utcnow())).isoformat() if hasattr(subscription.get("created_at", subscription.get("start_date", "")), "isoformat") else str(subscription.get("created_at", subscription.get("start_date", "")))
        
        # Set max leads based on plan (no free plan)
        if plan == "professional":
            max_leads = 2000   # Professional plan: 2,000 leads
        elif plan == "starter":
            max_leads = 500    # Starter plan: 500 leads
        elif plan == "enterprise":
            max_leads = 50000  # Enterprise plan: unlimited
        else:
            max_leads = 0      # No default free plan
        
        return {
            "plan_id": plan,
            "plan_name": plan_name,
            "max_leads": max_leads,
            "leads_used": leads_used,
            "status": status_val,
            "created_at": created_at,
            "features": {
                "basic_info": True,
                "advanced_filters": plan in ["starter", "professional", "enterprise"],
                "csv_export": plan in ["starter", "professional", "enterprise"],
                "analytics": plan in ["professional", "enterprise"],
                "api_access": plan in ["professional", "enterprise"],
                "custom_segments": plan in ["professional", "enterprise"]
            }
        }
    except Exception as e:
        print(f"Error fetching dashboard data: {str(e)}")
        # No free plan fallback - raise error instead
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Unable to retrieve subscription information. Please verify your payment status."
        )


@router.get("/plans")
async def get_subscription_plans():
    """
    Get all available subscription plans (paid plans only - no free tier).
    Prices in INR matching landing page pricing.
    
    Returns:
        dict: List of paid subscription plans with features and pricing
    """
    return {
        "status": "success",
        "plans": [
            {
                "id": "starter",
                "name": "Starter",
                "max_leads": 500,
                "price": 3000,  # ₹3,000/month
                "currency": "INR",
                "features": [
                    "500 leads/month",
                    "Advanced filters",
                    "CSV export",
                    "Priority support"
                ]
            },
            {
                "id": "professional",
                "name": "Professional",
                "max_leads": 2000,
                "price": 9500,  # ₹9,500/month
                "currency": "INR",
                "features": [
                    "2,000 leads/month",
                    "Advanced analytics",
                    "API access",
                    "Custom segments"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "max_leads": 50000,
                "price": 29999,  # Custom pricing
                "currency": "INR",
                "features": [
                    "Unlimited leads/month",
                    "Advanced analytics",
                    "Full API access",
                    "Custom integrations",
                    "Dedicated support team",
                    "Custom workflows"
                ]
            }
        ]
    }


@router.get("/subscriptions/current")
async def get_current_subscription(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription information (paid plans only).
    
    Returns:
        dict: Subscription details
        
    Raises:
        402: If no active subscription found
    """
    from app.config.mongodb import get_subscriptions_collection
    
    try:
        # Get user's subscription from MongoDB
        subscriptions_collection = await get_subscriptions_collection()
        
        # Query for the user's subscription
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        subscription = await subscriptions_collection.find_one({"user_id": user_id_str})
        
        # No free plan - require active subscription
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="No active subscription found. Please complete your subscription payment."
            )
        
        plan = subscription.get("plan", "").lower()
        status_val = subscription.get("status", "inactive")
        
        # Reject free tier
        if plan == "free":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Free plan is no longer available. Please upgrade to a paid plan."
            )
        
        # Ensure subscription is active
        if status_val != "active":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Your subscription is not active. Please renew your subscription."
            )
        
        created_at = subscription.get("created_at", subscription.get("start_date", "")).isoformat() if hasattr(subscription.get("created_at", subscription.get("start_date", "")), "isoformat") else str(subscription.get("created_at", subscription.get("start_date", "")))
        
        return {
            "plan_id": plan,
            "plan_name": plan.title(),
            "leads_used": subscription.get("leads_used", 0),
            "leads_limit": subscription.get("leads_limit", 0),
            "status": status_val,
            "created_at": created_at,
            "renewal_date": subscription.get("renewal_date", "").isoformat() if hasattr(subscription.get("renewal_date", ""), "isoformat") else str(subscription.get("renewal_date", "")),
            "is_active": status_val == "active"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Unable to retrieve subscription information. Please verify your payment status."
        )


# ============================================================================
# Lead Scraper Endpoints
# ============================================================================

@router.post("/scraper/search")
async def scraper_search(
    request: ScraperSearchRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for leads using Google Places API with smart deduplication.
    
    Returns NEW leads not already saved in user's database (bizlead_database_leads).
    Filters out leads that user has already saved to keep database clean.
    
    Parameters:
    - query: Search query (e.g., "restaurants in New York")
    - max_results: Maximum number of results (default 10, max 100)
    
    Returns:
    - List of NEW leads with name, address, phone, website, email
    - new_leads_count: Number of new leads (not in user's database)
    - duplicate_count: Number of leads filtered out (already in user's database)
    """
    try:
        # Query validation is handled by Pydantic model, no need to repeat
        max_results = min(request.max_results, 100)  # Cap at 100
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Check if API key is configured
        if not settings.GOOGLE_PLACES_API_KEY or settings.GOOGLE_PLACES_API_KEY == "your-api-key-here":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Search service is not configured. Please configure Google Places API key."
            )
        
        # ============================================================================
        # Smart Pagination with Incremental Deduplication
        # ============================================================================
        # Fetch database leads FIRST, then check each page incrementally
        # Stop when we have enough NEW leads (not duplicates)
        
        from app.config.mongodb import get_database_leads_collection
        from datetime import datetime
        
        # Helper function to generate consistent unique identifier for a lead
        def get_lead_identifier(lead: dict) -> str:
            """Generate a unique identifier for a lead using email, phone, or name+location combo."""
            email = lead.get("email", "").strip().lower() if lead.get("email") else ""
            phone = lead.get("phone", "").strip() if lead.get("phone") else ""
            name = lead.get("name", "").strip().lower() if lead.get("name") else ""
            address = lead.get("address", "").strip().lower() if lead.get("address") else ""
            
            # Primary: Use email if available and valid
            if email and email != "n/a":
                return f"email:{email}"
            
            # Secondary: Use phone if available and valid
            if phone and phone != "N/A" and phone != "n/a":
                return f"phone:{phone}"
            
            # Tertiary: Use name + address combo to avoid false matches across regions
            if name and address:
                return f"location:{name}|{address}"
            
            # Fallback: name only as last resort
            if name:
                return f"name:{name}"
            
            return None
        
        try:
            database_leads_collection = await get_database_leads_collection()
            
            # Get ALL active leads from user's database BEFORE pagination
            active_leads = await database_leads_collection.find({
                "user_id": user_id_str,
                "expires_at": {"$gt": datetime.utcnow()}
            }).to_list(None)
            
            # Build set of lead identifiers already in user's database
            database_identifiers = set()
            for lead in active_leads:
                identifier = get_lead_identifier(lead)
                if identifier:
                    database_identifiers.add(identifier)
            
            print(f"[DB] User has {len(active_leads)} active leads in database")
            print(f"[DB] Database identifiers: {len(database_identifiers)} unique IDs")
            
        except Exception as e:
            print(f"[DB ERROR] Could not load database leads: {str(e)}")
            database_identifiers = set()
        
        # Now fetch pages incrementally and filter as we go
        filtered_leads = []  # NEW leads not in database
        all_fetched_places = []  # All fetched from API (for tracking)
        duplicate_count = 0
        pages_fetched = 0
        page_token = None
        max_pagination_pages = 10  # Fetch up to 10 pages (200 results) to find NEW leads
        
        print(f"[SEARCH] Starting search for query: '{request.query}' with max_results={max_results}")
        print(f"[SEARCH] Will keep fetching pages until we have {max_results} NEW leads")
        
        while pages_fetched < max_pagination_pages and len(filtered_leads) < max_results:
            print(f"[SEARCH Page {pages_fetched + 1}] Current: {len(filtered_leads)} new leads, {duplicate_count} duplicates")
            
            # Fetch from Google Places API with pagination token
            api_response = search_places(
                settings.GOOGLE_PLACES_API_KEY, 
                request.query, 
                20,  # Always fetch 20 per page
                page_token=page_token
            )
            
            places = api_response.get("places", [])
            next_page_token = api_response.get("nextPageToken")
            
            print(f"[SEARCH Page {pages_fetched + 1}] Got {len(places)} results from Google Places API")
            
            if not places:
                if pages_fetched == 0:
                    # No results at all on first search
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"No leads found for query: {request.query}"
                    )
                else:
                    # No more results available from API
                    print(f"[SEARCH] No more results from API after {pages_fetched} pages")
                    break
            
            # Remove duplicates from already fetched API results
            fetched_ids = {p.get("id") for p in all_fetched_places}
            new_places = [p for p in places if p.get("id") not in fetched_ids]
            all_fetched_places.extend(new_places)
            
            # Transform this page to leads and check against database
            for place in new_places:
                name = place.get("displayName", {}).get("text", "Unknown") if isinstance(place.get("displayName"), dict) else place.get("displayName", "Unknown")
                website = place.get("websiteUri", "N/A")
                phone = place.get("nationalPhoneNumber", "N/A")
                email = find_email_for_lead(name, website, phone)  # Email scraping enabled
                
                lead = {
                    "id": place.get("id", f"lead_{len(all_fetched_places)}"),
                    "name": name,
                    "address": place.get("formattedAddress", "N/A"),
                    "phone": phone,
                    "website": website,
                    "email": email
                }
                
                # Check if this lead is already in user's database
                identifier = get_lead_identifier(lead)
                
                if identifier and identifier in database_identifiers:
                    duplicate_count += 1
                    print(f"[FILTER] DUPLICATE: {lead.get('name')} ({identifier})")
                else:
                    filtered_leads.append(lead)
                    print(f"[FILTER] NEW: {lead.get('name')} ({identifier})")
                    
                    # Stop if we have enough NEW leads
                    if len(filtered_leads) >= max_results:
                        print(f"[SEARCH] Found {max_results} NEW leads, stopping pagination")
                        break
            
            pages_fetched += 1
            
            # Stop pagination if no more pages available
            if not next_page_token:
                print(f"[SEARCH] No more pages available after {pages_fetched} pages")
                break
            
            page_token = next_page_token
        
        # Final summary
        print(f"[FINAL] Fetched {pages_fetched} pages, found {len(filtered_leads)} NEW leads, filtered {duplicate_count} duplicates")
        
        # Leads already filtered and transformed during incremental pagination
        checked_leads_count = len(all_fetched_places)
        pagination_pages_fetched = pages_fetched
        
        # ============================================================================
        # Build Response
        # ============================================================================
        response_data = {
            "status": "success",
            "query": request.query,
            "results_count": len(filtered_leads),
            "new_leads_count": len(filtered_leads),
            "duplicate_count": duplicate_count,
            "total_api_results": checked_leads_count,
            "leads": filtered_leads,
            "expansion_rounds": pagination_pages_fetched,  # Now represents pages fetched via pagination
        }
        
        # Build informative message
        if len(filtered_leads) > 0:
            message = f"Found {len(filtered_leads)} new lead{'s' if len(filtered_leads) != 1 else ''}"
            if duplicate_count > 0:
                message += f" ({duplicate_count} duplicate{'s' if duplicate_count != 1 else ''} filtered)"
        elif duplicate_count > 0:
            message = f"All {duplicate_count} result{'s' if duplicate_count != 1 else ''} from this search are already in your database"
            if pagination_pages_fetched > 0:
                message += f" (searched {pagination_pages_fetched} page{'s' if pagination_pages_fetched != 1 else ''} with no new results)"
        else:
            message = f"No leads found for query: {request.query}"
        
        response_data["message"] = message
        
        return response_data
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        import traceback
        print(f"Scraper error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.post("/scraper/save-results", tags=["scraper"])
async def save_search_results(
    request: SaveSearchResultsRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Save search results to user's database for 30 days.
    
    Each lead is saved with metadata for automatic cleanup after 30 days.
    
    Parameters:
    - query: The search query
    - leads: List of leads found in the search
    
    Returns:
    - Success message with count of leads saved
    """
    from app.config.mongodb import get_database_leads_collection
    from datetime import datetime, timedelta
    
    try:
        database_leads_collection = await get_database_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Save each lead to database with 30-day expiration
        leads_saved = 0
        for lead in request.leads:
            lead_doc = {
                "user_id": user_id_str,
                "query": request.query,  # Track which search this came from
                "name": lead.get("name"),
                "email": lead.get("email", "").lower() if lead.get("email") else None,
                "phone": lead.get("phone"),
                "website": lead.get("website"),
                "address": lead.get("address"),
                "id": lead.get("id"),  # Original API ID
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(days=30),
                "status": "search_result"  # Mark as from search (vs user manually added)
            }
            
            # Insert the lead
            await database_leads_collection.insert_one(lead_doc)
            leads_saved += 1
        
        return {
            "status": "success",
            "message": f"Search results saved successfully",
            "leads_saved": leads_saved
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(f"Error saving search results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save search results: {str(e)}"
        )


@router.get("/scraper/my-search-results", tags=["scraper"])
async def get_user_search_results(
    skip: int = 0,
    limit: int = 100,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get user's search results from the last 30 days.
    
    Parameters:
        skip: Number of results to skip
        limit: Number of results to return
    
    Returns:
        dict: List of search results with leads
    """
    from app.config.mongodb import get_search_results_collection
    
    try:
        search_results_collection = await get_search_results_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Get search results, sorted by most recent first
        results_cursor = search_results_collection.find(
            {"user_id": user_id_str}
        ).sort("searched_at", -1).skip(skip).limit(limit)
        
        results = []
        async for result in results_cursor:
            results.append({
                "id": str(result["_id"]),
                "query": result.get("query"),
                "leads": result.get("leads", []),
                "searched_at": result.get("searched_at").isoformat() if result.get("searched_at") else None,
                "expires_at": result.get("expires_at").isoformat() if result.get("expires_at") else None
            })
        
        # Flatten all leads from all searches into one list with consistent deduplication
        all_leads = []
        seen_identifiers = set()
        
        # Helper function (same as in scraper_search)
        def get_lead_identifier(lead: dict) -> str:
            """Generate a unique identifier for a lead using email or name-phone combo."""
            email = lead.get("email", "").strip().lower() if lead.get("email") else ""
            phone = lead.get("phone", "").strip() if lead.get("phone") else ""
            name = lead.get("name", "").strip().lower() if lead.get("name") else ""
            
            if email and email != "n/a":
                return f"email:{email}"
            if name and phone and phone != "N/A":
                return f"phone:{name}-{phone}"
            address = lead.get("address", "").strip().lower() if lead.get("address") else ""
            if name and address:
                return f"address:{name}-{address}"
            if name:
                return f"name:{name}"
            return None
        
        for search_result in results:
            for lead in search_result.get("leads", []):
                identifier = get_lead_identifier(lead)
                if identifier and identifier not in seen_identifiers:
                    seen_identifiers.add(identifier)
                    all_leads.append(lead)
        
        return {
            "status": "success",
            "total_searches": len(results),
            "total_unique_leads": len(all_leads),
            "leads": all_leads,
            "searches": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching search results: {str(e)}"
        )


@router.post("/database/save-search-lead", tags=["database"])
async def save_search_lead_to_database(
    lead_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Save a lead from search results to user's temporary database (30-day storage).
    
    Parameters:
        lead_data: dict with keys:
            - name: str (required)
            - email: str (optional)
            - phone: str (optional)
            - website: str (optional)
            - address: str (optional)
            - expires_at: str (ISO datetime, optional) - auto-set to 30 days from now
    
    Returns:
        dict: Success message with lead ID
    """
    from app.config.mongodb import get_database_leads_collection
    
    try:
        database_leads_collection = await get_database_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Parse expires_at if provided, otherwise set to 30 days from now
        from datetime import datetime, timedelta
        
        if lead_data.get("expires_at"):
            try:
                expires_at = datetime.fromisoformat(lead_data["expires_at"].replace('Z', '+00:00'))
            except:
                expires_at = datetime.utcnow() + timedelta(days=30)
        else:
            expires_at = datetime.utcnow() + timedelta(days=30)
        
        # Create database lead document
        lead_doc = {
            "user_id": user_id_str,
            "name": lead_data.get("name"),
            "email": lead_data.get("email", "").lower() if lead_data.get("email") else None,
            "phone": lead_data.get("phone"),
            "website": lead_data.get("website"),
            "address": lead_data.get("address"),
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "status": "temporary"  # Mark as temporary database lead
        }
        
        # Insert into database
        result = await database_leads_collection.insert_one(lead_doc)
        
        return {
            "status": "success",
            "message": f"Lead moved to database for 30 days",
            "lead_id": str(result.inserted_id),
            "expires_at": expires_at.isoformat()
        }
    except Exception as e:
        print(f"Error saving lead to database: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to move lead to database: {str(e)}"
        )


@router.get("/database/my-leads", tags=["database"])
async def get_user_database_leads(
    skip: int = 0,
    limit: int = 100,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get user's leads from temporary database (30-day storage).
    
    Parameters:
        skip: Number of results to skip
        limit: Number of results to return
    
    Returns:
        dict: List of database leads
    """
    from app.config.mongodb import get_database_leads_collection
    
    try:
        database_leads_collection = await get_database_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Get active leads (not expired)
        from datetime import datetime
        
        filter_query = {
            "user_id": user_id_str,
            "expires_at": {"$gt": datetime.utcnow()}
        }
        
        total = await database_leads_collection.count_documents(filter_query)
        
        leads_cursor = database_leads_collection.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        
        leads = []
        async for lead in leads_cursor:
            leads.append({
                "id": str(lead["_id"]),
                "name": lead.get("name"),
                "email": lead.get("email"),
                "phone": lead.get("phone"),
                "website": lead.get("website"),
                "address": lead.get("address"),
                "created_at": lead.get("created_at").isoformat() if lead.get("created_at") else None,
                "expires_at": lead.get("expires_at").isoformat() if lead.get("expires_at") else None,
                "status": lead.get("status")
            })
        
        return {
            "status": "success",
            "total": total,
            "leads": leads
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching database leads: {str(e)}"
        )


# ============================================================================
# Notification Endpoints
# ============================================================================

@router.get("/notifications", tags=["notifications"])
async def get_notifications(
    skip: int = 0,
    limit: int = 20,
    is_read: Optional[bool] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get notifications for the current user.
    
    Parameters:
        skip: Number of notifications to skip
        limit: Maximum number of notifications to return
        is_read: Filter by read status (True, False, or None for all)
    
    Returns:
        NotificationListResponse: List of notifications with total and unread count
    """
    from app.config.mongodb import get_notifications_collection
    
    try:
        notifications_collection = await get_notifications_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Build filter query
        filter_query = {"user_id": user_id_str}
        if is_read is not None:
            filter_query["is_read"] = is_read
        
        # Get total count
        total_count = await notifications_collection.count_documents(filter_query)
        
        # Get unread count
        unread_count = await notifications_collection.count_documents({
            "user_id": user_id_str,
            "is_read": False
        })
        
        # Get notifications with pagination
        notifications = []
        async for notif in notifications_collection.find(filter_query).sort("created_at", -1).skip(skip).limit(limit):
            notif["id"] = str(notif.get("_id", ""))
            notifications.append(notif)
        
        return {
            "total": total_count,
            "unread_count": unread_count,
            "notifications": notifications
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching notifications: {str(e)}"
        )


@router.get("/notifications/unread-count", tags=["notifications"])
async def get_unread_notifications_count(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get count of unread notifications for the current user.
    
    Returns:
        dict: Unread notification count
    """
    from app.config.mongodb import get_notifications_collection
    
    try:
        notifications_collection = await get_notifications_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        unread_count = await notifications_collection.count_documents({
            "user_id": user_id_str,
            "is_read": False
        })
        
        return {"unread_count": unread_count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching unread count: {str(e)}"
        )


@router.post("/notifications/{notification_id}/mark-as-read", tags=["notifications"])
async def mark_notification_as_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Mark a notification as read.
    
    Parameters:
        notification_id: The ID of the notification to mark as read
    
    Returns:
        dict: Success message
    """
    from app.config.mongodb import get_notifications_collection
    from bson import ObjectId
    from datetime import datetime
    
    try:
        notifications_collection = await get_notifications_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Update notification
        result = await notifications_collection.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": user_id_str
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking notification as read: {str(e)}"
        )


@router.post("/notifications/mark-all-as-read", tags=["notifications"])
async def mark_all_notifications_as_read(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Mark all notifications as read for the current user.
    
    Returns:
        dict: Count of updated notifications
    """
    from app.config.mongodb import get_notifications_collection
    from datetime import datetime
    
    try:
        notifications_collection = await get_notifications_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Update all unread notifications
        result = await notifications_collection.update_many(
            {
                "user_id": user_id_str,
                "is_read": False
            },
            {
                "$set": {
                    "is_read": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "message": "All notifications marked as read",
            "updated_count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking notifications as read: {str(e)}"
        )


@router.delete("/notifications/{notification_id}", tags=["notifications"])
async def delete_notification(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a notification.
    
    Parameters:
        notification_id: The ID of the notification to delete
    
    Returns:
        dict: Success message
    """
    from app.config.mongodb import get_notifications_collection
    from bson import ObjectId
    
    try:
        notifications_collection = await get_notifications_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Delete notification
        result = await notifications_collection.delete_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": user_id_str
            }
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return {"message": "Notification deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting notification: {str(e)}"
        )


# ============================================================================
# CRM Leads Endpoints
# ============================================================================

from datetime import datetime
from bson import ObjectId


@router.post("/crm/save-lead", tags=["crm"])
async def save_lead_to_crm(
    lead_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Save a lead from search results to user's CRM.
    
    Parameters:
        lead_data: dict with keys:
            - name: str (required)
            - email: str (optional)
            - phone: str (optional)
            - website: str (optional)
            - address: str (optional)
            - source_query: str (optional) - the search query that found this lead
            - tags: list[str] (optional)
    
    Returns:
        dict: Created lead with ID
    """
    from app.config.mongodb import get_crm_leads_collection
    from app.models.subscription import Subscription
    from app.config.mongodb import get_subscriptions_collection
    
    try:
        crm_leads_collection = await get_crm_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Check free tier limit (5 leads max)
        subscriptions_collection = await get_subscriptions_collection()
        sub = await subscriptions_collection.find_one({"user_id": user_id_str})
        
        if sub and sub.get("plan") == "free":
            # Count existing leads
            count = await crm_leads_collection.count_documents({"user_id": user_id_str})
            if count >= 5:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Free tier limited to 5 saved leads. Upgrade to Premium for unlimited."
                )
        
        # Create lead document
        lead_doc = {
            "user_id": user_id_str,
            "name": lead_data.get("name"),
            "email": lead_data.get("email"),
            "phone": lead_data.get("phone"),
            "website": lead_data.get("website"),
            "address": lead_data.get("address"),
            "source_query": lead_data.get("source_query"),
            "status": "new",  # Default status
            "tags": lead_data.get("tags", []),
            "notes": None,
            "saved_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert and return
        result = await crm_leads_collection.insert_one(lead_doc)
        lead_doc["_id"] = str(result.inserted_id)
        
        return {
            "status": "success",
            "message": "Lead saved to CRM",
            "lead": {
                "id": str(result.inserted_id),
                "name": lead_doc["name"],
                "email": lead_doc["email"],
                "saved_at": lead_doc["saved_at"].isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving lead: {str(e)}"
        )


@router.get("/crm/my-leads", tags=["crm"])
async def get_user_crm_leads(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get user's saved CRM leads.
    
    Parameters:
        skip: Number of leads to skip (for pagination)
        limit: Number of leads to return (default 20)
        status: Filter by status (new/contacted/converted/qualified/rejected)
        tag: Filter by tag
    
    Returns:
        dict: List of leads with pagination info
    """
    from app.config.mongodb import get_crm_leads_collection
    
    try:
        crm_leads_collection = await get_crm_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Build filter
        filter_query = {"user_id": user_id_str}
        if status:
            filter_query["status"] = status
        if tag:
            filter_query["tags"] = tag
        
        # Get total count
        total = await crm_leads_collection.count_documents(filter_query)
        
        # Get leads with pagination, sorted by most recent first
        leads_cursor = crm_leads_collection.find(filter_query).sort("saved_at", -1).skip(skip).limit(limit)
        leads = []
        
        async for lead in leads_cursor:
            leads.append({
                "id": str(lead["_id"]),
                "name": lead.get("name"),
                "email": lead.get("email"),
                "phone": lead.get("phone"),
                "website": lead.get("website"),
                "address": lead.get("address"),
                "source_query": lead.get("source_query"),
                "status": lead.get("status", "new"),
                "tags": lead.get("tags", []),
                "notes": lead.get("notes"),
                "saved_at": lead.get("saved_at").isoformat() if lead.get("saved_at") else None
            })
        
        return {
            "status": "success",
            "total": total,
            "skip": skip,
            "limit": limit,
            "leads": leads
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching leads: {str(e)}"
        )


@router.put("/crm/leads/{lead_id}", tags=["crm"])
async def update_crm_lead(
    lead_id: str,
    update_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update a CRM lead's status, notes, or tags.
    
    Parameters:
        lead_id: The ID of the lead to update
        update_data: dict with optional keys:
            - status: str (new/contacted/converted/qualified/rejected)
            - notes: str
            - tags: list[str]
    
    Returns:
        dict: Updated lead
    """
    from app.config.mongodb import get_crm_leads_collection
    
    try:
        crm_leads_collection = await get_crm_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Build update
        update_doc = {"updated_at": datetime.utcnow()}
        if "status" in update_data:
            update_doc["status"] = update_data["status"]
        if "notes" in update_data:
            update_doc["notes"] = update_data["notes"]
        if "tags" in update_data:
            update_doc["tags"] = update_data["tags"]
        
        # Update
        result = await crm_leads_collection.find_one_and_update(
            {
                "_id": ObjectId(lead_id),
                "user_id": user_id_str
            },
            {"$set": update_doc},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return {
            "status": "success",
            "message": "Lead updated",
            "lead": {
                "id": str(result["_id"]),
                "name": result.get("name"),
                "status": result.get("status", "new"),
                "notes": result.get("notes"),
                "tags": result.get("tags", []),
                "updated_at": result.get("updated_at").isoformat() if result.get("updated_at") else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lead: {str(e)}"
        )


@router.delete("/crm/leads/{lead_id}", tags=["crm"])
async def delete_crm_lead(
    lead_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a CRM lead.
    
    Parameters:
        lead_id: The ID of the lead to delete
    
    Returns:
        dict: Success message
    """
    from app.config.mongodb import get_crm_leads_collection
    
    try:
        crm_leads_collection = await get_crm_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Delete
        result = await crm_leads_collection.delete_one(
            {
                "_id": ObjectId(lead_id),
                "user_id": user_id_str
            }
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return {"status": "success", "message": "Lead deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting lead: {str(e)}"
        )


@router.post("/crm/add-tag", tags=["crm"])
async def add_tag_to_lead(
    lead_id: str,
    tag: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Add a tag to a CRM lead.
    
    Parameters:
        lead_id: The ID of the lead
        tag: The tag to add
    
    Returns:
        dict: Updated lead
    """
    from app.config.mongodb import get_crm_leads_collection
    
    try:
        crm_leads_collection = await get_crm_leads_collection()
        user_id_str = str(current_user.id) if hasattr(current_user, 'id') else current_user.id
        
        # Add tag if not exists
        result = await crm_leads_collection.find_one_and_update(
            {
                "_id": ObjectId(lead_id),
                "user_id": user_id_str,
                "tags": {"$ne": tag}  # Only add if tag doesn't exist
            },
            {"$push": {"tags": tag}, "$set": {"updated_at": datetime.utcnow()}},
            return_document=True
        )
        
        if not result:
            # Check if lead exists
            existing = await crm_leads_collection.find_one(
                {"_id": ObjectId(lead_id), "user_id": user_id_str}
            )
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lead not found"
                )
            # Tag already exists
            result = existing
        
        return {
            "status": "success",
            "message": "Tag added to lead",
            "tags": result.get("tags", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding tag: {str(e)}"
        )


# Include this router in your main FastAPI app:
# from fastapi import FastAPI
# from app.routes import protected_endpoints
#
# app = FastAPI()
# app.include_router(protected_endpoints.router)
