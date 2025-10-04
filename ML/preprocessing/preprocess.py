import cv2
import numpy as np
import os
import pandas as pd
from datetime import datetime
from textblob import TextBlob
import re
import requests
import easyocr

def preprocess_image_for_ocr(image_path: str) -> np.ndarray:
    """Enhanced image preprocessing for better OCR results"""
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read the image file")
            
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Apply CLAHE for contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Additional denoising
        kernel = np.ones((1, 1), np.uint8)
        processed = cv2.dilate(thresh, kernel, iterations=1)
        processed = cv2.erode(processed, kernel, iterations=1)
        
        return processed
        
    except Exception as e:
        print(f"Error in image preprocessing: {e}")
        return cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2GRAY)

def correct_text(text: str) -> str:
    """Correct common OCR errors in the extracted text"""
    ocr_corrections = {
        '9': 's', '0': 'o', '1': 'i', '5': 's', '4': 'a', '8': 'b',
        '\\$': 's', '\\*': 'x', '!': 'i', '~': '-', '\\|': 'i'
    }
    
    for wrong, right in ocr_corrections.items():
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)
    
    try:
        return str(TextBlob(text).correct())
    except Exception as e:
        print(f"Text correction failed: {e}")
        return text

def extract_receipt_data(text: str, image_name: str) -> dict:
    """Extract structured data from receipt text"""
    data = {
        'restaurant_name': '',
        'address': '',
        'phone': '',
        'invoice_number': '',
        'date_time': '',
        'items': [],
        'subtotal': 0.0,
        'tax': 0.0,
        'total': 0.0,
        'payment_method': '',
        'source_image': image_name
    }
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return data
    
    data['restaurant_name'] = lines[0] if lines else ''
    data['address'] = lines[1] if len(lines) > 1 else ''
    
    item_pattern = re.compile(r'^(.+?)\s*[x*]\s*[0-9]\s*(\d+\.?\d*)$')
    
    for line in lines:
        line_lower = line.lower()
        
        if not data['phone'] and ('phone' in line_lower or 'tel' in line_lower):
            data['phone'] = re.sub(r'[^0-9+\-]', '', line)
        
        if not data['invoice_number'] and ('invoice' in line_lower or 'inv' in line_lower):
            data['invoice_number'] = re.sub(r'[^0-9a-zA-Z#]', '', line)
        
        if not data['date_time'] and ('date' in line_lower or 'time' in line_lower):
            data['date_time'] = line
        
        if match := item_pattern.search(line):
            item_name = match.group(1).strip()
            item_price = float(match.group(2))
            data['items'].append({'name': item_name, 'price': item_price})
        
        if 'subtotal' in line_lower:
            data['subtotal'] = float(re.findall(r'\d+\.?\d*', line)[-1])
        elif 'tax' in line_lower or 'vat' in line_lower:
            data['tax'] = float(re.findall(r'\d+\.?\d*', line)[-1])
        elif 'total' in line_lower and not data['total']:
            data['total'] = float(re.findall(r'\d+\.?\d*', line)[-1])
        
        if 'payment' in line_lower or 'pay' in line_lower:
            data['payment_method'] = line.split(':')[-1].strip()
    
    return data

def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image using EasyOCR"""
    try:
        # Initialize EasyOCR reader (English only)
        reader = easyocr.Reader(['en'])
        
        # Read and preprocess image
        processed_img = preprocess_image(image_path)
        
        # Save processed image to a temporary file for EasyOCR
        temp_path = "temp_processed.jpg"
        cv2.imwrite(temp_path, processed_img)
        
        # Extract text
        result = reader.readtext(
            temp_path,
            detail=0,
            paragraph=True,
            width_ths=0.7,
            height_ths=0.5
        )
        
        # Clean up
        try:
            os.remove(temp_path)
        except:
            pass
            
        text = "\n".join(result).strip()
        return text
        
    except Exception as e:
        print(f"Error in text extraction: {e}")
        return ""
def process_receipts(input_dir: str, output_file: str):
    """Process all receipt images in a directory and save to a single Excel file"""
    if not os.path.exists(input_dir):
        print(f"Input directory {input_dir} does not exist")
        return
    
    # Initialize EasyOCR reader once
    print("Initializing EasyOCR (this might take a moment)...")
    
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        all_data = []
        
        # Get list of image files
        image_files = [f for f in os.listdir(input_dir) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        for filename in image_files:
            image_path = os.path.join(input_dir, filename)
            print(f"\nProcessing {filename}...")
            
            # Extract text and correct it
            raw_text, corrected_text = extract_text_from_image(image_path)
            
            # Extract structured data
            receipt_data = extract_receipt_data(corrected_text, filename)
            all_data.append(receipt_data)
            
            # Save raw and corrected text to separate sheets
            text_df = pd.DataFrame({
                'Field': ['Raw Text', 'Corrected Text'],
                'Value': [raw_text, corrected_text]
            })
            
            sheet_name = os.path.splitext(filename)[0][:31]
            text_df.to_excel(writer, sheet_name=f"{sheet_name}_text", index=False)
        
        # Save all receipt data to a summary sheet
        if all_data:
            summary_data = []
            for receipt in all_data:
                items_str = "; ".join([f"{item['name']} (${item['price']:.2f})" 
                                     for item in receipt['items']])
                summary_data.append({
                    'Restaurant': receipt['restaurant_name'],
                    'Invoice #': receipt['invoice_number'],
                    'Date/Time': receipt['date_time'],
                    'Items': items_str,
                    'Subtotal': receipt['subtotal'],
                    'Tax': receipt['tax'],
                    'Total': receipt['total'],
                    'Payment Method': receipt['payment_method'],
                    'Source Image': receipt['source_image']
                })
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
    
    print(f"\nProcessing complete. Results saved to {output_file}")

if __name__ == "__main__":
    input_directory = r"c:\Users\HP\odoo\realistic_test_receipts"
    output_excel = r"c:\Users\HP\odoo\Backend\reports\receipts_analysis.xlsx"
    
    os.makedirs(os.path.dirname(output_excel), exist_ok=True)
    process_receipts(input_directory, output_excel)