**CONTACT FORM TROUBLESHOOTING & TESTING GUIDE**

## Quick Start to Test Contact Form

### 1. **Start the Backend Server**
```bash
cd "c:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\AppStore\BizLead\places_lead_scraper"
python -m app.main
```

**Expected output in terminal:**
```
✅ Application started successfully
✓ Connected to MongoDB successfully
✓ Created 'bizlead_messages' collection
✓ Created index on messages.email
✓ Created index on messages.status
✓ Created index on messages.created_at
```

If you see these messages, MongoDB is connected ✅

### 2. **Start the Frontend Server** (in a NEW terminal)
```bash
cd "c:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\AppStore\BizLead\frontend"
npm run dev
```

### 3. **Test the Contact Form**
- Go to: `http://localhost:3000/contact`
- Fill out the form with sample data:
  - Name: John Doe
  - Email: john@example.com
  - Phone: +1-555-0123
  - Product: Email Finder (or any option)
  - Message: "Test message from contact form"
- Click "Send Message"

### 4. **Expected Behavior**

**If everything works:**
✅ Success modal appears with:
- Green checkmark icon
- "Message Sent!" heading
- Message ID (unique MongoDB document ID)
- Name and email confirmation
- Auto-closes after 5 seconds

**Browser Console Output:**
```
✅ Message submitted successfully with ID: 507f1f77bcf86cd799439011
```

**Backend Terminal Output:**
```
📨 Receiving contact message from john@example.com...
✓ MongoDB collection connected: bizlead_messages
📝 Message document prepared: {...}
✅ Contact message saved successfully to MongoDB - ID: 507f1f77bcf86cd799439011
```

### 5. **Check MongoDB Data**

Use MongoDB Compass or Atlas UI to verify:

1. Database: `bizlead`
2. Collection: `bizlead_messages`
3. Documents should contain:
   - `name`: "John Doe"
   - `email`: "john@example.com"
   - `phone`: "+1-555-0123"
   - `message`: "Test message..."
   - `status`: "new"
   - `created_at`: timestamp
   - `_id`: MongoDB ObjectId

---

## Troubleshooting

### **Issue 1: "Failed to send message" error**

**Possible Cause 1: Backend not running**
- Check if you started backend with `python -m app.main`
- Verify terminal shows "✅ Application started successfully"

**Possible Cause 2: MongoDB not connected**
- Check if .env has correct MONGODB_URL
- Current value should be: `mongodb+srv://Dev:Testing123@infodra.mhgyzyc.mongodb.net/?appName=Infodra`
- Your internet connection is working
- MongoDB Atlas account is active and user credentials are correct

**Possible Cause 3: CORS issue**
- Frontend must make request to: `http://localhost:8000/api/v1/contact/messages`
- Backend must allow CORS from: `http://localhost:3000`
- Check backend .env: `CORS_ORIGINS=http://localhost:3000`

**Fix Steps:**
1. Kill all Node processes: `taskkill /F /IM node.exe`
2. Stop backend (Ctrl+C in backend terminal)
3. Check all .env values are correct
4. Restart backend
5. Wait 2-3 seconds for MongoDB to connect
6. Refresh frontend and try again

### **Issue 2: Form submits but data not in MongoDB**

**Check Backend Logs:**
Look for error messages that say:
- `❌ Error saving contact message: ...`
- `❌ MongoDB connection failed: ...`

**Common MongoDB Errors:**
- `Authentication failed` → Credentials are wrong
- `Cannot find server at infodra.mhgyzyc.mongodb.net` → Network issue
- `No suitable servers found` → MongoDB service might be down

**Verify MongoDB Connection:**
```powershell
# Test MongoDB URL directly
python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    client = AsyncIOMotorClient('mongodb+srv://Dev:Testing123@infodra.mhgyzyc.mongodb.net/?appName=Infodra')
    try:
        await client.admin.command('ping')
        print('✅ MongoDB connection successful!')
    except Exception as e:
        print(f'❌ MongoDB connection failed: {e}')

asyncio.run(test())
```

### **Issue 3: Success modal doesn't appear but no error**

**Check:**
- Open browser Developer Tools (F12)
- Go to Network tab
- Submit the form again
- Look for the request to `/api/v1/contact/messages`
- Check the response:
  - Should be status `201`
  - Should contain `message_id` field

If response is `500` or missing fields, check backend logs

---

## API Testing with Curl

Test the endpoint directly:

```bash
curl -X POST http://localhost:8000/api/v1/contact/messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1-555-0123",
    "product": "Email Finder",
    "message": "This is a test message"
  }'
```

Expected response:
```json
{
  "status": "success",
  "message_id": "507f1f77bcf86cd799439011",
  "received_at": "2026-02-13T10:30:00.123456",
  "message": "Thank you for reaching out! We'll get back to you within 24 hours."
}
```

---

## Files Modified

1. **Backend Endpoint:** `places_lead_scraper/app/routes/contact.py`
   - Enhanced logging for debugging
   
2. **Frontend Form:** `frontend/app/contact/page.tsx`
   - Added success modal with message ID display
   - Improved error handling
   - Form auto-clears after submission

3. **MongoDB Config:** `places_lead_scraper/app/config/mongodb.py`
   - Messages collection and indexes set up

4. **Backend Main:** `places_lead_scraper/app/main.py`
   - Contact router registered

---

## Next Steps After Verification

Once data is saving to MongoDB:

1. **Admin Dashboard:** View messages at admin panel
2. **Email Notifications:** Set up email when new message arrives
3. **Auto-Reply:** Send confirmation email to user with Message ID
4. **Mark as Read:** Admin can mark messages as read/replied

All these features are ready in the backend routes!
