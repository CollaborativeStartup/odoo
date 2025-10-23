import os
import requests
from pathlib import Path

# Configuration
BASE_URL = 'http://localhost:5000'  # Update if your server runs on a different port
TEST_IMAGES_DIR = r'c:\Users\HP\odoo\realistic_test_receipts'
UPLOAD_ENDPOINT = f'{BASE_URL}/api/upload'  # Update endpoint if different

def test_receipt_upload(image_path):
    """Test uploading a single receipt image"""
    try:
        with open(image_path, 'rb') as img:
            files = {'file': (os.path.basename(image_path), img, 'image/jpeg')}
            response = requests.post(UPLOAD_ENDPOINT, files=files)
        
        print(f"\nTesting: {os.path.basename(image_path)}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Extracted Data:")
            print(f"Merchant: {result.get('merchant', 'Not found')}")
            print(f"Total Amount: {result.get('total_amount', 'Not found')}")
            print(f"Date: {result.get('date', 'Not found')}")
            print("Items:")
            for item in result.get('items', []):
                print(f"  - {item.get('description', '')}: {item.get('amount', '')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")

def run_tests():
    """Run tests on all images in the test directory"""
    test_images = list(Path(TEST_IMAGES_DIR).glob('*.jpg')) + \
                 list(Path(TEST_IMAGES_DIR).glob('*.png'))
    
    if not test_images:
        print(f"No test images found in {TEST_IMAGES_DIR}")
        return
    
    print(f"Found {len(test_images)} test images. Starting tests...")
    
    for image_path in test_images:
        test_receipt_upload(str(image_path))
        print("\n" + "="*50 + "\n")

if __name__ == '__main__':
    # Make sure the server is running first!
    print("Make sure the Flask server is running before starting tests!")
    print(f"Test images directory: {TEST_IMAGES_DIR}")
    input("Press Enter to start testing...")
    
    run_tests()
    print("\nTesting complete!")
