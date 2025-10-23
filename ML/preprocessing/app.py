import os
import json
import re
import uuid
import cv2
import numpy as np
import easyocr
import requests
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
import pandas as pd
from PIL import Image
import io
from odoo.ML.preprocessing.report_generator import ReportGenerator

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config.update(
    UPLOAD_FOLDER='uploads',
    REPORTS_FOLDER='reports',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
    SECRET_KEY=os.urandom(24),
    REST_COUNTRIES_API='https://restcountries.com/v3.1/all?fields=name,currencies',
    EXCHANGE_RATE_API='https://api.exchangerate-api.com/v4/latest/{}',
    DEFAULT_CURRENCY='INR'
)

# Ensure required directories exist
Path(app.config['UPLOAD_FOLDER']).mkdir(exist_ok=True)
Path(app.config['REPORTS_FOLDER']).mkdir(exist_ok=True)


class CurrencyService:
    _instance = None
    _currencies = None
    _categories = set()  # Using set to avoid duplicates
    _exchange_rates = {}
    _last_updated = {}
    CACHE_DURATION = 3600  # 1 hour cache

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CurrencyService, cls).__new__(cls)
            cls._instance._load_currencies()  # This method was missing
            cls._instance._load_common_categories()
        return cls._instance
    def _load_common_categories(self):
        """Load common expense categories that will be used as a base"""
        common_categories = [
        # Common expense categories
        'Food & Dining', 'Travel', 'Office Supplies', 'Transportation',
        'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other',
        'Shopping', 'Groceries', 'Bills & Fees', 'Personal Care', 'Gifts',
        'Rent', 'Insurance', 'Taxes', 'Salary', 'Freelance', 'Investments',
        'Home', 'Electronics', 'Clothing', 'Pets', 'Hobbies', 'Subscriptions',
        'Dining Out', 'Coffee Shops', 'Fast Food', 'Alcohol & Bars',
        'Movies & Shows', 'Music', 'Games', 'Sports', 'Pharmacy',
        'Doctor', 'Dentist', 'Eyecare', 'Therapist', 'Tuition',
        'Student Loan', 'School Supplies', 'Online Courses',
        'Home Office', 'Internet', 'Mobile', 'TV', 'Electricity',
        'Water', 'Gas', 'Parking', 'Public Transport', 'Car Maintenance',
        'Fuel', 'Flights', 'Hotels', 'Vacation', 'Ride Sharing'
    ]
        self._categories.update(common_categories)
    def _load_currencies(self):
        """Load currencies from REST Countries API with fallback"""
        # Common currency symbol mapping for better display
        CURRENCY_SYMBOLS = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'AUD': 'A$',
            'CAD': 'C$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'MXN': 'MX$',
            'BRL': 'R$', 'RUB': '₽', 'KRW': '₩', 'TRY': '₺', 'THB': '฿',
            'IDR': 'Rp', 'HUF': 'Ft', 'CZK': 'Kč', 'DKK': 'kr', 'NOK': 'kr',
            'SEK': 'kr', 'PLN': 'zł', 'BGN': 'лв', 'RON': 'lei', 'HRK': 'kn',
            'BDT': 'Tk',  # Bangladeshi Taka
            'AFN': 'Af',  # Afghan Afghani
            'PKR': '₨',  # Pakistani Rupee
            'LKR': '₨',  # Sri Lankan Rupee
            'NPR': '₨',  # Nepalese Rupee
            'MVR': 'Rf', # Maldivian Rufiyaa
            'BTN': 'Nu', # Bhutanese Ngultrum
            'MMK': 'K',  # Burmese Kyat
            'KHR': '៛',  # Cambodian Riel
            'LAK': '₭',  # Lao Kip
            'VND': '₫',  # Vietnamese Dong
            'PHP': '₱',  # Philippine Peso
            'KZT': '₸',  # Kazakhstani Tenge
            'UAH': '₴',  # Ukrainian Hryvnia
            'GEL': '₾',  # Georgian Lari
            'AMD': '֏',  # Armenian Dram
            'GHS': 'GH₵', # Ghanaian Cedi
            'NGN': '₦',  # Nigerian Naira
            'ZAR': 'R',  # South African Rand
            'EGP': 'E£', # Egyptian Pound
            'MAD': 'DH', # Moroccan Dirham
            'DZD': 'DA', # Algerian Dinar
            'TND': 'DT', # Tunisian Dinar
            'JOD': 'JD', # Jordanian Dinar
            'LBP': 'ل.ل', # Lebanese Pound
            'SYP': '£S', # Syrian Pound
            'YER': '﷼',  # Yemeni Rial
            'OMR': 'ر.ع.', # Omani Rial
            'QAR': 'ر.ق', # Qatari Riyal
            'SAR': 'ر.س', # Saudi Riyal
            'KWD': 'د.ك', # Kuwaiti Dinar
            'BHD': '.د.ب', # Bahraini Dinar
            'AED': 'د.إ', # UAE Dirham
            'ILS': '₪',  # Israeli New Shekel
            'JMD': 'J$', # Jamaican Dollar
            'BBD': 'Bds$', # Barbadian Dollar
            'BZD': 'BZ$', # Belize Dollar
            'BMD': 'BD$', # Bermudian Dollar
            'KYD': 'CI$', # Cayman Islands Dollar
            'FJD': 'FJ$', # Fijian Dollar
            'GYD': 'G$',  # Guyanese Dollar
            'LRD': 'L$',  # Liberian Dollar
            'NAD': 'N$',  # Namibian Dollar
            'SBD': 'SI$', # Solomon Islands Dollar
            'SRD': 'SRD', # Surinamese Dollar
            'TTD': 'TT$', # Trinidad and Tobago Dollar
            'TVD': 'TV$', # Tuvaluan Dollar
            'XCD': 'EC$', # East Caribbean Dollar
            'ZWD': 'Z$'  # Zimbabwean Dollar
        }

        try:
            response = requests.get(
                app.config['REST_COUNTRIES_API'], 
                timeout=10
            )
            response.raise_for_status()
            countries = response.json()
            
            self._currencies = {}
            for country in countries:
                if 'currencies' in country and country['currencies']:
                    for code, details in country['currencies'].items():
                        if code not in self._currencies:
                            # Use our symbol mapping if available, otherwise use the one from API
                            symbol = CURRENCY_SYMBOLS.get(code, details.get('symbol', code))
                            self._currencies[code] = {
                                'name': details.get('name', code),
                                'symbol': symbol,
                                'countries': set()
                            }
                        if 'name' in country:
                            self._currencies[code]['countries'].add(country['name'].get('common', ''))
            
            # Convert sets to lists for JSON serialization
            for code, currency in self._currencies.items():
                currency['countries'] = list(currency['countries'])
                # Ensure we have a symbol for all currencies
                if not currency['symbol'] or currency['symbol'] == code:
                    currency['symbol'] = CURRENCY_SYMBOLS.get(code, code)
                
        except Exception as e:
            print(f"Error loading currencies: {e}")
            # Fallback to major currencies with our symbol mapping
            self._currencies = {
                'USD': {'name': 'US Dollar', 'symbol': '$', 'countries': ['United States']},
                'EUR': {'name': 'Euro', 'symbol': '€', 'countries': ['Eurozone']},
                'GBP': {'name': 'British Pound', 'symbol': '£', 'countries': ['United Kingdom']},
                'JPY': {'name': 'Japanese Yen', 'symbol': '¥', 'countries': ['Japan']},
                'INR': {'name': 'Indian Rupee', 'symbol': '₹', 'countries': ['India']},
                'CAD': {'name': 'Canadian Dollar', 'symbol': 'C$', 'countries': ['Canada']},
                'AUD': {'name': 'Australian Dollar', 'symbol': 'A$', 'countries': ['Australia']},
                'CNY': {'name': 'Chinese Yuan', 'symbol': '¥', 'countries': ['China']},
                'SGD': {'name': 'Singapore Dollar', 'symbol': 'S$', 'countries': ['Singapore']},
                'AED': {'name': 'UAE Dirham', 'symbol': 'د.إ', 'countries': ['United Arab Emirates']}
            }

    def add_category(self, category: str):
        """Dynamically add a new category"""
        if category and isinstance(category, str):
            self._categories.add(category.strip())
            return True
        return False

    def add_categories(self, categories: list):
        """Add multiple categories at once"""
        if not isinstance(categories, (list, set, tuple)):
            return False
            
        added = 0
        for category in categories:
            if self.add_category(category):
                added += 1
        return added

    def get_categories(self, count: int = None, include_common: bool = True):
        """
        Get categories
        
        Args:
            count: Number of random categories to return (None for all)
            include_common: Whether to include common categories
            
        Returns:
            Set of categories
        """
        if include_common and not self._categories:
            self._load_common_categories()
            
        if count is None:
            return self._categories.copy()
            
        return set(random.sample(
            list(self._categories), 
            min(count, len(self._categories))
        ))

    def detect_category(self, text: str) -> str:
        """
        Try to detect the most relevant category from text
        
        Args:
            text: Input text to analyze
            
        Returns:
            str: Best matching category or 'Other' if no good match
        """
        if not text or not isinstance(text, str):
            return 'Other'
            
        text = text.lower().strip()
        
        # Simple keyword matching (can be enhanced with ML/NLP)
        category_keywords = {
            'food': ['restaurant', 'cafe', 'food', 'dining', 'coffee', 'lunch', 'dinner', 'breakfast', 'groceries'],
            'travel': ['flight', 'hotel', 'airbnb', 'vacation', 'trip', 'travel'],
            'transportation': ['taxi', 'uber', 'lyft', 'train', 'bus', 'subway', 'metro', 'gas', 'fuel', 'parking'],
            'shopping': ['store', 'shop', 'mall', 'amazon', 'purchase', 'order'],
            'utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'cable', 'tv'],
            'entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'event', 'show'],
            'healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'dental', 'clinic'],
            'education': ['school', 'university', 'course', 'tuition', 'book', 'learning'],
            'bills': ['bill', 'payment', 'subscription', 'membership', 'fee'],
            'home': ['rent', 'mortgage', 'maintenance', 'repair', 'furniture', 'appliance']
        }
        
        # Check for exact matches first
        for category in self._categories:
            if category.lower() == text:
                return category
                
        # Then check keyword matches
        matched_keywords = {}
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    matched_keywords[keyword] = matched_keywords.get(keyword, 0) + 1
        
        if matched_keywords:
            # Get the most matched keyword
            best_match = max(matched_keywords.items(), key=lambda x: x[1])
            # Find the most specific category for this keyword
            for category, keywords in category_keywords.items():
                if best_match[0] in keywords:
                    # Add this as a new category if it doesn't exist
                    self.add_category(category.title())
                    return category.title()
        
        # If no good match, add as a new category
        self.add_category(text.title())
        return text.title()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})
