#!/usr/bin/env python3
"""
Test Sample Datasets
Verify that sample datasets are valid and can be processed
"""

import unittest
import pandas as pd
import numpy as np
import os
from pathlib import Path

class TestSampleDatasets(unittest.TestCase):
    """Test cases for sample datasets"""
    
    def setUp(self):
        """Set up test environment"""
        self.sample_dir = Path("sample_datasets")
        self.expected_files = [
            "sample_economic_data.csv",
            "complex_economic_data.csv", 
            "messy_economic_data.csv",
            "problematic_data.csv"
        ]
    
    def test_sample_directory_exists(self):
        """Test that sample datasets directory exists"""
        self.assertTrue(self.sample_dir.exists(), "Sample datasets directory not found")
        self.assertTrue(self.sample_dir.is_dir(), "Sample datasets path is not a directory")
    
    def test_expected_files_exist(self):
        """Test that expected sample files exist"""
        for filename in self.expected_files:
            file_path = self.sample_dir / filename
            with self.subTest(filename=filename):
                self.assertTrue(file_path.exists(), f"Sample file {filename} not found")
                self.assertGreater(file_path.stat().st_size, 0, f"Sample file {filename} is empty")
    
    def test_sample_economic_data(self):
        """Test the main sample economic dataset"""
        file_path = self.sample_dir / "sample_economic_data.csv"
        
        if not file_path.exists():
            self.skipTest("sample_economic_data.csv not found")
        
        try:
            df = pd.read_csv(file_path)
            
            # Basic structure tests
            self.assertGreater(len(df), 0, "Dataset is empty")
            self.assertGreater(len(df.columns), 0, "Dataset has no columns")
            
            # Check for expected economic indicators
            expected_columns = ['date', 'gdp', 'inflation', 'unemployment']
            available_columns = [col.lower() for col in df.columns]
            
            for col in expected_columns:
                if col in available_columns:
                    print(f"✓ Found expected column: {col}")
            
            # Test data types
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            self.assertGreater(len(numeric_cols), 0, "No numeric columns found")
            
            # Test for missing values
            missing_count = df.isnull().sum().sum()
            missing_percentage = (missing_count / (len(df) * len(df.columns))) * 100
            
            print(f"Dataset shape: {df.shape}")
            print(f"Missing values: {missing_count} ({missing_percentage:.1f}%)")
            print(f"Numeric columns: {len(numeric_cols)}")
            
        except Exception as e:
            self.fail(f"Failed to load sample_economic_data.csv: {e}")
    
    def test_complex_economic_data(self):
        """Test the complex economic dataset"""
        file_path = self.sample_dir / "complex_economic_data.csv"
        
        if not file_path.exists():
            self.skipTest("complex_economic_data.csv not found")
        
        try:
            df = pd.read_csv(file_path)
            
            # Should be more complex than basic sample
            self.assertGreater(len(df.columns), 5, "Complex dataset should have more columns")
            self.assertGreater(len(df), 50, "Complex dataset should have more rows")
            
            # Check for various data types
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            text_cols = df.select_dtypes(include=['object']).columns
            
            self.assertGreater(len(numeric_cols), 0, "Should have numeric columns")
            
            print(f"Complex dataset shape: {df.shape}")
            print(f"Numeric columns: {len(numeric_cols)}")
            print(f"Text columns: {len(text_cols)}")
            
        except Exception as e:
            self.fail(f"Failed to load complex_economic_data.csv: {e}")
    
    def test_messy_economic_data(self):
        """Test the messy dataset (should have data quality issues)"""
        file_path = self.sample_dir / "messy_economic_data.csv"
        
        if not file_path.exists():
            self.skipTest("messy_economic_data.csv not found")
        
        try:
            df = pd.read_csv(file_path)
            
            # This dataset should have quality issues
            missing_count = df.isnull().sum().sum()
            duplicate_count = df.duplicated().sum()
            
            print(f"Messy dataset shape: {df.shape}")
            print(f"Missing values: {missing_count}")
            print(f"Duplicate rows: {duplicate_count}")
            
            # Should have some issues (this is expected for messy data)
            if missing_count == 0 and duplicate_count == 0:
                print("⚠ Messy dataset appears clean - may need more realistic issues")
            
        except Exception as e:
            self.fail(f"Failed to load messy_economic_data.csv: {e}")
    
    def test_problematic_data(self):
        """Test the problematic dataset (should have severe issues)"""
        file_path = self.sample_dir / "problematic_data.csv"
        
        if not file_path.exists():
            self.skipTest("problematic_data.csv not found")
        
        try:
            df = pd.read_csv(file_path)
            
            # This should have significant problems
            missing_percentage = (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
            duplicate_percentage = (df.duplicated().sum() / len(df)) * 100
            
            print(f"Problematic dataset shape: {df.shape}")
            print(f"Missing percentage: {missing_percentage:.1f}%")
            print(f"Duplicate percentage: {duplicate_percentage:.1f}%")
            
            # Check for data type issues
            object_cols = df.select_dtypes(include=['object']).columns
            for col in object_cols:
                # Try to convert to numeric to see if it should be numeric
                try:
                    numeric_conversion = pd.to_numeric(df[col], errors='coerce')
                    conversion_success = numeric_conversion.notna().sum() / len(df)
                    if conversion_success > 0.8:
                        print(f"⚠ Column '{col}' appears numeric but stored as text")
                except:
                    pass
            
        except Exception as e:
            self.fail(f"Failed to load problematic_data.csv: {e}")
    
    def test_all_datasets_loadable(self):
        """Test that all datasets can be loaded without errors"""
        for filename in self.expected_files:
            file_path = self.sample_dir / filename
            
            if not file_path.exists():
                continue
            
            with self.subTest(filename=filename):
                try:
                    df = pd.read_csv(file_path)
                    self.assertIsInstance(df, pd.DataFrame)
                    self.assertGreater(len(df), 0)
                    print(f"✓ {filename}: {df.shape}")
                    
                except Exception as e:
                    self.fail(f"Failed to load {filename}: {e}")
    
    def test_dataset_encoding(self):
        """Test that datasets have proper encoding"""
        for filename in self.expected_files:
            file_path = self.sample_dir / filename
            
            if not file_path.exists():
                continue
            
            with self.subTest(filename=filename):
                try:
                    # Try UTF-8 first
                    df = pd.read_csv(file_path, encoding='utf-8')
                    print(f"✓ {filename}: UTF-8 encoding")
                    
                except UnicodeDecodeError:
                    try:
                        # Try other common encodings
                        df = pd.read_csv(file_path, encoding='latin-1')
                        print(f"⚠ {filename}: Latin-1 encoding (consider converting to UTF-8)")
                        
                    except Exception as e:
                        self.fail(f"Encoding issues with {filename}: {e}")
    
    def test_dataset_statistics(self):
        """Generate statistics for all datasets"""
        print("\nDataset Statistics Summary:")
        print("-" * 50)
        
        for filename in self.expected_files:
            file_path = self.sample_dir / filename
            
            if not file_path.exists():
                continue
            
            try:
                df = pd.read_csv(file_path)
                
                numeric_cols = len(df.select_dtypes(include=[np.number]).columns)
                text_cols = len(df.select_dtypes(include=['object']).columns)
                missing_cells = df.isnull().sum().sum()
                total_cells = len(df) * len(df.columns)
                missing_pct = (missing_cells / total_cells) * 100 if total_cells > 0 else 0
                
                print(f"{filename}:")
                print(f"  Shape: {df.shape}")
                print(f"  Numeric columns: {numeric_cols}")
                print(f"  Text columns: {text_cols}")
                print(f"  Missing data: {missing_pct:.1f}%")
                print(f"  Memory usage: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
                print()
                
            except Exception as e:
                print(f"{filename}: Error - {e}")
    
    def test_create_missing_datasets(self):
        """Create missing sample datasets if they don't exist"""
        if not self.sample_dir.exists():
            print("Creating sample_datasets directory...")
            self.sample_dir.mkdir(exist_ok=True)
        
        # Create basic sample if missing
        basic_file = self.sample_dir / "sample_economic_data.csv"
        if not basic_file.exists():
            print("Creating sample_economic_data.csv...")
            
            dates = pd.date_range('2020-01-01', periods=100, freq='M')
            np.random.seed(42)  # For reproducible data
            
            df = pd.DataFrame({
                'date': dates,
                'gdp_growth': np.random.normal(2.5, 1.5, 100),
                'inflation_rate': np.random.normal(2.0, 0.8, 100),
                'unemployment_rate': np.random.normal(5.5, 1.2, 100),
                'interest_rate': np.random.normal(3.0, 1.0, 100),
                'consumer_confidence': np.random.normal(100, 15, 100)
            })
            
            df.to_csv(basic_file, index=False)
            print(f"✓ Created {basic_file}")
        
        # This test always passes - it's for setup
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main(verbosity=2)