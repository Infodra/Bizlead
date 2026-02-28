# BizLead User Registration System - Complete Implementation Guide

## Overview

This is a production-ready user registration system for BizLead SaaS platform built with FastAPI and MongoDB. It implements a complete authentication flow with JWT tokens, bcrypt password hashing, and automatic free trial subscription creation.

## Architecture

### Technology Stack

- **Backend Framework**: FastAPI (async/await)
- **Database**: MongoDB (users and subscriptions)
- **Password Hashing**: bcrypt (via passlib)
- **JWT Authentication**: python-jose
- **Async Database Driver**: motor (async MongoDB)

### Collections

1. **bizlead_users**
   - Stores user account information
   - Unique email index
   - Tracks current subscription

2. **bizlead_subscriptions**
   - Tracks all subscriptions (free trial, paid plans)
   - Links to users via user_id
   - Manages trial periods and lead limits

## Registration Flow

### User Journey

```
User clicks "Start Free Trial"
    ↓
POST /api/v1/auth/register
    ↓
Backend validates input
    ├─ Check email format
    ├─ Verify password strength
    ├─ Confirm password match
    └─ Check terms acceptance
    ↓
Check if email exists (409 if yes)
    ↓
Hash password with bcrypt
    ↓
Create user document
    ├─ full_name
    ├─ email (unique, lowercase)
    ├─ password_hash
    ├─ company_name
    ├─ phone
    ├─ role: "user"
    ├─ is_active: true
    └─ timestamps
    ↓
Create FREE TRIAL subscription
    ├─ plan_name: "free"
    ├─ status: "trial"
    ├─ leads_limit: 50
    ├─ leads_used: 0
    ├─ trial_end_date: NOW + 7 days
    └─ timestamps
    ↓
Update user.current_subscription_id
    ↓
Generate JWT tokens
    ├─ access_token (15 min expiry)
    └─ refresh_token (7 days expiry)
    ↓
Return UserWithToken response
    ↓
Frontend stores tokens → Redirects to /dashboard
```

## API Endpoints

### 1. Register (Create Account)

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "company_name": "Acme Corp",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "terms_accepted": true
}
```

**Response (201 Created):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "full_name": "John Doe",
    "email": "john@example.com",
    "company_name": "Acme Corp",
    "phone": "+1234567890",
    "role": "user",
    "is_active": true,
    "current_subscription_id": "507f1f77bcf86cd799439012",
    "created_at": "2024-02-10T10:30:00Z",
    "updated_at": "2024-02-10T10:30:00Z",
    "last_login": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "subscription_status": "trial",
  "trial_end_date": "2024-02-17T10:30:00Z",
  "leads_limit": 50
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed (password mismatch, terms not accepted, weak password)
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Database error

### 2. Refresh Token

**Request:**
```http
POST /api/v1/auth/refresh?refresh_token_str=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Get Profile

**Request:**
```http
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "full_name": "John Doe",
  "email": "john@example.com",
  "company_name": "Acme Corp",
  "phone": "+1234567890",
  "role": "user",
  "is_active": true,
  "current_subscription_id": "507f1f77bcf86cd799439012",
  "created_at": "2024-02-10T10:30:00Z",
  "updated_at": "2024-02-10T10:30:00Z",
  "last_login": "2024-02-10T11:00:00Z"
}
```

## Database Schema

### bizlead_users Collection

```javascript
{
  _id: ObjectId,
  full_name: string,           // Required, 2-100 chars
  email: string,               // Required, unique, lowercase
  password_hash: string,       // Bcrypt hash, never returned
  company_name: string,        // Required, 2-150 chars
  phone: string,               // Required, 10-20 chars
  role: string,                // "user" | "admin" | "moderator"
  is_active: boolean,          // true/false
  current_subscription_id: ObjectId | null,
  created_at: timestamp,
  updated_at: timestamp,
  last_login: timestamp | null
}

// Indexes
{ email: 1, unique: true }
{ created_at: 1 }
```

### bizlead_subscriptions Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,           // Reference to user
  plan_name: string,           // "free" | "starter" | "professional" | "enterprise"
  status: string,              // "trial" | "active" | "expired" | "cancelled"
  start_date: timestamp,
  trial_end_date: timestamp | null,    // Only for trial
  renewal_date: timestamp | null,      // For paid plans
  leads_limit: number,         // Max leads allowed
  leads_used: number,          // Current usage
  created_at: timestamp,
  updated_at: timestamp,
  cancelled_at: timestamp | null
}

