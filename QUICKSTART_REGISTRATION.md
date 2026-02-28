# BizLead Registration System - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Python 3.9+
- MongoDB (local or Atlas)
- pip and virtualenv

### Step 1: Clone & Setup Environment

```bash
# Clone repo (already done)
cd BizLead/places_lead_scraper

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure MongoDB

**Option A: Local MongoDB with Docker**
```bash
# Start MongoDB container
docker-compose up -d mongodb

# Container is ready at: mongodb://admin:admin123@localhost:27017
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Add to .env

### Step 3: Create .env File

```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
# Database (choose one)
DATABASE_URL=sqlite:///./bizlead.db
MONGODB_URL=mongodb://admin:admin123@localhost:27017
MONGODB_DB_NAME=bizlead_db

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars

# For testing
DEBUG=true
ENVIRONMENT=development
```

### Step 4: Start Backend Server

```bash
cd places_lead_scraper
uvicorn app.main:app --reload --port 8000
```

Server starts at: http://localhost:8000
Docs available at: http://localhost:8000/docs

### Step 5: Test Registration API

**Swagger UI (Interactive):**
1. Open http://localhost:8000/docs
2. Find `/api/v1/auth/register` endpoint
3. Click "Try it out"
4. Enter test data:
```json
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
5. Click "Execute"

**Using curl:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.smith@example.com",
    "company_name": "Acme Corp",
    "phone": "+1234567890",
    "password": "SecurePass123!",
    "confirm_password": "SecurePass123!",
    "terms_accepted": true
  }'
```

**Expected Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "full_name": "John Doe",
    "email": "john.smith@example.com",
    "company_name": "Acme Corp",
    ...
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "subscription_status": "trial",
  "trial_end_date": "2024-02-17T10:30:00Z",
  "leads_limit": 50
}
```

## 🔌 Integration Guide

### 1. Connect Frontend to Backend

Update your Next.js frontend:

```jsx
// lib/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export async function registerUser(data) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    
    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Registration failed';
  }
}

export async function getProfile(token) {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
```

### 2. Create Registration Component

```jsx
// app/auth/signup/page.tsx
import { registerUser } from '@/lib/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerUser(formData);
      
      // Show success toast
      toast.success('Welcome to BizLead! Your 7-day trial is active.');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Start Your Free Trial</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          required
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="text"
          name="company_name"
          placeholder="Company Name"
          required
          onChange={(e) => setFormData({...formData, company_name: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          required
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password (min 8 chars)"
          required
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          required
          onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
          className="w-full px-4 py-2 border rounded"
        />
        
        <label className="flex items-center">
          <input
            type="checkbox"
            name="terms_accepted"
            required
            onChange={(e) => setFormData({...formData, terms_accepted: e.target.checked})}
            className="mr-2"
          />
          I agree to the terms and conditions
        </label>
        
        {error && <div className="text-red-600">{error}</div>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Start Free Trial'}
        </button>
      </form>
    </div>
  );
}
```

### 3. Add CORS Configuration

Update `frontend/next.config.ts` to allow backend communication:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
```

## 📊 Testing Checklist

- [ ] User registration with valid data ✅
- [ ] Duplicate email rejection (409) ✅
- [ ] Invalid password rejection (400) ✅
- [ ] Password mismatch error (400) ✅
- [ ] Terms not accepted error (400) ✅
- [ ] Access token returned (15 min expiry) ✅
- [ ] Refresh token returned (7 days expiry) ✅
- [ ] Free trial subscription created (50 leads) ✅
- [ ] MongoDB collections created ✅
- [ ] Indexes created for performance ✅
- [ ] Get profile endpoint works with valid token ✅
- [ ] Get profile endpoint rejects invalid token (401) ✅
- [ ] Refresh token endpoint works ✅
- [ ] Password hashing works (bcrypt) ✅
- [ ] Subscription expiry check works ✅

## 🐛 Debugging

### View MongoDB Collections

```bash
# Using MongoDB Shell
mongo mongodb://admin:admin123@localhost:27017

# Switch to database
use bizlead_db

# View users
db.bizlead_users.find()

# View subscriptions
db.bizlead_subscriptions.find()

# Check indexes
db.bizlead_users.getIndexes()
```

### View Server Logs

```bash
# The terminal running uvicorn shows all logs
# Look for:
# - INFO: User registered: <user_id>
# - INFO: Free trial subscription created: <sub_id>
# - WARNING: Registration attempt with existing email
# - ERROR: Error creating user
```

### Check API Response

```bash
# In browser test (http://localhost:8000/docs)
# Copy response → Tools → Format JSON for readability
```

## 🚀 Next Steps

1. **Email Verification**: Send confirmation email with OTP
2. **Welcome Email**: Send trial activation email
3. **Trial Countdown**: Show remaining days in dashboard
4. **Payment Integration**: Setup Stripe/Razorpay for upgrades
5. **Admin Dashboard**: Manage users and subscriptions

## ❓ FAQ

**Q: How long is the free trial?**
A: 7 days with 50 lead limit (configurable in database)

**Q: Where are passwords stored?**
A: Hashed with bcrypt (12 rounds), never in plain text

**Q: How do I reset a user's password?**
A: Implement `/auth/forgot-password` endpoint

**Q: Can users change their subscription plan?**
A: Yes, implement `/subscriptions/upgrade` endpoint

**Q: How is trial expiry enforced?**
A: Checked in `get_current_user_with_valid_subscription` dependency

## 📚 Documentation

- Full registered system guide: `REGISTRATION_SYSTEM.md`
- API documentation: http://localhost:8000/docs
- FastAPI docs: https://fastapi.tiangolo.com
- MongoDB docs: https://docs.mongodb.com

---

**Happy coding! 🎉**

For issues or questions, check error logs → review REGISTRATION_SYSTEM.md → contact support
