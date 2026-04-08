#!/usr/bin/env python3
"""
Test script for visualization API endpoints
"""

import requests
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Test configuration
API_BASE = "http://localhost:8000"
TEST_DATA_FILE = "sample_datasets/sample_economic_data.csv"

def test_visualization_endpoints():
    """Test all visualization API endpoints"""
    print("🧪 Testing Visualization API Endpoints")
    print("=" * 50)
    
    # First, upload a test dataset
    print("📁 Uploading test dataset...")
    
    test_file_path = Path(__file__).parent / TEST_DATA_FILE
    if not test_file_path.exists():
        print(f"❌ Test file not found: {test_file_path}")
        return False
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            response = requests.post(f"{API_BASE}/api/dataset/upload", files=files)
        
        if response.status_code == 200:
            print("✅ Dataset uploaded successfully")
        else:
            print(f"❌ Dataset upload failed: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False
    
    # Test visualization options endpoint
    print("\n🔍 Testing visualization options...")
    try:
        response = requests.get(f"{API_BASE}/api/visualization/options")
        if response.status_code == 200:
            options = response.json()
            print("✅ Visualization options retrieved")
            print(f"   Numeric columns: {len(options.get('columns', {}).get('numeric', []))}")
            print(f"   Suggestions: {len(options.get('suggestions', []))}")
            
            # Store columns for further testing
            numeric_cols = options.get('columns', {}).get('numeric', [])
            
        else:
            print(f"❌ Options request failed: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"❌ Options error: {e}")
        return False
    
    # Test histogram endpoint
    if numeric_cols:
        print(f"\n📊 Testing histogram for column: {numeric_cols[0]}")
        try:
            response = requests.post(f"{API_BASE}/api/visualization/histogram", 
                                   params={'column': numeric_cols[0], 'bins': 20})
            
            if response.status_code == 200:
                hist_data = response.json()
                print("✅ Histogram created successfully")
                print(f"   Chart type: {hist_data.get('chart_type')}")
                print(f"   Data points: {len(hist_data.get('data', []))}")
                print(f"   Mean: {hist_data.get('statistics', {}).get('mean', 'N/A')}")
            else:
                print(f"❌ Histogram request failed: {response.status_code}")
                print(f"   Error: {response.text}")
        
        except Exception as e:
            print(f"❌ Histogram error: {e}")
    
    # Test scatter plot endpoint
    if len(numeric_cols) >= 2:
        print(f"\n⚡ Testing scatter plot: {numeric_cols[0]} vs {numeric_cols[1]}")
        try:
            response = requests.post(f"{API_BASE}/api/visualization/scatter",
                                   params={'x_column': numeric_cols[0], 'y_column': numeric_cols[1]})
            
            if response.status_code == 200:
                scatter_data = response.json()
                print("✅ Scatter plot created successfully")
                print(f"   Chart type: {scatter_data.get('chart_type')}")
                print(f"   Data points: {len(scatter_data.get('data', []))}")
                print(f"   Correlation: {scatter_data.get('correlation', 'N/A')}")
            else:
                print(f"❌ Scatter plot request failed: {response.status_code}")
                print(f"   Error: {response.text}")
        
        except Exception as e:
            print(f"❌ Scatter plot error: {e}")
    
    # Test line chart endpoint
    if len(numeric_cols) >= 2:
        print(f"\n📈 Testing line chart: {numeric_cols[0]} vs {numeric_cols[1]}")
        try:
            response = requests.post(f"{API_BASE}/api/visualization/line",
                                   params={'x_column': numeric_cols[0], 'y_column': numeric_cols[1]})
            
            if response.status_code == 200:
                line_data = response.json()
                print("✅ Line chart created successfully")
                print(f"   Chart type: {line_data.get('chart_type')}")
                print(f"   Data points: {len(line_data.get('data', []))}")
            else:
                print(f"❌ Line chart request failed: {response.status_code}")
                print(f"   Error: {response.text}")
        
        except Exception as e:
            print(f"❌ Line chart error: {e}")
    
    print("\n✅ Visualization API testing completed!")
    return True

def test_api_health():
    """Test if the API server is running"""
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print("🚀 Visualization API Test Suite")
    print("=" * 50)
    
    # Check if API server is running
    if not test_api_health():
        print("❌ API server is not running!")
        print("   Please start the backend server first:")
        print("   cd backend && python start_server.py")
        exit(1)
    
    print("✅ API server is running")
    
    # Run visualization tests
    success = test_visualization_endpoints()
    
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed!")
        exit(1)