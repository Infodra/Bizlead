# BizLead Production Testing Checklist
**Version:** v1.0 - Current Production  
**Date:** February 21, 2026  
**Status:** Ready for Testing with Real Data

---

## 📋 Overview
This document outlines comprehensive testing procedures for all user plan levels (Free, Starter, Professional) before Razorpay payment gateway integration.

---

## 🔧 Environment Setup

### Backend
```powershell
cd "c:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\AppStore\BizLead\places_lead_scraper"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
cd "c:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\AppStore\BizLead\frontend"
npm run dev
```

Access: `http://localhost:3000`  
API Docs: `http://localhost:8000/docs`

---

## 👥 Test User Accounts Setup

### Account 1: Free Plan
- **Email:** free_user@test.com
- **Password:** TestPassword123!
- **Plan:** Free (50 leads/month)
- **Features:** Basic info, Manual search
- **Status:** ⬜ Not Created

### Account 2: Starter Plan
- **Email:** starter_user@test.com
- **Password:** TestPassword123!
- **Plan:** Starter (500 leads/month)
- **Features:** Advanced filters, Email finder, CSV export
- **Status:** ⬜ Not Created

### Account 3: Professional Plan
- **Email:** pro_user@test.com
- **Password:** TestPassword123!
- **Plan:** Professional (2000+ leads/month)
- **Features:** All premium features, Analytics, API access
- **Status:** ⬜ Not Created

---

## ✅ Testing Checklist

### Phase 1: Registration & Authentication
- [ ] Register free_user@test.com successfully
  - [ ] User redirected to dashboard
  - [ ] Subscription shows "Free" with 50 leads
  - [ ] Token stored in localStorage
- [ ] Register starter_user@test.com successfully
- [ ] Register pro_user@test.com successfully
- [ ] Login with all three accounts works
- [ ] Logout clears token and localStorage
- [ ] Session persists after page refresh

### Phase 2: Dashboard Overview Tab

#### Free Plan User
- [ ] Displays correct plan name "Free"
- [ ] Shows leads usage 0/50
- [ ] Displays correct features list
- [ ] Subscription status shows "Active"
- [ ] KPI cards display correctly
- [ ] Usage chart loads without errors

#### Starter Plan User
- [ ] Displays correct plan name "Starter"
- [ ] Shows leads usage 0/500
- [ ] Displays advanced filter feature
- [ ] Usage chart shows historical data

#### Professional Plan User
- [ ] Displays correct plan name "Professional"
- [ ] Shows leads usage 0/2000+
- [ ] All premium features enabled
- [ ] Analytics available

### Phase 3: Business Search Tab (Scraper)

#### Free Plan User
- [ ] Search functionality works
- [ ] Accepts search query and maxResults
- [ ] Returns realistic mock results (name, phone, email, address)
- [ ] maxResults parameter respected (request 10 → get 10)
- [ ] Download CSV button visible ✅ FIXED
- [ ] Results count updates after search
- [ ] Search updates usage counter (0 → 5, if searched 5 leads)

#### Starter Plan User
- [ ] Same functionality as Free
- [ ] Can search with advanced filters
- [ ] Email finder works
- [ ] More search attempts allowed than Free plan

#### Professional Plan User
- [ ] All search features available
- [ ] No search limitations
- [ ] Analytics available on results
- [ ] API access features visible

### Phase 4: Save Results Flow

#### For All Users
- [ ] Click "Save Results" on any lead
  - [ ] SaveLeadModal opens
  - [ ] Can select leads to save
  - [ ] "Save to Database" button works
  - [ ] Toast notification confirms save
- [ ] Results are stored in backend database
- [ ] Verify in Database tab

### Phase 5: Database Tab

#### Free Plan User
- [ ] Database tab loads without errors
- [ ] Initially shows no saved leads
- [ ] After saving results from search:
  - [ ] Saved leads appear in list
  - [ ] Correct count displayed
  - [ ] Lead details match saved data
- [ ] Can search/filter saved leads
- [ ] Usage counter updates (reflects saved leads)

#### Starter Plan User
- [ ] Can save up to 500 leads total
- [ ] Database displays all saved leads
- [ ] Can export saved leads as CSV

#### Professional Plan User
- [ ] Unlimited saved leads
- [ ] Full database management features
- [ ] Advanced filtering and analytics

### Phase 6: Plan Upgrade Flow

#### Scenario 1: Free User Approaching Limit
- [ ] User has 45/50 leads used
- [ ] Search returns warning: "5 searches remaining in this month"
- [ ] "Upgrade Plan" button visible and clickable
- [ ] Clicking upgrade shows available plans (Starter, Professional)

