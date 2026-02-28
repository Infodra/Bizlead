# BizLead Dashboard - Architecture & Component Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BizLead Dashboard (Next.js)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Dashboard Layout (/dashboard)              │   │
│  │  - Authentication Check                                 │   │
│  │  - Token Validation                                     │   │
│  │  - Auth Redirect to Login                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│   │                                                             │
│   ├─ Sidebar (Fixed/Mobile Toggle)                             │
│   │   └─ Navigation Items (5 pages + Logout)                   │
│   │                                                             │
│   ├─ Main Content Area                                         │
│   │   ├─ Navbar (Top Bar)                                      │
│   │   │   ├─ Breadcrumb Navigation                             │
│   │   │   ├─ Search Bar                                        │
│   │   │   ├─ Notification Dropdown                             │
│   │   │   └─ Profile Dropdown                                  │
│   │   │                                                         │
│   │   └─ Page Content (Dynamic)                                │
│   │       ├─ /dashboard → Dashboard Overview                   │
│   │       ├─ /dashboard/search → Business Search               │
│   │       ├─ /dashboard/database → Lead Database               │
│   │       ├─ /dashboard/crm → CRM Pipeline                     │
│   │       └─ /dashboard/billing → Billing & Payments           │
│   │                                                             │
│   └─ AI Chat Assistant (Floating Button)                       │
│       └─ Chat Panel with AI Responses                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
DashboardLayout
│
├── <Sidebar>
│   ├── Logo & Branding
│   ├── Navigation Menu (5 items)
│   │   ├── Dashboard (icon + label)
│   │   ├── Business Search (icon + label)
│   │   ├── Database (icon + label)
│   │   ├── CRM Leads (icon + label + BETA badge)
│   │   └── Billing (icon + label)
│   └── Logout Button
│
├── <Main Content>
│   ├── <Navbar>
│   │   ├── Breadcrumb Navigation
│   │   ├── Search Bar
│   │   ├── Notification Dropdown
│   │   │   └── 3 Mock Notifications
│   │   └── Profile Dropdown
│   │       ├── User Info
│   │       └── Menu Items (Settings, Logout)
│   │
│   └── <Page Content>
│       │
│       ├─ Dashboard Page
│       │   ├── <StatsCard> × 4 (KPI cards)
│       │   ├── <AIUsageTrend> (Recharts Line)
│       │   ├── <AIInsightsPanel> (4 insight cards)
│       │   └── <SubscriptionCard> (Usage tracker)
│       │
│       ├─ Search Page
│       │   ├── Search Input
│       │   ├── Max Results Dropdown
│       │   ├── Results Table
│       │   └── CSV Export Button
│       │
│       ├─ Database Page
│       │   ├── Search & Filter Bar
│       │   ├── Batch Selection Toolbar
│       │   ├── Data Table (8 columns)
│       │   │   └── Row Actions (Edit/Delete)
│       │   └── Pagination
│       │
│       ├─ CRM Page
│       │   ├── Pipeline Overview Stats
│       │   └── Lead Cards (Grid)
│       │       ├── Contact Info
│       │       ├── Timeline (Last/Next)
│       │       ├── Status Selector
│       │       ├── Notes Section
│       │       └── Actions (Edit/Delete)
│       │
│       └─ Billing Page
│           ├── Current Plan Card
│           │   ├── Plan Name & Price
│           │   ├── Features Checklist
│           │   └── Upgrade Button
│           ├── Tabs (Invoices | Payments)
│           │   ├─ Invoices Tab
│           │   │   └── Invoice Table
│           │   │       ├── Invoice Details
│           │   │       └── Download Button
│           │   └─ Payments Tab
│           │       └── Payment Methods List
│           └── <PricingTiers>
│               └── 3 Pricing Cards
│                   └── Enterprise (AI features)
│
└── <AIChatAssistant>
    ├── Floating Button (Bottom-right)
    └── Chat Panel (On open)
        ├── Message History
        ├── Suggested Prompts
        ├── Input Field
        └── Send Button