@app.route('/api/categories', methods=['GET', 'POST'])
def handle_categories():
        """
        Handle category operations
        
        GET params:
            - count: Number of random categories to return
            - detect: Text to detect category from
            
        POST body (JSON):
            - categories: List of categories to add
        """
        # Handle category detection
        if request.method == 'GET' and 'detect' in request.args:
            detected = currency_service.detect_category(request.args['detect'])
            return jsonify({
                'status': 'success',
                'detected_category': detected
            })
            
        # Handle adding new categories
        if request.method == 'POST':
            data = request.get_json() or {}
            if 'categories' in data and isinstance(data['categories'], list):
                added = currency_service.add_categories(data['categories'])
                return jsonify({
                    'status': 'success',
                    'added': added,
                    'total_categories': len(currency_service.get_categories())
                })
            return jsonify({'status': 'error', 'message': 'Invalid request'}), 400
        
        # Default: return list of categories
        try:
            count = min(int(request.args.get('count', 0)), 100) or None
        except (TypeError, ValueError):
            count = None
            
        return jsonify({
            'status': 'success',
            'categories': list(currency_service.get_categories(count=count))
        })
async def get_exchange_rates(self, base_currency: str) -> Dict:
        """Get exchange rates for a base currency"""
        if not base_currency:
            base_currency = app.config['DEFAULT_CURRENCY']
            
        # Check if we have fresh cached rates
        if (self._exchange_rates and 
            self._last_updated and 
            (datetime.now() - self._last_updated).total_seconds() < self.CACHE_DURATION and
            self._exchange_rates.get('base') == base_currency):
            return self._exchange_rates
            
        try:
            url = app.config['EXCHANGE_RATE_API'].format(base_currency)
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            self._exchange_rates = response.json()
            self._last_updated = datetime.now()
            return self._exchange_rates
            
        except Exception as e:
            print(f"Error fetching exchange rates: {e}")
            return {
                'base': base_currency,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'rates': {base_currency: 1.0}  # Fallback to 1:1 if API fails
            }

