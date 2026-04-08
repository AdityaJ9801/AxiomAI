#!/usr/bin/env python3
"""
Test Time Series Analysis Fix
Verify that the datetime parsing and time series analysis works correctly
"""

import pandas as pd
import numpy as np
import tempfile
import os
from datetime import datetime, timedelta
import requests
import json

def create_test_datasets():
    """Create test datasets with various date formats"""
    
    # Dataset 1: Standard ISO format
    dates1 = pd.date_range('2023-01-01', periods=50, freq='D')
    df1 = pd.DataFrame({
        'date': dates1.strftime('%Y-%m-%d'),
        'value': np.random.randn(50).cumsum() + 100
    })
    
    # Dataset 2: US format
    dates2 = pd.date_range('2023-01-01', periods=30, freq='M')
    df2 = pd.DataFrame({
        'date': dates2.strftime('%m/%d/%Y'),
        'sales': np.random.randn(30).cumsum() + 1000
    })
    
    # Dataset 3: European format
    dates3 = pd.date_range('2023-01-01', periods=20, freq='W')
    df3 = pd.DataFrame({
        'date': dates3.strftime('%d-%m-%Y'),
        'revenue': np.random.randn(20).cumsum() + 5000
    })
    
    # Dataset 4: With some invalid dates
    dates4 = pd.date_range('2023-01-01', periods=25, freq='D')
    date_strings = dates4.strftime('%Y-%m-%d').tolist()
    date_strings[10] = 'invalid_date'  # Add invalid date
    date_strings[15] = '2023-13-45'    # Add another invalid date
    
    df4 = pd.DataFrame({
        'timestamp': date_strings,
        'metric': np.random.randn(25).cumsum() + 50
    })
    
    return [
        (df1, 'date', 'value', 'ISO format'),
        (df2, 'date', 'sales', 'US format'),
        (df3, 'date', 'revenue', 'European format'),
        (df4, 'timestamp', 'metric', 'With invalid dates')
    ]

def test_datetime_parsing():
    """Test datetime parsing functionality"""
    print("Testing datetime parsing...")
    
    test_datasets = create_test_datasets()
    
    for i, (df, date_col, value_col, description) in enumerate(test_datasets):
        print(f"\nTest {i+1}: {description}")
        print(f"Sample dates: {df[date_col].head(3).tolist()}")
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            df.to_csv(f.name, index=False)
            temp_file = f.name
        
        try:
            # Test the parsing logic (simulate what happens in backend)
            ts_data = df[[date_col, value_col]].copy()
            
            # Try parsing with different methods
            sample_dates = ts_data[date_col].dropna().head(10)
            
            common_formats = [
                '%Y-%m-%d',
                '%Y/%m/%d', 
                '%d/%m/%Y',
                '%m/%d/%Y',
                '%Y-%m-%d %H:%M:%S',
                '%Y/%m/%d %H:%M:%S',
                '%d-%m-%Y',
                '%m-%d-%Y'
            ]
            
            working_format = None
            for fmt in common_formats:
                try:
                    pd.to_datetime(sample_dates.iloc[0], format=fmt)
                    success_count = 0
                    for date_val in sample_dates.head(5):
                        try:
                            pd.to_datetime(date_val, format=fmt)
                            success_count += 1
                        except:
                            break
                    
                    if success_count >= min(3, len(sample_dates)):
                        working_format = fmt
                        break
                except:
                    continue
            
            if working_format:
                print(f"  ✓ Detected format: {working_format}")
                ts_data[date_col] = pd.to_datetime(ts_data[date_col], format=working_format, errors='coerce')
            else:
                print(f"  ⚠ Using pandas inference")
                ts_data[date_col] = pd.to_datetime(ts_data[date_col], infer_datetime_format=True, errors='coerce')
            
            # Check results
            valid_dates = ts_data[date_col].notna().sum()
            total_dates = len(ts_data)
            
            print(f"  Valid dates: {valid_dates}/{total_dates}")
            
            if valid_dates > 0:
                ts_data_clean = ts_data.dropna(subset=[date_col])
                ts_data_clean = ts_data_clean.set_index(date_col).sort_index()
                print(f"  Date range: {ts_data_clean.index.min()} to {ts_data_clean.index.max()}")
                print(f"  ✓ Parsing successful")
            else:
                print(f"  ✗ No valid dates parsed")
        
        except Exception as e:
            print(f"  ✗ Error: {e}")
        
        finally:
            # Clean up
            if os.path.exists(temp_file):
                os.unlink(temp_file)

def test_api_endpoint():
    """Test the actual API endpoint if server is running"""
    print("\n" + "="*50)
    print("Testing API Endpoint (if server is running)")
    print("="*50)
    
    API_BASE = "http://localhost:8000"
    
    try:
        # Check if server is running
        health_response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if health_response.status_code != 200:
            print("⚠ Backend server not running, skipping API tests")
            return
        
        print("✓ Backend server is running")
        
        # Create and upload test dataset
        dates = pd.date_range('2023-01-01', periods=30, freq='D')
        test_df = pd.DataFrame({
            'date': dates.strftime('%Y-%m-%d'),
            'value': np.random.randn(30).cumsum() + 100,
            'category': np.random.choice(['A', 'B', 'C'], 30)
        })
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            test_df.to_csv(f.name, index=False)
            temp_file = f.name
        
        try:
            # Upload dataset
            with open(temp_file, 'rb') as f:
                files = {"file": ("test_timeseries.csv", f, "text/csv")}
                upload_response = requests.post(f"{API_BASE}/api/dataset/upload", files=files)
            
            if upload_response.status_code == 200:
                print("✓ Dataset uploaded successfully")
                
                # Test time series analysis
                analysis_request = {
                    "analysis_type": "timeseries",
                    "parameters": {
                        "date_column": "date",
                        "value_column": "value",
                        "forecast_periods": 10
                    }
                }
                
                analysis_response = requests.post(
                    f"{API_BASE}/api/analysis/timeseries",
                    json=analysis_request,
                    headers={"Content-Type": "application/json"}
                )
                
                if analysis_response.status_code == 200:
                    result = analysis_response.json()
                    print("✓ Time series analysis successful")
                    print(f"  Series length: {result['results']['series_length']}")
                    print(f"  Date range: {result['results']['start_date']} to {result['results']['end_date']}")
                    print(f"  Trend: {result['results']['trend']}")
                    
                    if 'forecast' in result['results']:
                        forecast = result['results']['forecast']
                        print(f"  Forecast periods: {forecast['periods']}")
                        print(f"  Forecast values: {forecast['values'][:3]}... (showing first 3)")
                else:
                    print(f"✗ Time series analysis failed: {analysis_response.status_code}")
                    print(f"  Error: {analysis_response.text}")
            else:
                print(f"✗ Dataset upload failed: {upload_response.status_code}")
        
        finally:
            # Clean up
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    except requests.exceptions.RequestException:
        print("⚠ Cannot connect to backend server, skipping API tests")
    except Exception as e:
        print(f"✗ API test error: {e}")

def main():
    """Main test function"""
    print("Time Series Analysis Fix Test")
    print("="*50)
    
    # Test datetime parsing
    test_datetime_parsing()
    
    # Test API endpoint
    test_api_endpoint()
    
    print("\n" + "="*50)
    print("Test completed!")

if __name__ == "__main__":
    main()