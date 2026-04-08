#!/usr/bin/env python3
"""
Dataset Validation Script
Validates all sample datasets and generates a comprehensive report
"""

import pandas as pd
import numpy as np
import os
from pathlib import Path
from datetime import datetime
import json

class DatasetValidator:
    """Validates datasets and generates quality reports"""
    
    def __init__(self, sample_dir="sample_datasets"):
        self.sample_dir = Path(sample_dir)
        self.validation_results = {}
        
    def validate_dataset(self, file_path):
        """Validate a single dataset"""
        try:
            df = pd.read_csv(file_path)
            
            # Basic information
            basic_info = {
                "file_size_kb": file_path.stat().st_size / 1024,
                "shape": df.shape,
                "memory_usage_kb": df.memory_usage(deep=True).sum() / 1024
            }
            
            # Column analysis
            column_info = {
                "total_columns": len(df.columns),
                "numeric_columns": len(df.select_dtypes(include=[np.number]).columns),
                "text_columns": len(df.select_dtypes(include=['object']).columns),
                "datetime_columns": len(df.select_dtypes(include=['datetime64']).columns),
                "column_names": df.columns.tolist()
            }
            
            # Data quality metrics
            total_cells = df.shape[0] * df.shape[1]
            missing_cells = df.isnull().sum().sum()
            
            quality_metrics = {
                "missing_values": {
                    "total_missing": int(missing_cells),
                    "missing_percentage": float((missing_cells / total_cells) * 100) if total_cells > 0 else 0,
                    "columns_with_missing": df.columns[df.isnull().any()].tolist()
                },
                "duplicates": {
                    "duplicate_rows": int(df.duplicated().sum()),
                    "duplicate_percentage": float((df.duplicated().sum() / len(df)) * 100) if len(df) > 0 else 0
                },
                "data_types": df.dtypes.astype(str).to_dict()
            }
            
            # Statistical summary for numeric columns
            numeric_summary = {}
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            for col in numeric_cols:
                col_data = df[col].dropna()
                if len(col_data) > 0:
                    numeric_summary[col] = {
                        "mean": float(col_data.mean()),
                        "median": float(col_data.median()),
                        "std": float(col_data.std()),
                        "min": float(col_data.min()),
                        "max": float(col_data.max()),
                        "outliers_iqr": self._count_outliers_iqr(col_data)
                    }
            
            # Categorical summary
            categorical_summary = {}
            categorical_cols = df.select_dtypes(include=['object']).columns
            
            for col in categorical_cols:
                col_data = df[col].dropna()
                if len(col_data) > 0:
                    value_counts = col_data.value_counts()
                    categorical_summary[col] = {
                        "unique_values": int(col_data.nunique()),
                        "most_common": value_counts.head(5).to_dict(),
                        "null_count": int(df[col].isnull().sum())
                    }
            
            # Data quality score
            quality_score = self._calculate_quality_score(df, quality_metrics)
            
            # Potential issues
            issues = self._identify_issues(df, quality_metrics, numeric_summary)
            
            return {
                "status": "success",
                "basic_info": basic_info,
                "column_info": column_info,
                "quality_metrics": quality_metrics,
                "numeric_summary": numeric_summary,
                "categorical_summary": categorical_summary,
                "quality_score": quality_score,
                "issues": issues,
                "recommendations": self._generate_recommendations(issues, df)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    def _count_outliers_iqr(self, series):
        """Count outliers using IQR method"""
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = series[(series < lower_bound) | (series > upper_bound)]
        return len(outliers)
    
    def _calculate_quality_score(self, df, quality_metrics):
        """Calculate overall data quality score (0-100)"""
        score = 100.0
        
        # Deduct for missing values
        missing_pct = quality_metrics["missing_values"]["missing_percentage"]
        score -= missing_pct * 0.5  # 0.5 points per percent missing
        
        # Deduct for duplicates
        duplicate_pct = quality_metrics["duplicates"]["duplicate_percentage"]
        score -= duplicate_pct * 0.3  # 0.3 points per percent duplicate
        
        # Deduct for data type issues
        object_cols = len(df.select_dtypes(include=['object']).columns)
        total_cols = len(df.columns)
        if total_cols > 0:
            object_ratio = object_cols / total_cols
            if object_ratio > 0.5:  # More than 50% object columns might indicate issues
                score -= (object_ratio - 0.5) * 20
        
        return max(0.0, min(100.0, score))
    
    def _identify_issues(self, df, quality_metrics, numeric_summary):
        """Identify potential data quality issues"""
        issues = []
        
        # Missing value issues
        missing_pct = quality_metrics["missing_values"]["missing_percentage"]
        if missing_pct > 10:
            issues.append({
                "type": "high_missing_values",
                "severity": "high" if missing_pct > 25 else "medium",
                "description": f"{missing_pct:.1f}% of data is missing",
                "affected_columns": quality_metrics["missing_values"]["columns_with_missing"]
            })
        
        # Duplicate issues
        duplicate_pct = quality_metrics["duplicates"]["duplicate_percentage"]
        if duplicate_pct > 5:
            issues.append({
                "type": "duplicate_rows",
                "severity": "high" if duplicate_pct > 15 else "medium",
                "description": f"{duplicate_pct:.1f}% of rows are duplicates",
                "count": quality_metrics["duplicates"]["duplicate_rows"]
            })
        
        # Outlier issues
        for col, stats in numeric_summary.items():
            outlier_count = stats["outliers_iqr"]
            if outlier_count > len(df) * 0.05:  # More than 5% outliers
                issues.append({
                    "type": "outliers",
                    "severity": "low",
                    "description": f"Column '{col}' has {outlier_count} outliers",
                    "column": col,
                    "outlier_count": outlier_count
                })
        
        # Data type issues
        for col in df.select_dtypes(include=['object']).columns:
            # Check if object column might be numeric
            try:
                numeric_conversion = pd.to_numeric(df[col], errors='coerce')
                conversion_success = numeric_conversion.notna().sum() / len(df)
                if conversion_success > 0.8:
                    issues.append({
                        "type": "data_type_mismatch",
                        "severity": "medium",
                        "description": f"Column '{col}' appears numeric but stored as text",
                        "column": col,
                        "conversion_success": conversion_success
                    })
            except:
                pass
        
        return issues
    
    def _generate_recommendations(self, issues, df):
        """Generate recommendations based on identified issues"""
        recommendations = []
        
        for issue in issues:
            if issue["type"] == "high_missing_values":
                if issue["severity"] == "high":
                    recommendations.append("Consider removing columns with >25% missing values or use advanced imputation")
                else:
                    recommendations.append("Apply appropriate missing value imputation (mean/median/mode)")
            
            elif issue["type"] == "duplicate_rows":
                recommendations.append("Remove duplicate rows using drop_duplicates()")
            
            elif issue["type"] == "outliers":
                recommendations.append(f"Investigate outliers in '{issue['column']}' - consider capping or transformation")
            
            elif issue["type"] == "data_type_mismatch":
                recommendations.append(f"Convert '{issue['column']}' to numeric type using pd.to_numeric()")
        
        # General recommendations
        if len(df) < 30:
            recommendations.append("Dataset is small - consider collecting more data for robust analysis")
        
        if len(df.columns) > 50:
            recommendations.append("High-dimensional dataset - consider feature selection or dimensionality reduction")
        
        return recommendations
    
    def validate_all_datasets(self):
        """Validate all datasets in the sample directory"""
        if not self.sample_dir.exists():
            return {"error": "Sample datasets directory not found"}
        
        results = {}
        csv_files = list(self.sample_dir.glob("*.csv"))
        
        if not csv_files:
            return {"error": "No CSV files found in sample datasets directory"}
        
        for file_path in csv_files:
            print(f"Validating {file_path.name}...")
            results[file_path.name] = self.validate_dataset(file_path)
        
        return results
    
    def generate_report(self, output_file="dataset_validation_report.json"):
        """Generate comprehensive validation report"""
        results = self.validate_all_datasets()
        
        # Add summary statistics
        summary = {
            "validation_date": datetime.now().isoformat(),
            "total_datasets": len(results),
            "successful_validations": len([r for r in results.values() if r.get("status") == "success"]),
            "failed_validations": len([r for r in results.values() if r.get("status") == "error"]),
            "average_quality_score": 0.0,
            "total_issues": 0
        }
        
        successful_results = [r for r in results.values() if r.get("status") == "success"]
        if successful_results:
            quality_scores = [r["quality_score"] for r in successful_results]
            summary["average_quality_score"] = sum(quality_scores) / len(quality_scores)
            summary["total_issues"] = sum(len(r["issues"]) for r in successful_results)
        
        report = {
            "summary": summary,
            "dataset_results": results
        }
        
        # Save report
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        return report
    
    def print_summary(self):
        """Print a summary of validation results"""
        results = self.validate_all_datasets()
        
        print("\n" + "="*60)
        print("DATASET VALIDATION SUMMARY")
        print("="*60)
        
        successful = [r for r in results.values() if r.get("status") == "success"]
        failed = [r for r in results.values() if r.get("status") == "error"]
        
        print(f"Total datasets: {len(results)}")
        print(f"Successfully validated: {len(successful)}")
        print(f"Failed validations: {len(failed)}")
        
        if successful:
            avg_quality = sum(r["quality_score"] for r in successful) / len(successful)
            print(f"Average quality score: {avg_quality:.1f}/100")
        
        print("\nDataset Details:")
        print("-" * 40)
        
        for filename, result in results.items():
            if result["status"] == "success":
                shape = result["basic_info"]["shape"]
                quality = result["quality_score"]
                issues = len(result["issues"])
                
                print(f"{filename}:")
                print(f"  Shape: {shape[0]} rows × {shape[1]} columns")
                print(f"  Quality Score: {quality:.1f}/100")
                print(f"  Issues Found: {issues}")
                
                if issues > 0:
                    print("  Issue Types:")
                    for issue in result["issues"]:
                        print(f"    - {issue['type']} ({issue['severity']})")
                
                print()
            else:
                print(f"{filename}: VALIDATION FAILED - {result['error']}")
                print()

def main():
    """Main validation function"""
    validator = DatasetValidator()
    
    print("Starting dataset validation...")
    
    # Generate and save detailed report
    report = validator.generate_report()
    print(f"Detailed report saved to: dataset_validation_report.json")
    
    # Print summary to console
    validator.print_summary()
    
    # Print recommendations
    results = validator.validate_all_datasets()
    successful_results = [r for r in results.values() if r.get("status") == "success"]
    
    if successful_results:
        all_recommendations = []
        for result in successful_results:
            all_recommendations.extend(result["recommendations"])
        
        unique_recommendations = list(set(all_recommendations))
        
        if unique_recommendations:
            print("\nRECOMMENDATIONS:")
            print("-" * 40)
            for i, rec in enumerate(unique_recommendations, 1):
                print(f"{i}. {rec}")

if __name__ == "__main__":
    main()