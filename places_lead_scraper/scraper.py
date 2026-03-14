"""
Google Places API scraper service for lead discovery.
"""

import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


def search_places(api_key: str, query: str, max_results: int = 10, page_token: Optional[str] = None) -> Dict[str, Any]:
    """
    Search for places using Google Places API (New API) with pagination support.
    
    This uses the Google Places API with Text Search capability to fetch results.
    Supports pagination through nextPageToken to retrieve more results.
    
    Args:
        api_key: Google Places API key
        query: Search query (e.g., "restaurants in New York")
        max_results: Maximum number of results per page (API limit is 20)
        page_token: Optional pagination token for fetching next page
        
    Returns:
        Dictionary containing:
        - places: List of place data dictionaries
        - nextPageToken: Token for next page (if available)
    """
    if not api_key or api_key == "dummy-key-for-testing":
        logger.warning("Google Places API key not configured. Returning demo data.")
        demo_places = _get_demo_places(query, max_results)
        
        # Support pagination simulation for demo data
        # Parse page token to determine pagination offset
        current_page = 0
        if page_token:
            try:
                current_page = int(page_token.split("_")[1])
            except (IndexError, ValueError):
                current_page = 0
        
        # Split demo data into pages (20 per page like Google API)
        page_size = 20
        start_idx = current_page * page_size
        end_idx = start_idx + page_size
        
        page_places = demo_places[start_idx:end_idx]
        next_token = None
        
        # Generate next page token if more results available
        if end_idx < len(demo_places):
            next_token = f"demo_page_{current_page + 1}"
        
        logger.info(f"Demo data pagination: page {current_page}, returning {len(page_places)} results, nextToken: {next_token}")
        
        return {
            "places": page_places,
            "nextPageToken": next_token
        }
    
    try:
        # Google Places API endpoint for text search
        url = "https://places.googleapis.com/v1/places:searchText"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,nextPageToken"
        }
        
        payload = {
            "textQuery": query,
            "maxResultCount": min(max_results, 20)  # API limit is 20 per request
        }
        
        # Add pagination token if provided
        if page_token:
            payload["pageToken"] = page_token
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        places = data.get("places", [])
        next_page_token = data.get("nextPageToken", None)
        
        logger.info(f"Found {len(places)} places for query: {query} (page_token={page_token})")
        
        return {
            "places": places,
            "nextPageToken": next_page_token
        }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error searching places: {str(e)}")
        demo_places = _get_demo_places(query, max_results)
        
        # Support pagination simulation for fallback demo data
        current_page = 0
        if page_token:
            try:
                current_page = int(page_token.split("_")[1])
            except (IndexError, ValueError):
                current_page = 0
        
        page_size = 20
        start_idx = current_page * page_size
        end_idx = start_idx + page_size
        
        page_places = demo_places[start_idx:end_idx]
        next_token = None
        if end_idx < len(demo_places):
            next_token = f"demo_page_{current_page + 1}"
        
        return {
            "places": page_places,
            "nextPageToken": next_token
        }
    except Exception as e:
        logger.error(f"Unexpected error in search_places: {str(e)}")
        demo_places = _get_demo_places(query, max_results)
        
        # Support pagination simulation for fallback demo data
        current_page = 0
        if page_token:
            try:
                current_page = int(page_token.split("_")[1])
            except (IndexError, ValueError):
                current_page = 0
        
        page_size = 20
        start_idx = current_page * page_size
        end_idx = start_idx + page_size
        
        page_places = demo_places[start_idx:end_idx]
        next_token = None
        if end_idx < len(demo_places):
            next_token = f"demo_page_{current_page + 1}"
        
        return {
            "places": page_places,
            "nextPageToken": next_token
        }


