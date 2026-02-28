# Phase 8 Testing Guide - Database-Based Deduplication Workflow

## Overview
Phase 8 restructures the search and deduplication workflow to use `bizlead_database_leads` collection as the primary source of truth for deduplication. This enables smarter filtering and prevents showing duplicate results across searches.

## Changes Made

### Frontend Changes (dashboard/page.tsx)

#### 1. **Empty State Message Update**
- **Location**: Search results empty state
- **Old Message**: "All companies already saved. All companies from your previous search for 'query'..."
- **New Message**: "All leads already in your database. All companies returned from this search are already in your database"
- **Clearer Explanation**: Notes that system automatically filters out duplicate leads
- **Benefit**: More intuitive - explains what's happening without confusing "previous search" terminology

**Code Change**:
```tsx
// Shows "All leads already in your database" instead of "All companies already saved"
{duplicateCount > 0 ? (
  <>
    <p className="text-slate-600 font-medium mb-1">All leads already in your database</p>
    <p className="text-sm text-slate-500">
      All {duplicateCount} compan{duplicateCount === 1 ? 'y' : 'ies'} returned from this search are already in your database
    </p>
  </>
)}
```

#### 2. **Save Response Handling**
- **Location**: `handleScrape` function, after save API call
- **Old Behavior**: Called `saveResponse` endpoint, didn't use response data
- **New Behavior**: Captures `leads_saved` count from response and shows in toast
- **Benefit**: Users see confirmation of how many leads were actually saved to database

**Code Change**:
```tsx
const saveResponse = await apiClient.post('/api/v1/bizlead/scraper/save-results', {
  query: searchQuery.trim(),
  leads: validLeads,
});

const leadsSaved = saveResponse.data.leads_saved || validLeads.length;
toast.success(`Saved ${leadsSaved} lead${leadsSaved !== 1 ? 's' : ''} to database`);
```

### Backend Changes (protected_endpoints.py)

#### 1. **scraper_search Endpoint - Deduplication Logic**
- **Change**: Query source changed from `search_results_collection` to `bizlead_database_leads`
- **Purpose**: Use permanent database as source of truth instead of search history

**Before**:
```python
# OLD: Checked against specific search history
previous_searches = await search_results_collection.find({
    "user_id": user_id_str,
    "query": request.query
}).to_list(None)
```

**After**:
```python
# NEW: Check against all active leads in user's database
database_leads_collection = await get_database_leads_collection()
active_leads = await database_leads_collection.find({
    "user_id": user_id_str,
    "expires_at": {"$gt": datetime.utcnow()}
}).to_list(None)
```

#### 2. **save_search_results Endpoint - Storage Strategy**
- **Change**: Saves individual leads instead of batch search record
- **Purpose**: Enables flexible lead management and proper deduplication
- **Metadata**: Each lead stores: user_id, query, name, email, phone, website, address, created_at, expires_at (30 days TTL), status

**Before**:
```python
# OLD: Saved entire search as single document
search_record = {
    "user_id": user_id_str,
    "query": request.query,
    "leads": request.leads,
    "saved_at": datetime.utcnow()
}
```

**After**:
```python
# NEW: Save each lead individually with metadata
for lead in request.leads:
    lead_doc = {
        "user_id": user_id_str,
        "query": request.query,  # Which search lead came from
        "name": lead.get("name"),
        "email": lead.get("email", "").lower(),
        "phone": lead.get("phone"),
        "website": lead.get("website"),
        "address": lead.get("address"),
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30),
        "status": "search_result"
    }
    await database_leads_collection.insert_one(lead_doc)
```

**Response Change**:
```python
# OLD: Returned result_id
return {"status": "success", "result_id": str(result.inserted_id)}

# NEW: Returns count of saved leads
return {
    "status": "success",
    "message": "Search results saved successfully",
    "leads_saved": leads_saved  # Count of individual leads saved
}
```

## User Workflow (As Implemented)

### Scenario 1: First-Time Search
1. User searches for "manufacturing company in bangalore"
2. API calls from user's database check: finds 0 existing leads
3. Returns ALL results from Google Places API
4. Toast shows: "Found 25 new leads"
5. User clicks "Save All"
6. All 25 leads saved to `bizlead_database_leads` with 30-day TTL

**Expected Result**: ✅ Shows all 25 leads, 0 duplicates

### Scenario 2: Second Search - Same Query
1. User searches for "manufacturing company in bangalore" again
2. API checks: finds 25 existing leads from previous search
3. Google Places API returns same/similar 25 leads
4. API filters them: 0 new leads (all 25 are duplicates)
5. Shows empty state: "All leads already in your database"

**Expected Result**: ✅ Shows empty state with duplicate message

### Scenario 3: Second Search - Different Query
1. User searches for "engineering company in bengaluru"
2. API checks: finds 0 existing leads for this keyword
3. Google Places API returns 30 leads
4. Returns 30 new leads (none match previous "manufacturing" leads)
5. User sees all 30 results

**Expected Result**: ✅ Shows all 30 leads, 0 duplicates

### Scenario 4: Search After Some Leads Expired
1. User searches for "manufacturing company in bangalore" after 20 days
2. API checks database: finds 15 active leads (10 expired/deleted)
3. Google Places API returns 25 leads
4. Filters out 15 duplicates
5. Returns 10 new leads

**Expected Result**: ✅ Shows 10 new leads, 15 duplicates filtered

## Testing Steps

### Prerequisites
- Backend running on localhost:8000 with hot-reload
- Frontend running on localhost:3000 with hot-reload
- MongoDB running with `bizlead_database_leads` collection

