#!/usr/bin/env python3
"""
Advanced EDA MCP Tool
Handles advanced exploratory data analysis operations
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .base_mcp_tool import BaseMCPTool

class AdvancedEDATool(BaseMCPTool):
    """MCP tool for advanced exploratory data analysis"""
    
    def __init__(self):
        super().__init__("advanced_eda")
        self.data = None
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        return {
            "name": "advanced_eda",
            "description": "Advanced exploratory data analysis operations",
            "actions": [
                "distribution_analysis",
                "correlation_analysis", 
                "feature_importance",
                "anomaly_detection",
                "statistical_tests",
                "data_profiling"
            ]
        }
    
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute advanced EDA action"""
        try:
            if action == "distribution_analysis":
                return self.distribution_analysis(parameters.get("columns"))
            elif action == "correlation_analysis":
                return self.correlation_analysis(parameters.get("method", "pearson"))
            elif action == "feature_importance":
                return self.feature_importance(parameters.get("target_column"))
            elif action == "anomaly_detection":
                return self.anomaly_detection(parameters.get("method", "isolation_forest"))
            elif action == "statistical_tests":
                return self.statistical_tests(parameters.get("test_type"))
            elif action == "data_profiling":
                return self.data_profiling()
            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def distribution_analysis(self, columns: List[str] = None) -> Dict[str, Any]:
        """Analyze data distributions"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns.tolist()
        
        if columns:
            columns = [col for col in columns if col in numeric_cols]
        else:
            columns = numeric_cols
        
        results = {}
        
        for col in columns:
            col_data = self.data[col].dropna()
            
            # Basic distribution stats
            results[col] = {
                "mean": float(col_data.mean()),
                "median": float(col_data.median()),
                "std": float(col_data.std()),
                "skewness": float(col_data.skew()),
                "kurtosis": float(col_data.kurtosis()),
                "min": float(col_data.min()),
                "max": float(col_data.max()),
                "q25": float(col_data.quantile(0.25)),
                "q75": float(col_data.quantile(0.75))
            }
            
            # Distribution shape assessment
            if abs(results[col]["skewness"]) < 0.5:
                results[col]["distribution_shape"] = "approximately_normal"
            elif results[col]["skewness"] > 0.5:
                results[col]["distribution_shape"] = "right_skewed"
            else:
                results[col]["distribution_shape"] = "left_skewed"
        
        return {
            "success": True,
            "distributions": results,
            "columns_analyzed": len(columns)
        }
    
    def correlation_analysis(self, method: str = "pearson") -> Dict[str, Any]:
        """Perform correlation analysis"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        if len(numeric_data.columns) < 2:
            return {"success": False, "error": "Need at least 2 numeric columns for correlation"}
        
        # Calculate correlation matrix
        if method == "pearson":
            corr_matrix = numeric_data.corr(method='pearson')
        elif method == "spearman":
            corr_matrix = numeric_data.corr(method='spearman')
        elif method == "kendall":
            corr_matrix = numeric_data.corr(method='kendall')
        else:
            return {"success": False, "error": f"Unknown correlation method: {method}"}
        
        # Find strong correlations
        strong_correlations = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                corr_val = corr_matrix.iloc[i, j]
                
                if abs(corr_val) > 0.7:  # Strong correlation threshold
                    strong_correlations.append({
                        "variable1": col1,
                        "variable2": col2,
                        "correlation": float(corr_val),
                        "strength": "strong" if abs(corr_val) > 0.8 else "moderate"
                    })
        
        return {
            "success": True,
            "method": method,
            "correlation_matrix": corr_matrix.to_dict(),
            "strong_correlations": strong_correlations,
            "variables_analyzed": len(numeric_data.columns)
        }
    
    def feature_importance(self, target_column: str) -> Dict[str, Any]:
        """Calculate feature importance"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if target_column not in self.data.columns:
            return {"success": False, "error": f"Target column '{target_column}' not found"}
        
        # Prepare features and target
        features = self.data.select_dtypes(include=[np.number]).drop(columns=[target_column], errors='ignore')
        target = self.data[target_column]
        
        if len(features.columns) == 0:
            return {"success": False, "error": "No numeric features available"}
        
        # Remove rows with missing values
        combined_data = pd.concat([features, target], axis=1).dropna()
        features_clean = combined_data[features.columns]
        target_clean = combined_data[target_column]
        
        importance_scores = {}
        
        # Calculate correlation-based importance
        for col in features_clean.columns:
            correlation = abs(features_clean[col].corr(target_clean))
            importance_scores[col] = {
                "correlation_importance": float(correlation),
                "rank": 0  # Will be filled later
            }
        
        # Rank features by importance
        sorted_features = sorted(importance_scores.items(), 
                               key=lambda x: x[1]["correlation_importance"], 
                               reverse=True)
        
        for rank, (feature, scores) in enumerate(sorted_features, 1):
            importance_scores[feature]["rank"] = rank
        
        return {
            "success": True,
            "target_column": target_column,
            "feature_importance": importance_scores,
            "top_features": [item[0] for item in sorted_features[:5]],
            "features_analyzed": len(features_clean.columns)
        }
    
    def anomaly_detection(self, method: str = "isolation_forest") -> Dict[str, Any]:
        """Detect anomalies in the data"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        numeric_data = self.data.select_dtypes(include=[np.number]).dropna()
        
        if len(numeric_data) == 0:
            return {"success": False, "error": "No numeric data available for anomaly detection"}
        
        anomalies = []
        
        if method == "iqr":
            # IQR method for each column
            for col in numeric_data.columns:
                Q1 = numeric_data[col].quantile(0.25)
                Q3 = numeric_data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                col_anomalies = numeric_data[
                    (numeric_data[col] < lower_bound) | 
                    (numeric_data[col] > upper_bound)
                ].index.tolist()
                
                anomalies.extend(col_anomalies)
        
        elif method == "zscore":
            # Z-score method
            z_scores = np.abs((numeric_data - numeric_data.mean()) / numeric_data.std())
            anomaly_mask = (z_scores > 3).any(axis=1)
            anomalies = numeric_data[anomaly_mask].index.tolist()
        
        else:
            return {"success": False, "error": f"Unknown anomaly detection method: {method}"}
        
        # Remove duplicates and get unique anomaly indices
        unique_anomalies = list(set(anomalies))
        
        return {
            "success": True,
            "method": method,
            "anomaly_count": len(unique_anomalies),
            "anomaly_percentage": (len(unique_anomalies) / len(self.data)) * 100,
            "anomaly_indices": unique_anomalies[:100],  # Limit to first 100
            "total_rows": len(self.data)
        }
    
    def statistical_tests(self, test_type: str) -> Dict[str, Any]:
        """Perform statistical tests"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        if test_type == "normality":
            # Test normality for each numeric column
            results = {}
            
            for col in numeric_data.columns:
                col_data = numeric_data[col].dropna()
                
                if len(col_data) < 8:
                    results[col] = {"error": "Insufficient data for normality test"}
                    continue
                
                # Shapiro-Wilk test (for small samples)
                if len(col_data) <= 5000:
                    try:
                        from scipy import stats
                        statistic, p_value = stats.shapiro(col_data)
                        results[col] = {
                            "test": "shapiro_wilk",
                            "statistic": float(statistic),
                            "p_value": float(p_value),
                            "is_normal": p_value > 0.05
                        }
                    except ImportError:
                        # Fallback to simple skewness test
                        skewness = abs(col_data.skew())
                        results[col] = {
                            "test": "skewness_check",
                            "skewness": float(skewness),
                            "is_normal": skewness < 0.5
                        }
                else:
                    # For large samples, use skewness and kurtosis
                    skewness = abs(col_data.skew())
                    kurtosis = abs(col_data.kurtosis())
                    results[col] = {
                        "test": "skewness_kurtosis",
                        "skewness": float(skewness),
                        "kurtosis": float(kurtosis),
                        "is_normal": skewness < 0.5 and kurtosis < 3
                    }
            
            return {
                "success": True,
                "test_type": "normality",
                "results": results,
                "columns_tested": len(results)
            }
        
        else:
            return {"success": False, "error": f"Unknown test type: {test_type}"}
    
    def data_profiling(self) -> Dict[str, Any]:
        """Generate comprehensive data profile"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        profile = {
            "basic_info": {
                "shape": self.data.shape,
                "memory_usage_mb": self.data.memory_usage(deep=True).sum() / (1024**2),
                "duplicate_rows": int(self.data.duplicated().sum())
            },
            "column_types": {
                "numeric": self.data.select_dtypes(include=[np.number]).columns.tolist(),
                "categorical": self.data.select_dtypes(include=['object']).columns.tolist(),
                "datetime": self.data.select_dtypes(include=['datetime64']).columns.tolist()
            },
            "missing_data": {
                "total_missing": int(self.data.isnull().sum().sum()),
                "missing_percentage": (self.data.isnull().sum().sum() / (self.data.shape[0] * self.data.shape[1])) * 100,
                "columns_with_missing": self.data.columns[self.data.isnull().any()].tolist()
            },
            "data_quality_score": 0.0
        }
        
        # Calculate data quality score
        score = 100.0
        
        # Deduct for missing values
        missing_ratio = profile["missing_data"]["missing_percentage"] / 100
        score -= missing_ratio * 30
        
        # Deduct for duplicates
        duplicate_ratio = profile["basic_info"]["duplicate_rows"] / self.data.shape[0]
        score -= duplicate_ratio * 20
        
        # Deduct for data type issues (too many object columns)
        object_ratio = len(profile["column_types"]["categorical"]) / len(self.data.columns)
        if object_ratio > 0.5:
            score -= (object_ratio - 0.5) * 20
        
        profile["data_quality_score"] = max(0.0, min(100.0, score))
        
        return {
            "success": True,
            "profile": profile
        }