// Indexes
{ user_id: 1 }
{ status: 1 }
{ trial_end_date: 1 }
```

## Security Implementation

### Password Hashing

- **Algorithm**: bcrypt with 12 rounds
- **Min Length**: 8 characters
- **Max Length**: 100 characters
- **Strength Requirements**:
  - Must contain at least 2 of: uppercase, lowercase, numbers, special chars

```python
from app.auth.password_handler import password_handler

# Hash
hashed = password_handler.hash_password("SecurePass123!")

# Verify
is_valid = password_handler.verify_password("SecurePass123!", hashed)

# Validate strength
is_strong, message = password_handler.validate_password_strength("SecurePass123!")
```

### JWT Tokens

**Access Token:**
- Expiry: 15 minutes
- Algorithm: HS256
- Type: access

**Refresh Token:**
- Expiry: 7 days
- Algorithm: HS256
- Type: refresh

```python
from app.auth.jwt_handler import jwt_handler

# Create tokens
tokens = jwt_handler.create_tokens(user_id="507f...", email="john@example.com")
# Returns: { "access_token": "...", "refresh_token": "..." }

# Verify token
payload = jwt_handler.verify_token(token)
# Returns: { "sub": "507f...", "email": "john@example.com", "exp": 123456789, "type": "access" }

# Get user ID from token
user_id = jwt_handler.get_user_id_from_token(token)

# Check if expired
is_expired = jwt_handler.is_token_expired(token)
```

### Authorization Dependency

```python
from app.dependencies.auth_dependency import get_current_user, get_current_user_with_valid_subscription

# Use in routes
@app.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    """Access token required"""
    return current_user

@app.get("/api/leads")
async def get_leads(current_user = Depends(get_current_user_with_valid_subscription)):
    """Access token + valid, non-expired subscription required"""
    return {"leads": [...]}
```

## Environment Configuration

Create `.env` file in project root:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bizlead_db
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=bizlead_db

# Security
SECRET_KEY=your-secret-key-min-32-chars-generated-with-openssl
JWT_SECRET=your-jwt-secret-min-32-chars-generated-with-openssl
ALGORITHM=HS256

# Application
APP_NAME=BizLead
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=false
LOG_LEVEL=INFO

# External APIs
GOOGLE_PLACES_API_KEY=your-google-api-key

# CORS
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Trial Configuration
FREE_PLAN_LEAD_LIMIT=50
STARTER_PLAN_LEAD_LIMIT=500
PROFESSIONAL_PLAN_LEAD_LIMIT=2000
```

## Installation & Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Make sure MongoDB driver is installed:
```bash
pip install motor==3.3.2
```

### 2. Configure Environment

Create `.env` file with required variables (see above).

### 3. MongoDB Setup

**Local Development:**
```bash
# Using Docker Compose
docker-compose up -d mongodb

# Or install MongoDB locally and start service
mongod
```

**Production (MongoDB Atlas):**
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/bizlead_db
```

### 4. Start Application

```bash
# Development mode
uvicorn app.main:app --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Frontend Integration

### Registration Form

```jsx
import { useState } from 'react';
import axios from 'axios';

export function SignupForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/auth/register',
        formData
      );

      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input
        name="full_name"
        placeholder="Full Name"
        required
        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
      />
      {/* ... other fields ... */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Start Free Trial'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### API Client with Token Management

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

// Intercept requests to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(
            'http://localhost:8000/api/v1/auth/refresh',
            null,
            { params: { refresh_token_str: refreshToken } }
          );
          localStorage.setItem('access_token', response.data.access_token);
          // Retry original request
          return apiClient(error.config);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Testing

### Manual API Testing

**Using curl:**

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "company_name": "Acme Corp",
    "phone": "+1234567890",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!",
    "terms_accepted": true
  }'

# Get profile (use token from register response)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/profile
```

**Using Postman:**

1. Create collection
2. Add requests:
   - POST /api/v1/auth/register
   - GET /api/v1/auth/profile
   - POST /api/v1/auth/refresh
