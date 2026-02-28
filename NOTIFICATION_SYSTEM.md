# Notification System Documentation

## Overview
A complete notification system has been implemented for BizLead allowing admins to send notifications to users whenever they update offers, plans, or important information in the database.

## System Components

### 1. Backend Implementation

#### MongoDB Collection: `bizlead_notifications`
Location: MongoDB Atlas - `bizlead_db` database

**Fields:**
- `_id` (ObjectId): Unique notification ID
- `user_id` (string): ID of the user who receives the notification
- `title` (string): Notification title (max 200 chars)
- `message` (string): Notification message (max 1000 chars)
- `notification_type` (string): Type of notification - "offer", "system", "update", "plan", or "general"
- `admin_updated_field` (optional string): Field that was updated by admin (e.g., "pricing", "features", "trial_period")
- `is_read` (boolean): Whether the user has read the notification (default: false)
- `created_at` (datetime): When the notification was created
- `updated_at` (optional datetime): When the notification was last updated

**Indexes:**
- Single index on `user_id` - for quick user-specific queries
- Single index on `is_read` - for filtering read/unread notifications
- Compound index on `(user_id, is_read)` - for optimized queries
- Descending index on `created_at` - for latest-first ordering

#### Python Model
File: `places_lead_scraper/app/models/notification.py`

**Schemas:**
- `NotificationCreate`: Request model for creating notifications
- `NotificationUpdate`: Model for updating notification status
- `NotificationResponse`: Response model with full notification details
- `NotificationListResponse`: List response with pagination metadata

#### Backend Endpoints

All endpoints require authentication via Bearer token.

**Location:** `places_lead_scraper/app/routes/protected_endpoints.py`

##### GET `/api/v1/bizlead/notifications`
Retrieves paginated list of notifications for the current user.

**Query Parameters:**
- `skip` (optional, default=0): Number of notifications to skip for pagination
- `limit` (optional, default=20): Maximum notifications to return
- `is_read` (optional): Filter by read status (true/false/null for all)

**Response:**
```json
{
  "total": 25,
  "unread_count": 5,
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "user123",
      "title": "New Offer Available",
      "message": "Check our new 50% coupon on professional plans!",
      "notification_type": "offer",
      "admin_updated_field": "pricing",
      "is_read": false,
      "created_at": "2026-02-13T10:30:00Z",
      "updated_at": null
    }
  ]
}
```

##### GET `/api/v1/bizlead/notifications/unread-count`
Gets only the count of unread notifications (lightweight endpoint for header badge update).

**Response:**
```json
{
  "unread_count": 5
}
```

##### POST `/api/v1/bizlead/notifications/{notification_id}/mark-as-read`
Marks a single notification as read.

**Parameters:**
- `notification_id` (path): MongoDB ObjectId of the notification

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

##### POST `/api/v1/bizlead/notifications/mark-all-as-read`
Marks all unread notifications as read for the current user.

**Response:**
```json
{
  "message": "All notifications marked as read",
  "updated_count": 3
}
```

##### DELETE `/api/v1/bizlead/notifications/{notification_id}`
Deletes a single notification.

**Parameters:**
- `notification_id` (path): MongoDB ObjectId of the notification

**Response:**
```json
{
  "message": "Notification deleted"
}
```

### 2. Frontend Implementation

#### Notifications Page Component
File: `frontend/app/notifications/page.tsx`

**Features:**
- Full-page notifications interface
- Empty state when no notifications exist
- Unread notification indicator (dot and badge)
- Timestamp formatting (relative time: "5m ago", "2h ago", etc.)
- Color-coded notification types with icons:
  - `offer` - Amber AlertCircle
  - `system` - Blue Info
  - `update` - Emerald CheckCircle
  - `plan` - Pink Bell
  - `general` - Gray Bell
- Mark individual notification as read
- Delete individual notification
- "Mark all as read" button (appears only when unread notifications exist)
- Responsive design (mobile and desktop friendly)

**Page Structure:**
```
├── Sticky Header
│   ├── Close button (back to dashboard)
│   ├── Title "Notifications"
│   └── "Mark all as read" button (conditional)
└── Main Content
    ├── Loading spinner (while fetching)
    ├── Empty state (when no notifications)
    └── Notification list
        ├── For each notification:
        │   ├── Icon (based on type)
        │   ├── Title & Message
        │   ├── Admin updated field (if present)
        │   ├── Time ago
        │   ├── Action buttons (Mark as read, Delete)
        │   └── Unread indicator dot
```

#### DashboardHeader Updates
File: `frontend/components/dashboard/DashboardHeader.tsx`

**Changes:**
- Import `Link` from Next.js for navigation
- Add state for `unreadCount`
- Fetch unread count on component mount
- Auto-refresh every 30 seconds
- Display unread count badge on notification bell:
  - Show red dot if unread exists
  - Show numeric badge (max "9+") for unread count
- Make notification button a link to `/notifications` page
- Real-time notification status updates

#### Notifications Page Route
- URL: `/notifications`
- Protected route (requires authentication)
- Full-page layout with close button to return to dashboard

### 3. MongoDB Configuration

File: `places_lead_scraper/app/config/mongodb.py`

**Changes Made:**
1. Added `bizlead_notifications` collection creation in `create_collections()`
2. Added notification indexes in `create_indexes()`
3. Added async function `get_notifications_collection()` getter

**Collection Auto-Creation:**
- Collections are automatically created on app startup
- Indexes are automatically created for performance optimization

---

## How to Use

### For Admin Users (Creating Notifications via MongoDB)

1. **Connect to MongoDB Atlas**
   - Go to MongoDB Atlas dashboard
   - Select the `bizlead_db` database
   - Select the `bizlead_notifications` collection