# Initialize services
currency_service = CurrencyService()

def preprocess_image(image_path: str) -> np.ndarray:
    """Preprocess image for better OCR results"""
    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read the image file")
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding to preprocess the image
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    # Apply dilation and erosion to remove noise
    kernel = np.ones((1, 1), np.uint8)
    gray = cv2.dilate(gray, kernel, iterations=1)
    gray = cv2.erode(gray, kernel, iterations=1)
    
    return gray

def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image using OCR with EasyOCR as the primary engine"""
    import traceback
    
    def use_easyocr(img_path: str) -> str:
        """Extract text using EasyOCR"""
        try:
            print(f"[DEBUG] Using EasyOCR on {img_path}")
            if not os.path.exists(img_path):
                print(f"[ERROR] File not found: {img_path}")
                return ""
                
            if os.path.getsize(img_path) == 0:
                print(f"[ERROR] File is empty: {img_path}")
                return ""
                
            import easyocr
            print("[DEBUG] Initializing EasyOCR reader...")
            # Initialize with English and other common languages if needed
            reader = easyocr.Reader(['en'])  # Add more languages if needed: ['en', 'es', 'fr', 'de', ...]
            print("[DEBUG] Reading text from image...")
            result = reader.readtext(img_path, detail=0)
            print(f"[DEBUG] EasyOCR extracted {len(result)} text blocks")
            return "\n".join(result).strip()
        except Exception as e:
            error_msg = f"[ERROR] EasyOCR failed: {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            return ""
    
    print(f"\n{'='*50}")
    print(f"[DEBUG] Processing image: {image_path}")
    print(f"[DEBUG] File exists: {os.path.exists(image_path)}")
    
    if not os.path.exists(image_path):
        print(f"[ERROR] Image file not found: {image_path}")
        return ""
    
    # Use EasyOCR as the primary OCR engine
    text = use_easyocr(image_path)
    
    if not text:
        print("[WARNING] EasyOCR failed to extract text")
    else:
        print(f"[DEBUG] Successfully extracted text: {text[:100]}...")
    
    print(f"{'='*50}\n")
    return text or ""  # Return the extracted text or empty string if no text was extracted
def extract_merchant(text: str) -> str:
    """Extract merchant name from receipt text"""
    # Look for common merchant patterns
    patterns = [
        r'(?:at|from|@)\s*([A-Z][a-zA-Z0-9\s&.,-]+?)(?:\n|$|\s+[A-Z])',
        r'^\s*([A-Z][a-zA-Z0-9\s&.,-]+?)\s*\n',
        r'([A-Z][A-Z0-9\s&.,-]{3,})(?:\n|$)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            merchant = match.group(1).strip()
            # Clean up the merchant name
            merchant = re.sub(r'[^\w\s&.,-]', '', merchant)
            if len(merchant) > 2:  # Ensure it's a reasonable length
                return merchant
    
    return "Unknown Merchant"

def extract_date(text: str) -> str:
    """Extract date from receipt text"""
    # Look for various date formats
    date_patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # DD/MM/YYYY or MM/DD/YYYY
        r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',    # YYYY-MM-DD
        r'(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})',  # 01 Jan 2023
        r'([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})'    # January 1, 2023
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            try:
                # Try to parse the date
                from dateutil import parser
                date_str = match.group(1)
                date_obj = parser.parse(date_str, dayfirst=True, yearfirst=False)
                return date_obj.strftime('%Y-%m-%d')
            except:
                continue
    
    return datetime.now().strftime('%Y-%m-%d')  # Default to today if no date found

def extract_total_amount(text: str) -> float:
    """Extract total amount from receipt text"""
    # Look for total amount patterns
    patterns = [
        r'(?:total|total amount|amount due|balance|amt|ttl|subtotal)[^\d]*([$€£¥₹]?\s*\d+[.,]\d{2})',
        r'([$€£¥₹]\s*\d+[.,]\d{2})\s*(?:\n|$)',
        r'(?:total|total amount|amount due|balance|amt|ttl|subtotal)[^\d]*(\d+[.,]\d{2})',
        r'\b(\d+[.,]\d{2})\s*(?:\n|$)'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        if matches:
            # Get the last match (often the total is the last amount)
            amount_str = matches[-1].replace(',', '.').replace(' ', '')
            try:
                # Remove any non-numeric characters except decimal point
                amount_str = re.sub(r'[^\d.]', '', amount_str)
                return float(amount_str)
            except (ValueError, IndexError):
                continue
    
    return 0.0

def extract_items(text: str) -> List[Dict[str, Any]]:
    """Extract line items from receipt text"""
    items = []
    
    # Look for item patterns (this is a simple implementation)
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        # Look for lines that might contain item information
        if re.search(r'\d+\s*[xX]\s*\d+[.,]\d{2}', line) or re.search(r'\d+[.,]\d{2}\s*$', line):
            # Try to extract quantity, description, and amount
            parts = re.split(r'\s{2,}|\t', line)  # Split on multiple spaces or tabs
            if len(parts) >= 2:
                # Try to extract amount (usually at the end)
                amount_match = re.search(r'([$€£¥₹]?\s*\d+[.,]\d{2})\s*$', line)
                if amount_match:
                    amount_str = amount_match.group(1).replace(',', '.')
                    amount = float(re.sub(r'[^\d.]', '', amount_str))
                    
                    # The rest is the description
                    description = line[:amount_match.start()].strip()
                    
                    # Try to extract quantity if present (e.g., "2 x 10.00")
                    quantity = 1
                    qty_match = re.search(r'(\d+)\s*[xX]\s*\d+[.,]\d{2}', description)
                    if qty_match:
                        quantity = int(qty_match.group(1))
                        description = description.replace(qty_match.group(0), '').strip()
                    
                    items.append({
                        'description': description or 'Item',
                        'quantity': quantity,
                        'amount': amount
                    })
    
    # If no items found but we have a total, create a single item
    if not items:
        total = extract_total_amount(text)
        if total > 0:
            items.append({
                'description': 'Purchase',
                'quantity': 1,
                'amount': total
            })
    
    return items

def detect_category_from_text(text: str) -> str:
    """Detect the most likely category from receipt text"""
    return currency_service.detect_category(text)

@app.route('/')
def index():
    """Root endpoint that provides API information"""
    return jsonify({
        'name': 'Expense Processing API',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'upload': {'method': 'POST', 'path': '/api/upload'},
            'categories': {'method': 'GET', 'path': '/api/categories'},
            'currencies': {'method': 'GET', 'path': '/api/currencies'},
            'exchange_rates': {
                'method': 'GET', 
                'path': '/api/exchange-rates/<base_currency>',
                'default_currency': app.config['DEFAULT_CURRENCY']
            },
            'report': {
                'method': 'GET', 
                'path': '/api/report/<report_id>.<format>', 
                'formats': ['json', 'xlsx']
            }
        }
    })

@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    """Get list of supported currencies with country information"""
    try:
        # Make sure the requests module is imported
        import requests
        
        # Add a timeout to the request
        response = requests.get(
            'https://restcountries.com/v3.1/all?fields=name,currencies',
            timeout=10  # 10 seconds timeout
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the response
        countries = response.json()
        
        # Process the data
        currency_list = []
        for country in countries:
            if 'currencies' in country:
                for currency_code, currency_info in country['currencies'].items():
                    currency_list.append({
                        'code': currency_code.upper(),
                        'name': currency_info.get('name', ''),
                        'symbol': currency_info.get('symbol', ''),
                        'country': country['name'].get('common', '')
                    })
        
        # Remove duplicates
        unique_currencies = {currency['code']: currency for currency in currency_list}.values()
        
        return jsonify({
            'status': 'success',
            'currencies': list(unique_currencies)
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to fetch currencies: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get list of expense categories"""
    return currency_service.get_categories()

