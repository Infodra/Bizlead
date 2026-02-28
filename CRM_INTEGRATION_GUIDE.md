# CRM Integration - Complete Flow Guide

## Overview
The "Save to CRM" feature now provides a complete workflow for saving leads from the Database page to permanent CRM storage in MongoDB.

## User Flow

### 1. **Database Page** → Save Leads to CRM
- User navigates to **Dashboard > Database**
- Views auto-saved leads from searches (30-day temporary storage)
- Clicks **"Save to CRM"** button next to any lead
- Lead is sent to backend: `POST /api/v1/bizlead/crm/save-lead`
- **Toast notification** appears: "✅ {Company Name} saved to CRM!"
- Lead is now permanently stored in MongoDB CRM collection

### 2. **CRM Leads Page** → Manage Saved Leads  
- User navigates to **Dashboard > CRM** (or **CRM Leads** page)
- Page automatically fetches all saved CRM leads: `GET /api/v1/bizlead/crm/my-leads`
- Displays leads in a professional table with:
  - **Lead Name** - Full lead name
  - **Email** - Clickable for mailto links
  - **Company** - Company name
  - **Status** - Dropdown to change (new, contacted, qualified, converted, rejected)
  - **Saved Date** - When lead was added to CRM
  - **Actions** - Delete button (visible on hover)

### 3. **Search & Filter**
- Search by: Name, Email, or Company name
- Filter by Status: All, New, Contacted, Qualified, Converted, Rejected
- Results update in real-time

### 4. **Lead Management**
- **Update Status**: Click status dropdown, select new status (updates immediately)
- **Delete Lead**: Click delete button, confirm, lead removed from CRM
- **View Statistics**: 
  - Total Leads count
  - Qualified count
  - Converted count

## Technical Architecture

### Backend Endpoints

**POST /api/v1/bizlead/crm/save-lead**
```
Purpose: Save a lead to CRM database (permanent storage)
Request Body:
{
  "name": "Company Name",
  "email": "contact@company.com",
  "phone": "+1 (555) 123-4567",
  "company": "Company Name",
  "website": "https://company.com",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "address": "San Francisco, CA"
}
Response:
{
  "status": "success",
  "message": "Lead saved to CRM",
  "lead": {
    "id": "mongodb_id",
    "name": "Company Name",
    "email": "contact@company.com",
    "saved_at": "2026-02-27T10:30:00Z"
  }
}
Pricing: Free plan = 5 leads max, Premium = Unlimited
```

**GET /api/v1/bizlead/crm/my-leads**
```
Purpose: Fetch all CRM leads for current user
Query Parameters:
- skip: int (pagination offset)
- limit: int (pagination limit)
- status: string (optional, filter by status)
- tag: string (optional, filter by tag)
Response:
{
  "status": "success",
  "total": 12,
  "skip": 0,
  "limit": 100,
  "leads": [
    {
      "_id": "mongodb_id",
      "name": "Company Name",
      "email": "contact@company.com",
      "phone": "+1 (555) 123-4567",
      "website": "https://company.com",
      "company": "Company Name",
      "industry": "Technology",
      "status": "new",
      "tags": ["enterprise", "priority"],
      "notes": "",
      "saved_at": "2026-02-27T10:30:00Z",
      "source_query": "software companies san francisco"
    }
  ]
}
```

**PUT /api/v1/bizlead/crm/leads/{lead_id}**
```
Purpose: Update lead status, notes, or tags
Request Body:
{
  "status": "qualified",
  "notes": "Demo scheduled",
  "tags": ["enterprise"]
}
Response: Updated lead object
```

**DELETE /api/v1/bizlead/crm/leads/{lead_id}**
```
Purpose: Delete a CRM lead permanently
Response:
{
  "status": "success",
  "message": "Lead deleted"
}
```

### Frontend Components

**Database Page** (`/app/dashboard/database/page.tsx`)
- Fetches 30-day temporary leads from database
- Button: "Save to CRM"
- Calls: `apiClient.post('/api/v1/bizlead/crm/save-lead', ...)`
- Shows toast on success/failure

