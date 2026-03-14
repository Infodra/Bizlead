"""
Centralized settings management using Pydantic BaseSettings.

All configuration is loaded from environment variables.
Never store secrets in code - use .env file for local development.

Usage:
    from app.config.settings import settings
    
    # Access any setting
    db_url = settings.DATABASE_URL
    secret_key = settings.SECRET_KEY
    debug = settings.DEBUG
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings are validated and typed for safety.
    """

    # ========================================================================
    # DATABASE
    # ========================================================================
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection string",
        examples=["postgres://user:pass@localhost:5432/bizlead_db"]
    )

    MONGODB_URL: Optional[str] = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection URL for user and subscription data"
    )

    MONGODB_DB_NAME: str = Field(
        default="bizlead_db",
        description="MongoDB database name"
    )

    # ========================================================================
    # SECURITY & JWT
    # ========================================================================
    SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="Secret key for password hashing (min 32 chars)"
    )

    JWT_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT tokens (min 32 chars)"
    )

    ALGORITHM: str = Field(
        default="HS256",
        description="JWT algorithm"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        gt=0,
        description="JWT token expiry time in minutes"
    )

    # ========================================================================
    # EXTERNAL API KEYS
    # ========================================================================
    GOOGLE_PLACES_API_KEY: str = Field(
        ...,
        description="Google Places API key"
    )

    GOOGLE_MAPS_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Maps API key (optional)"
    )

    # ========================================================================
    # PAYMENT PROCESSING
    # ========================================================================
    STRIPE_API_KEY: Optional[str] = Field(
        default=None,
        description="Stripe API key (sk_test_... or sk_live_...)"
    )

    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(
        default=None,
        description="Stripe webhook signing secret"
    )

    RAZORPAY_KEY_ID: Optional[str] = Field(
        default=None,
        description="Razorpay Key ID"
    )

    RAZORPAY_KEY_SECRET: Optional[str] = Field(
        default=None,
        description="Razorpay Key Secret"
    )

    WEBHOOK_SECRET: Optional[str] = Field(
        default=None,
        description="Generic webhook secret for other services"
    )

    # ========================================================================
    # EMAIL CONFIGURATION (OPTIONAL)
    # ========================================================================
    SMTP_SERVER: str = Field(
        default="smtp.gmail.com",
        description="SMTP server address"
    )

    SMTP_PORT: int = Field(
        default=587,
        description="SMTP server port"
    )

    SMTP_USERNAME: Optional[str] = Field(
        default=None,
        description="SMTP username/email (optional - leave empty to disable email)"
    )

    SMTP_PASSWORD: Optional[str] = Field(
        default=None,
        description="SMTP password or app password (optional - leave empty to disable email)"
    )

    SMTP_FROM_EMAIL: str = Field(
        default="noreply@bizlead.com",
        description="From email address for sent emails"
    )

    # ========================================================================
    # APPLICATION METADATA
    # ========================================================================
    APP_NAME: str = Field(
        default="BizLead",
        description="Application name"
    )

    APP_VERSION: str = Field(
        default="1.0.0",
        description="Application version"
    )

    DEBUG: bool = Field(
        default=False,
        description="Debug mode (NEVER True in production)"
    )

    ENVIRONMENT: str = Field(
        default="production",
        description="Environment: development, staging, production"
    )

    # ========================================================================
    # REDIS
    # ========================================================================
    REDIS_URL: Optional[str] = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL"
    )

    # ========================================================================
    # CORS & SECURITY
    # ========================================================================
    ALLOWED_HOSTS: str = Field(
        default="localhost,127.0.0.1",
        description="Comma-separated list of allowed hosts"
    )

    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        description="Comma-separated list of allowed CORS origins"
    )

    # ========================================================================
    # LOGGING
    # ========================================================================
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL"
    )

    LOG_DIR: str = Field(
        default="logs",
        description="Directory for log files"
    )

    # ========================================================================
    # SUBSCRIPTION LIMITS
    # ========================================================================
    SUBSCRIPTION_DEFAULT_DURATION_DAYS: int = Field(
        default=30,
        gt=0,
        description="Default subscription duration in days"
    )

    FREE_PLAN_LEAD_LIMIT: int = Field(
        default=50,
        gt=0,
        description="Lead limit for free plan"
    )

    STARTER_PLAN_LEAD_LIMIT: int = Field(
        default=500,
        gt=0,
        description="Lead limit for starter plan"
    )

    PROFESSIONAL_PLAN_LEAD_LIMIT: int = Field(
        default=2000,
        gt=0,
        description="Lead limit for professional plan"
    )

    # ========================================================================
    # PYDANTIC CONFIG
    # ========================================================================
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars not in model

    # ========================================================================
    # COMPUTED PROPERTIES
    # ========================================================================

    @property
    def allowed_hosts_list(self) -> list[str]:
        """Parse ALLOWED_HOSTS into a list."""
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",")]

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def is_debug(self) -> bool:
        """Check if debug mode is enabled."""
        return self.DEBUG is True

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.ENVIRONMENT.lower() == "development"


