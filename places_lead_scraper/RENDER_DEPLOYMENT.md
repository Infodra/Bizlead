# Render Deployment Guide

This guide explains how to deploy the Infodra SaaS Backend to Render.com.

## Prerequisites

1. Render.com account (https://render.com)
2. GitHub repository (already set up: `Infodra/infodra-saas-backend`)
3. Environment variables ready

## Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name:** `infodra-db`
   - **Database:** `bizlead`
   - **User:** Keep default or customize
   - **Region:** Same as your web service (recommended: `us-east-1`)
   - **Plan:** Starter (free tier)
4. Click **Create Database**
5. Copy the connection string (you'll need this as `DATABASE_URL`)

## Step 2: Create Web Service

1. Click **New +** → **Web Service**
2. Connect to GitHub:
   - Click **Connect account** if not already connected
   - Select repository: `Infodra/infodra-saas-backend`
   - Branch: `main`
3. Configure service:
   - **Name:** `infodra-saas-backend`
   - **Environment:** `Python 3.13` (should auto-select)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Starter (free tier) or higher
   - **Region:** Same as database
4. Click **Create Web Service**

## Step 3: Configure Environment Variables

In the Render dashboard for your web service:

1. Go to **Environment** tab
2. Add the following environment variables:

### Required Variables (NO DEFAULTS)

```
DATABASE_URL=postgresql://user:password@host:5432/bizlead
SECRET_KEY=<generate: openssl rand -hex 32>
JWT_SECRET=<generate: openssl rand -hex 32>
GOOGLE_PLACES_API_KEY=<your_api_key>
SMTP_USERNAME=<your_email@gmail.com>
SMTP_PASSWORD=<your_app_password>
```

### Optional Variables (With Defaults)

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=<your_email@gmail.com>
APP_ENV=production
DEBUG=false
CORS_ORIGINS=https://yourdomain.com
REDIS_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## Step 4: Generate Secrets

Run these commands locally to generate secure secrets:

```bash
# Generate SECRET_KEY
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f

# Generate JWT_SECRET
openssl rand -hex 32
# Example output: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v
```

Paste these values into the Render environment variables.

## Step 5: Set up Database URL

From your Render PostgreSQL dashboard:

1. Find the **External Database URL**
2. Copy it
3. In Web Service environment variables, set `DATABASE_URL` to this value

Example format:
```
postgresql://username:password@oregon-postgres.render.com:5432/bizlead
```

## Step 6: Gmail SMTP Configuration (Optional)

If using Gmail for email:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Set in environment:
   - `SMTP_USERNAME`: Your Gmail email
   - `SMTP_PASSWORD`: The 16-character app password
   - `SENDER_EMAIL`: Your Gmail email

## Step 7: Deploy

1. After setting all environment variables, click **Deploy**
2. Monitor deployment in **Logs** tab
3. Wait for "Service is live" message
4. Your API will be available at: `https://infodra-saas-backend.render.com`

## Step 8: Test Deployment

```bash
# Test health endpoint
curl https://infodra-saas-backend.render.com/health

# Expected response:
# {"status":"ok"}
```

## Troubleshooting

### Build Fails with "Module not found"
- Check that all dependencies in `requirements.txt` are Python 3.13 compatible
- Verify pre-built wheels exist for Python 3.13

### "Field required" errors
- Ensure all required environment variables are set in Render dashboard
- Check variable names exactly (case-sensitive)
- Redeploy after adding variables

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL service is running
- Ensure web service and database are in same region

### Application crashes on startup
- Check logs in Render dashboard
- Verify all required Python packages installed
- Ensure settings validation passes

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | ✅ | PostgreSQL connection string |
| SECRET_KEY | ✅ | 32-byte hex string for general secrets |
| JWT_SECRET | ✅ | 32-byte hex string for JWT signing |
| GOOGLE_PLACES_API_KEY | ✅ | Google Places API key |
| SMTP_USERNAME | ✅ | Email account username |
| SMTP_PASSWORD | ✅ | Email account password |
| SMTP_SERVER | ❌ | SMTP server (default: smtp.gmail.com) |
| SMTP_PORT | ❌ | SMTP port (default: 587) |
| SENDER_EMAIL | ❌ | From email address |
| STRIPE_SECRET_KEY | ❌ | Stripe secret key for payments |
| STRIPE_PUBLISHABLE_KEY | ❌ | Stripe public key for frontend |
| RAZORPAY_KEY_ID | ❌ | Razorpay key ID |
| RAZORPAY_KEY_SECRET | ❌ | Razorpay key secret |
| REDIS_URL | ❌ | Redis connection URL (optional caching) |
| APP_ENV | ❌ | Environment name (production/staging/development) |
| DEBUG | ❌ | Debug mode (false for production) |
| CORS_ORIGINS | ❌ | Comma-separated CORS allowed origins |

## Auto-Deployment from GitHub

The service is configured to automatically deploy when you push to the `main` branch. No manual deployment needed after setup!

To trigger a deployment:
```bash
git push origin main
```

## Monitoring & Logs

View logs in Render dashboard:
1. Go to Web Service
2. Click **Logs** tab
3. See real-time application output

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI on Render](https://render.com/docs/deploy-fastapi)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables on Render](https://render.com/docs/environment-variables)
