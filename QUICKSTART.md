# Quick Start Guide - BizLead with Next.js

## Step 1: Start the Backend
```bash
cd places_lead_scraper
pip install -r requirements.txt  # if needed
uvicorn app.main:app --reload
```
Backend runs on: **http://localhost:8000**

## Step 2: Start the Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:3000**

## Step 3: Access the App
- Go to `http://localhost:3000`
- Sign up or log in
- View your dashboard

## Available Commands

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Backend
```bash
uvicorn app.main:app --reload      # Development with auto-reload
uvicorn app.main:app --workers 4   # Production with workers
```

## Project Structure

```
BizLead/
├── places_lead_scraper/        # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── config/            # Configuration
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   └── requirements.txt        # Python dependencies
│
└── frontend/                   # Next.js Frontend
    ├── app/                    # Pages and routes
    ├── components/             # React components
    ├── lib/                    # Utilities and store
    ├── package.json
    └── .env.local              # Frontend env vars
```

## Login Credentials

Use the credentials you created during signup, or check your database for existing users.

## API Documentation

While developing, view the API docs at: **http://localhost:8000/docs**

This shows all available endpoints with their parameters and responses.

## Troubleshooting

### Frontend won't connect to backend
- Make sure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Ensure backend is running on port 8000
- Check browser console for errors

### Login failing
- Verify credentials
- Check backend logs for errors
- Ensure database is properly initialized

### CORS errors
- Backend CORS is already configured for localhost:3000
- No additional configuration needed

## Next Features to Build

1. **Leads Page** - Display scraped leads
2. **Scraper Interface** - UI for lead scraping
3. **Settings Page** - User preferences
4. **Payment Integration** - Stripe/Razorpay checkout
5. **Admin Dashboard** - Manage users and plans

Happy coding! 🚀