3. Set Authorization: Bearer Token
4. Use pre-request scripts for token management

## Files Created/Modified

### New Files

```
app/
├── auth/
│   ├── __init__.py                 # Auth module exports
│   ├── jwt_handler.py             # JWT token creation/validation
│   └── password_handler.py        # Password hashing with bcrypt
├── models/
│   ├── user.py                    # User Pydantic models
│   └── subscription.py            # Subscription Pydantic models
├── dependencies/
│   ├── __init__.py
│   └── auth_dependency.py         # FastAPI JWT dependencies
├── config/
│   └── mongodb.py                 # MongoDB connection setup
└── routes/
    └── auth.py                    # Registration & auth endpoints (updated)

Documentation:
├── REGISTRATION_SYSTEM.md         # This file
```

### Modified Files

```
app/
├── main.py                        # Added MongoDB connection in lifespan
├── config/settings.py             # Added MONGODB_URL & MONGODB_DB_NAME
└── routes/auth.py                 # Complete registration implementation
requirements.txt                    # Added motor for MongoDB
```

## Troubleshooting

### MongoDB Connection Failed

**Error**: `Error connecting to MongoDB: connection refused`

**Solutions:**
1. Ensure MongoDB is running: `mongod` or Docker container
2. Check MONGODB_URL in .env
3. Verify MongoDB credentials if using Atlas
4. Check firewall rules for port 27017

### JWT Token Errors

**Error**: `Invalid token` or `Token expired`

**Solutions:**
1. Ensure SECRET_KEY and JWT_SECRET are set
2. Check token hasn't expired (15 min for access token)
3. Use refresh token to get new access token
4. Verify Authorization header format: `Bearer <token>`

### Password Validation Fails

**Error**: `Password must contain uppercase, lowercase, numbers, and special characters`

**Solutions:**
1. Password must be min 8 characters
2. Include at least 2 of:
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Special chars (!@#$%^&*)

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Ensure frontend URL is in CORS_ORIGINS in .env
2. Check Access-Control headers are returned
3. Verify credentials are being sent with requests

## Performance Optimization

### Database Indexes

Indexes are automatically created on startup:

```javascript
// Users collection
{ email: 1, unique: true }      // For checking email existence
{ created_at: 1 }               // For user timeline queries

// Subscriptions collection
{ user_id: 1 }                  // For finding user subscriptions
{ status: 1 }                   // For filtering by status
{ trial_end_date: 1 }           // For finding expired trials
```

### Caching Strategies

```python
# Cache user profile
@cache(expire=300)  # 5 minutes
async def get_user_profile(user_id: str):
    return await get_from_db(user_id)

# Cache subscription status
@cache(expire=600)  # 10 minutes
async def get_subscription(subscription_id: str):
    return await get_from_db(subscription_id)
```

## Production Checklist

- [ ] Set `DEBUG=false` in production
- [ ] Generate strong SECRET_KEY and JWT_SECRET
- [ ] Use PostgreSQL for production (not SQLite)
- [ ] Use MongoDB Atlas for production
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Implement automated backups
- [ ] Set up CI/CD pipeline
- [ ] Load test the registration endpoint
- [ ] Security audit of code
- [ ] Update password requirements if needed
- [ ] Implement email verification (optional)

## Future Enhancements

1. **Email Verification**: Send confirmation email with OTP
2. **Two-Factor Authentication**: SMS or authenticator app
3. **OAuth/SSO**: Google, GitHub, Microsoft login
4. **Social Login**: Simplified signup with social accounts
5. **Rate Limiting**: Prevent registration spam
6. **Email Notifications**: Welcome email with trial info
7. **Trial Expiry**: Automated emails before trial ends
8. **Subscription Webhooks**: PaymentIntention, subscription updates
9. **Admin Dashboard**: Manage users and subscriptions
10. **Analytics**: Track registration sources, conversion rates

## Support

For questions or issues:
1. Check error messages and logs
2. Review FastAPI docs: https://fastapi.tiangolo.com
3. Review JWT docs: https://pyjwt.readthedocs.io
4. Check MongoDB docs: https://docs.mongodb.com
5. Contact support team

---

**Last Updated**: February 10, 2024
**Version**: 1.0.0
