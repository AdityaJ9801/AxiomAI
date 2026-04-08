#!/usr/bin/env python3
"""
Test script to verify API endpoints are working correctly
"""

import requests
import json
import pandas as pd
import numpy as np
from io import StringIO

API_BASE = "http://localhost:8000"

def test_health_check():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE}/api/health")
        if response.status_code == 200:
            print("✓ API is running")
            return True
        else:
            print(f"✗ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to API: {e}")
        return False

def test_dataset_upload():
    """Test dataset upload with sample data"""
    try:
        # Create sample CSV data
        sample_data = """date,value,category,amount
2023-01-01,100.5,A,1000
2023-01-02,102.3,B,1100
2023-01-03,98.7,A,950
2023-01-04,105.2,C,1200
2023-01-05,103.8,B,1050"""
        
        # Save to temporary file
        with open("temp_test_data.csv", "w") as f:
            f.write(sample_data)
        
        # Upload file
        with open("temp_test_data.csv", "rb") as f:
            files = {"file": ("test_data.csv", f, "text/csv")}
            response = requests.post(f"{API_BASE}/api/dataset/upload", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Dataset upload successful")
            print(f"  Shape: {data.get('dataset_info', {}).get('shape', 'Unknown')}")
            return True
        else:
            print(f"✗ Dataset upload failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Dataset upload error: {e}")
        return False
    finally:
        # Clean up
        import os
        if os.path.exists("temp_test_data.csv"):
            os.remove("temp_test_data.csv")

def test_dataset_info():
    """Test dataset info endpoint"""
    try:
        response = requests.get(f"{API_BASE}/api/dataset/info")
        if response.status_code == 200:
            data = response.json()
            print("✓ Dataset info retrieved")
            print(f"  Columns: {len(data.get('columns', []))}")
            return True
        else:
            print(f"✗ Dataset info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Dataset info error: {e}")
        return False

def test_descriptive_analysis():
    """Test descriptive analysis endpoint"""
    try:
        payload = {
            "analysis_type": "descriptive",
            "parameters": {}
        }
        response = requests.post(
            f"{API_BASE}/api/analysis/descriptive",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Descriptive analysis successful")
            if "results" in data:
                results = data["results"]
                print(f"  Numeric summary columns: {len(results.get('numeric_summary', {}))}")
                print(f"  Correlation matrix size: {len(results.get('correlation_matrix', {}))}")
            return True
        else:
            print(f"✗ Descriptive analysis failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Descriptive analysis error: {e}")
        return False

def main():
    print("Testing API endpoints...\n")
    
    # Test health check
    if not test_health_check():
        print("API is not running. Please start the backend server first.")
        return
    
    print()
    
    # Test dataset upload
    if test_dataset_upload():
        print()
        
        # Test dataset info
        test_dataset_info()
        print()
        
        # Test analysis
        test_descriptive_analysis()
    
    print("\nAPI endpoint testing completed.")

if __name__ == "__main__":
    main()