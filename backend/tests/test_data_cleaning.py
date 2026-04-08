#!/usr/bin/env python3
"""
Test Data Cleaning Functionality
"""

import unittest
import pandas as pd
import numpy as np
import tempfile
import os
from mcp_tools.data_cleaner import DataCleaner

class TestDataCleaning(unittest.TestCase):
    """Test cases for data cleaning operations"""
    
    def setUp(self):
        """Set up test data"""
        self.cleaner = DataCleaner()
        
        # Create test dataset with various issues
        self.test_data = pd.DataFrame({
            'numeric_col': [1, 2, np.nan, 4, 5, 100, 7, 8, 9, 10],  # Has missing and outlier
            'text_col': ['A', 'B', None, 'A', 'C', 'B', 'A', 'D', 'E', 'A'],  # Has missing
            'duplicate_col': [1, 1, 2, 2, 3, 3, 4, 5, 6, 7],  # Has duplicates when combined
            'date_str': ['2023-01-01', '2023-01-02', '2023-01-03', 'invalid', '2023-01-05', 
                        '2023-01-06', '2023-01-07', '2023-01-08', '2023-01-09', '2023-01-10']
        })
        
        # Add some duplicate rows
        self.test_data = pd.concat([self.test_data, self.test_data.iloc[[0, 1]]], ignore_index=True)
        
        # Save to temporary file
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
        self.test_data.to_csv(self.temp_file.name, index=False)
        self.temp_file.close()
        
        # Load data into cleaner
        self.cleaner.load_data(self.temp_file.name)
    
    def tearDown(self):
        """Clean up temporary files"""
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_load_data(self):
        """Test data loading"""
        result = self.cleaner.load_data(self.temp_file.name)
        
        self.assertTrue(result['success'])
        self.assertIsNotNone(self.cleaner.data)
        self.assertEqual(self.cleaner.data.shape[1], 4)  # 4 columns
    
    def test_assess_quality(self):
        """Test quality assessment"""
        result = self.cleaner.assess_quality()
        
        self.assertTrue(result['success'])
        self.assertIn('quality_score', result)
        self.assertIn('issues', result)
        self.assertIsInstance(result['quality_score'], float)
        self.assertGreaterEqual(result['quality_score'], 0)
        self.assertLessEqual(result['quality_score'], 100)
    
    def test_get_data_issues(self):
        """Test issue detection"""
        issues = self.cleaner.get_data_issues()
        
        # Should detect missing values
        self.assertIn('missing_values', issues)
        self.assertGreater(len(issues['missing_values']), 0)
        
        # Should detect duplicates
        self.assertIn('duplicates', issues)
        self.assertGreater(issues['duplicates'], 0)
        
        # Should detect outliers
        self.assertIn('outliers', issues)
    
    def test_fix_missing_values_auto(self):
        """Test automatic missing value fixing"""
        before_missing = self.cleaner.data.isnull().sum().sum()
        
        result = self.cleaner.fix_missing_values(strategy="auto")
        
        self.assertTrue(result['success'])
        self.assertEqual(result['strategy'], 'auto')
        self.assertGreater(result['before_count'], result['after_count'])
        
        after_missing = self.cleaner.data.isnull().sum().sum()
        self.assertLess(after_missing, before_missing)
    
    def test_fix_missing_values_mean(self):
        """Test mean imputation for missing values"""
        result = self.cleaner.fix_missing_values(strategy="mean", column="numeric_col")
        
        self.assertTrue(result['success'])
        self.assertEqual(result['strategy'], 'mean')
        
        # Check that numeric column has no missing values
        self.assertEqual(self.cleaner.data['numeric_col'].isnull().sum(), 0)
    
    def test_fix_missing_values_custom(self):
        """Test custom value imputation"""
        result = self.cleaner.fix_missing_values(
            strategy="custom", 
            column="numeric_col", 
            fill_value=999
        )
        
        self.assertTrue(result['success'])
        
        # Check that the custom value was used
        self.assertIn(999, self.cleaner.data['numeric_col'].values)
    
    def test_remove_duplicates(self):
        """Test duplicate removal"""
        before_count = len(self.cleaner.data)
        
        result = self.cleaner.remove_duplicates()
        
        self.assertTrue(result['success'])
        self.assertGreater(result['before_count'], result['after_count'])
        self.assertEqual(result['removed_count'], before_count - len(self.cleaner.data))
    
    def test_remove_duplicates_subset(self):
        """Test duplicate removal with subset"""
        result = self.cleaner.remove_duplicates(subset=['numeric_col', 'text_col'])
        
        self.assertTrue(result['success'])
        self.assertEqual(result['subset'], ['numeric_col', 'text_col'])
    
    def test_handle_outliers_iqr(self):
        """Test IQR outlier handling"""
        result = self.cleaner.handle_outliers(method="iqr", columns=['numeric_col'])
        
        self.assertTrue(result['success'])
        self.assertEqual(result['method'], 'iqr')
        self.assertIn('numeric_col', result['columns_processed'])
    
    def test_handle_outliers_zscore(self):
        """Test Z-score outlier handling"""
        result = self.cleaner.handle_outliers(method="zscore", threshold=2.0)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['method'], 'zscore')
        self.assertEqual(result['threshold'], 2.0)
    
    def test_fix_data_types(self):
        """Test automatic data type fixing"""
        result = self.cleaner.fix_data_types()
        
        self.assertTrue(result['success'])
        self.assertIsInstance(result['changes'], list)
    
    def test_validate_data(self):
        """Test data validation against rules"""
        rules = {
            'numeric_col': {
                'dtype': 'float64',
                'min_value': 0,
                'max_value': 50,
                'allow_null': False
            },
            'text_col': {
                'allowed_values': ['A', 'B', 'C', 'D', 'E'],
                'allow_null': True
            }
        }
        
        result = self.cleaner.validate_data(rules)
        
        self.assertTrue(result['success'])
        self.assertIn('validation_results', result)
        self.assertIn('overall_passed', result)
    
    def test_get_cleaning_suggestions(self):
        """Test cleaning suggestions generation"""
        suggestions = self.cleaner.get_cleaning_suggestions()
        
        self.assertIsInstance(suggestions, list)
        self.assertGreater(len(suggestions), 0)
        
        # Check suggestion structure
        for suggestion in suggestions:
            self.assertIn('type', suggestion)
            self.assertIn('priority', suggestion)
            self.assertIn('description', suggestion)
    
    def test_get_cleaning_report(self):
        """Test comprehensive cleaning report"""
        result = self.cleaner.get_cleaning_report()
        
        self.assertTrue(result['success'])
        self.assertIn('data_quality_score', result)
        self.assertIn('current_issues', result)
        self.assertIn('cleaning_suggestions', result)
        self.assertIn('data_profile', result)
    
    def test_calculate_quality_score(self):
        """Test quality score calculation"""
        score = self.cleaner.calculate_quality_score()
        
        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
    
    def test_get_data_profile(self):
        """Test data profiling"""
        profile = self.cleaner.get_data_profile()
        
        self.assertIn('shape', profile)
        self.assertIn('columns', profile)
        self.assertIn('dtypes', profile)
        self.assertIn('missing_summary', profile)
        self.assertIn('duplicate_count', profile)
        self.assertIn('numeric_columns', profile)
        self.assertIn('categorical_columns', profile)
    
    def test_error_handling_no_data(self):
        """Test error handling when no data is loaded"""
        empty_cleaner = DataCleaner()
        
        result = empty_cleaner.assess_quality()
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_error_handling_invalid_column(self):
        """Test error handling for invalid column names"""
        result = self.cleaner.fix_missing_values(column="nonexistent_column")
        
        self.assertIn('error', result)
    
    def test_error_handling_invalid_file(self):
        """Test error handling for invalid file paths"""
        result = self.cleaner.load_data("nonexistent_file.csv")
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)

if __name__ == '__main__':
    unittest.main()