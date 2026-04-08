#!/usr/bin/env python3
"""
Test script to verify JSON serialization fixes
"""

import numpy as np
import pandas as pd
import json
from backend_api import convert_numpy_types, safe_json_response

def test_numpy_conversion():
    """Test numpy type conversion"""
    print("Testing numpy type conversion...")
    
    # Test various numpy types
    test_data = {
        "int64": np.int64(42),
        "float64": np.float64(3.14),
        "array": np.array([1, 2, 3]),
        "series": pd.Series([1, 2, 3]),
        "nested": {
            "inner_int": np.int64(100),
            "inner_float": np.float64(2.71)
        },
        "list_with_numpy": [np.int64(1), np.float64(2.5), "string"]
    }
    
    # Convert and test
    converted = convert_numpy_types(test_data)
    
    # Try to serialize to JSON
    try:
        json_str = json.dumps(converted)
        print("✓ JSON serialization successful")
        print(f"Converted data: {converted}")
        return True
    except Exception as e:
        print(f"✗ JSON serialization failed: {e}")
        return False

def test_pandas_dataframe():
    """Test pandas DataFrame conversion"""
    print("\nTesting pandas DataFrame conversion...")
    
    # Create test DataFrame
    df = pd.DataFrame({
        'A': [1, 2, 3],
        'B': [1.1, 2.2, 3.3],
        'C': ['x', 'y', 'z']
    })
    
    # Test describe() output
    desc = df.describe()
    converted_desc = convert_numpy_types(desc.to_dict())
    
    try:
        json_str = json.dumps(converted_desc)
        print("✓ DataFrame describe() serialization successful")
        return True
    except Exception as e:
        print(f"✗ DataFrame describe() serialization failed: {e}")
        return False

if __name__ == "__main__":
    print("Running JSON serialization tests...\n")
    
    test1 = test_numpy_conversion()
    test2 = test_pandas_dataframe()
    
    if test1 and test2:
        print("\n✓ All tests passed! JSON serialization fix is working.")
    else:
        print("\n✗ Some tests failed. Check the implementation.")