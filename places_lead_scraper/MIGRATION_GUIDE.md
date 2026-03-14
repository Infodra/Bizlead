"""
MIGRATION GUIDE: Moving from Hardcoded Config to Environment Variables

This guide shows you how to identify and migrate hardcoded configuration
from Python files to environment variables using the new settings system.
"""

# ============================================================================
# STEP 1: Setup Your .env File
# ============================================================================

"""
1. Copy the template:
   cp .env.example .env

2. Edit .env with your actual values:
   DATABASE_URL=postgres://user:password@localhost:5432/bizlead_db
   SECRET_KEY=your-secret-key-min-32-chars-very-important-!!!
   JWT_SECRET=another-secret-key-min-32-chars-!!!
   # ... fill in all other values

3. IMPORTANT: Add .env to .gitignore
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Add .env to gitignore"

4. Never commit .env file - it contains production secrets!
"""

# ============================================================================
# STEP 2: Identify Hardcoded Values in Your Code
# ============================================================================

"""
Search for these patterns in your Python files:

BEFORE (❌ WRONG):
────────────────────────
DATABASE_URL = "postgres://user:pass@host/db"
SECRET_KEY = "hardcoded-secret"
API_KEY = "sk_test_1234567890"
DEBUG = True
ALLOWED_HOSTS = ["localhost", "example.com"]


AFTER (✅ CORRECT):
────────────────────────
from app.config.settings import settings

db_url = settings.DATABASE_URL
secret = settings.SECRET_KEY
api_key = settings.STRIPE_API_KEY
debug = settings.DEBUG
allowed_hosts = settings.allowed_hosts_list
"""

# ============================================================================
# STEP 3: Migration Examples
# ============================================================================

# ─────────────────────────────────────────────────────────────────────────
# Example 1: Database Configuration
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
from sqlalchemy import create_engine

DATABASE_URL = "postgres://user:pass@localhost:5432/bizlead"
engine = create_engine(DATABASE_URL)

NEW (✅):
────────
from sqlalchemy import create_engine
from app.config.settings import settings

engine = create_engine(settings.DATABASE_URL)
"""

# ─────────────────────────────────────────────────────────────────────────
# Example 2: JWT Configuration
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
from jose import jwt

SECRET_KEY = "hardcoded-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_token(data):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

NEW (✅):
────────
from jose import jwt
from app.config.settings import settings

def create_token(data):
    return jwt.encode(
        data,
        settings.JWT_SECRET,
        algorithm=settings.ALGORITHM
    )
"""

# ─────────────────────────────────────────────────────────────────────────
# Example 3: API Keys
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
GOOGLE_API_KEY = "AIzaSyDxxxxxxxx"
STRIPE_API_KEY = "sk_test_xxxxx"

def search_places(query):
    # Use GOOGLE_API_KEY
    pass

NEW (✅):
────────
from app.config.settings import settings

def search_places(query):
    api_key = settings.GOOGLE_PLACES_API_KEY
    # Use api_key
    pass
"""

# ─────────────────────────────────────────────────────────────────────────
# Example 4: Feature Flags and Limits
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
FREE_PLAN_LEADS = 50
STARTER_PLAN_LEADS = 500
PROFESSIONAL_PLAN_LEADS = 2000
DEBUG_MODE = True

NEW (✅):
────────
from app.config.settings import settings

# In your code:
if plan == "free":
    limit = settings.FREE_PLAN_LEAD_LIMIT
elif plan == "starter":
    limit = settings.STARTER_PLAN_LEAD_LIMIT
elif plan == "professional":
    limit = settings.PROFESSIONAL_PLAN_LEAD_LIMIT

if settings.is_debug:
    # Debug mode logic
    pass
"""

# ─────────────────────────────────────────────────────────────────────────
# Example 5: Email Configuration
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "user@gmail.com"
SMTP_PASSWORD = "password123"

def send_email(to, subject, body):
    # Use SMTP_* values
    pass

NEW (✅):
────────
from app.config.settings import settings

def send_email(to, subject, body):
    smtp_config = {
        'host': settings.SMTP_SERVER,
        'port': settings.SMTP_PORT,
        'username': settings.SMTP_USERNAME,
        'password': settings.SMTP_PASSWORD,
        'from_email': settings.SMTP_FROM_EMAIL,
    }
    # Use smtp_config
    pass
"""

# ─────────────────────────────────────────────────────────────────────────
# Example 6: FastAPI Application Setup
# ─────────────────────────────────────────────────────────────────────────

"""
OLD (❌):
────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="BizLead",
    debug=True,
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEW (✅):
────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version=settings.APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

# ============================================================================
# STEP 4: Validation Checklist
# ============================================================================

"""
After migrating, verify:

☐ No hardcoded DATABASE_URL in code
☐ No hardcoded SECRET_KEY in code
☐ No hardcoded API keys in code
☐ No hardcoded passwords in code
☐ All .py files import from app.config.settings
☐ .env file is in .gitignore
☐ .env.example is committed (without secrets)
☐ settings.py has all required variables
☐ Settings validate on startup
☐ Application starts with `python -m uvicorn main:app`

Run validation:
    python -c "from app.config.settings import validate_settings; print(validate_settings())"
"""

# ============================================================================
# STEP 5: Production Deployment
# ============================================================================