### Test 1: First-Time Search
```
1. Go to http://localhost:3000/dashboard
2. Login with test account
3. Enter search: "manufacturing company in bangalore"
4. Click "Scrape Leads"
5. Observe:
   - Toast: "Found X new leads"
   - Results table shows leads
   - No "All leads already in your database" message
   - "Save All" button enabled
```

**Expected**: ✅ Shows all results, no deduplication message

---

### Test 2: Save Results
```
1. After Test 1 completes:
2. Click "Save All" button
3. Observe:
   - Toast: "Saved X lead(s) to database"
   - Dashboard updates (usage stats increase)
   - Results remain visible in Search tab
```

**Expected**: ✅ Toast confirms save, usage stats update

---

### Test 3: Duplicate Detection (Same Query)
```
1. Stay on same page
2. Click search again with SAME query: "manufacturing company in bangalore"
3. Wait for results
4. Observe:
   - Empty results table
   - Empty state message: "All leads already in your database"
   - Shows duplicate count: "All 20 companies returned from this search..."
   - "Save All" button disabled (no new results)
```

**Expected**: ✅ Shows deduplication message, no new leads

---

### Test 4: Different Search Query
```
1. Change search: "software company in bangalore"
2. Click "Scrape Leads"
3. Observe:
   - Toast: "Found Y new leads"
   - Results table shows new companies (different from manufacturing search)
   - No deduplication message (or shows 0 duplicates)
```

**Expected**: ✅ Shows all new results, no overlap with previous search

---

### Test 5: Database Page Integration
```
1. Click "Database" tab
2. Observe:
   - Shows leads from both searches
   - Properly deduplicated (no duplicates in list)
   - Shows all leads from both "manufacturing" and "software" searches
3. Verify count matches saved leads from both searches
```

**Expected**: ✅ Database tab shows all leads from both searches, properly deduplicated

---

### Test 6: Dashboard Stats
```
1. Navigate to main Dashboard (header)
2. Observe "Leads Used" statistic
3. Should show count of:
   - All active leads from database_leads collection
   - Plus CRM leads (if any)
4. Should update after saves
```

**Expected**: ✅ Stats show total of database + CRM leads

---

## Debugging

### If Test 1 Shows Duplicates When It Should Show All
**Problem**: First search is filtering out leads incorrectly
**Check**:
1. Verify `bizlead_database_leads` collection is empty for this user
2. Check MongoDB logs for query errors
3. Verify `get_lead_identifier()` function is working
4. Check browser console for API errors

**Fix**:
```bash
# Clear test user's leads
# In MongoDB shell:
db.bizlead_database_leads.deleteMany({user_id: "test_user_id"})
```

---

### If Test 3 Shows Results When It Should Show Duplicates
**Problem**: Deduplication not working for same query
**Check**:
1. Verify leads were actually saved to `bizlead_database_leads`
2. Check TTL index exists on collection
3. Verify `get_lead_identifier()` returns same value for same lead
4. Check if API is returning different lead data on second search

**Fix**:
```python
# Verify in protected_endpoints.py:
# get_lead_identifier() should return consistent values
# Email: "email:john@example.com"
# Phone: "phone:9876543210-company"
# Address: "address:bangalore-company"
```

---

### If Test 4 Shows Duplicates From Different Searches
**Problem**: Deduplication too aggressive
**Solution**: This is OK! If two different searches return the same company (e.g., "manufacturing" finds ABC Corp, "engineering" also finds ABC Corp), they should both be deduplicated. The database stores by query, so you can see both search contexts.

---

## Response Format Reference

### GET /api/v1/bizlead/scraper/search
```json
{
  "status": "success",
  "query": "manufacturing company in bangalore",
  "results_count": 20,
  "new_leads_count": 20,
  "duplicate_count": 0,
  "total_api_results": 20,
  "leads": [
    {
      "id": "...",
      "name": "Company Name",
      "email": "contact@company.com",
      "phone": "+91987654321",
      "website": "company.com",
      "address": "Address"
    }
  ],
  "message": "Found 20 leads from Google Places"
}
```

### POST /api/v1/bizlead/scraper/save-results
**Request**:
```json
{
  "query": "manufacturing company in bangalore",
  "leads": [
    {
      "id": "...",
      "name": "Company Name",
      "email": "contact@company.com",
      "phone": "+91987654321",
      "website": "company.com",
      "address": "Address"
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Search results saved successfully",
  "leads_saved": 20
}
```

## Collection Structure

### bizlead_database_leads
```javascript
{
  _id: ObjectId("..."),
  user_id: "user123",
  query: "manufacturing company in bangalore",  // Source search
  name: "Company Name",
  email: "contact@company.com",  // Lowercase, normalized
  phone: "+91987654321",
  website: "company.com",
  address: "Address, City, Country",
  id: "google_places_id",  // Original API ID
  created_at: ISODate("2024-..."),
  expires_at: ISODate("2024-...+30days"),  // Auto-delete after 30 days
  status: "search_result"  // Mark as from search
}
```

**Important**: TTL index on `expires_at` field enables automatic cleanup:
```bash
# MongoDB shell:
db.bizlead_database_leads.createIndex(
  { "expires_at": 1 },
  { expireAfterSeconds: 0 }
)
```

## Expected to Work

✅ First search shows all new results  
✅ Second search same query shows deduplication  
✅ Third search different query shows all new results  
✅ Save response includes count of leads saved  
✅ Front-end toast shows save confirmation with count  
✅ Empty state message clarifies automatic filtering  
✅ Dashboard statistics update after save  
✅ Database page shows accumulated leads from multiple searches  

## Migration Complete ✅

The system is now using `bizlead_database_leads` as the permanent storage for search results with automatic 30-day TTL. This replaces the deprecated `search_results_collection` approach and enables cleaner lead management and deduplication.
