import os
import requests
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = 'http://localhost:5000'
TEST_RECEIPTS_DIR = r'c:\Users\HP\odoo\realistic_test_receipts'
UPLOAD_ENDPOINT = f"{BASE_URL}/api/upload"
REPORT_ENDPOINT = f"{BASE_URL}/api/report"
REPORTS_DIR = os.path.join(os.path.dirname(__file__), 'reports')

def ensure_reports_dir():
    """Ensure the reports directory exists"""
    os.makedirs(REPORTS_DIR, exist_ok=True)

def test_upload_receipt(receipt_path):
    """Test uploading a single receipt"""
    try:
        with open(receipt_path, 'rb') as f:
            files = {'file': (os.path.basename(receipt_path), f, 'image/jpeg')}
            response = requests.post(UPLOAD_ENDPOINT, files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'file': os.path.basename(receipt_path),
                    'success': True,
                    'report_id': result.get('report_id'),
                    'message': 'Upload successful'
                }
            else:
                return {
                    'file': os.path.basename(receipt_path),
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}"
                }
    except Exception as e:
        return {
            'file': os.path.basename(receipt_path),
            'success': False,
            'error': str(e)
        }

def test_get_json_report(report_id):
    """Test retrieving a JSON report"""
    try:
        url = f"{REPORT_ENDPOINT}/{report_id}.json"
        response = requests.get(url, headers={'Accept': 'application/json'}, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        return {'error': f'HTTP {response.status_code}: {response.text}'}
    except Exception as e:
        return {'error': str(e)}

def test_get_xlsx_report(report_id):
    """Test downloading an XLSX report"""
    try:
        url = f"{REPORT_ENDPOINT}/{report_id}.xlsx"
        filename = f"report_{report_id}.xlsx"
        filepath = os.path.join(REPORTS_DIR, filename)
        
        with requests.get(url, stream=True, timeout=30) as response:
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                return {
                    'success': True,
                    'filename': filename,
                    'filepath': filepath,
                    'content_type': response.headers.get('Content-Type'),
                    'content_length': os.path.getsize(filepath)
                }
            return {'error': f'HTTP {response.status_code}'}
    except Exception as e:
        return {'error': str(e)}

def run_tests():
    """Run tests on all receipt images in the test directory"""
    ensure_reports_dir()
    
    # Find all receipt images
    receipt_files = list(Path(TEST_RECEIPTS_DIR).glob('*.jpg'))
    
    if not receipt_files:
        print(f"No receipt files found in {TEST_RECEIPTS_DIR}")
        return
    
    print(f"Found {len(receipt_files)} receipt files for testing")
    
    # Test 1: Upload all receipts
    print("\n=== Testing Receipt Uploads ===")
    
    # Using ThreadPoolExecutor to upload multiple files in parallel
    with ThreadPoolExecutor(max_workers=4) as executor:
        upload_results = list(executor.map(test_upload_receipt, receipt_files))
    
    # Print upload results
    success_count = sum(1 for r in upload_results if r['success'])
    print(f"\nUpload Results: {success_count}/{len(receipt_files)} successful")
    
    # Test 2: Get reports for successful uploads
    print("\n=== Testing Report Generation ===")
    report_results = []
    
    for result in upload_results:
        if not result['success']:
            continue
            
        report_id = result['report_id']
        print(f"\nTesting report for {result['file']} (ID: {report_id})")
        
        # Test JSON report
        print("  - Testing JSON report...")
        json_report = test_get_json_report(report_id)
        
        if isinstance(json_report, dict):
            if 'expense_data' in json_report:
                print("    ✓ JSON report received (expense data)")
                print(f"    Extracted data: {json.dumps(json_report['expense_data'], indent=2, default=str)}")
                json_success = True
            else:
                error_msg = json_report.get('error', 'No expense_data in response')
                print(f"    ✗ Failed to get JSON report: {error_msg}")
                json_success = False
        else:
            print(f"    ✗ Invalid JSON response: {json.dumps(json_report, indent=2, default=str)[:500]}...")
            json_success = False
        
        # Test XLSX report
        print("  - Testing XLSX report...")
        xlsx_report = test_get_xlsx_report(report_id)
        
        if isinstance(xlsx_report, dict) and 'filepath' in xlsx_report:
            file_size = xlsx_report.get('content_length', 0) / 1024  # Convert to KB
            print(f"    ✓ XLSX report saved to: {xlsx_report['filepath']} ({file_size:.2f} KB)")
            xlsx_success = True
        else:
            error_msg = xlsx_report.get('error', 'Unknown error') if isinstance(xlsx_report, dict) else str(xlsx_report)
            print(f"    ✗ Failed to save XLSX report: {error_msg}")
            xlsx_success = False
        
        report_results.append({
            'file': result['file'],
            'report_id': report_id,
            'json_success': json_success,
            'xlsx_success': xlsx_success
        })
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Total receipts processed: {len(upload_results)}")
    print(f"Successful uploads: {success_count}")
    print(f"Failed uploads: {len(upload_results) - success_count}")
    
    if report_results:
        json_success = sum(1 for r in report_results if r['json_success'])
        xlsx_success = sum(1 for r in report_results if r['xlsx_success'])
        print(f"\nReport Generation:")
        print(f"- JSON reports: {json_success}/{len(report_results)} successful")
        print(f"- XLSX reports: {xlsx_success}/{len(report_results)} successful")
    
    print("\nTesting complete!")

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code != 200:
            print(f"Error: Server at {BASE_URL} returned status code {response.status_code}")
            print("Response content:", response.text)
            exit(1)
        print(f"Successfully connected to server at {BASE_URL}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server at {BASE_URL}: {e}")
        print("\nPlease make sure the server is running. Start it with:")
        print("1. Open a new terminal")
        print("2. Run: python app.py")
        print("3. Keep that terminal open while running the tests")
        exit(1)
    
    run_tests()