"""
For production, set environment variables directly (NOT .env file):

Option 1: Command line
───────────────────────
export DATABASE_URL="postgres://prod-user:prod-pass@prod-host/bizlead"
export SECRET_KEY="prod-secret-key-very-long-random-string-!!!!"
python -m uvicorn main:app --host 0.0.0.0 --port 8000

Option 2: Docker
───────────────
FROM python:3.10
ENV DATABASE_URL="postgres://..."
ENV SECRET_KEY="..."
ENV ENVIRONMENT="production"
ENV DEBUG="False"
...

Option 3: Kubernetes
──────────────────
kind: Pod
metadata:
  name: bizlead
spec:
  containers:
  - name: bizlead
    image: bizlead:latest
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: bizlead-secrets
          key: database-url
    - name: SECRET_KEY
      valueFrom:
        secretKeyRef:
          name: bizlead-secrets
          key: secret-key
    ...

Option 4: AWS/Azure/GCP Secret Manager
──────────────────────────────────────
Use their native secret management systems
and inject at runtime.

⚠️  PRODUCTION SECURITY:
  - Never use .env in production
  - Use secret managers (AWS Secrets Manager, Azure KeyVault, etc.)
  - Rotate secrets regularly
  - Enable secret detection in CI/CD
  - Audit access to secrets
"""

# ============================================================================
# STEP 6: Local Development Setup
# ============================================================================

"""
New developer setup:

1. Clone repository
   git clone <repo>
   cd bizlead

2. Copy environment template
   cp .env.example .env

3. Ask team for .env values (or have documented process)
   OR generate test values for local development

4. Verify settings
   python -c "from app.config.settings import print_settings_summary; print(print_settings_summary())"

5. Run application
   python -m uvicorn app.main:app --reload

✓ No need to edit Python files for configuration
✓ Each developer can have their own .env
✓ Settings are validated at startup
✓ Type hints prevent config errors
"""

# ============================================================================
# STEP 7: Troubleshooting
# ============================================================================

"""
Error: "Failed to load settings from environment variables"
──────────────────────────────────────────────────────────
Solution:
  - Make sure .env file exists in root directory
  - Check .env has required variables (DATABASE_URL, SECRET_KEY, JWT_SECRET)
  - Verify env var syntax is correct (no quotes needed)
  - Check file permissions

Error: "SECRET_KEY validation error: ensure this value has at least 32 characters"
────────────────────────────────────────────────────────────────────────────
Solution:
  - SECRET_KEY must be at least 32 characters
  - Use: python -c "import secrets; print(secrets.token_urlsafe(32))"
  - Copy output to .env

Error: "database URL could not be interpreted by SQLAlchemy"
───────────────────────────────────────────────────────────
Solution:
  - Check DATABASE_URL format: postgres://user:pass@host:port/dbname
  - Test connection: psql $DATABASE_URL
  - Verify host, port, database name, credentials

Environment variables not being picked up
──────────────────────────────────────────
Solution:
  - Reload IDE/terminal (sometimes env changes don't auto-reload)
  - Use: python -c "import os; print(os.getenv('DATABASE_URL'))"
  - Check .env file encoding (should be UTF-8)
"""

# ============================================================================
# REFERENCE: All Available Settings
# ============================================================================

"""
DATABASE_URL                           → PostgreSQL connection string
SECRET_KEY                             → Password hashing secret (min 32 chars)
JWT_SECRET                             → JWT token secret (min 32 chars)
ALGORITHM                              → JWT algorithm (default: HS256)
ACCESS_TOKEN_EXPIRE_MINUTES            → Token expiry time
GOOGLE_PLACES_API_KEY                  → Google Places API key
GOOGLE_MAPS_API_KEY                    → Google Maps API key (optional)
STRIPE_API_KEY                         → Stripe API key (optional)
STRIPE_WEBHOOK_SECRET                  → Stripe webhook secret (optional)
RAZORPAY_KEY_ID                        → Razorpay Key ID (optional)
RAZORPAY_KEY_SECRET                    → Razorpay Key Secret (optional)
WEBHOOK_SECRET                         → Generic webhook secret (optional)
SMTP_SERVER                            → Email SMTP server
SMTP_PORT                              → Email SMTP port
SMTP_USERNAME                          → Email SMTP username
SMTP_PASSWORD                          → Email SMTP password
SMTP_FROM_EMAIL                        → From email address
APP_NAME                               → Application name
APP_VERSION                            → Application version
DEBUG                                  → Debug mode (False in production!)
ENVIRONMENT                            → Environment name (production/staging/dev)
REDIS_URL                              → Redis connection URL (optional)
ALLOWED_HOSTS                          → Comma-separated allowed hosts
CORS_ORIGINS                           → Comma-separated CORS origins
LOG_LEVEL                              → Logging level (DEBUG/INFO/WARNING/ERROR)
LOG_DIR                                → Log directory
SUBSCRIPTION_DEFAULT_DURATION_DAYS     → Default subscription duration
FREE_PLAN_LEAD_LIMIT                   → Free plan lead limit
STARTER_PLAN_LEAD_LIMIT                → Starter plan lead limit
PROFESSIONAL_PLAN_LEAD_LIMIT           → Professional plan lead limit
"""
