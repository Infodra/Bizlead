"""
Invoice generation service with GST support.

This module provides functionality to generate and manage invoices with GST details.
"""

import os
import base64
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID

from app.models.payment import Invoice, Payment
from app.config.gst_config import (
    COMPANY_DETAILS,
    INVOICE_CONFIG,
    calculate_gst_from_paise,
    format_currency
)

# Pre-load images as base64 for embedding in invoices
_STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

def _load_image_base64(filename: str, mime: str) -> str:
    """Load an image file and return a base64 data URI."""
    filepath = os.path.join(_STATIC_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
        return f"data:{mime};base64,{encoded}"
    return ""

LOGO_DATA_URI = _load_image_base64("company_logo.png", "image/png")
SIGNATORY_DATA_URI = _load_image_base64("authorized_signatory.jpg", "image/jpeg")


def generate_invoice_number(db: Session) -> str:
    """
    Generate unique invoice number with prefix and sequential numbering.
    
    Returns:
        str: Invoice number like INV-1000, INV-1001, etc.
    """
    latest_invoice = db.query(Invoice).order_by(Invoice.id.desc()).first()
    
    if not latest_invoice:
        next_number = INVOICE_CONFIG["starting_number"]
    else:
        # Extract number from invoice and increment
        try:
            last_number = int(latest_invoice.invoice_number.split("-")[-1])
            next_number = last_number + 1
        except (ValueError, IndexError):
            next_number = INVOICE_CONFIG["starting_number"]
    
    return f"{INVOICE_CONFIG['prefix']}-{next_number}"


def create_invoice(
    db: Session,
    user_id: UUID,
    payment_id: UUID,
    subscription_id: UUID,
    amount: float,
    gst_amount: float,
    plan_name: str
) -> Invoice:
    """
    Create a new invoice with GST calculation.
    
    Args:
        db: SQLAlchemy session
        user_id: User ID
        payment_id: Payment ID
        subscription_id: Subscription ID
        amount: Base amount (before GST)
        gst_amount: GST amount
        plan_name: Plan name
    
    Returns:
        Invoice: Created invoice object
    """
    invoice_number = generate_invoice_number(db)
    total_amount = amount + gst_amount
    
    invoice = Invoice(
        user_id=user_id,
        payment_id=payment_id,
        subscription_id=subscription_id,
        invoice_number=invoice_number,
        amount=amount,
        tax_amount=gst_amount,
        total_amount=total_amount,
        status="issued",
        issued_at=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=30),
        paid_at=datetime.utcnow()  # Mark as paid immediately on payment completion
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    return invoice


def get_invoice_html(
    invoice: Invoice,
    plan_details: dict = None,
    customer_name: str = None,
    customer_email: str = None,
    customer_gstin: str = None
) -> str:
    """
    Generate HTML for invoice with GST details, company logo and authorized signatory.
    """

    gst_percentage = (invoice.tax_amount / invoice.amount * 100) if invoice.amount > 0 else 18
    address_html = COMPANY_DETAILS['address'].replace('\n', '<br>')
    hsn_sac = COMPANY_DETAILS.get('hsn_sac', '998314')
    website = COMPANY_DETAILS.get('website', 'www.infodra.ai')

    # Determine plan description
    plan_desc = "BizLead Professional Plan – Monthly Subscription"
    if plan_details and plan_details.get("plan_name"):
        pn = plan_details["plan_name"].title()
        plan_desc = f"BizLead {pn} Plan – Monthly Subscription"

    logo_img = f'<img src="{LOGO_DATA_URI}" alt="Company Logo" style="max-height:70px; max-width:220px;">' if LOGO_DATA_URI else ''
    sig_img = f'<img src="{SIGNATORY_DATA_URI}" alt="Authorized Signatory" style="max-height:60px;">' if SIGNATORY_DATA_URI else ''

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice - {invoice.invoice_number}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }}
        .invoice {{
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #ccc;
        }}
        /* Header */
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 30px;
            border-bottom: 3px solid #009db9;
        }}
        .header-left {{
            display: flex;
            align-items: center;
            gap: 18px;
        }}
        .header-right {{
            text-align: right;
        }}
        .header-right h2 {{
            color: #009db9;
            font-size: 26px;
            margin-bottom: 4px;
            letter-spacing: 2px;
        }}
        .header-right p {{
            font-size: 12px;
            color: #666;
        }}
        .company-name {{
            font-size: 22px;
            font-weight: 700;
            color: #009db9;
        }}

        /* Info section */
        .info-section {{
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }}
        .info-block h4 {{
            font-size: 11px;
            text-transform: uppercase;
            color: #009db9;
            margin-bottom: 6px;
            letter-spacing: 1px;
        }}
        .info-block p {{
            font-size: 13px;
            color: #555;
            line-height: 1.6;
        }}
        .info-block p strong {{
            color: #333;
        }}

        /* Two-column bill section */
        .bill-section {{
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            border-bottom: 1px solid #e2e8f0;
        }}
        .bill-block {{
            width: 48%;
        }}
        .bill-block h4 {{
            font-size: 11px;
            text-transform: uppercase;
            color: #009db9;
            margin-bottom: 6px;
            letter-spacing: 1px;
            border-bottom: 1px solid #009db9;
            padding-bottom: 4px;
        }}
        .bill-block p {{
            font-size: 13px;
            color: #555;
            line-height: 1.6;
        }}
        .bill-block p strong {{ color: #333; }}

        /* Items table */
        .items-table {{
            width: 100%;
            border-collapse: collapse;
        }}
        .items-table thead {{
            background: #009db9;
            color: #fff;
        }}
        .items-table th {{
            padding: 10px 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }}
        .items-table td {{
            padding: 12px;
            font-size: 13px;
            color: #555;
            border-bottom: 1px solid #e2e8f0;
        }}
        .text-right {{ text-align: right; }}
        .text-center {{ text-align: center; }}

        /* Summary */
        .summary-section {{
            display: flex;
            justify-content: flex-end;
            padding: 0 30px 20px;
        }}
        .summary {{
            width: 380px;
        }}
        .summary-row {{
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            border-bottom: 1px solid #f0f0f0;
        }}
        .summary-row .label {{ color: #666; }}
        .summary-row .value {{ color: #333; font-weight: 500; }}
        .summary-row.total {{
            margin-top: 6px;
            padding: 10px 0;
            border-top: 2px solid #009db9;
            border-bottom: 2px solid #009db9;
            font-size: 15px;
            font-weight: 700;
        }}
        .summary-row.total .value {{
            color: #009db9;
        }}

        /* Amount in words */
        .amount-words {{
            padding: 12px 30px;
            background: #f8fafc;
            font-size: 12px;
            color: #555;
            border-top: 1px solid #e2e8f0;
        }}
        .amount-words strong {{ color: #333; }}

        /* Footer */
        .footer-section {{
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 20px 30px;
            border-top: 1px solid #e2e8f0;
        }}
        .footer-left {{
            font-size: 11px;
            color: #999;
            line-height: 1.8;
        }}
        .footer-right {{
            text-align: center;
        }}
        .footer-right p {{
            font-size: 11px;
            color: #666;
            margin-top: 4px;
        }}
        .thank-you {{
            text-align: center;
            padding: 15px 30px;
            background: #009db9;
            color: #fff;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.5px;
        }}
        @media print {{
            body {{ background: #fff; padding: 0; }}
            .invoice {{ border: none; }}
        }}
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header with Logo -->
        <div class="header">
            <div class="header-left">
                {logo_img}
                <span class="company-name">{COMPANY_DETAILS['name']}</span>
            </div>
            <div class="header-right">
                <h2>TAX INVOICE</h2>
                <p>{invoice.invoice_number}</p>
            </div>
        </div>

        <!-- Company & Invoice Info -->
        <div class="info-section">
            <div class="info-block">
                <h4>From</h4>
                <p><strong>{COMPANY_DETAILS['name']}</strong></p>
                <p>{address_html}</p>
                <p><strong>GSTIN:</strong> {COMPANY_DETAILS['gst_number']}</p>
                <p><strong>Email:</strong> {COMPANY_DETAILS['email']}</p>
                <p><strong>Web:</strong> {website}</p>
            </div>
            <div class="info-block" style="text-align:right;">
                <h4>Invoice Details</h4>
                <p><strong>Invoice No:</strong> {invoice.invoice_number}</p>
                <p><strong>Date:</strong> {invoice.issued_at.strftime('%d-%m-%Y')}</p>
                <p><strong>Due Date:</strong> {invoice.due_date.strftime('%d-%m-%Y')}</p>
                <p><strong>Status:</strong> <span style="color:#28a745;font-weight:bold;">PAID</span></p>
                <p><strong>Place of Supply:</strong> Tamil Nadu (33)</p>
            </div>
        </div>

        <!-- Bill To / Ship To -->
        <div class="bill-section">
            <div class="bill-block">
                <h4>Bill To</h4>
                <p><strong>{customer_name or 'N/A'}</strong></p>
                <p>{customer_email or 'N/A'}</p>
                {'<p><strong>GSTIN:</strong> ' + customer_gstin + '</p>' if customer_gstin else ''}
            </div>
            <div class="bill-block">
                <h4>Payment Info</h4>
                <p><strong>Payment Date:</strong> {invoice.paid_at.strftime('%d-%m-%Y %H:%M') if invoice.paid_at else 'N/A'}</p>
                <p><strong>Invoice ID:</strong> {invoice.id}</p>
            </div>
        </div>

        <!-- Line Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width:5%;">#</th>
                    <th style="width:35%;">Description</th>
                    <th class="text-center" style="width:12%;">HSN/SAC</th>
                    <th class="text-center" style="width:6%;">Qty</th>
                    <th class="text-right" style="width:14%;">Unit Price</th>
                    <th class="text-right" style="width:14%;">Taxable Amt</th>
                    <th class="text-right" style="width:14%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-center">1</td>
                    <td>{plan_desc}</td>
                    <td class="text-center">{hsn_sac}</td>
                    <td class="text-center">1</td>
                    <td class="text-right">{format_currency(invoice.amount)}</td>
                    <td class="text-right">{format_currency(invoice.amount)}</td>
                    <td class="text-right">{format_currency(invoice.total_amount)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
            <div class="summary">
                <div class="summary-row">
                    <span class="label">Subtotal (Before Tax)</span>
                    <span class="value">{format_currency(invoice.amount)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">CGST @ 9%</span>
                    <span class="value">{format_currency(invoice.tax_amount / 2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">SGST @ 9%</span>
                    <span class="value">{format_currency(invoice.tax_amount / 2)}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Total Tax (GST 18%)</span>
                    <span class="value">{format_currency(invoice.tax_amount)}</span>
                </div>
                <div class="summary-row total">
                    <span class="label">TOTAL</span>
                    <span class="value">{format_currency(invoice.total_amount)}</span>
                </div>
            </div>
        </div>

        <!-- Footer with Signatory -->
        <div class="footer-section">
            <div class="footer-left">
                <p>This is a computer-generated invoice.</p>
                <p>For queries, contact: {COMPANY_DETAILS['email']}</p>
                <p>{website}</p>
            </div>
            <div class="footer-right">
                {sig_img}
                <p><strong>Authorized Signatory</strong></p>
                <p>{COMPANY_DETAILS['name']}</p>
            </div>
        </div>

        <div class="thank-you">
            Thank you for choosing BizLead!
        </div>
    </div>
</body>
</html>"""

    return html_content


def get_invoice_data(invoice: Invoice) -> dict:
    """
    Get invoice data as dictionary for API responses.
    
    Args:
        invoice: Invoice object
    
    Returns:
        dict: Invoice data
    """
    return {
        "id": str(invoice.id),
        "invoice_number": invoice.invoice_number,
        "amount": invoice.amount,
        "tax_amount": invoice.tax_amount,
        "gst_percentage": 18,
        "total_amount": invoice.total_amount,
        "status": invoice.status,
        "issued_at": invoice.issued_at.isoformat(),
        "due_date": invoice.due_date.isoformat(),
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "currency": "INR"
    }
