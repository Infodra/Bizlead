"""
GST (Goods and Services Tax) configuration for India-based transactions.

Standard GST Rate: 18% for SaaS/IT Services in India
"""

import os

# GST Configuration
GST_RATE = 0.18  # 18% standard GST rate for SaaS services in India
GST_ENABLED = True
CURRENCY = "INR"

# Company Details for Invoice
COMPANY_DETAILS = {
    "name": "Infodra Technologies Private Limited",
    "address": "Innov8 2nd Floor, RMZ Millenia Business Park, Campus 1A,\nNo 143, MGR Road, Perungudi, Chennai - 600096.",
    "gst_number": os.getenv("COMPANY_GST_NUMBER", "33AAICI3429C1ZY"),
    "email": os.getenv("COMPANY_EMAIL", "connect@infodra.ai"),
    "phone": os.getenv("COMPANY_PHONE", "+91-XXXXXXXXXX"),
    "website": "www.infodra.ai",
    "hsn_sac": "998314",
}

# Invoice configuration
INVOICE_CONFIG = {
    "prefix": "INV",
    "starting_number": 1000,
    "date_format": "%d-%m-%Y"
}


def calculate_gst_amount(base_amount: float) -> dict:
    """
    Calculate GST and total amount for a given base price.
    
    Args:
        base_amount: Price before GST (in rupees)
    
    Returns:
        dict: {
            'base_amount': float,
            'gst_amount': float,
            'total_amount': float,
            'gst_percentage': float
        }
    """
    gst_amount = base_amount * GST_RATE
    total_amount = base_amount + gst_amount
    
    return {
        'base_amount': round(base_amount, 2),
        'gst_amount': round(gst_amount, 2),
        'total_amount': round(total_amount, 2),
        'gst_percentage': GST_RATE * 100
    }


def calculate_gst_from_paise(amount_paise: int) -> dict:
    """
    Calculate GST from amount in paise.
    
    Args:
        amount_paise: Amount in paise (100 paise = 1 rupee)
    
    Returns:
        dict: GST calculation details including paise amounts
    """
    amount_rupees = amount_paise / 100
    gst_calc = calculate_gst_amount(amount_rupees)
    
    return {
        'base_amount': gst_calc['base_amount'],
        'base_amount_paise': int(gst_calc['base_amount'] * 100),
        'gst_amount': gst_calc['gst_amount'],
        'gst_amount_paise': int(gst_calc['gst_amount'] * 100),
        'total_amount': gst_calc['total_amount'],
        'total_amount_paise': int(gst_calc['total_amount'] * 100),
        'gst_percentage': gst_calc['gst_percentage']
    }


def format_currency(amount: float) -> str:
    """Format amount as Indian currency"""
    return f"₹{amount:,.2f}"
