# GST Implementation Guide for BizLead

## Overview

GST (Goods and Services Tax) has been integrated into the BizLead payment system for India-based transactions. This guide explains the implementation and how to use the GST features.

## Implementation Details

### GST Configuration
- **GST Rate**: 18% (standard rate for SaaS/IT Services in India)
- **File**: `places_lead_scraper/app/config/gst_config.py`
- **Currency**: INR (Indian Rupees)

### Pricing Structure (Updated)

All prices are shown as base amount + 18% GST:

#### Starter Plan
- Base Amount: ₹999
- GST (18%): ₹179.82
- **Total Amount: ₹1,178.82**

#### Professional Plan
- Base Amount: ₹2,999
- GST (18%): ₹539.82
- **Total Amount: ₹3,538.82**

#### Free Plan
- No GST applicable

## API Changes

### 1. Create Payment Order Endpoint
**POST** `/api/v1/bizlead/payments/create-order`

#### Request
```json
{
  "plan_name": "professional",
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

#### Response (Updated with GST)
```json
{
  "order_id": "order_xyz123",
  "amount": 299900,
  "gst_amount": 53982,
  "total_amount": 353882,
  "gst_percentage": 18,
  "currency": "INR",
  "plan": "professional",
  "key_id": "rzp_test_3qx3dxOIv3MxXe",
  "payment_id": "payment_uuid"
}
```

**Field Explanations:**
- `amount`: Base price in paise (₹2,999 = 299900 paise)
- `gst_amount`: 18% tax in paise (₹539.82 = 53982 paise)
- `total_amount`: Total charge in paise (amount + gst_amount)
- Razorpay will charge the `total_amount` from user's card

### 2. Get All Invoices Endpoint
**GET** `/api/v1/bizlead/payments/invoices`

#### Query Parameters
- `limit`: Number of invoices to return (default: 20)
- `skip`: Number of invoices to skip for pagination (default: 0)

#### Response
```json
[
  {
    "id": "invoice_uuid",
    "invoice_number": "INV-1000",
    "amount": 2999,
    "tax_amount": 539.82,
    "gst_percentage": 18,
    "total_amount": 3538.82,
    "currency": "INR",
    "status": "paid",
    "issued_at": "2026-02-28T10:30:00",
    "due_date": "2026-03-30T10:30:00",
    "paid_at": "2026-02-28T10:30:00"
  }
]
```

### 3. Download Invoice Endpoint
**GET** `/api/v1/bizlead/payments/invoice/{invoice_id}/download`

#### Response
- Returns HTML invoice file with GST breakdown
- File name: `INV-{invoice_number}.html`
- Contains company details, GST information, and payment details

## Invoice Generation

### Automatic Workflow
1. User initiates payment → Order created with GST calculation
2. User completes payment in Razorpay
3. Payment verified and completed
4. Invoice automatically generated with:
   - Sequential invoice number (INV-1000, INV-1001, etc.)
   - Base amount and GST breakdown
   - Total amount including GST
   - Payment date and subscription details

### Invoice Data Structure
```python
{
  "invoice_number": "INV-1000",        # Unique invoice number
  "amount": 2999,                      # Base amount (before GST)
  "tax_amount": 539.82,                # GST amount (18%)
  "total_amount": 3538.82,             # Total (amount + GST)
  "gst_percentage": 18,                # GST percentage
  "status": "issued",                  # issued, paid, overdue, cancelled
  "issued_at": "2026-02-28T10:30:00", # Invoice date
  "due_date": "2026-03-30T10:30:00",  # Payment due date
  "paid_at": "2026-02-28T10:30:00"    # Payment completion date
}
```

## Database Changes

### Payment Model Updates
New fields added to track GST:
```python
- gst_amount: Float          # GST amount in rupees
- gst_percentage: Float      # GST percentage (18%)
- total_amount: Float        # Total including GST
```

### Invoice Model
Already supports GST with fields:
```python
- amount: Float              # Base amount
- tax_amount: Float         # GST amount
- total_amount: Float       # Total including GST
```

## Frontend Integration

### Pricing Page Display
The pricing page should display:

```
┌─────────────────────────────────────┐
│       PROFESSIONAL PLAN             │
├─────────────────────────────────────┤
│ Base Price:          ₹2,999        │
│ GST (18%):          +₹539.82        │
├─────────────────────────────────────┤
│ Total Amount:        ₹3,538.82      │
└─────────────────────────────────────┘
```

### Invoice HTML Template
The invoice HTML includes:
- Company details with GST number
- Invoice number and dates
- Bill to information
- Itemized breakdown (subscription details)
- GST calculation breakdown
- Payment status (PAID)
- Tax compliance notice

## Testing

### Test Users (With Payment)

**Professional Plan User:**
- Email: `devaraj.design@gmail.com`
- Password: `Testing123`
- Plan: Professional (₹3,538.82 with GST)

**Starter Plan User:**
- Email: `Vijayalakshmi.meena@gmail.com`
- Password: `Testing123`
- Plan: Starter (₹1,178.82 with GST)

### Test Flow

1. **Create Payment Order**
   ```bash
   POST /api/v1/bizlead/payments/create-order
   {
     "plan_name": "professional",
     "email": "test@example.com",
     "full_name": "Test User"
   }
   ```

2. **Verify in Response**
   - Check `gst_amount` is 18% of base `amount`
   - Check `total_amount` = `amount` + `gst_amount`

3. **Complete Payment**
   - User pays in Razorpay (uses test card 4111111111111111)
   - Payment verified
   - Invoice automatically created

4. **Download Invoice**
   ```bash
   GET /api/v1/bizlead/payments/invoice/{invoice_id}/download
   ```

## Company Information (For Invoices)

Currently pre-configured in `app/config/gst_config.py`:
```python
COMPANY_DETAILS = {
    "name": "BizLead Technologies",
    "address": "India",
    "gst_number": "18AABCU9603R1Z5",
    "email": "billing@bizlead.com",
    "phone": "+91-XXXXXXXXXX"
}
```

**Update these values before production deployment:**
- Replace GST number with actual registered GST number
- Update company address
- Update contact email and phone

## Production Checklist

- [ ] Update GST number in `COMPANY_DETAILS`
- [ ] Configure actual Razorpay API keys
- [ ] Update company address and details
- [ ] Test complete payment flow with live Razorpay keys
- [ ] Verify invoices generate correctly
- [ ] Setup email to send invoices automatically
- [ ] Test invoice download functionality
- [ ] Verify GST calculation accuracy
- [ ] Document GST compliance for accounting
- [ ] Test refund flow with GST reversal

## GST Support Functions

### In `app/config/gst_config.py`

**calculate_gst_amount(base_amount: float) -> dict**
- Calculates GST amount from base price
- Returns: amount, gst_amount, total_amount, gst_percentage

**calculate_gst_from_paise(amount_paise: int) -> dict**
- Calculates GST from amount in paise
- Returns: paise and rupee amounts with GST breakdown

**format_currency(amount: float) -> str**
- Formats amount as Indian currency (₹)
- Example: format_currency(2999) → "₹2,999.00"

## Invoice Service Functions

### In `app/services/invoice_service.py`

**generate_invoice_number(db: Session) -> str**
- Generates unique invoice number
- Format: "INV-{sequence_number}"
- Example: "INV-1000", "INV-1001"

**create_invoice(...) -> Invoice**
- Creates invoice with GST details
- Automatically marks as paid on creation
- Stores in database

**get_invoice_html(invoice: Invoice) -> str**
- Generates HTML invoice for download
- Includes company details, GST breakdown
- Styled for printing

**get_invoice_data(invoice: Invoice) -> dict**
- Returns invoice as dictionary for API responses

## File Structure

```
places_lead_scraper/
├── app/
│   ├── config/
│   │   └── gst_config.py              # GST configuration
│   ├── models/
│   │   └── payment.py                 # Updated Payment model
│   ├── services/
│   │   ├── payment_service.py         # Updated with GST
│   │   └── invoice_service.py         # New invoice generation
│   └── routes/
│       └── payments.py                # Updated endpoints
```

## Future Enhancements

1. **Email Invoices**: Automatically email invoices after payment
2. **PDF Export**: Generate PDF invoices with better formatting
3. **Tax Reports**: Generate GST compliance reports
4. **Multiple Tax Rates**: Support different GST rates by state
5. **Invoice Customization**: Allow custom company details per invoice
6. **In-app Invoice Viewer**: Display invoices in web interface
7. **Refund GST Reversal**: Automatically reverse GST on refunds
8. **GST Summary Reports**: Monthly/annual GST calculation reports

## Support

For issues or questions about GST implementation:
1. Check this guide first
2. Review test user flows
3. Check database for invoice records
4. Verify Razorpay payment webhook responses

---

**Last Updated**: February 28, 2026
**GST Rate**: 18%
**Status**: Ready for production testing
