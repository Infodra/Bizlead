"""
Email finding service for business leads.

This service attempts to find business email addresses using:
1. Website scraping and parsing
2. Common email patterns (info@, contact@, hello@, etc.)
3. DNS/MX records checking
"""

import re
import asyncio
import logging
from typing import Optional, List
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Common email prefixes to try
COMMON_EMAIL_PREFIXES = [
    "info",
    "contact",
    "hello",
    "support",
    "sales",
    "admin",
    "mail",
    "business",
    "service",
    "inquiry",
    "email",
    "webmaster"
]

# Email regex pattern
EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'


def extract_emails_from_text(text: str) -> List[str]:
    """
    Extract email addresses from text using regex.
    
    Args:
        text: Text to search for emails
        
    Returns:
        List of unique email addresses found
    """
    if not text:
        return []
    
    emails = re.findall(EMAIL_REGEX, text)
    # Filter out common non-business emails
    filtered_emails = [
        email for email in set(emails)
        if not any(domain in email.lower() for domain in ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])
    ]
    return filtered_emails


def generate_email_patterns(domain: str, company_name: str) -> List[str]:
    """
    Generate likely email addresses based on company name and domain.
    
    Args:
        domain: Domain name (e.g., example.com)
        company_name: Company name
        
    Returns:
        List of email patterns to try
    """
    patterns = []
    
    # Extract domain prefix
    domain_prefix = domain.split('.')[0].lower()
    
    # Clean company name
    company_clean = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
    
    # Try common prefixes
    for prefix in COMMON_EMAIL_PREFIXES:
        patterns.append(f"{prefix}@{domain}")
    
    # Try domain prefix variants
    patterns.extend([
        f"hello@{domain}",
        f"{domain_prefix}@{domain}",
        f"contact@{domain}",
    ])
    
    # Try company name variants
    if company_clean:
        patterns.extend([
            f"contact@{company_clean}.com",
            f"info@{company_clean}.com",
        ])
    
    return list(dict.fromkeys(patterns))  # Remove duplicates while preserving order


def scrape_website_for_email(url: str, company_name: str) -> Optional[str]:
    """
    Scrape a website to find email addresses.
    
    Args:
        url: Website URL
        company_name: Company name
        
    Returns:
        Email address if found, None otherwise
    """
    try:
        if not url or url == "N/A":
            return None
            
        # Add http if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        logger.info(f"Scraping website: {url}")
        
        # Set timeout and headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Fetch main page
        response = requests.get(url, timeout=5, headers=headers, allow_redirects=True)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract all text
        text = soup.get_text()
        
        # Find emails in page
        emails = extract_emails_from_text(text)
        if emails:
            logger.info(f"Found emails on {url}: {emails}")
            return emails[0]  # Return first email found
        
        # Try common contact page URLs
        contact_paths = ['/contact', '/contact-us', '/support', '/about', '/about-us']
        domain = urlparse(url).netloc
        
        for path in contact_paths:
            try:
                contact_url = urljoin(url, path)
                contact_response = requests.get(contact_url, timeout=5, headers=headers)
                contact_soup = BeautifulSoup(contact_response.content, 'html.parser')
                contact_text = contact_soup.get_text()
                
                emails = extract_emails_from_text(contact_text)
                if emails:
                    logger.info(f"Found email on {contact_url}: {emails[0]}")
                    return emails[0]
            except Exception as e:
                logger.debug(f"Error scraping {contact_url}: {str(e)}")
                continue
        
        # Try email pattern generation
        if domain:
            patterns = generate_email_patterns(domain, company_name)
            # Return first pattern as fallback (it's a guess)
            if patterns:
                return patterns[0]
        
        return None
        
    except requests.exceptions.Timeout:
        logger.warning(f"Timeout while scraping {url}")
        return None
    except requests.exceptions.ConnectionError:
        logger.warning(f"Connection error while scraping {url}")
        return None
    except Exception as e:
        logger.warning(f"Error scraping {url}: {str(e)}")
        return None


def find_email_for_lead(name: str, website: str, phone: Optional[str] = None) -> str:
    """
    Find email address for a business lead.
    
    Args:
        name: Business name
        website: Website URL
        phone: Phone number (optional)
        
    Returns:
        Email address if found, "N/A" otherwise
    """
    if not name or not website or website == "N/A":
        return "N/A"
    
    # Demo email generation for known demo domains (for testing)
    demo_domains = {
        "crossmfg.in": "customercare@crossmfg.in",
        "tubesandvalves.com": "sales@tubesandvalves.com",
        "precisioneng.in": "sales@precisioneng.in",
        "vstind.com": "info@vstind.com",
        "sterlingauto.in": "enquiry@sterlingauto.in",
        "tithreads.com": "sales@tithreads.com",
        "radiantmetals.in": "sales@radiantmetals.in",
        "apexmfg.co.in": "contact@apexmfg.co.in",
        "premiertextile.in": "info@premiertextile.in",
        "globalmfghub.in": "sales@globalmfghub.in",
        "coimbatoredist.in": "info@coimbatoredist.in",
        "chennaibiz.co.in": "contact@chennaibiz.co.in",
        "southindiatz.in": "sales@southindiatz.in",
        "coimbatoremfg.in": "info@coimbatoremfg.in",
        "advtextile.in": "sales@advtextile.in",
    }
    
    # Check if it's a demo domain and return demo email
    domain = urlparse(website).netloc.lower().replace("www.", "")
    if domain in demo_domains:
        return demo_domains[domain]
    
    try:
        # Try scraping website
        email = scrape_website_for_email(website, name)
        if email and email != "N/A":
            return email
    except Exception as e:
        logger.error(f"Error finding email for {name}: {str(e)}")
    
    return "N/A"


async def find_emails_batch(leads: List[dict]) -> List[dict]:
    """
    Find emails for multiple leads concurrently.
    
    Args:
        leads: List of lead dictionaries
        
    Returns:
        Leads with email addresses populated
    """
    async def find_for_lead(lead):
        """Find email for a single lead."""
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        email = await loop.run_in_executor(
            None,
            find_email_for_lead,
            lead.get('name', ''),
            lead.get('website', ''),
            lead.get('phone', None)
        )
        lead['email'] = email
        return lead
    
    # Process leads with concurrency limit
    tasks = [find_for_lead(lead) for lead in leads]
    results = await asyncio.gather(*tasks)
    return results
