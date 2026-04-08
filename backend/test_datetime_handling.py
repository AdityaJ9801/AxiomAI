#!/usr/bin/env python3
"""
Test script to verify datetime handling in API endpoints
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from backend_api import convert_numpy_types, safe_datetime_convert, prepare_dataframe_for_json

def test_datetime_conversion():
    """Test datetime type conversion"""
    print("Testing datetime conversion...")
    
    # Create test data with various datetime types
    test_data = {
        "timestamp": pd.Timestamp("2023-01-01 12:00:00"),
        "datetime": datetime(2023, 1, 1, 12, 0, 0),
        "timedelta": pd.Timedelta(days=1),
        "numpy_datetime": np.datetime64("2023-01-01"),
        "date_string": "2023-01-01",
        "nested": {
            "inner_timestamp": pd.Timestamp("2023-01-02"),
            "inner_list": [pd.Timestamp("2023-01-03"), pd.Timestamp("2023-01-04")]
        }
    }
    
    # Convert and test
    converted = convert_numpy_types(test_data)
    
    try:
        json_str = json.dumps(converted)
        print("✓ Datetime conversion successful")
        print(f"Converted data: {converted}")
        return True
    except Exception as e:
        print(f"✗ Datetime conversion failed: {e}")
        return False

def test_dataframe_datetime_handling():
    """Test DataFrame with datetime columns"""
    print("\nTesting DataFrame datetime handling...")
    
    # Create DataFrame with datetime columns
    dates = pd.date_range("2023-01-01", periods=5, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "value": [100, 102, 98, 105, 103],
        "category": ["A", "B", "A", "C", "B"],
        "timestamp": pd.to_datetime(["2023-01-01 10:00", "2023-01-02 11:00", 
                                   "2023-01-03 12:00", "2023-01-04 13:00", "2023-01-05 14:00"])
    })
    
    print(f"Original dtypes: {df.dtypes.to_dict()}")
    
    # Test prepare_dataframe_for_json
    prepared_df = prepare_dataframe_for_json(df)
    print(f"Prepared dtypes: {prepared_df.dtypes.to_dict()}")
    
    # Test conversion to dict
    try:
        records = convert_numpy_types(prepared_df.to_dict('records'))
        json_str = json.dumps(records)
        print("✓ DataFrame datetime handling successful")
        print(f"Sample record: {records[0]}")
        return True
    except Exception as e:
        print(f"✗ DataFrame datetime handling failed: {e}")
        return False

def test_time_series_data():
    """Test time series specific data structures"""
    print("\nTesting time series data structures...")
    
    # Create time series data
    dates = pd.date_range("2023-01-01", periods=10, freq="D")
    ts_data = pd.DataFrame({
        "value": np.random.randn(10) * 10 + 100
    }, index=dates)
    
    # Simulate time series analysis result
    result = {
        "series_length": len(ts_data),
        "start_date": ts_data.index.min(),
        "end_date": ts_data.index.max(),
        "mean": ts_data["value"].mean(),
        "std": ts_data["value"].std(),
        "historical_data": ts_data.reset_index().to_dict('records')
    }
    
    print(f"Original result types: {type(result['start_date'])}, {type(result['historical_data'][0]['index'])}")
    
    # Test conversion
    try:
        converted = convert_numpy_types(result)
        json_str = json.dumps(converted)
        print("✓ Time series data handling successful")
        print(f"Converted start_date: {converted['start_date']}")
        return True
    except Exception as e:
        print(f"✗ Time series data handling failed: {e}")
        return False

def main():
    print("Testing datetime handling in API...\n")
    
    test1 = test_datetime_conversion()
    test2 = test_dataframe_datetime_handling()
    test3 = test_time_series_data()
    
    if test1 and test2 and test3:
        print("\n✓ All datetime handling tests passed!")
    else:
        print("\n✗ Some datetime handling tests failed.")

if __name__ == "__main__":
    main()