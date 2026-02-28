# Smart Auto-Expansion Feature - Search Results

## Overview
When searching for leads returns all duplicates, the system now automatically expands the search to fetch MORE results from Google Places API, filters them, and returns new leads.

## How It Works

### Scenario: "manufacturing company in coimbatore"

**First Search (User Request)**
```
Query: "manufacturing company in coimbatore"
Max Results: 5
```

**Backend Process:**
1. Fetches 5 results from Google Places API
2. Filters against user's database → 5 duplicates found
3. **Triggers Auto-Expansion** since all results are duplicates
4. Fetches 20 results (4x expansion)
5. Filters new 15 results → 8 duplicates, 7 new leads
6. Returns 5 new leads (up to max_results limit)

**User Response:**
```json
{
  "status": "success",
  "leads": [7 new companies],
  "new_leads_count": 7,
  "duplicate_count": 13,
  "total_api_results": 20,
  "expansion_rounds": 1,
  "message": "Found 7 new leads (searched 20 total results, 1 expansion round)"
}
```

## Smart Expansion Logic

### Algorithm
1. **Initial Fetch**: Request `max_results` from API
2. **First Filter**: Check against user's database
3. **Expansion Trigger**: If `new_leads < max_results` AND still have budget
4. **Expanded Fetch**: Request `max_results * 3` (or more based on round)
5. **Continue**: Keep fetching until:
   - We have `max_results` new leads, OR
   - We hit max 5 expansion rounds, OR
   - We reach 200 total results checked, OR
   - API returns no more results

### Configuration
```python
max_results = min(request.max_results, 100)  # User request capped at 100
max_expansion_rounds = 5                      # Max expansion attempts
total_api_limit = 200                         # Max results to fetch total
```

### Expansion Rounds Scaling
- **Round 0** (Initial): Fetch `max_results` (e.g., 5)
- **Round 1** (Auto-Expand): Fetch `max_results * 3` (e.g., 15)
- **Round 2**: Fetch `max_results * 4` (e.g., 20)
- **Round 3**: Fetch `max_results * 5` (e.g., 25)
- **Round 4**: Fetch up to 200 total results

## Example Workflows

### Scenario 1: New Search with New Query
```
User searches: "manufacturing company in coimbatore" (first time)
↓
No duplicates in database
↓
Result: 5 leads found
Message: "Found 5 new leads"
Toast: "✓ Found 5 new leads"
```

### Scenario 2: Same Query - All Duplicates
```
User searches: "manufacturing company in coimbatore" (second time)
↓
All 5 initial results are duplicates
↓
Auto-Expansion Triggered (Round 1)
↓
Fetches 15 more results
↓
Filters: 8 duplicates, 7 new leads
↓
Result: 5 new leads (capped at max_results)
Message: "Found 5 new leads (searched 20 total results, 1 expansion round)"
Toast: "✓ Found 5 new leads"
```

### Scenario 3: Partial Duplicates
```
Result: 2 duplicates, 3 new leads
↓
Need 2 more to reach max_results=5
↓
Auto-Expansion Triggered
↓
Search continues until finds 2 more new leads
↓
Now has 5 new leads total
```

### Scenario 4: No More Results Available
```
Fetched: 50 results
Duplicates: 47
New leads: 3
↓
Auto-Expansion Triggered
↓
API returns 0 new results
↓
Expansion stops
↓
Result: 3 new leads
Message: "Found 3 new leads (searched 50 total results, 2 expansion rounds)"
```

## API Response Format

### Successful Expansion
```json
{
  "status": "success",
  "query": "manufacturing company in coimbatore",
  "new_leads_count": 5,
  "duplicate_count": 15,
  "total_api_results": 20,
  "expansion_rounds": 1,
  "leads": [
    {
      "name": "Company Name",
      "email": "contact@company.com",
      "phone": "+91987654321",
      "website": "company.com",
      "address": "Address, City"
    }
  ],
  "message": "Found 5 new leads (searched 20 total results, 1 expansion round)"
}
```

### No Expansion Needed
```json
{
  "status": "success",
  "query": "engineering company in bangalore",
  "new_leads_count": 5,
  "duplicate_count": 0,
  "total_api_results": 5,
  "expansion_rounds": 0,
  "leads": [...],
  "message": "Found 5 new leads"
}
```

## Performance Considerations

### When Expansion Helps
✅ User searches same query repeatedly  
✅ Limited results from API initial request  
✅ User has saved many leads already  
✅ Want consistent result count (always get max_results)  

### When Expansion Stops
⏹️ Found enough new leads  
⏹️ Hit max 5 expansion rounds  
⏹️ Checked 200+ results total  
⏹️ API returns no more results  

## Frontend Changes

The frontend now also displays expansion information in the success toast:

```tsx
// Before
"Found 5 new leads"

// After (with expansion)
"Found 5 new leads (searched 20 total results, 1 expansion round)"
```

## Benefits

| Benefit | Impact |
|---------|--------|
| **Consistency** | Always try to return `max_results` new leads |
| **No Surprises** | User doesn't see empty results when more exist |
| **Smart Filtering** | Doesn't agggressively fetch everything, stops when target met |
| **Transparency** | Shows how many results were searched and how many rounds |
| **Efficient API Usage** | Stops early when goal achieved, doesn't max-out API calls |

## Testing the Feature

### Test Case 1: First Time Ever
```
1. Search: "manufacturing company in coimbatore"
2. Expected: Shows 5 results, no expansion
3. Verify: expansion_rounds = 0
```

### Test Case 2: Duplicate Detection
```
1. Search same query again
2. Expected: Auto-expansion triggered
3. Verify: Says "searched X total results, 1 expansion round"
4. Should show 5 new companies (different from first search)
```

### Test Case 3: Different Query  
```
1. Search: "software company in coimbatore"
2. Expected: Shows 5 results (different from manufacturing)
3. Verify: No expansion needed (expansion_rounds = 0)
```

## API Efficiency

### Before Smart Expansion
- Search returns 5 results, all duplicates
- User gets 0 leads
- User must manually search again with different keywords

### After Smart Expansion  
- Search returns 5 results, all duplicates
- System auto-fetches 15 more results
- Finds 7 new leads, returns 5 to user
- User gets results without changing query

This ensures users always get maximum value from each search while respecting API limits!
