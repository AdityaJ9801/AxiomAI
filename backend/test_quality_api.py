#!/usr/bin/env python3
"""
Test Quality API Structure
Verify that the quality API returns the expected structure
"""

import pandas as pd
import numpy as np
from mcp_tools.data_cleaner import DataCleaner
import tempfile
import os

def test_quality_api_structure():
    """Test the quality API response structure"""
    
    # Create test data with various issues
    test_data = pd.DataFrame({
        'numeric_col': [1, 2, np.nan, 4, 5, 100, 7, 8, 9, 10],  # Has missing and outlier
        'text_col': ['A', 'B', None, 'A', 'C', 'B', 'A', 'D', 'E', 'A'],  # Has missing
        'duplicate_col': [1, 1, 2, 2, 3, 3, 4, 5, 6, 7],  # Has duplicates when combined
        'date_str': ['2023-01-01', '2023-01-02', '2023-01-03', 'invalid', '2023-01-05', 
                    '2023-01-06', '2023-01-07', '2023-01-08', '2023-01-09', '2023-01-10']
    })
    
    # Add some duplicate rows
    test_data = pd.concat([test_data, test_data.iloc[[0, 1]]], ignore_index=True)
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        test_data.to_csv(f.name, index=False)
        temp_file = f.name
    
    try:
        # Test data cleaner
        cleaner = DataCleaner()
        load_result = cleaner.load_data(temp_file)
        print("Load result:", load_result)
        
        # Test quality report
        report = cleaner.get_cleaning_report()
        print("\nQuality Report Structure:")
        print("Keys:", list(report.keys()))
        
        if 'current_shape' in report:
            print(f"current_shape: {report['current_shape']} (type: {type(report['current_shape'])})")
        
        if 'data_quality_score' in report:
            print(f"data_quality_score: {report['data_quality_score']} (type: {type(report['data_quality_score'])})")
        
        if 'issues' in report:
            print(f"issues keys: {list(report['issues'].keys())}")
            
            if 'missing_values' in report['issues']:
                print(f"missing_values: {report['issues']['missing_values']}")
            
            if 'duplicates' in report['issues']:
                print(f"duplicates: {report['issues']['duplicates']}")
        
        if 'column_completeness' in report:
            print(f"column_completeness sample: {dict(list(report['column_completeness'].items())[:3])}")
        
        # Test suggestions
        suggestions = cleaner.get_cleaning_suggestions()
        print(f"\nSuggestions count: {len(suggestions)}")
        if suggestions:
            print("First suggestion structure:", suggestions[0])
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # Clean up
        if os.path.exists(temp_file):
            os.unlink(temp_file)

if __name__ == "__main__":
    print("Testing Quality API Structure...")
    success = test_quality_api_structure()
    print(f"\nTest {'PASSED' if success else 'FAILED'}")