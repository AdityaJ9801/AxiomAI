#!/usr/bin/env python3
"""
Data Processing MCP Tool
Handles data loading, basic analysis, and transformations
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from .base_mcp_tool import BaseMCPTool

class DataProcessingTool(BaseMCPTool):
    """MCP tool for data processing operations"""
    
    def __init__(self):
        super().__init__("data_processing")
        self.data = None
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        return {
            "name": "data_processing",
            "description": "Data loading, analysis, and transformation operations",
            "actions": [
                "load_data",
                "get_info",
                "get_sample",
                "get_statistics",
                "filter_data",
                "transform_data"
            ]
        }
    
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data processing action"""
        try:
            if action == "load_data":
                return self.load_data(parameters.get("file_path"))
            elif action == "get_info":
                return self.get_info()
            elif action == "get_sample":
                return self.get_sample(parameters.get("n", 10))
            elif action == "get_statistics":
                return self.get_statistics()
            elif action == "filter_data":
                return self.filter_data(parameters.get("conditions", {}))
            elif action == "transform_data":
                return self.transform_data(parameters.get("operations", []))
            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def load_data(self, file_path: str) -> Dict[str, Any]:
        """Load data from file"""
        try:
            if file_path.endswith('.csv'):
                self.data = pd.read_csv(file_path)
            elif file_path.endswith(('.xlsx', '.xls')):
                self.data = pd.read_excel(file_path)
            else:
                return {"success": False, "error": "Unsupported file format"}
            
            return {
                "success": True,
                "message": f"Data loaded successfully: {self.data.shape[0]} rows × {self.data.shape[1]} columns",
                "shape": self.data.shape,
                "columns": self.data.columns.tolist()
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_info(self) -> Dict[str, Any]:
        """Get dataset information"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        return {
            "success": True,
            "shape": self.data.shape,
            "columns": self.data.columns.tolist(),
            "dtypes": self.data.dtypes.astype(str).to_dict(),
            "memory_usage": self.data.memory_usage(deep=True).sum(),
            "missing_values": self.data.isnull().sum().to_dict()
        }
    
    def get_sample(self, n: int = 10) -> Dict[str, Any]:
        """Get data sample"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        sample = self.data.head(n)
        return {
            "success": True,
            "sample": sample.to_dict('records'),
            "total_rows": len(self.data)
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get descriptive statistics"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        numeric_cols = self.data.select_dtypes(include=[np.number])
        
        return {
            "success": True,
            "statistics": numeric_cols.describe().to_dict(),
            "correlations": numeric_cols.corr().to_dict() if len(numeric_cols.columns) > 1 else {}
        }
    
    def filter_data(self, conditions: Dict[str, Any]) -> Dict[str, Any]:
        """Filter data based on conditions"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        try:
            filtered_data = self.data.copy()
            
            for column, condition in conditions.items():
                if column not in self.data.columns:
                    continue
                
                if isinstance(condition, dict):
                    if 'min' in condition:
                        filtered_data = filtered_data[filtered_data[column] >= condition['min']]
                    if 'max' in condition:
                        filtered_data = filtered_data[filtered_data[column] <= condition['max']]
                    if 'equals' in condition:
                        filtered_data = filtered_data[filtered_data[column] == condition['equals']]
                    if 'contains' in condition:
                        filtered_data = filtered_data[filtered_data[column].str.contains(condition['contains'], na=False)]
            
            return {
                "success": True,
                "filtered_shape": filtered_data.shape,
                "original_shape": self.data.shape,
                "sample": filtered_data.head(10).to_dict('records')
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def transform_data(self, operations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Apply data transformations"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        try:
            transformed_data = self.data.copy()
            applied_operations = []
            
            for operation in operations:
                op_type = operation.get('type')
                column = operation.get('column')
                
                if op_type == 'normalize' and column in transformed_data.columns:
                    if transformed_data[column].dtype in ['int64', 'float64']:
                        transformed_data[column] = (transformed_data[column] - transformed_data[column].mean()) / transformed_data[column].std()
                        applied_operations.append(f"Normalized {column}")
                
                elif op_type == 'log_transform' and column in transformed_data.columns:
                    if transformed_data[column].dtype in ['int64', 'float64'] and (transformed_data[column] > 0).all():
                        transformed_data[column] = np.log(transformed_data[column])
                        applied_operations.append(f"Log transformed {column}")
                
                elif op_type == 'categorical_encode' and column in transformed_data.columns:
                    if transformed_data[column].dtype == 'object':
                        transformed_data[column] = pd.Categorical(transformed_data[column]).codes
                        applied_operations.append(f"Encoded {column}")
            
            return {
                "success": True,
                "applied_operations": applied_operations,
                "transformed_shape": transformed_data.shape,
                "sample": transformed_data.head(10).to_dict('records')
            }
        except Exception as e:
            return {"success": False, "error": str(e)}