2. **Insert a Notification Document**
   ```json
   {
     "user_id": "user_id_here",
     "title": "Special Offer!",
     "message": "We've added new features to the Professional plan. Check them out!",
     "notification_type": "offer",
     "admin_updated_field": "plan_features",
     "is_read": false,
     "created_at": new Date(),
     "updated_at": null
   }
   ```

3. **User Receives Notification**
   - User sees unread notification badge on header
   - Clicking bell icon shows notifications page
   - Notification appears in the list with timestamp

### For Users

1. **Access Notifications:**
   - Click the bell icon in dashboard header
   - Or navigate to `/notifications` directly

2. **View Notifications:**
   - See timestamped list of all notifications
   - Icon and color indicate notification type
   - Admin-updated field shows what was changed

3. **Manage Notifications:**
   - Click checkmark to mark individual notification as read
   - Click X to delete a notification
   - Click "Mark all as read" button to mark all as read

---

## Notification Types Reference

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `offer` | AlertCircle | Amber | Special promotions, discounts, deals |
| `system` | Info | Blue | System updates, maintenance, general info |
| `update` | CheckCircle | Emerald | Feature launches, plan upgrades, new capabilities |
| `plan` | Bell | Pink | Plan-related changes, subscription updates |
| `general` | Bell | Gray | Generic notifications, default type |

---

## API Integration Points

### Backend to Database
- **Create Notification:** Insert document in `bizlead_notifications` collection
- **Update Notification:** Mark `is_read = true`, update `updated_at`
- **Query Notifications:** Filter by `user_id`, sort by `created_at` descending

### Frontend to Backend
- **On Mount:** Fetch unread count for header badge
- **On Notification Page Load:** Fetch all notifications with pagination
- **On Action:** Mark read/delete via POST/DELETE endpoints
- **Auto-Refresh:** Update unread count every 30 seconds

### Data Flow
```
Admin → MongoDB (inserts notification)
        ↓
User opens dashboard → Header fetches unread count
        ↓
User clicks bell → Navigates to /notifications page
        ↓
Page fetches all notifications from API
        ↓
User marks read or deletes → API updates MongoDB
```

---

## Database Schema Example

**Collection:** `bizlead_notifications`

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "user_id": "user_123_id",
  "title": "Professional Plan Features Added",
  "message": "We've added advanced analytics and custom segments to your Professional plan. Start using these powerful features today!",
  "notification_type": "update",
  "admin_updated_field": "plan_features",
  "is_read": false,
  "created_at": ISODate("2026-02-13T10:30:00.000Z"),
  "updated_at": null
}
```

---

## Error Handling

All API endpoints return appropriate HTTP status codes:
- `200 OK` - Successful operation
- `404 Not Found` - Notification not found (user unauthorized)
- `500 Internal Server Error` - Server-side error with error message

Example error response:
```json
{
  "detail": "Notification not found"
}
```

---

## Performance Optimization

1. **Indexes:** Compound index on (user_id, is_read) for fast filtering
2. **Pagination:** Default limit of 20 notifications, customizable via API
3. **Lazy Loading:** Unread count fetched separately for header
4. **Auto-Refresh:** 30-second interval prevents excessive requests
5. **Caching:** Frontend stores notifications in component state

---

## Security

- **Authentication:** All endpoints require valid JWT token
- **User Isolation:** Notifications filtered by `user_id` to prevent cross-user access
- **Data Validation:** Pydantic schemas validate all inputs
- **Authorization:** Users can only modify their own notifications

---

## Future Enhancements

1. **Real-time Updates:** WebSocket support for instant notifications
2. **Email Notifications:** Send email when admin creates notification
3. **Notification Templates:** Pre-defined templates for common scenarios
4. **Bulk Operations:** Create notifications for multiple users at once
5. **Notification Scheduling:** Schedule notifications for future delivery
6. **Analytics:** Track read rates and user engagement
7. **Push Notifications:** Mobile app push notification support

---

## Testing the System

### 1. Create Test Notification (MongoDB)
```javascript
// Insert into bizlead_notifications collection
db.bizlead_notifications.insertOne({
  "user_id": "test_user_id",
  "title": "Test Notification",
  "message": "This is a test notification",
  "notification_type": "general",
  "is_read": false,
  "created_at": new Date()
})
```

### 2. Test Endpoints with cURL
```bash
# Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/bizlead/notifications

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/bizlead/notifications/unread-count

# Mark as read
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/bizlead/notifications/{id}/mark-as-read
```

### 3. Test Frontend
1. Start frontend dev server: `npm run dev`
2. Log in to dashboard
3. Check notification bell badge
4. Click bell to open notifications page
5. Verify unread indicators and actions work

---

## Troubleshooting

**Issue: Notifications page shows "No notifications"**
- Check that notification documents are in MongoDB
- Verify `user_id` matches the logged-in user's ID
- Check browser network tab for API errors

**Issue: Unread count badge not showing**
- Ensure backend is running and accessible
- Check localStorage for valid `access_token`
- Verify CORS is configured for API requests

**Issue: API returns 404 when marking as read**
- Notification may have been deleted
- User may not be the notification owner
- ObjectId format may be incorrect

---

## Files Modified/Created

### Created Files:
1. `places_lead_scraper/app/models/notification.py` - Notification schemas
2. `frontend/app/notifications/page.tsx` - Notifications page component

### Modified Files:
1. `places_lead_scraper/app/config/mongodb.py` - Added notifications collection setup
2. `places_lead_scraper/app/routes/protected_endpoints.py` - Added 5 new notification endpoints
3. `frontend/components/dashboard/DashboardHeader.tsx` - Added notification button functionality

### Database Changes:
- New collection: `bizlead_notifications`
- New indexes for performance optimization