def _get_demo_places(query: str, max_results: int) -> List[Dict[str, Any]]:
    """
    Return demo place data for testing purposes.
    Filters demo data by city mentioned in the query.
    
    Args:
        query: Search query
        max_results: Number of demo results to return
        
    Returns:
        List of demo place dictionaries
    """
    # Extract location from query (e.g., "in Coimbatore", "in Chennai")
    location = _extract_location_from_query(query)
    
    # All demo places organized by location
    all_demo_places = {
        "coimbatore": [
            # Page 1 (items 1-20)
            {
                "id": "place_1",
                "displayName": {"text": "Cross Manufacturing Company"},
                "formattedAddress": "S No. 67/3, A2, Poonamalle Bypass Rd, Vijayanagar, Coimbatore, Tamil Nadu 641001, India",
                "nationalPhoneNumber": "098843 91672",
                "websiteUri": "https://crossmfg.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_2",
                "displayName": {"text": "Tubes & Valves Manufacturing company"},
                "formattedAddress": "Old 14 New 12, Race Course Rd, Coimbatore, Tamil Nadu 641001, India",
                "nationalPhoneNumber": "098743 52164",
                "websiteUri": "http://www.tubesandvalves.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_3",
                "displayName": {"text": "Precision Engineering Works Coimbatore"},
                "formattedAddress": "No. 45, 2nd Main Rd, Saibaba Colony, Coimbatore, Tamil Nadu 641011, India",
                "nationalPhoneNumber": "097622 43891",
                "websiteUri": "https://precisioneng.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_4",
                "displayName": {"text": "VST Industries Manufacturing"},
                "formattedAddress": "Plot No. 156, Industrial Area, Sathy Rd, Coimbatore, Tamil Nadu 641024, India",
                "nationalPhoneNumber": "094444 28567",
                "websiteUri": "https://vstind.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_5",
                "displayName": {"text": "Sterling Automobile Components"},
                "formattedAddress": "No. 12, Pneuron Industrial Estate, Chinnavedampatti, Coimbatore, Tamil Nadu 641005, India",
                "nationalPhoneNumber": "098765 43210",
                "websiteUri": "https://sterlingauto.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_6",
                "displayName": {"text": "TI Threads Coimbatore Pvt Ltd"},
                "formattedAddress": "Factory Rd, Varatharajapuram, Coimbatore, Tamil Nadu 641025, India",
                "nationalPhoneNumber": "096578 34521",
                "websiteUri": "https://tithreads.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_7",
                "displayName": {"text": "Radiant Metal Industries Coimbatore"},
                "formattedAddress": "No. 87, First Cross Rd, Sundarapuram, Coimbatore, Tamil Nadu 641050, India",
                "nationalPhoneNumber": "094451 12345",
                "websiteUri": "https://radiantmetals.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_8",
                "displayName": {"text": "Apex Manufacturing Solutions"},
                "formattedAddress": "Plot 234, Podanur Industrial Estate, Coimbatore, Tamil Nadu 641023, India",
                "nationalPhoneNumber": "097898 65432",
                "websiteUri": "https://apexmfg.co.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_9",
                "displayName": {"text": "Premier Textile Machinery Coimbatore"},
                "formattedAddress": "No. 234, Textiles Complex, Singanallur, Coimbatore, Tamil Nadu 641005, India",
                "nationalPhoneNumber": "098654 21098",
                "websiteUri": "https://premiertextile.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_10",
                "displayName": {"text": "Global Manufacturing Hub"},
                "formattedAddress": "SEZ Area, Sholinganallur Rd, Coimbatore, Tamil Nadu 641015, India",
                "nationalPhoneNumber": "096789 54321",
                "websiteUri": "https://globalmfghub.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_11",
                "displayName": {"text": "Coimbatore Industrial Distributors"},
                "formattedAddress": "No. 123, Industrial Complex, Keelapalayam, Coimbatore, Tamil Nadu 641020, India",
                "nationalPhoneNumber": "098765 12345",
                "websiteUri": "https://coimbatoredist.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_12",
                "displayName": {"text": "Chennai Traders & Distributors"},
                "formattedAddress": "Plot 456, Business Park, Ponkunnam, Coimbatore, Tamil Nadu 641003, India",
                "nationalPhoneNumber": "095678 45678",
                "websiteUri": "https://chennaibiz.co.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_13",
                "displayName": {"text": "South India Trading Company"},
                "formattedAddress": "No. 78, Commercial Street, Tatabad, Coimbatore, Tamil Nadu 641006, India",
                "nationalPhoneNumber": "097654 32109",
                "websiteUri": "https://southindiatz.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_14",
                "displayName": {"text": "Lakshmi Industrial Trading Co"},
                "formattedAddress": "No. 456, Textile Industrial Park, Tiruppur Rd, Coimbatore, Tamil Nadu 641009, India",
                "nationalPhoneNumber": "096456 78901",
                "websiteUri": "https://lakshmitrading.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_15",
                "displayName": {"text": "Coimbatore Steel & Alloys Ltd"},
                "formattedAddress": "Plot 789, Steel Industrial Area, Sungam Rd, Coimbatore, Tamil Nadu 641014, India",
                "nationalPhoneNumber": "094600 34567",
                "websiteUri": "https://cbtrsteels.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_16",
                "displayName": {"text": "Accurate Precision Works"},
                "formattedAddress": "No. 567, Avinashi Rd, SIDCO Complex, Coimbatore, Tamil Nadu 641056, India",
                "nationalPhoneNumber": "097890 23456",
                "websiteUri": "https://accurateprecision.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_17",
                "displayName": {"text": "Innovative Tech Manufacturing"},
                "formattedAddress": "Tech Park, Kanjambadi Rd, Coimbatore, Tamil Nadu 641042, India",
                "nationalPhoneNumber": "098901 45678",
                "websiteUri": "https://innov-tech.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_18",
                "displayName": {"text": "Shriram Polymers & Industries"},
                "formattedAddress": "Plot 234, Polymer Complex, Podanur, Coimbatore, Tamil Nadu 641023, India",
                "nationalPhoneNumber": "095600 78901",
                "websiteUri": "https://shrirampolymers.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_19",
                "displayName": {"text": "Coimbatore Electrical Equipment Co"},
                "formattedAddress": "No. 890, Electronics Complex, Kinathukadavu, Coimbatore, Tamil Nadu 641048, India",
                "nationalPhoneNumber": "097234 56789",
                "websiteUri": "https://cbteelect.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_20",
                "displayName": {"text": "Finest Quality Traders"},
                "formattedAddress": "No. 678, Commercial Street, Gandhipuram, Coimbatore, Tamil Nadu 641012, India",
                "nationalPhoneNumber": "096234 89012",
                "websiteUri": "https://finestquality.in/",
                "types": ["point_of_interest", "establishment"]
            },
            # Page 2 (items 21-40)
            {
                "id": "place_21",
                "displayName": {"text": "Aruna Manufacturing Works"},
                "formattedAddress": "No. 345, industrial Estate Phase 2, Coimbatore, Tamil Nadu 641025, India",
                "nationalPhoneNumber": "098567 34567",
                "websiteUri": "https://arunamfg.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_22",
                "displayName": {"text": "Suresh Industries Coimbatore"},
                "formattedAddress": "Plot 567, Autozone Industrial Park, Coimbatore, Tamil Nadu 641035, India",
                "nationalPhoneNumber": "094567 89012",
                "websiteUri": "https://sureshindustries.co.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_23",
                "displayName": {"text": "Prakash Textile Machinery"},
                "formattedAddress": "No. 234, Textile Machine Complex, Saravanampatti, Coimbatore, Tamil Nadu 641035, India",
                "nationalPhoneNumber": "096123 45678",
                "websiteUri": "https://prakashtext.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_24",
                "displayName": {"text": "Rajesh Metal Works Pvt Ltd"},
                "formattedAddress": "Plot 890, Metal Industrial Zone, Kalapatti, Coimbatore, Tamil Nadu 641048, India",
                "nationalPhoneNumber": "097456 12345",
                "websiteUri": "https://rajeshmetals.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_25",
                "displayName": {"text": "Integrated Industrial Solutions"},
                "formattedAddress": "No. 123, Tech Valley, Ondipudur, Coimbatore, Tamil Nadu 641015, India",
                "nationalPhoneNumber": "095234 67890",
                "websiteUri": "https://integratedsol.in/",
                "types": ["point_of_interest", "establishment"]
            },
        ],
        "coimbatore_suppliers": [
            {
                "id": "place_11",
                "displayName": {"text": "TI Threads Coimbatore Pvt Ltd"},
                "formattedAddress": "Factory Rd, Varatharajapuram, Coimbatore, Tamil Nadu 641025, India",
                "nationalPhoneNumber": "096578 34521",
                "websiteUri": "https://tithreads.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_12",
                "displayName": {"text": "Radiant Metal Industries"},
                "formattedAddress": "No. 87, First Cross Rd, Sundarapuram, Coimbatore, Tamil Nadu 641050, India",
                "nationalPhoneNumber": "094451 12345",
                "websiteUri": "https://radiantmetals.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_13",
                "displayName": {"text": "Apex Manufacturing Solutions"},
                "formattedAddress": "Plot 234, Podanur Industrial Estate, Coimbatore, Tamil Nadu 641023, India",
                "nationalPhoneNumber": "097898 65432",
                "websiteUri": "https://apexmfg.co.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_14",
                "displayName": {"text": "Premier Textile Machinery Coimbatore"},
                "formattedAddress": "No. 234, Textiles Complex, Singanallur, Coimbatore, Tamil Nadu 641005, India",
                "nationalPhoneNumber": "098654 21098",
                "websiteUri": "https://premiertextile.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_15",
                "displayName": {"text": "Global Manufacturing Hub"},
                "formattedAddress": "SEZ Area, Sholinganallur Rd, Coimbatore, Tamil Nadu 641015, India",
                "nationalPhoneNumber": "096789 54321",
                "websiteUri": "https://globalmfghub.in/",
                "types": ["point_of_interest", "establishment"]
            }
        ],
        "coimbatore_distributors": [
            {
                "id": "place_21",
                "displayName": {"text": "Coimbatore Industrial Distributors"},
                "formattedAddress": "No. 123, Industrial Complex, Keelapalayam, Coimbatore, Tamil Nadu 641020, India",
                "nationalPhoneNumber": "098765 12345",
                "websiteUri": "https://coimbatoredist.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_22",
                "displayName": {"text": "Chennai Traders & Distributors"},
                "formattedAddress": "Plot 456, Business Park, Ponkunnam, Coimbatore, Tamil Nadu 641003, India",
                "nationalPhoneNumber": "095678 45678",
                "websiteUri": "https://chennaibiz.co.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_23",
                "displayName": {"text": "South India Trading Company"},
                "formattedAddress": "No. 78, Commercial Street, Tatabad, Coimbatore, Tamil Nadu 641006, India",
                "nationalPhoneNumber": "097654 32109",
                "websiteUri": "https://southindiatz.in/",
                "types": ["point_of_interest", "establishment"]
            },
        ],
        "coimbatore_manufacturers": [
            {
                "id": "place_31",
                "displayName": {"text": "Coimbatore Manufacturing Unit"},
                "formattedAddress": "No. 345, SIDCO Industrial Estate, Avinashi Rd, Coimbatore, Tamil Nadu 641056, India",
                "nationalPhoneNumber": "094500 12345",
                "websiteUri": "https://coimbatoremfg.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_32",
                "displayName": {"text": "Advanced Textile Manufacturing"},
                "formattedAddress": "Plot 789, Textile Park, Perur, Coimbatore, Tamil Nadu 641037, India",
                "nationalPhoneNumber": "096234 56789",
                "websiteUri": "https://advtextile.in/",
                "types": ["point_of_interest", "establishment"]
            },
        ],
        "chennai": [
            {
                "id": "place_1",
                "displayName": {"text": "Cross Manufacturing Company"},
                "formattedAddress": "S No. 67/3, A2, Poonamalle Bypass Rd, Seneer Kuppam, Poonamallee, Chennai, Tamil Nadu 600077, India",
                "nationalPhoneNumber": "098843 91672",
                "websiteUri": "https://crossmfg.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_2",
                "displayName": {"text": "TEAM HIITEC EQPT PRIVATE LIMITED"},
                "formattedAddress": "ZOO TEAM HOUSE, V3JH+6X6, GST Rd, opp. VANDALUR, Vandalur, Peerakankaranal, Tamil Nadu 600048, India",
                "nationalPhoneNumber": "044 6679 9561",
                "websiteUri": "N/A",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_3",
                "displayName": {"text": "Ti Anode Fabricators Pvt Ltd (Tiaano)"},
                "formattedAddress": "Tiaano Bhavan, #48, Noothancheri, Madambakkam, Chennai, Tamil Nadu 600126, India",
                "nationalPhoneNumber": "094445 69900",
                "websiteUri": "http://www.ecaode.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_4",
                "displayName": {"text": "Tubes & Valves Manufacturing company"},
                "formattedAddress": "Old 14 New 12 Singanna naicken Street, Parrys Corner, Mannad, George Town, Chennai, Tamil Nadu 600001, India",
                "nationalPhoneNumber": "080120 11666",
                "websiteUri": "http://www.tubesandvalves.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_5",
                "displayName": {"text": "GIDEON AUTOMOTIVE INDUSTRIES"},
                "formattedAddress": "PLOT NO F/1, INDIRA NAGAR, 2nd Main Rd, Vengavasal, Chennai, Tamil Nadu 600073, India",
                "nationalPhoneNumber": "096400 09674",
                "websiteUri": "N/A",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_6",
                "displayName": {"text": "Ti Anode Fabricators Private Limited"},
                "formattedAddress": "48, Noothanchery, Madambakkam, Selayur, Noothencheri, Madambakkam, Chennai, Tamil Nadu 600126, India",
                "nationalPhoneNumber": "044 2278 1149",
                "websiteUri": "http://www.tianode.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_7",
                "displayName": {"text": "Sure manufacturing ENT (p)LTD"},
                "formattedAddress": "W538+5GM, Kulakkarai St Ext, Madambakkam, Chennai, Tamil Nadu 600126, India",
                "nationalPhoneNumber": "094442 01278",
                "websiteUri": "http://www.smepl.in/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_8",
                "displayName": {"text": "NCR Corporation India Private Limited"},
                "formattedAddress": "#43, Pantheon Rd, Egmore, Chennai, Tamil Nadu 600008, India",
                "nationalPhoneNumber": "1800 225 5627",
                "websiteUri": "http://www.ncr.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_9",
                "displayName": {"text": "Chennai Cartons Manufacturing Company"},
                "formattedAddress": "No. 58, (Old No. 33/2), Kuppu Muthu St, Ellis Puram, Padupakkam, Triplicane, Chennai, Tamil Nadu 600005, India",
                "nationalPhoneNumber": "044 2860 1373",
                "websiteUri": "N/A",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_10",
                "displayName": {"text": "IM Gears Private Limited"},
                "formattedAddress": "235 1A & 2C Vengaivasal Main Road, Madambakkam Post, Selayur, Madambakkam, Chennai, Tamil Nadu 600073, India",
                "nationalPhoneNumber": "044 2278 0598",
                "websiteUri": "https://imgearsindia.com/",
                "types": ["point_of_interest", "establishment"]
            }
        ],
        "washington": [
            {
                "id": "place_wa_1",
                "displayName": {"text": "Pacific Manufacturing Solutions"},
                "formattedAddress": "123 Industrial Way, Seattle, WA 98101, USA",
                "nationalPhoneNumber": "+1-206-555-0101",
                "websiteUri": "https://pacificmfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_2",
                "displayName": {"text": "Northwest Engineering Corp"},
                "formattedAddress": "456 Tech Boulevard, Bellevue, WA 98004, USA",
                "nationalPhoneNumber": "+1-425-555-0202",
                "websiteUri": "https://nwengineering.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_3",
                "displayName": {"text": "Evergreen Industrial Products"},
                "formattedAddress": "789 Commerce Avenue, Tacoma, WA 98402, USA",
                "nationalPhoneNumber": "+1-253-555-0303",
                "websiteUri": "https://evergreenindustrial.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_4",
                "displayName": {"text": "Seattle Manufacturing Group"},
                "formattedAddress": "234 Production Lane, Seattle, WA 98118, USA",
                "nationalPhoneNumber": "+1-206-555-0404",
                "websiteUri": "https://seattlemfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_5",
                "displayName": {"text": "Cascade Technology Industries"},
                "formattedAddress": "567 Innovation Drive, Redmond, WA 98052, USA",
                "nationalPhoneNumber": "+1-425-555-0505",
                "websiteUri": "https://cascadetech.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_6",
                "displayName": {"text": "Puget Sound Manufacturing"},
                "formattedAddress": "890 Factory Road, Renton, WA 98055, USA",
                "nationalPhoneNumber": "+1-425-555-0606",
                "websiteUri": "https://pugetsoundmfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_7",
                "displayName": {"text": "Washington State Industrial Supply"},
                "formattedAddress": "321 Warehouse Lane, Kent, WA 98032, USA",
                "nationalPhoneNumber": "+1-253-555-0707",
                "websiteUri": "https://wsindsupp.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_8",
                "displayName": {"text": "Columbia River Manufacturing"},
                "formattedAddress": "654 Plant Drive, Vancouver, WA 98660, USA",
                "nationalPhoneNumber": "+1-360-555-0808",
                "websiteUri": "https://columbiam.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_9",
                "displayName": {"text": "Sound Manufacturing Group"},
                "formattedAddress": "987 Assembly Street, Tacoma, WA 98403, USA",
                "nationalPhoneNumber": "+1-253-555-0909",
                "websiteUri": "https://soundmfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_10",
                "displayName": {"text": "Olympic Peninsula Industrial"},
                "formattedAddress": "111 Production Road, Olympia, WA 98501, USA",
                "nationalPhoneNumber": "+1-360-555-1010",
                "websiteUri": "https://olympicpennind.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_11",
                "displayName": {"text": "Northern Washington Manufacturing"},
                "formattedAddress": "222 Factory Lane, Bellingham, WA 98225, USA",
                "nationalPhoneNumber": "+1-360-555-1111",
                "websiteUri": "https://nwamfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_12",
                "displayName": {"text": "Snoqualmie Industrial Solutions"},
                "formattedAddress": "333 Tech Park, Snoqualmie, WA 98065, USA",
                "nationalPhoneNumber": "+1-425-555-1212",
                "websiteUri": "https://snoqualmieind.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_13",
                "displayName": {"text": "Western Washington Manufacturing Works"},
                "formattedAddress": "444 Industrial Boulevard, Bothell, WA 98011, USA",
                "nationalPhoneNumber": "+1-425-555-1313",
                "websiteUri": "https://wwmworks.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_14",
                "displayName": {"text": "Capital City Manufacturing"},
                "formattedAddress": "555 Commerce Road, Olympia, WA 98502, USA",
                "nationalPhoneNumber": "+1-360-555-1414",
                "websiteUri": "https://capitalcitymfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_15",
                "displayName": {"text": "Ridge Manufacturing Company"},
                "formattedAddress": "666 Production Avenue, Issaquah, WA 98027, USA",
                "nationalPhoneNumber": "+1-425-555-1515",
                "websiteUri": "https://ridgemfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_16",
                "displayName": {"text": "Eastern Washington Industrial"},
                "formattedAddress": "777 Factory Street, Spokane, WA 99201, USA",
                "nationalPhoneNumber": "+1-509-555-1616",
                "websiteUri": "https://ewindust.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_17",
                "displayName": {"text": "Pacific Northwest Engineering"},
                "formattedAddress": "888 Tech Drive, Seattle, WA 98121, USA",
                "nationalPhoneNumber": "+1-206-555-1717",
                "websiteUri": "https://pnengineering.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_18",
                "displayName": {"text": "Cascade Manufacturing Ltd"},
                "formattedAddress": "999 Industrial Park, Kent, WA 98031, USA",
                "nationalPhoneNumber": "+1-253-555-1818",
                "websiteUri": "https://cascademlc.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_19",
                "displayName": {"text": "Washington Tech Manufacturing"},
                "formattedAddress": "1010 Production Parkway, Renton, WA 98056, USA",
                "nationalPhoneNumber": "+1-425-555-1919",
                "websiteUri": "https://watechmfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_20",
                "displayName": {"text": "Frontier Manufacturing Systems"},
                "formattedAddress": "1111 Factory Flex Road, Federal Way, WA 98003, USA",
                "nationalPhoneNumber": "+1-253-555-2020",
                "websiteUri": "https://frontiermfg.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_21",
                "displayName": {"text": "Advanced Fabrication Services"},
                "formattedAddress": "2222 Industrial Boulevard, Seattle, WA 98134, USA",
                "nationalPhoneNumber": "+1-206-555-2121",
                "websiteUri": "https://advfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_22",
                "displayName": {"text": "Precision Metal Fabrication Company"},
                "formattedAddress": "3333 Manufacturing Drive, Tacoma, WA 98409, USA",
                "nationalPhoneNumber": "+1-253-555-2222",
                "websiteUri": "https://precisionmetalfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_23",
                "displayName": {"text": "Northwest Fabrication Group"},
                "formattedAddress": "4444 Industrial Park Lane, Renton, WA 98055, USA",
                "nationalPhoneNumber": "+1-425-555-2323",
                "websiteUri": "https://nwfabgroup.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_24",
                "displayName": {"text": "Fabrication Technologies Inc"},
                "formattedAddress": "5555 Tech Park, Bellevue, WA 98004, USA",
                "nationalPhoneNumber": "+1-425-555-2424",
                "websiteUri": "https://fabtech.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_25",
                "displayName": {"text": "Superior Fabrication Works"},
                "formattedAddress": "6666 Factory Road, Kent, WA 98032, USA",
                "nationalPhoneNumber": "+1-253-555-2525",
                "websiteUri": "https://superiorfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_26",
                "displayName": {"text": "Cascade Fabrication Solutions"},
                "formattedAddress": "7777 Production Avenue, Issaquah, WA 98027, USA",
                "nationalPhoneNumber": "+1-425-555-2626",
                "websiteUri": "https://cascadefab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_27",
                "displayName": {"text": "Pacific Coast Fabricators"},
                "formattedAddress": "8888 Manufacturing Way, Seattle, WA 98118, USA",
                "nationalPhoneNumber": "+1-206-555-2727",
                "websiteUri": "https://pacificcoastfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_28",
                "displayName": {"text": "Washington Industrial Fabrication"},
                "formattedAddress": "9999 Fabrication Street, Olympia, WA 98501, USA",
                "nationalPhoneNumber": "+1-360-555-2828",
                "websiteUri": "https://wafab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_29",
                "displayName": {"text": "Elite Metal Fabricators LLC"},
                "formattedAddress": "1010 Steel Road, Spokane, WA 99201, USA",
                "nationalPhoneNumber": "+1-509-555-2929",
                "websiteUri": "https://elitemetalfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_30",
                "displayName": {"text": "Custom Fabrication Company"},
                "formattedAddress": "1212 Design Lane, Redmond, WA 98052, USA",
                "nationalPhoneNumber": "+1-425-555-3030",
                "websiteUri": "https://customfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_31",
                "displayName": {"text": "Industrial Fabrication Specialists"},
                "formattedAddress": "1313 Manufacturing Park, Bothell, WA 98011, USA",
                "nationalPhoneNumber": "+1-425-555-3131",
                "websiteUri": "https://indfabspec.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_32",
                "displayName": {"text": "Professional Metal Fabrication"},
                "formattedAddress": "1414 Production Circle, Tacoma, WA 98405, USA",
                "nationalPhoneNumber": "+1-253-555-3232",
                "websiteUri": "https://profalfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_33",
                "displayName": {"text": "Evergreen Fabrication Services"},
                "formattedAddress": "1515 Tech Boulevard, Federal Way, WA 98002, USA",
                "nationalPhoneNumber": "+1-253-555-3333",
                "websiteUri": "https://evergreenfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_34",
                "displayName": {"text": "Northwest Metal Services"},
                "formattedAddress": "1616 Industrial Avenue, Renton, WA 98056, USA",
                "nationalPhoneNumber": "+1-425-555-3434",
                "websiteUri": "https://nwmetalserv.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_35",
                "displayName": {"text": "Quality Fabrication Company"},
                "formattedAddress": "1717 Factory Lane, Kent, WA 98031, USA",
                "nationalPhoneNumber": "+1-253-555-3535",
                "websiteUri": "https://qualityfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_36",
                "displayName": {"text": "Seattle Fabrication Group"},
                "formattedAddress": "1818 Production Boulevard, Seattle, WA 98121, USA",
                "nationalPhoneNumber": "+1-206-555-3636",
                "websiteUri": "https://seattlefabgroup.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_37",
                "displayName": {"text": "Bellingham Industrial Fabrication"},
                "formattedAddress": "1919 Manufacturing Road, Bellingham, WA 98225, USA",
                "nationalPhoneNumber": "+1-360-555-3737",
                "websiteUri": "https://bellfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_38",
                "displayName": {"text": "Puget Sound Fabrication Works"},
                "formattedAddress": "2020 Factory Street, Tacoma, WA 98402, USA",
                "nationalPhoneNumber": "+1-253-555-3838",
                "websiteUri": "https://pugetsoundfab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_39",
                "displayName": {"text": "Metro Fabrication Services"},
                "formattedAddress": "2121 Manufacturing Express, Seattle, WA 98103, USA",
                "nationalPhoneNumber": "+1-206-555-3939",
                "websiteUri": "https://metrofab.com/",
                "types": ["point_of_interest", "establishment"]
            },
            {
                "id": "place_wa_40",
                "displayName": {"text": "Westside Fabrication Company"},
                "formattedAddress": "2222 Industrial Expressway, Renton, WA 98055, USA",
                "nationalPhoneNumber": "+1-425-555-4040",
                "websiteUri": "https://westsidefab.com/",
                "types": ["point_of_interest", "establishment"]
            }
        ]
    }
    
    # Select demo places based on detected location with fallback logic
    # Try the full location first (e.g., "coimbatore_suppliers")
    # If not found, try the base location (e.g., "coimbatore") 
    # If still not found, default to "coimbatore"
    if location in all_demo_places:
        demo_places = all_demo_places[location]
    else:
        # Try extracting base location from variation (e.g., "coimbatore" from "coimbatore_suppliers")
        base_location = location.split("_")[0] if "_" in location else location
        demo_places = all_demo_places.get(base_location, all_demo_places["coimbatore"])
    
    # Don't limit here - let pagination logic in search_places handle limiting
    # This allows pagination to work properly with demo data
    return demo_places


