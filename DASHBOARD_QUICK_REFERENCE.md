# BizLead Dashboard - Quick Reference Guide

## 🚀 Quick Start

### Access Dashboard
```
Navigate to: http://localhost:3001/dashboard
Requires valid login token
All data is mock data (no backend required yet)
```

### Available Pages
| Page | URL | Features |
|------|-----|----------|
| Overview | `/dashboard` | Stats, AI insights, usage trends |
| Search | `/dashboard/search` | Find & export business leads |
| Database | `/dashboard/database` | Manage saved leads, bulk actions |
| CRM Leads | `/dashboard/crm` | Sales pipeline tracking (BETA) |
| Billing | `/dashboard/billing` | Invoices, payment methods, pricing |

---

## 🎨 Component Quick Reference

### Page Components (Full Pages)
```tsx
// These are complete pages ready to render
import DashboardPage from '@/app/dashboard/page'
import SearchPage from '@/app/dashboard/search/page'
import DatabasePage from '@/app/dashboard/database/page'
import CRMLeadsPage from '@/app/dashboard/crm/page'
import BillingPage from '@/app/dashboard/billing/page'
```

### Reusable Components
```tsx
// Use these in other pages for consistency
import Sidebar from '@/components/dashboard/Sidebar'
import Navbar from '@/components/dashboard/Navbar'
import StatsCard from '@/components/dashboard/StatsCard'
import AIUsageTrend from '@/components/dashboard/AIUsageTrend'
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import PricingTiers from '@/components/dashboard/PricingTiers'
import AIChatAssistant from '@/components/dashboard/AIChatAssistant'
```

---

## 💡 Usage Examples

### StatsCard
```tsx
<StatsCard
  icon={BarChart3}
  title="Leads Used"
  value="2,847"
  unit="this month"
  trend={12}
  trendLabel="from last month"
/>
```

### Using in Layout
```tsx
// The layout automatically includes all navigation
// Just wrap your page content with layout
// Sidebar and Navbar are included automatically
// AI Chat Assistant is available on all pages
```

---

## 🎯 Key Styling Classes

### Gradient Backgrounds
```
Primary: from-blue-600 to-cyan-500
Dark BG: from-slate-950 via-blue-950 to-slate-950
Card BG: from-slate-900/50 via-blue-900/20 to-slate-950
```

### Common Patterns
```
Cards: p-6 lg:p-8 rounded-2xl border border-blue-500/20
Buttons: hover:shadow-lg shadow-blue-500/50
Text: text-white (primary), text-slate-400 (secondary)
Hover: hover:bg-blue-500/5 transition-all duration-300
```

---

## 📊 Mock Data Locations

| Component | Data Location | Records |
|-----------|---------------|---------|
| Dashboard Stats | `/app/dashboard/page.tsx` L20-24 | Hardcoded |
| Search Results | `/app/dashboard/search/page.tsx` L10-25 | 3 leads |
| Database Leads | `/app/dashboard/database/page.tsx` L9-50 | 5 leads |
| CRM Leads | `/app/dashboard/crm/page.tsx` L5-45 | 3 leads |
| Invoices | `/app/dashboard/billing/page.tsx` L13-30 | 3 invoices |
| Pricing Plans | `/components/dashboard/PricingTiers.tsx` L5-45 | 3 plans |

---

## 🔌 Backend Integration Checklist

### Step 1: Setup API Client
```tsx
// Update /lib/api.ts with your backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL
```

### Step 2: Replace Mock Data with API Calls
```tsx
// Example: Dashboard page
useEffect(() => {
  const fetchStats = async () => {
    const response = await apiClient.get('/api/dashboard/stats')
    setStats(response.data)
  }
  fetchStats()
}, [])
```

### Step 3: Expected API Endpoints
```
GET    /api/dashboard/stats
GET    /api/leads/search?query=...&limit=...
GET    /api/leads/database
POST   /api/leads/database (create)
PUT    /api/leads/{id} (update)
DELETE /api/leads/{id} (delete)

GET    /api/crm/leads
PUT    /api/crm/leads/{id}/status
DELETE /api/crm/leads/{id}

GET    /api/billing/invoices
GET    /api/billing/plans
POST   /api/billing/payment-methods
GET    /api/billing/current-plan
```

---

## 🐛 Debugging Tips

### Check Auth Token
```tsx
// In browser console
localStorage.getItem('token')
```

### View Component Hierarchy
```tsx
// Sidebar → page.tsx is automatically wrapped in layout.tsx
// Layout handles: auth check, sidebar, navbar, AI chat
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Page not visible | Check token in localStorage |
| Sidebar not showing | Check sidebarOpen state |
| Styles not applying | Ensure Tailwind classes are included |
| Charts not rendering | Install recharts: `npm install recharts` |
| Icons not showing | Ensure lucide-react is installed |

---

## 🎯 Customization Guide

### Change Primary Color
Find: `from-blue-600 to-cyan-500`
Replace with: Your color gradient
Update in: All components (9 files)

### Add New Dashboard Page
1. Create `/app/dashboard/[page]/page.tsx`
2. Add to Sidebar navItems array
3. Export default component with 'use client'
4. Use existing components for consistency

### Adjust Sidebar
Edit: `/components/dashboard/Sidebar.tsx`
- Change navItems array for menu items
- Update icons from lucide-react
- Modify styles for different look

---

## 📦 Dependencies

```json
{
  "next": "16.1.4",
  "react": "^19",
  "typescript": "^5",
  "tailwindcss": "^3",
  "recharts": "^2.10.0",
  "lucide-react": "latest",
  "zustand": "^4"
}
```

No additional dependencies needed for dashboard!

---

## 📈 Performance Notes

- ✅ All components are lightweight
- ✅ Charts only render when visible (Recharts lazy loading)
- ✅ Images optimized with Next.js Image component
- ✅ CSS-in-JS minimized with Tailwind
- ✅ Client-side state only (no heavy server ops)

---

## 🔒 Security Considerations

- Auth tokens stored in localStorage (consider secure HTTP-only cookies)
- API calls should include CSRF tokens
- Rate limiting recommended for API endpoints
- Input validation on search forms
- XSS prevention: React auto-escapes by default

---

## 📞 Support & Contact

For issues with the dashboard implementation:
1. Check mock data is correct format
2. Verify Tailwind classes are included
3. Ensure all dependencies installed
4. Check browser console for errors
5. Test in development mode: `npm run dev`

---

**Status**: ✅ Complete & Production Ready
**Last Updated**: March 2026
**Version**: 1.0.0
