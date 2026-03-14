"""
Example FastAPI application using centralized settings.

This demonstrates the recommended way to initialize your FastAPI app
with settings from environment variables.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.config.settings import settings, validate_settings, print_settings_summary


# ============================================================================
# Setup Logging
# ============================================================================

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ============================================================================
# Startup & Shutdown Events
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Runs startup code, then yields, then cleanup code on shutdown.
    """
    
    # ─── STARTUP ───
    logger.info("Starting BizLead application...")
    
    # Print settings summary on startup
    # print(print_settings_summary())  # Commented out to avoid Unicode encoding issues
    
    # Validate all settings are configured
    validation = validate_settings()
    logger.info(f"Settings validation: {validation}")
    
    if not validation["all_critical_configured"]:
        logger.warning("⚠️  Some critical settings are not configured!")
    
    # Initialize SQL tables (for payments, invoices, subscriptions)
    try:
        from app.database import init_db
        init_db()
        logger.info("✅ SQL tables initialized")
    except Exception as e:
        logger.warning(f"⚠️  SQL table init failed: {str(e)}")
    
    # Initialize MongoDB connection
    try:
        from app.config.mongodb import connect_to_mongodb, close_mongodb
        try:
            await connect_to_mongodb()
        except Exception as e:
            logger.warning(f"⚠️  MongoDB connection failed: {str(e)}. Some features will be unavailable.")
    except Exception as e:
        logger.warning(f"⚠️  MongoDB import/init failed: {str(e)}")
    
    logger.info("✅ Application started successfully")
    
    yield
    
    # ─── SHUTDOWN ───
    logger.info("Shutting down BizLead application...")
    
    # Close MongoDB connection
    try:
        from app.config.mongodb import close_mongodb
        await close_mongodb()
    except Exception as e:
        logger.warning(f"⚠️  Error closing MongoDB: {str(e)}")
    
    logger.info("✅ Application shutdown complete")


# ============================================================================
# Create FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="Lead automation and management SaaS platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,  # ⚠️ Should be False in production!
    lifespan=lifespan,
    # Use unpkg CDN instead of jsDelivr to avoid tracking prevention in Safari
    swagger_js_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
    swagger_css_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
    redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"
)


# ============================================================================
# Add Middleware
# ============================================================================


# CORS Middleware
cors_origins = settings.cors_origins_list
# In production, also allow the custom domain variants
if settings.is_production:
    extra = [
        "https://bizlead.infodra.ai",
        "https://www.bizlead.infodra.ai",
        "https://bizlead.vercel.app",
    ]
    cors_origins = list(set(cors_origins + extra))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Hosts Middleware (security)
# Only enable in production with properly configured ALLOWED_HOSTS
if settings.ALLOWED_HOSTS and settings.ALLOWED_HOSTS != "*":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"],  # Let the reverse proxy (Render) handle host validation
    )


# ============================================================================
# Health Check Endpoint
# ============================================================================


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for load balancers and monitoring.
    
    Returns basic system status without requiring authentication.
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION
    }


@app.get("/api/v1/health", tags=["System"])
async def api_health_check():
    """
    Health check endpoint for API monitoring.
    
    Includes more detailed status information.
    """
    import os
    from datetime import datetime
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "debug_mode": settings.DEBUG,
        "settings_validated": validate_settings()["all_critical_configured"],
        "log_level": settings.LOG_LEVEL,
    }
    
    return health_status


# ============================================================================
# Include Routers
# ============================================================================

# Authentication Router
from app.routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

# Subscription Management Router
from app.routes.subscriptions import router as subscriptions_router
app.include_router(subscriptions_router, prefix="/api/v1/bizlead", tags=["Subscriptions"])

# Payment Router
from app.routes.payments import router as payments_router
app.include_router(payments_router, tags=["Payments"])

# Protected Endpoints Router
from app.routes.protected_endpoints import router as protected_router
app.include_router(protected_router, prefix="/api/v1", tags=["Protected"])

# Contact Form Router
from app.routes.contact import router as contact_router
app.include_router(contact_router, prefix="/api/v1", tags=["Contact Form"])

# Admin Router
from app.routes.admin import router as admin_router
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])


# ============================================================================
# Root Endpoint
# ============================================================================


@app.get("/", tags=["System"])
async def root():
    """
    Root endpoint providing API information.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


# ============================================================================
# Error Handlers
# ============================================================================


@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions."""
    logger.error(f"Value Error: {str(exc)}")
    return {
        "detail": "Invalid request",
        "error": str(exc)
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected Error: {str(exc)}", exc_info=True)
    
    # In production, don't expose internal error details
    if settings.is_production:
        return {
            "detail": "Internal server error"
        }
    else:
        return {
            "detail": "Internal server error",
            "error": str(exc)
        }


# ============================================================================
# Example Usage in Endpoint
# ============================================================================


@app.get("/api/v1/config/plans", tags=["Configuration"])
async def get_plan_limits():
    """
    Example endpoint demonstrating settings usage.
    
    Returns current plan limits from settings.
    """
    return {
        "plans": {
            "starter": {
                "lead_limit": settings.STARTER_PLAN_LEAD_LIMIT,
            },
            "professional": {
                "lead_limit": settings.PROFESSIONAL_PLAN_LEAD_LIMIT,
            }
        }
    }


# ============================================================================
# For Development: Run with uvicorn
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )


"""
USAGE:

1. Development (with auto-reload):
   python -m uvicorn app.main:app --reload

2. Production:
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

3. With environment file:
   python -m uvicorn app.main:app

4. With custom environment:
   DATABASE_URL="..." SECRET_KEY="..." python -m uvicorn app.main:app
"""