# Global settings instance
# Usage: from app.config.settings import settings
try:
    settings = Settings()
except Exception as e:
    error_msg = str(e)
    
    # Provide helpful error message for missing required fields
    if "Field required" in error_msg:
        required_fields = []
        if "SECRET_KEY" in error_msg:
            required_fields.append("SECRET_KEY (generate: openssl rand -hex 32)")
        if "JWT_SECRET" in error_msg:
            required_fields.append("JWT_SECRET (generate: openssl rand -hex 32)")
        if "DATABASE_URL" in error_msg:
            required_fields.append("DATABASE_URL (PostgreSQL connection string)")
        if "GOOGLE_PLACES_API_KEY" in error_msg:
            required_fields.append("GOOGLE_PLACES_API_KEY (from Google Cloud)")
        
        raise RuntimeError(
            f"❌ Missing required environment variables:\n"
            f"  {chr(10).join('  • ' + f for f in required_fields)}\n\n"
            f"📖 For local development: Copy .env.example to .env and fill values\n"
            f"🚀 For Render deployment: Set variables in dashboard → Environment\n\n"
            f"Full error:\n{error_msg}"
        )
    else:
        raise RuntimeError(
            f"Failed to load settings from environment variables.\n"
            f"Error: {error_msg}\n"
            f"Make sure you have all required environment variables set."
        )


# ============================================================================
# SETTINGS VALIDATION
# ============================================================================


def validate_settings() -> dict:
    """
    Validate all critical settings are configured.
    
    Returns:
        dict: Validation results
    """
    validation_results = {
        "database_configured": bool(settings.DATABASE_URL),
        "security_configured": bool(settings.SECRET_KEY and settings.JWT_SECRET),
        "email_configured": bool(
            settings.SMTP_USERNAME and settings.SMTP_PASSWORD
        ),
        "payment_configured": bool(
            settings.STRIPE_API_KEY
            or (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
        ),
        "google_api_configured": bool(settings.GOOGLE_PLACES_API_KEY),
        "redis_configured": bool(settings.REDIS_URL),
    }

    validation_results["all_critical_configured"] = all(
        [
            validation_results["database_configured"],
            validation_results["security_configured"],
            validation_results["google_api_configured"],
        ]
    )

    return validation_results


# ============================================================================
# DEBUG UTILITIES
# ============================================================================


def print_settings_summary() -> str:
    """
    Print a summary of settings (safe - no secrets exposed).
    
    Returns:
        str: Settings summary
    """
    summary = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        SETTINGS SUMMARY                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

🏢 APPLICATION
  Name:                    {settings.APP_NAME}
  Version:                 {settings.APP_VERSION}
  Environment:             {settings.ENVIRONMENT}
  Debug:                   {settings.DEBUG}

🔐 SECURITY
  Algorithm:               {settings.ALGORITHM}
  Token Expiry (mins):     {settings.ACCESS_TOKEN_EXPIRE_MINUTES}
  Database:                Configured ✓
  JWT Secret:              Configured ✓

💾 DATABASE
  URL:                     {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'INVALID'}

📧 EMAIL
  Server:                  {settings.SMTP_SERVER}:{settings.SMTP_PORT}
  Username:                {settings.SMTP_USERNAME}
  From Email:              {settings.SMTP_FROM_EMAIL}

🔗 EXTERNAL APIs
  Google Places:           Configured ✓
  Google Maps:             {"Configured ✓" if settings.GOOGLE_MAPS_API_KEY else "Not configured"}

💳 PAYMENT
  Stripe:                  {"Configured ✓" if settings.STRIPE_API_KEY else "Not configured"}
  Razorpay:                {"Configured ✓" if settings.RAZORPAY_KEY_ID else "Not configured"}

📊 PLAN LIMITS
  Free Plan:               {settings.FREE_PLAN_LEAD_LIMIT} leads
  Starter Plan:            {settings.STARTER_PLAN_LEAD_LIMIT} leads
  Professional Plan:       {settings.PROFESSIONAL_PLAN_LEAD_LIMIT} leads

🎯 CORS & HOSTS
  Allowed Hosts:           {settings.allowed_hosts_list}
  CORS Origins:            {settings.cors_origins_list}

📝 LOGGING
  Level:                   {settings.LOG_LEVEL}
  Directory:               {settings.LOG_DIR}

"""
    return summary


# Print on module load if in debug mode
if os.getenv("PRINT_SETTINGS", "false").lower() == "true":
    print(print_settings_summary())