#### Scenario 2: Upgrade Modal
- [ ] Shows comparison table: Free vs Starter vs Professional
- [ ] Click on "Upgrade to Starter" 
  - [ ] Modal opens for plan selection
  - [ ] Plan details displayed
  - [ ] CTA button ready for payment

#### Scenario 3: After Upgrade
- [ ] Plan changes immediately in dashboard
- [ ] Usage counter resets for new month
- [ ] New features become available

### Phase 7: Notifications System

#### All Users
- [ ] Notifications bell icon in header
- [ ] Unread count displays correctly
- [ ] Click bell to open NotificationsModal
- [ ] Mark notifications as read
- [ ] Delete notifications
- [ ] "Mark All as Read" works
- [ ] Notifications persist after page refresh

#### Notification Types to Test
- [ ] Plan upgrade confirmation
- [ ] Usage limit warnings
- [ ] Monthly limit reset notifications
- [ ] Payment confirmations (after Razorpay)

### Phase 8: CSV Export

#### Free Plan User
- [ ] Click "Download CSV" on search results
- [ ] File downloads as `.csv`
- [ ] Contains correct columns: name, phone, email, address, website
- [ ] All saved results exported

#### Other Plans
- [ ] CSV export works for saved leads
- [ ] File contains all lead data

### Phase 9: Responsive Design

#### Mobile View (375px width)
- [ ] Sidebar responds to hamburger menu
- [ ] Search form inputs accessible
- [ ] Results table scrollable
- [ ] Modal displays correctly
- [ ] Buttons clickable and properly sized

#### Tablet View (768px width)
- [ ] Layout adjusts properly
- [ ] All features accessible

#### Desktop View (1920px width)
- [ ] Dashboard displays fully
- [ ] Charts and tables render correctly

### Phase 10: Error Handling

- [ ] Network error (backend down): Shows toast notification
- [ ] Invalid search query: Shows validation message
- [ ] Expired token: Redirects to login
- [ ] Missing required fields: Shows form validation
- [ ] Database errors: Shows user-friendly error message

### Phase 11: Performance & Speed

- [ ] Dashboard loads within 2 seconds
- [ ] Search results return within 3 seconds
- [ ] CSV download completes within 5 seconds
- [ ] No console errors (check browser DevTools)
- [ ] No memory leaks (monitor DevTools Performance tab)

---

## 📊 Test Results Summary

| Feature | Free | Starter | Professional | Status |
|---------|------|---------|--------------|--------|
| Registration | ✅ | ✅ | ✅ | ⬜ |
| Login | ✅ | ✅ | ✅ | ⬜ |
| Dashboard Overview | ✅ | ✅ | ✅ | ⬜ |
| Search Results | ✅ | ✅ | ✅ | ⬜ |
| Save Leads | ✅ | ✅ | ✅ | ⬜ |
| Database Tab | ✅ | ✅ | ✅ | ⬜ |
| Plan Upgrade | ✅ | ✅ | ✅ | ⬜ |
| Notifications | ✅ | ✅ | ✅ | ⬜ |
| CSV Export | ✅ | ✅ | ✅ | ⬜ |
| Error Handling | ✅ | ✅ | ✅ | ⬜ |

---

## 🚀 Next Step: Razorpay Integration

**Due:** After all testing is complete

### What Will Be Added:
1. **Payment Gateway Integration**
   - Razorpay account setup
   - API key configuration
   
2. **Payment Flow**
   - When user clicks "Upgrade to Starter" or "Professional"
   - Razorpay payment modal opens
   - User enters card/UPI details
   - Payment processing
   - Confirmation and plan activation

3. **Backend Changes**
   - Payment verification endpoint
   - Order creation for Razorpay
   - Subscription activation after payment

4. **Frontend Changes**
   - Razorpay script integration
   - Payment modal component
   - Success/failure handling

---

## ⚠️ Known Issues (Production Version v1.0)

None identified - Ready for production testing!

---

## 📝 Notes

- **Backend Status:** Real API endpoints ready
- **Database:** MongoDB configured and connected
- **Mock Data:** Disabled for production (using real data only)
- **Payment Gateway:** Ready for Razorpay integration after testing

---

## 🎯 Sign-Off

### Testing Coordinator: _________________
### Date: _________________
### Overall Result: ⬜ PENDING / ✅ PASSED / ❌ FAILED

---

**Once all tests pass, proceed to Razorpay Integration Phase**