@app.route('/api/exchange-rates/<base_currency>', methods=['GET'])
def get_exchange_rates(base_currency: str):
    """Get exchange rates for a base currency"""
    rates = currency_service.get_exchange_rates(base_currency.upper())
    return jsonify({
        'status': 'success',
        'base_currency': base_currency.upper(),
        'rates': rates.get('rates', {})
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and process receipts using OCR"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Generate a unique report ID
        report_id = str(uuid.uuid4())
        
        # Save the uploaded file
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.jpg', '.jpeg', '.png', '.pdf']:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        filename = f"{report_id}{file_ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from the image
        text = extract_text_from_image(filepath)
        
        # Process the extracted text to get receipt data
        merchant = extract_merchant(text)
        receipt_date = extract_date(text)
        total_amount = extract_total_amount(text)
        items = extract_items(text)
        
        # If no items found but we have a total, create a single item
        if not items and total_amount > 0:
            items = [{
                'description': 'Purchase',
                'quantity': 1,
                'amount': total_amount
            }]
        
        # Prepare the report data
        report_data = {
            'report_id': report_id,
            'filename': filename,
            'uploaded_at': datetime.utcnow().isoformat(),
            'status': 'processed',
            'expense_data': {
                'merchant': merchant,
                'date': receipt_date,
                'amount': total_amount,
                'currency': 'USD',  # Default, can be extracted from text
                'category': detect_category_from_text(text),
                'items': items
            },
            'raw_text': text  # Include raw extracted text for debugging
        }
        
        # Initialize ReportGenerator with the reports directory
        generator = ReportGenerator(base_dir=app.config['REPORTS_FOLDER'])
        
        # Generate reports using the ReportGenerator
        report_paths = generator.generate_reports(report_id, report_data)
        
        # Log the generated report paths
        print(f"Generated reports:")
        for format, path in report_paths.items():
            print(f"- {format.upper()}: {path} ({os.path.getsize(path)} bytes)")
            
        print(f"Extracted text: {text[:200]}...")
        return jsonify({
            'status': 'success',
            'message': 'File uploaded and processed successfully',
            'report_id': report_id,
            'download_links': {
                'json': f'/api/report/{report_id}.json',
                'xlsx': f'/api/report/{report_id}.xlsx'
            }
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error processing file: {str(e)}")
        print(f"Error details: {error_details}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to process file: {str(e)}',
            'error_details': error_details.split('\n') if app.debug else None
        }), 500



@app.route('/api/report/<report_id>.<format>', methods=['GET'])
def get_report(report_id, format):
    """Download report in specified format"""
    if format not in ['json', 'xlsx']:
        return jsonify({'error': 'Unsupported report format'}), 400
    
    # Construct the path based on the new directory structure
    report_path = os.path.join(app.config['REPORTS_FOLDER'], format, f"{report_id}.{format}")
    
    if not os.path.exists(report_path):
        # Fallback to old path for backward compatibility
        old_path = os.path.join(app.config['REPORTS_FOLDER'], f"{report_id}.{format}")
        if os.path.exists(old_path):
            report_path = old_path
        else:
            return jsonify({'error': 'Report not found'}), 404
    
    try:
        if format == 'json':
            with open(report_path, 'r', encoding='utf-8') as f:
                report_data = json.load(f)
            response = make_response(jsonify({
                'status': 'success',
                'report_id': report_id,
                'data': report_data
            }))
            response.headers['Content-Type'] = 'application/json'
            return response
        else:  # xlsx
            return send_file(
                report_path,
                as_attachment=True,
                download_name=f"expense_report_{report_id}.xlsx",
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment_kwargs={
                    'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'as_attachment': True,
                    'download_name': f"expense_report_{report_id}.xlsx"
                }
            )
    except Exception as e:
        import traceback
        print(f"Error in get_report: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to generate report: {str(e)}'
        }), 500



if __name__ == '__main__':
    # Create required directories
    for folder in [
        app.config['UPLOAD_FOLDER'],
        app.config['REPORTS_FOLDER'],
        os.path.join(app.config['REPORTS_FOLDER'], 'json'),
        os.path.join(app.config['REPORTS_FOLDER'], 'xlsx')
    ]:
        os.makedirs(folder, exist_ok=True)
    
    # Start the Flask development server
    app.run(debug=True, host='0.0.0.0', port=5000)