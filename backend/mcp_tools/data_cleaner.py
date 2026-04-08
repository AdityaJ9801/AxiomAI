#!/usr/bin/env python3
"""
Data Cleaning MCP Tool
Handles data quality assessment and cleaning operations
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .base_mcp_tool import BaseMCPTool

class DataCleaner(BaseMCPTool):
    """MCP tool for data cleaning operations"""
    
    def __init__(self):
        super().__init__("data_cleaner")
        self.data = None
        self.original_data = None
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        return {
            "name": "data_cleaner",
            "description": "Data quality assessment and cleaning operations",
            "actions": [
                "load_data",
                "assess_quality",
                "fix_missing_values",
                "remove_duplicates",
                "handle_outliers",
                "fix_data_types",
                "validate_data",
                "get_cleaning_report"
            ]
        }
    
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data cleaning action"""
        try:
            if action == "load_data":
                return self.load_data(parameters.get("file_path"))
            elif action == "assess_quality":
                return self.assess_quality()
            elif action == "fix_missing_values":
                return self.fix_missing_values(
                    parameters.get("strategy", "auto"),
                    parameters.get("column"),
                    parameters.get("fill_value")
                )
            elif action == "remove_duplicates":
                return self.remove_duplicates(
                    parameters.get("subset"),
                    parameters.get("keep", "first")
                )
            elif action == "handle_outliers":
                return self.handle_outliers(
                    parameters.get("method", "iqr"),
                    parameters.get("columns"),
                    parameters.get("threshold", 1.5)
                )
            elif action == "fix_data_types":
                return self.fix_data_types()
            elif action == "validate_data":
                return self.validate_data(parameters.get("rules", {}))
            elif action == "get_cleaning_report":
                return self.get_cleaning_report()
            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def load_data(self, file_path: str) -> Dict[str, Any]:
        """Load data and create backup"""
        try:
            if file_path.endswith('.csv'):
                self.data = pd.read_csv(file_path)
            elif file_path.endswith(('.xlsx', '.xls')):
                self.data = pd.read_excel(file_path)
            else:
                return {"success": False, "error": "Unsupported file format"}
            
            self.original_data = self.data.copy()
            
            # Initial quality assessment
            quality_score = self.calculate_quality_score()
            
            return {
                "success": True,
                "message": f"Data loaded successfully: {self.data.shape[0]} rows × {self.data.shape[1]} columns",
                "shape": self.data.shape,
                "quality_score": quality_score,
                "profile": self.get_data_profile()
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def assess_quality(self) -> Dict[str, Any]:
        """Assess data quality"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        issues = self.get_data_issues()
        quality_score = self.calculate_quality_score()
        
        return {
            "success": True,
            "quality_score": quality_score,
            "issues": issues,
            "recommendations": self.get_cleaning_suggestions()
        }
    
    def get_data_issues(self) -> Dict[str, Any]:
        """Identify data quality issues"""
        issues = {}
        
        # Missing values
        missing_counts = self.data.isnull().sum()
        issues['missing_values'] = {col: int(count) for col, count in missing_counts.items() if count > 0}
        
        # Duplicates
        issues['duplicates'] = int(self.data.duplicated().sum())
        
        # Data type issues
        issues['data_type_issues'] = []
        for col in self.data.columns:
            if self.data[col].dtype == 'object':
                # Check if numeric data stored as string
                try:
                    pd.to_numeric(self.data[col].dropna())
                    issues['data_type_issues'].append(f"{col}: appears numeric but stored as text")
                except:
                    pass
        
        # Outliers (for numeric columns)
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        issues['outliers'] = {}
        for col in numeric_cols:
            Q1 = self.data[col].quantile(0.25)
            Q3 = self.data[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = self.data[(self.data[col] < Q1 - 1.5 * IQR) | (self.data[col] > Q3 + 1.5 * IQR)]
            if len(outliers) > 0:
                issues['outliers'][col] = len(outliers)
        
        return issues
    
    def calculate_quality_score(self) -> float:
        """Calculate overall data quality score (0-100)"""
        if self.data is None:
            return 0.0
        
        score = 100.0
        total_cells = self.data.shape[0] * self.data.shape[1]
        
        # Deduct for missing values
        missing_ratio = self.data.isnull().sum().sum() / total_cells
        score -= missing_ratio * 30
        
        # Deduct for duplicates
        duplicate_ratio = self.data.duplicated().sum() / len(self.data)
        score -= duplicate_ratio * 20
        
        # Deduct for data type issues
        type_issues = len([col for col in self.data.columns if self.data[col].dtype == 'object'])
        type_issue_ratio = type_issues / len(self.data.columns)
        score -= type_issue_ratio * 10
        
        return max(0.0, min(100.0, score))
    
    def get_data_profile(self) -> Dict[str, Any]:
        """Get comprehensive data profile"""
        if self.data is None:
            return {}
        
        profile = {
            "shape": self.data.shape,
            "columns": self.data.columns.tolist(),
            "dtypes": self.data.dtypes.astype(str).to_dict(),
            "memory_usage_mb": self.data.memory_usage(deep=True).sum() / (1024**2),
            "missing_summary": self.data.isnull().sum().to_dict(),
            "duplicate_count": int(self.data.duplicated().sum()),
            "numeric_columns": self.data.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_columns": self.data.select_dtypes(include=['object']).columns.tolist()
        }
        
        return profile
    
    def fix_missing_values(self, strategy: str = "auto", column: str = None, fill_value: Any = None) -> Dict[str, Any]:
        """Fix missing values using specified strategy"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        before_count = self.data.isnull().sum().sum()
        
        if column and column not in self.data.columns:
            return {"error": f"Column '{column}' not found"}
        
        columns_to_fix = [column] if column else self.data.columns
        
        for col in columns_to_fix:
            if self.data[col].isnull().sum() == 0:
                continue
            
            if strategy == "auto":
                if self.data[col].dtype in ['int64', 'float64']:
                    # Use median for numeric
                    self.data[col].fillna(self.data[col].median(), inplace=True)
                else:
                    # Use mode for categorical
                    mode_val = self.data[col].mode()
                    if len(mode_val) > 0:
                        self.data[col].fillna(mode_val[0], inplace=True)
            elif strategy == "mean":
                if self.data[col].dtype in ['int64', 'float64']:
                    self.data[col].fillna(self.data[col].mean(), inplace=True)
            elif strategy == "median":
                if self.data[col].dtype in ['int64', 'float64']:
                    self.data[col].fillna(self.data[col].median(), inplace=True)
            elif strategy == "mode":
                mode_val = self.data[col].mode()
                if len(mode_val) > 0:
                    self.data[col].fillna(mode_val[0], inplace=True)
            elif strategy == "forward_fill":
                self.data[col].fillna(method='ffill', inplace=True)
            elif strategy == "backward_fill":
                self.data[col].fillna(method='bfill', inplace=True)
            elif strategy == "custom" and fill_value is not None:
                self.data[col].fillna(fill_value, inplace=True)
        
        after_count = self.data.isnull().sum().sum()
        
        return {
            "success": True,
            "strategy": strategy,
            "before_count": int(before_count),
            "after_count": int(after_count),
            "fixed_count": int(before_count - after_count)
        }
    
    def remove_duplicates(self, subset: List[str] = None, keep: str = "first") -> Dict[str, Any]:
        """Remove duplicate rows"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        before_count = len(self.data)
        
        if subset:
            # Validate subset columns
            invalid_cols = [col for col in subset if col not in self.data.columns]
            if invalid_cols:
                return {"error": f"Columns not found: {invalid_cols}"}
        
        self.data.drop_duplicates(subset=subset, keep=keep, inplace=True)
        after_count = len(self.data)
        
        return {
            "success": True,
            "before_count": before_count,
            "after_count": after_count,
            "removed_count": before_count - after_count,
            "subset": subset,
            "keep": keep
        }
    
    def handle_outliers(self, method: str = "iqr", columns: List[str] = None, threshold: float = 1.5) -> Dict[str, Any]:
        """Handle outliers in numeric columns"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns.tolist()
        
        if columns:
            columns = [col for col in columns if col in numeric_cols]
        else:
            columns = numeric_cols
        
        outliers_handled = 0
        
        for col in columns:
            if method == "iqr":
                Q1 = self.data[col].quantile(0.25)
                Q3 = self.data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - threshold * IQR
                upper_bound = Q3 + threshold * IQR
                
                outlier_mask = (self.data[col] < lower_bound) | (self.data[col] > upper_bound)
                outliers_handled += outlier_mask.sum()
                
                # Cap outliers
                self.data.loc[self.data[col] < lower_bound, col] = lower_bound
                self.data.loc[self.data[col] > upper_bound, col] = upper_bound
            
            elif method == "zscore":
                z_scores = np.abs((self.data[col] - self.data[col].mean()) / self.data[col].std())
                outlier_mask = z_scores > threshold
                outliers_handled += outlier_mask.sum()
                
                # Remove outliers
                self.data = self.data[~outlier_mask]
        
        return {
            "success": True,
            "method": method,
            "threshold": threshold,
            "columns_processed": columns,
            "outliers_handled": int(outliers_handled)
        }
    
    def fix_data_types(self) -> Dict[str, Any]:
        """Automatically fix data type issues"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        changes = []
        
        for col in self.data.columns:
            if self.data[col].dtype == 'object':
                # Try to convert to numeric
                try:
                    numeric_data = pd.to_numeric(self.data[col], errors='coerce')
                    if numeric_data.notna().sum() > len(self.data) * 0.8:  # 80% conversion success
                        self.data[col] = numeric_data
                        changes.append(f"{col}: object -> numeric")
                        continue
                except:
                    pass
                
                # Try to convert to datetime
                try:
                    datetime_data = pd.to_datetime(self.data[col], errors='coerce')
                    if datetime_data.notna().sum() > len(self.data) * 0.8:  # 80% conversion success
                        self.data[col] = datetime_data
                        changes.append(f"{col}: object -> datetime")
                        continue
                except:
                    pass
        
        return {
            "success": True,
            "changes": changes,
            "total_changes": len(changes)
        }
    
    def validate_data(self, rules: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Validate data against custom rules"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        validation_results = {}
        
        for column, rule_set in rules.items():
            if column not in self.data.columns:
                validation_results[column] = {"error": "Column not found"}
                continue
            
            column_results = {"passed": True, "issues": []}
            
            # Check data type
            if "dtype" in rule_set:
                expected_dtype = rule_set["dtype"]
                if str(self.data[column].dtype) != expected_dtype:
                    column_results["passed"] = False
                    column_results["issues"].append(f"Expected dtype {expected_dtype}, got {self.data[column].dtype}")
            
            # Check range for numeric columns
            if "min_value" in rule_set or "max_value" in rule_set:
                if self.data[column].dtype in ['int64', 'float64']:
                    if "min_value" in rule_set:
                        violations = (self.data[column] < rule_set["min_value"]).sum()
                        if violations > 0:
                            column_results["passed"] = False
                            column_results["issues"].append(f"{violations} values below minimum {rule_set['min_value']}")
                    
                    if "max_value" in rule_set:
                        violations = (self.data[column] > rule_set["max_value"]).sum()
                        if violations > 0:
                            column_results["passed"] = False
                            column_results["issues"].append(f"{violations} values above maximum {rule_set['max_value']}")
            
            # Check allowed values
            if "allowed_values" in rule_set:
                invalid_values = ~self.data[column].isin(rule_set["allowed_values"])
                violations = invalid_values.sum()
                if violations > 0:
                    column_results["passed"] = False
                    column_results["issues"].append(f"{violations} values not in allowed list")
            
            # Check null values
            if "allow_null" in rule_set and not rule_set["allow_null"]:
                null_count = self.data[column].isnull().sum()
                if null_count > 0:
                    column_results["passed"] = False
                    column_results["issues"].append(f"{null_count} null values found")
            
            validation_results[column] = column_results
        
        return {
            "success": True,
            "validation_results": validation_results,
            "overall_passed": all(result.get("passed", False) for result in validation_results.values())
        }
    
    def get_cleaning_suggestions(self) -> List[Dict[str, Any]]:
        """Get automated cleaning suggestions"""
        if self.data is None:
            return []
        
        suggestions = []
        issues = self.get_data_issues()
        
        # Missing values suggestions
        if issues['missing_values']:
            for col, count in issues['missing_values'].items():
                percentage = (count / len(self.data)) * 100
                if percentage < 5:
                    suggestions.append({
                        "type": "fix_missing",
                        "column": col,
                        "strategy": "auto",
                        "priority": "high",
                        "description": f"Fix {count} missing values in {col} ({percentage:.1f}%)"
                    })
                elif percentage < 20:
                    suggestions.append({
                        "type": "fix_missing",
                        "column": col,
                        "strategy": "auto",
                        "priority": "medium",
                        "description": f"Consider fixing {count} missing values in {col} ({percentage:.1f}%)"
                    })
                else:
                    suggestions.append({
                        "type": "consider_dropping",
                        "column": col,
                        "priority": "low",
                        "description": f"Column {col} has {percentage:.1f}% missing values - consider dropping"
                    })
        
        # Duplicates suggestion
        if issues['duplicates'] > 0:
            suggestions.append({
                "type": "remove_duplicates",
                "priority": "high",
                "description": f"Remove {issues['duplicates']} duplicate rows"
            })
        
        # Data type suggestions
        for issue in issues['data_type_issues']:
            suggestions.append({
                "type": "fix_data_types",
                "priority": "medium",
                "description": issue
            })
        
        # Outlier suggestions
        if issues['outliers']:
            for col, count in issues['outliers'].items():
                suggestions.append({
                    "type": "handle_outliers",
                    "column": col,
                    "method": "iqr",
                    "priority": "low",
                    "description": f"Handle {count} outliers in {col}"
                })
        
        return suggestions
    
    def get_cleaning_report(self) -> Dict[str, Any]:
        """Get comprehensive cleaning report"""
        if self.data is None:
            return {"error": "No data loaded"}
        
        current_quality = self.calculate_quality_score()
        issues = self.get_data_issues()
        suggestions = self.get_cleaning_suggestions()
        data_profile = self.get_data_profile()
        
        # Format issues for frontend compatibility
        formatted_issues = {
            "missing_values": {},
            "duplicates": {"count": 0, "percentage": 0.0},
            "outliers": {},
            "data_types": {}
        }
        
        # Format missing values
        if 'missing_values' in issues and issues['missing_values']:
            for col, count in issues['missing_values'].items():
                if count > 0:
                    percentage = (count / len(self.data)) * 100
                    formatted_issues["missing_values"][col] = {
                        "count": int(count),
                        "percentage": float(percentage)
                    }
        
        # Format duplicates
        if 'duplicates' in issues:
            duplicate_count = int(issues['duplicates'])
            formatted_issues["duplicates"] = {
                "count": duplicate_count,
                "percentage": float((duplicate_count / len(self.data)) * 100) if len(self.data) > 0 else 0.0
            }
        
        # Format outliers
        if 'outliers' in issues and issues['outliers']:
            for col, count in issues['outliers'].items():
                formatted_issues["outliers"][col] = {"count": int(count)}
        
        # Calculate column completeness
        column_completeness = {}
        for col in self.data.columns:
            non_null_count = self.data[col].notna().sum()
            completeness = (non_null_count / len(self.data)) * 100
            column_completeness[col] = float(completeness)
        
        return {
            "success": True,
            "data_quality_score": float(current_quality),
            "current_shape": list(self.data.shape),
            "original_shape": list(self.original_data.shape) if self.original_data is not None else list(self.data.shape),
            "issues": formatted_issues,
            "current_issues": issues,  # Keep original for backward compatibility
            "cleaning_suggestions": suggestions,
            "data_profile": data_profile,
            "column_completeness": column_completeness,
            "has_original": self.original_data is not None
        }