```

---

## 🔄 Data Flow

```
┌────────────────────────────────────────────────────────┐
│              Authentication Check (Layout)            │
├────────────────────────────────────────────────────────┤
│  Check localStorage.token                             │
│  ↓                                                     │
│  Token exists?                                         │
│  ├─ YES → Load Sidebar + Navbar + Page                │
│  └─ NO  → Redirect to /auth/login                     │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│        User Navigates (Sidebar Click)                 │
├────────────────────────────────────────────────────────┤
│  useRouter.push('/dashboard/page')                    │
│  ↓                                                     │
│  usePathname() → Current page                          │
│  ↓                                                     │
│  Sidebar highlights active item                       │
│  ↓                                                     │
│  Navbar updates breadcrumb                            │
└────────────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────┐
│         Page Renders (Dynamic Content)                │
├────────────────────────────────────────────────────────┤
│  useState() → Local page state                        │
│  ↓                                                     │
│  Components render with mock data                     │
│  ↓                                                     │
│  User interactions update state                       │
│  (search, filter, status change, etc.)                │
│  ↓                                                     │
│  Optional API calls to backend (future)               │
└────────────────────────────────────────────────────────┘
```

---

## 🔌 Component Props Flow

### StatsCard
```
<StatsCard
  icon={IconComponent}
  title="string"
  value="string | number"
  unit="string?"
  trend="number?"
  trendLabel="string?"
/>
```

### AIUsageTrend
```
<AIUsageTrend />
- Internal: useState for timeRange
- No props required
- Data generated internally
```

### PricingTiers
```
<PricingTiers />
- Standalone component
- No props required
- Self-contained pricing data
```

### AIChatAssistant
```
<AIChatAssistant />
- Floating widget (no props)
- Internal: useState for messages, input
- Positioned fixed bottom-right
```

---

## 🎨 Styling Architecture

```
Global Styles
├── Tailwind CSS Configuration (tailwind.config.js)
├── Global CSS (globals.css)
│   └── custom properties
│
└── Component Styles (Inline Tailwind)
    │
    ├── Dark Theme
    │   ├── Background: from-slate-950 via-blue-950
    │   ├── Text: text-white / text-slate-300
    │   └── Borders: border-blue-500/20
    │
    ├── Gradients
    │   ├── Primary: from-blue-600 to-cyan-500
    │   ├── Dark BG: from-slate-950 via-blue-950
    │   └── AI Accent: from-purple-600 to-blue-600
    │
    ├── Interactive States
    │   ├── Hover: hover:bg-blue-500/5
    │   ├── Glow: shadow-lg shadow-blue-500/50
    │   └── Focus: focus:border-blue-500
    │
    └── Responsive
        ├── Mobile: default (100vw)
        ├── Tablet: md: (768px)
        └── Desktop: lg: (1024px)
```

---

## 📊 State Management

```
useAuthStore (Zustand)
├── user: User | null
├── token: string | null
├── login: (credentials) → void
├── logout: () → void
└── checkAuth: () → void

Page States (useState)
├── Dashboard
│   └── timeRange: '7d' | '30d' | '6m'
│
├── Search
│   ├── searchTerm: string
│   └── loading: boolean
│
├── Database
│   ├── searchTerm: string
│   ├── selectedRows: string[]
│   └── sortBy: string
│
├── CRM
│   ├── leads: Lead[]
│   ├── editingId: string | null
│   └── editStatus: string
│
├── Billing
│   └── activeTab: 'invoices' | 'methods'
│
└── AIChatAssistant
    ├── isOpen: boolean
    ├── messages: Message[]
    └── inputValue: string
```

---

## 🔐 Authentication Flow

```
User Logs In
    ↓
Token stored in localStorage
    ↓
useAuthStore.login() called
    ↓
useAuthStore.token updated
    ↓
Navigation to /dashboard
    ↓
DashboardLayout checks token
    ├─ Token exists → Load dashboard
    └─ Token missing → Redirect to /auth/login
    ↓
Sidebar displays user info
    ↓
API calls include token header
    ↓
User clicks Logout
    ↓
localStorage.token cleared
    ↓
useAuthStore.logout() called
    ↓
