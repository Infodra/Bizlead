# BizLead Frontend Migration: Streamlit → Next.js

## Overview
This migration replaces the Streamlit frontend with a modern Next.js application, providing a better user experience and improved scalability.

## What's Changed

### Backend (No Changes Required)
- Your FastAPI backend remains unchanged and continues to run on `http://localhost:8000`
- All existing API endpoints remain the same
- The API is already configured with CORS support for the frontend

### Frontend - New Next.js Application
A new `frontend/` directory contains the Next.js application:

```
frontend/
├── app/
│   ├── page.tsx                 # Home page (redirects to login/dashboard)
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Sign up page
│   └── dashboard/
│       ├── layout.tsx          # Protected dashboard layout
│       └── page.tsx            # Dashboard with plan info
├── components/
│   └── Navbar.tsx              # Navigation component
├── lib/
│   ├── api.ts                  # Axios API client with interceptors
│   └── store.ts                # Zustand store for auth state
├── .env.local                  # Environment variables
├── package.json
└── tsconfig.json
```

## Running the Application

### 1. Keep the Backend Running
```bash
cd places_lead_scraper
uvicorn app.main:app --reload
# Backend will be available at http://localhost:8000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# Frontend will be available at http://localhost:3000
```

### 3. Access the Application
- Open your browser to `http://localhost:3000`
- You'll be redirected to the login page
- Use your credentials to log in

## Key Features

### Authentication
- Login and signup pages connected to your FastAPI backend
- JWT token-based authentication
- Automatic token management with localStorage
- Protected routes that redirect to login when unauthenticated

### Dashboard
- User subscription plan display
- Lead usage tracking with progress bar
- Available plans listing
- Plan upgrade capability

### Components
- **Navbar**: Navigation across the app with user info and logout
- **API Client**: Axios instance with automatic token injection and error handling
- **Auth Store**: Zustand store for centralized auth state management

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Zustand**: Lightweight state management
- **React Hot Toast**: Toast notifications

### Backend (Unchanged)
- FastAPI
- SQLAlchemy ORM
- PostgreSQL/SQLite
- JWT Authentication

## Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**
Continue using your existing backend environment variables

## Migration Notes

### Files Removed
- `app.py` (Streamlit app) - No longer needed but left in place for reference
- `app/pages/plan_dashboard.py` (Streamlit page) - Replaced by Next.js pages
- `app/ui/plan_display.py` (Streamlit UI) - Replaced by Next.js components
- Streamlit dependency removed from `requirements.txt`

### Files to Create (Optional)
You can create additional pages for:
- `/leads` - Display user's scraped leads
- `/scraper` - Lead scraping interface
- `/settings` - User account settings
- `/billing` - Subscription management

## API Integration Points

The frontend communicates with these backend endpoints:
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `GET /api/v1/subscriptions/current` - Get current subscription
- `GET /api/v1/plans` - Get available plans

Extend these as needed for your additional features.

## Development

### Adding New Pages
```typescript
// app/mypage/page.tsx
'use client';

import { Navbar } from '@/components/Navbar';

export default function MyPage() {
  return (
    <>
      <Navbar />
      <div className="p-8">
        {/* Your content here */}
      </div>
    </>
  );
}
```

### Using the API Client
```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.get('/api/v1/endpoint');
const data = await apiClient.post('/api/v1/endpoint', { /* data */ });
```

### Using Auth Store
```typescript
import { useAuthStore } from '@/lib/store';

const { user, isLoggedIn, logout } = useAuthStore();
```

## Next Steps

1. ✅ Backend still running at port 8000
2. ✅ Frontend scaffolding complete
3. Create additional pages (leads, scraper, settings)
4. Add more components (forms, tables, modals)
5. Connect all backend endpoints
6. Deploy to production (Vercel for frontend, Render for backend)

## Support

For issues or questions about the migration, refer to your backend documentation or API endpoints at `http://localhost:8000/docs`