**CRM Leads Page** (`/app/dashboard/crm/page.tsx`)
- Complete lead management interface
- Fetches from: `GET /api/v1/bizlead/crm/my-leads`
- Features:
  - Search functionality
  - Status filtering
  - Inline status updates
  - Delete with confirmation
  - Statistics card

### Data Storage

**30-Day Temporary Database** (Search Results)
```
Collection: database_leads
- Expires after 30 days automatically
- Data: Search results from Business Search
- Accessed via: `/api/v1/bizlead/database/my-leads`
- Used for: Temporary staging before CRM save
```

**Permanent CRM Database** (Permanent Storage)
```
Collection: crm_leads (MongoDB)
- Persists indefinitely until user deletes
- Data: Leads manually saved from Database page
- Accessed via: `/api/v1/bizlead/crm/my-leads`
- Includes: Status, tags, notes for CRM tracking
- Tracked: saved_at, updated_at timestamps
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BUSINESS SEARCH PAGE                                         │
│    - User searches for companies                                │
│    - Results auto-save to 30-day database                      │
│    - 30-day expiration set automatically                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. DATABASE PAGE (Temporary Storage)                            │
│    - Displays 30-day saved leads                                │
│    - User reviews company information                           │
│    - Clicks "Save to CRM" button                                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
         POST /api/v1/bizlead/crm/save-lead
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. BACKEND - CRM SAVE                                           │
│    - Receives lead data                                         │
│    - Validates subscription (free=5 max, premium=unlimited)    │
│    - Saves to MongoDB crm_leads collection                      │
│    - Returns success with lead ID                               │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND - TOAST NOTIFICATION                                │
│    - Shows: "✅ {Company} saved to CRM!"                        │
│    - Duration: 4 seconds                                        │
│    - Position: Bottom right                                     │
└─────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CRM LEADS PAGE (Permanent Storage)                           │
│    GET /api/v1/bizlead/crm/my-leads                             │
│    - Displays all permanently saved CRM leads                   │
│    - Can update status, delete, search, filter                 │
│    - Persists until manual deletion                             │
│    - View statistics: Total, Qualified, Converted              │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Highlights

✅ **Permanent Storage**: CRM leads persist indefinitely (until deleted)
✅ **Status Tracking**: New, Contacted, Qualified, Converted, Rejected
✅ **Search & Filter**: Find leads by name, email, company
✅ **Bulk Management**: Delete leads with confirmation
✅ **Toast Notifications**: User-friendly feedback
✅ **Theme Support**: Dark/Light mode colors applied
✅ **Error Handling**: Graceful error messages via toast
✅ **Pagination Ready**: API supports skip/limit for large datasets
✅ **Pricing Integration**: Free tier limited to 5 leads
✅ **Timestamps**: saved_at, updated_at for audit trail

## Testing Checklist

- [ ] Navigate to Database page
- [ ] Click "Save to CRM" on a lead
- [ ] Verify toast notification appears
- [ ] Go to CRM Leads page
- [ ] Confirm lead appears in table
- [ ] Change lead status via dropdown
- [ ] Verify status updates correctly
- [ ] Search for lead by name/email
- [ ] Filter by status
- [ ] Delete lead and confirm removal
- [ ] Check stats update correctly
- [ ] Switch between dark/light theme
- [ ] Test with multiple leads
- [ ] Verify timeout errors show toast message

## Customization Options

### Modify Statuses
Edit `statusOptions` in CRM page:
```tsx
const statusOptions = ['new', 'contacted', 'qualified', 'converted', 'rejected'];
```

### Change Toast Position
Edit `toast.success()` calls:
```tsx
position: 'bottom-right' // or 'top-right', 'center', etc.
```

### Add Pagination
Update `limit` in API call:
```tsx
const response = await apiClient.get('/api/v1/bizlead/crm/my-leads', {
  params: {
    skip: skip,      // Add pagination state
    limit: 50,       // Change from 100 to 50
  }
});
```

### Add Tags
Use existing tag endpoints:
```tsx
await apiClient.post('/api/v1/bizlead/crm/add-tag', null, {
  params: {
    lead_id: leadId,
    tag: 'priority'
  }
});
```