Redirect to /auth/login
```

---

## 📱 Responsive Design Breakpoints

```
Mobile (< 768px)
├── Sidebar: Hidden (toggle button in navbar)
├── Search bar: Hidden
├── Grid cols: 1
└── Padding: p-4

Tablet (768px - 1024px)
├── Sidebar: Fixed desktop, toggle on tap
├── Search bar: Hidden
├── Grid cols: 2
└── Padding: p-6

Desktop (> 1024px)
├── Sidebar: Fixed visible
├── Search bar: Visible
├── Grid cols: 4
└── Padding: p-8
```

---

## 🔄 Component Reusability Matrix

| Component | Dashboard | Search | Database | CRM | Billing | Other Pages |
|-----------|-----------|--------|----------|-----|---------|------------|
| Sidebar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Navbar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| StatsCard | ✓ | - | - | - | - | ✓ |
| PricingTiers | - | - | - | - | ✓ | ✓ |
| Form Components | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Table Component | - | ✓ | ✓ | - | ✓ | - |
| Card Component | ✓ | - | - | ✓ | ✓ | ✓ |

---

## 🚀 Performance Optimization

```
Component Rendering
├── Lazy Loading
│   ├── Charts: Recharts lazy-loads
│   ├── Images: Next.js Image optimization
│   └── Code: Route-based splitting
│
├── Re-render Prevention
│   ├── useState for local state
│   ├── No unnecessary prop drilling
│   └── Memoization where needed
│
└── Bundle Size
    ├── Recharts: ~50KB (charts only)
    ├── Lucide: ~20KB (icons)
    └── Tailwind: ~100KB (all styles)
```

---

## 🔗 External Dependencies

```
recharts
└── Used in: AIUsageTrend component
├── Features: Line charts, responsive, tooltips
└── Size: ~50KB

lucide-react
└── Used in: All components (icons)
├── Features: 1500+ icons, lightweight
└── Size: ~20KB

zustand
└── Used in: Authentication state (useAuthStore)
├── Features: Lightweight state management
└── Size: ~5KB

next
└── Core framework
├── Features: App Router, SSR, Optimization
└── Version: 16.1.4
```

---

## 📈 Scalability Considerations

```
Adding New Pages
├── Create /app/dashboard/[new]/page.tsx
├── Add to Sidebar navItems
├── Import common components (Sidebar, Navbar)
└── Follow existing component patterns

Adding New Components
├── Create /components/dashboard/NewComponent.tsx
├── Use same styling patterns
├── Export as default export
└── Document props interface

API Integration
├── Update /lib/api.ts with endpoints
├── Replace mock data with API calls
├── Add loading/error states
└── Handle authentication headers
```

---

## 🎯 Development Workflow

```
1. Start Server
   └── npm run dev → localhost:3001

2. Navigate Dashboard
   └── /dashboard (requires login)

3. Test Features
   ├── Click sidebar items
   ├── Test search/filter
   ├── Check hover effects
   └── Verify responsive design

4. Modify Components
   ├── Edit .tsx files
   ├── Save → auto-reload
   └── Check browser console

5. Add Backend APIs
   ├── Update apiClient
   ├── Replace mock data
   ├── Add loading states
   └── Test API integration

6. Deploy
   ├── npm run build
   ├── Fix any errors
   └── Deploy to hosting
```

---

## 📚 File Dependencies Map

```
layout.tsx
├── Sidebar.tsx
├── Navbar.tsx
├── AIChatAssistant.tsx
└── useAuthStore

page.tsx (Dashboard)
├── StatsCard.tsx
├── AIUsageTrend.tsx
│   └── recharts
├── AIInsightsPanel.tsx
└── SubscriptionCard.tsx

search/page.tsx
└── lucide-react

database/page.tsx
└── lucide-react

crm/page.tsx
└── lucide-react

billing/page.tsx
├── PricingTiers.tsx
└── lucide-react

Sidebar.tsx
├── lucide-react
└── useAuthStore

Navbar.tsx
├── lucide-react
└── useAuthStore

AIChatAssistant.tsx
└── lucide-react
```

---

**Architecture Version**: 1.0  
**Last Updated**: March 2026  
**Status**: ✅ Complete
