#!/usr/bin/env python3
"""
Generate sample datasets for testing the GUI interface
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def create_sales_dataset():
    """Create a sample sales dataset"""
    np.random.seed(42)
    random.seed(42)
    
    # Generate date range
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2024, 12, 31)
    date_range = pd.date_range(start_date, end_date, freq='D')
    
    # Sample data
    n_records = 1000
    
    data = {
        'date': np.random.choice(date_range, n_records),
        'product_category': np.random.choice(['Electronics', 'Clothing', 'Home', 'Books', 'Sports'], n_records),
        'product_name': [f'Product_{i}' for i in range(n_records)],
        'sales_amount': np.random.normal(100, 30, n_records).round(2),
        'quantity': np.random.poisson(3, n_records),
        'customer_age': np.random.normal(35, 12, n_records).round().astype(int),
        'customer_gender': np.random.choice(['Male', 'Female', 'Other'], n_records),
        'region': np.random.choice(['North', 'South', 'East', 'West'], n_records),
        'discount_applied': np.random.choice([True, False], n_records, p=[0.3, 0.7]),
        'customer_satisfaction': np.random.uniform(1, 5, n_records).round(1)
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Add some correlations
    df.loc[df['product_category'] == 'Electronics', 'sales_amount'] *= 1.5
    df.loc[df['discount_applied'] == True, 'sales_amount'] *= 0.8
    df.loc[df['customer_age'] > 50, 'sales_amount'] *= 1.2
    
    # Add some missing values
    missing_indices = np.random.choice(df.index, size=int(0.05 * len(df)), replace=False)
    df.loc[missing_indices, 'customer_satisfaction'] = np.nan
    
    # Add some outliers
    outlier_indices = np.random.choice(df.index, size=int(0.02 * len(df)), replace=False)
    df.loc[outlier_indices, 'sales_amount'] *= 5
    
    return df

def create_employee_dataset():
    """Create a sample employee dataset"""
    np.random.seed(123)
    random.seed(123)
    
    n_employees = 500
    
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']
    positions = ['Junior', 'Senior', 'Lead', 'Manager', 'Director']
    
    data = {
        'employee_id': [f'EMP_{i:04d}' for i in range(1, n_employees + 1)],
        'name': [f'Employee_{i}' for i in range(1, n_employees + 1)],
        'department': np.random.choice(departments, n_employees),
        'position': np.random.choice(positions, n_employees),
        'salary': np.random.normal(75000, 25000, n_employees).round().astype(int),
        'years_experience': np.random.exponential(5, n_employees).round().astype(int),
        'age': np.random.normal(32, 8, n_employees).round().astype(int),
        'gender': np.random.choice(['Male', 'Female'], n_employees),
        'education_level': np.random.choice(['Bachelor', 'Master', 'PhD'], n_employees, p=[0.6, 0.3, 0.1]),
        'performance_rating': np.random.uniform(2.5, 5.0, n_employees).round(1),
        'hire_date': pd.date_range('2015-01-01', '2024-01-01', periods=n_employees),
        'remote_work': np.random.choice([True, False], n_employees, p=[0.4, 0.6])
    }
    
    df = pd.DataFrame(data)
    
    # Add correlations
    df.loc[df['position'] == 'Director', 'salary'] *= 2
    df.loc[df['position'] == 'Manager', 'salary'] *= 1.5
    df.loc[df['education_level'] == 'PhD', 'salary'] *= 1.3
    df.loc[df['department'] == 'Engineering', 'salary'] *= 1.2
    
    # Ensure age and experience make sense
    df['age'] = np.maximum(df['age'], df['years_experience'] + 22)
    
    # Add some missing values
    missing_indices = np.random.choice(df.index, size=int(0.03 * len(df)), replace=False)
    df.loc[missing_indices, 'performance_rating'] = np.nan
    
    return df

def create_financial_dataset():
    """Create a sample financial dataset"""
    np.random.seed(456)
    
    # Generate time series data
    dates = pd.date_range('2020-01-01', '2024-12-31', freq='D')
    n_days = len(dates)
    
    # Stock price simulation (random walk)
    initial_price = 100
    returns = np.random.normal(0.001, 0.02, n_days)  # Daily returns
    prices = [initial_price]
    
    for ret in returns[1:]:
        prices.append(prices[-1] * (1 + ret))
    
    data = {
        'date': dates,
        'stock_price': prices,
        'volume': np.random.lognormal(10, 1, n_days).astype(int),
        'market_cap': np.array(prices) * np.random.lognormal(15, 0.1, n_days),
        'pe_ratio': np.random.normal(15, 5, n_days).round(2),
        'dividend_yield': np.random.uniform(0, 0.05, n_days).round(4),
        'sector': np.random.choice(['Technology', 'Healthcare', 'Finance', 'Energy'], n_days),
        'analyst_rating': np.random.choice(['Buy', 'Hold', 'Sell'], n_days, p=[0.4, 0.5, 0.1])
    }
    
    df = pd.DataFrame(data)
    
    # Add some trends and seasonality
    df['month'] = df['date'].dt.month
    df.loc[df['month'].isin([11, 12]), 'stock_price'] *= 1.05  # Holiday effect
    
    return df

def main():
    """Generate and save sample datasets"""
    print("🔄 Generating sample datasets...")
    
    # Create datasets
    sales_df = create_sales_dataset()
    employee_df = create_employee_dataset()
    financial_df = create_financial_dataset()
    
    # Save to files
    sales_df.to_csv('sample_sales_data.csv', index=False)
    employee_df.to_csv('sample_employee_data.csv', index=False)
    financial_df.to_csv('sample_financial_data.csv', index=False)
    
    # Also save as other formats for testing
    sales_df.to_parquet('sample_sales_data.parquet', index=False)
    employee_df.to_excel('sample_employee_data.xlsx', index=False)
    
    print("✅ Sample datasets created:")
    print(f"  📊 Sales Data: {len(sales_df)} records (CSV, Parquet)")
    print(f"  👥 Employee Data: {len(employee_df)} records (CSV, Excel)")
    print(f"  💰 Financial Data: {len(financial_df)} records (CSV)")
    print("\n🎯 Use these files to test the GUI interface!")

if __name__ == "__main__":
    main()