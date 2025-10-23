"""
Report Generator Module

This module handles the generation of reports in different formats (JSON, XLSX)
using the extracted receipt data. It provides a clean interface for creating
well-formatted and documented output files with text correction capabilities.
"""

import os
import json
import re
import string
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
from textblob import TextBlob
import unicodedata

class TextCorrector:
    """
    Handles text correction and cleaning operations.
    """
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize text by removing special characters and extra whitespace.
        
        Args:
            text (str): Input text to clean
            
        Returns:
            str: Cleaned text
        """
        if not isinstance(text, str):
            return text
            
        # Remove non-printable characters
        text = ''.join(char for char in text if char in string.printable)
        
        # Normalize unicode characters
        text = unicodedata.normalize('NFKC', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    @staticmethod
    def correct_spelling(text: str) -> str:
        """
        Correct spelling in the given text.
        
        Args:
            text (str): Input text to correct
            
        Returns:
            str: Text with corrected spelling
        """
        if not isinstance(text, str) or not text.strip():
            return text
            
        try:
            blob = TextBlob(text)
            return str(blob.correct())
        except Exception as e:
            print(f"Error in spelling correction: {e}")
            return text
    
    @staticmethod
    def correct_grammar(text: str) -> str:
        """
        Correct grammar in the given text.
        
        Args:
            text (str): Input text to correct
            
        Returns:
            str: Text with corrected grammar
        """
        if not isinstance(text, str) or not text.strip():
            return text
            
        try:
            blob = TextBlob(text)
            # Correct some common grammar issues
            corrected = str(blob.correct())
            # Fix common contractions and possessives
            corrected = re.sub(r"\b(cant)\b", "can't", corrected, flags=re.IGNORECASE)
            corrected = re.sub(r"\b(dont)\b", "don't", corrected, flags=re.IGNORECASE)
            corrected = re.sub(r"\b(wont)\b", "won't", corrected, flags=re.IGNORECASE)
            return corrected
        except Exception as e:
            print(f"Error in grammar correction: {e}")
            return text
    
    @staticmethod
    def standardize_currency_symbols(text: str) -> str:
        """
        Standardize currency symbols in the text.
        
        Args:
            text (str): Input text with currency symbols
            
        Returns:
            str: Text with standardized currency symbols
        """
        if not isinstance(text, str):
            return text
            
        # Standardize common currency symbols
        currency_mapping = {
            '\u20b9': '₹',  # Indian Rupee
            '\u00a3': '£',  # British Pound
            '\u00a5': '¥',  # Japanese Yen
            '\u20ac': '€',  # Euro
            '\u00a2': '¢',  # Cent
            '\u00a4': '¤',  # Currency sign
        }
        
        for old, new in currency_mapping.items():
            text = text.replace(old, new)
            
        return text

class ReportGenerator:
    """
    Handles generation of reports in various formats from receipt data.
    
    This class provides methods to generate reports in different formats
    (currently JSON and XLSX) from the extracted receipt data.
    Includes text correction and cleaning features.
    """
    
    def __init__(self, base_dir: str = 'reports'):
        """
        Initialize the ReportGenerator.
        
        Args:
            base_dir (str): Base directory to save generated reports.
                           Defaults to 'reports'.
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True, parents=True)
        self.text_corrector = TextCorrector()
    
    def generate_reports(self, report_id: str, data: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate reports in all available formats.
        
        Args:
            report_id (str): Unique identifier for the report.
            data (Dict[str, Any]): The receipt data to generate reports from.
            
        Returns:
            Dict[str, str]: Dictionary containing paths to the generated files.
        """
        return {
            'json': self.generate_json_report(report_id, data),
            'xlsx': self.generate_excel_report(report_id, data)
        }
    
    def clean_data(self, data: Union[Dict, List, str]) -> Union[Dict, List, str]:
        """
        Recursively clean and correct text data in the dictionary.
        
        Args:
            data: Data to clean (dict, list, or str)
            
        Returns:
            Cleaned data with corrected text
        """
        if isinstance(data, dict):
            return {k: self.clean_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_data(item) for item in data]
        elif isinstance(data, str):
            # Apply text cleaning and correction
            cleaned = self.text_corrector.clean_text(data)
            cleaned = self.text_corrector.standardize_currency_symbols(cleaned)
            
            # Only apply spelling/grammar correction to longer text fields
            # to avoid over-correcting codes, IDs, etc.
            if len(cleaned.split()) > 2:  # Only correct text with more than 2 words
                cleaned = self.text_corrector.correct_spelling(cleaned)
                cleaned = self.text_corrector.correct_grammar(cleaned)
                
            return cleaned
        return data
    
    def generate_json_report(self, report_id: str, data: Dict[str, Any]) -> str:
        """
        Generate a JSON report from the receipt data.
        
        Args:
            report_id (str): Unique identifier for the report.
            data (Dict[str, Any]): The receipt data.
            
        Returns:
            str: Path to the generated JSON file.
        """
        # Clean and correct the data
        cleaned_data = self.clean_data(data)
        
        # Create reports/json directory if it doesn't exist
        json_dir = self.base_dir / 'json'
        json_dir.mkdir(exist_ok=True)
        
        # Save as JSON
        json_path = json_dir / f"{report_id}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
            
        return str(json_path)
    
    def generate_excel_report(self, report_id: str, data: Dict[str, Any]) -> str:
        """
        Generate an Excel report from the receipt data.
        
        Args:
            report_id (str): Unique identifier for the report.
            data (Dict[str, Any]): The receipt data.
            
        Returns:
            str: Path to the generated Excel file.
        """
        # Clean and correct the data
        cleaned_data = self.clean_data(data)
        
        # Create Excel data
        excel_data = []
        
        # Add header
        excel_data.append(['Expense Report', ''])
        excel_data.append(['Generated at', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        excel_data.append([])
        
        # Add merchant and date info
        if 'merchant' in cleaned_data or 'date' in cleaned_data:
            excel_data.append(['Merchant', cleaned_data.get('merchant', 'N/A')])
            excel_data.append(['Date', cleaned_data.get('date', 'N/A')])
            excel_data.append(['Total Amount', cleaned_data.get('amount', 'N/A')])
            excel_data.append(['Currency', cleaned_data.get('currency', 'USD')])
            
            # Add additional fields if they exist
            for field in ['description', 'expense_line', 'expense_type', 'restaurant', 'expense_category']:
                if field in cleaned_data:
                    excel_data.append([field.replace('_', ' ').title(), cleaned_data[field]])
            
            excel_data.append([])  # Empty row for separation
            
            # Add items table
            if 'items' in cleaned_data and cleaned_data['items']:
                excel_data.append(['Items', 'Quantity', 'Unit Price', 'Amount'])
                for item in cleaned_data['items']:
                    excel_data.append([
                        item.get('description', ''),
                        item.get('quantity', 1),
                        item.get('unit_price', item.get('amount', 0)),
                        item.get('amount', 0)
                    ])
        
        # Create DataFrame
        df = pd.DataFrame(excel_data)
        
        # Create output directory if it doesn't exist
        output_dir = self.base_dir / 'xlsx'
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Save the Excel file
        output_path = output_dir / f"{report_id}.xlsx"
        df.to_excel(output_path, index=False, engine='openpyxl', header=False)
        
        return str(output_path)

# Example usage
if __name__ == "__main__":
    # Example data with some common OCR/typing errors
    sample_data = {
        "merchant": "Sample Store  ",  # Extra spaces
        "date": "2023-10-04",
        "amount": 123.45,
        "currency": "USD",
        "raw_text": "This is a smaple recipt with some speling erors and   extra spaces.",
        "items": [
            {"description": "Laptop Bag   ", "quantity": 2, "unit_price": 10.99, "amount": 21.98},
            {"description": "Wireless Mouse", "quantity": 1, "unit_price": 50.50, "amount": 50.50},
            {"description": "Tax", "amount": 10.97},
            {"description": "Service chrg", "amount": 5.00}  # Misspelled
        ]
    }
    
    print("Original data:")
    print(json.dumps(sample_data, indent=2))
    
    # Initialize the generator
    generator = ReportGenerator()
    
    # Clean the data
    print("\nCleaned data:")
    cleaned_data = generator.clean_data(sample_data)
    print(json.dumps(cleaned_data, indent=2))
    
    # Generate reports
    report_paths = generator.generate_reports("sample_report", sample_data)
    print(f"\nGenerated reports: {report_paths}")