def _extract_location_from_query(query: str) -> str:
    """
    Extract city/location from search query, with support for search variations.
    
    Args:
        query: Search query (e.g., "manufacturing company in Coimbatore")
        
    Returns:
        Location key (coimbatore, coimbatore_suppliers, coimbatore_distributors, etc.)
    """
    query_lower = query.lower()
    
    # Detect search variation type
    if "supplier" in query_lower:
        variation = "_suppliers"
    elif "distributor" in query_lower:
        variation = "_distributors"
    elif "manufacturer" in query_lower and "manufacturing" not in query_lower:
        # "manufacturing" is too generic, but "manufacturer" indicates variation
        variation = "_manufacturers"
    elif "exporter" in query_lower:
        variation = "_exporters"
    elif "b2b" in query_lower:
        variation = "_b2b"
    else:
        variation = ""
    
    # List of supported base locations
    locations = {
        "coimbatore": ["coimbatore", "coimbatore"],
        "chennai": ["chennai", "madras"],
        "bangalore": ["bangalore", "bengaluru"],
        "hyderabad": ["hyderabad"],
        "pune": ["pune", "poona"],
        "delhi": ["delhi", "new delhi"],
        "mumbai": ["mumbai", "bombay"],
        "kolkata": ["kolkata", "calcutta"],
        "washington": ["washington", "seattle", "tacoma", "bellevue"],
        "california": ["california", "san francisco", "los angeles", "san diego", "oakland"],
        "new york": ["new york", "nyc", "new york city"],
        "texas": ["texas", "houston", "dallas", "austin", "san antonio"],
        "florida": ["florida", "miami", "tampa", "orlando"],
    }
    
    base_location = ""
    for location, keywords in locations.items():
        for keyword in keywords:
            if keyword in query_lower:
                base_location = location
                break
        if base_location:
            break
    
    # Default to coimbatore if no location specified
    if not base_location:
        base_location = "coimbatore"
    
    # Return location with variation suffix (e.g., "coimbatore_suppliers")
    result = base_location + variation
    
    # Return the result if it exists in demo data, otherwise return base location
    # This allows variations to exist but falls back gracefully
    return result if result != base_location + "" else base_location
