#!/usr/bin/env python3
"""
Visualization MCP Server
MCP server wrapper for data visualization operations
"""

from mcp import McpServer
from typing import Dict, Any, List
import pandas as pd
import numpy as np

class VisualizationMCPServer:
    """MCP server for data visualization"""
    
    def __init__(self):
        self.server = McpServer("data-visualization")
        self.data = None
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.tool("create_histogram")
        async def create_histogram(
            column: str,
            bins: int = 30,
            title: str = None
        ) -> Dict[str, Any]:
            """Create histogram visualization"""
            return self.create_histogram(column, bins, title)
        
        @self.server.tool("create_scatter_plot")
        async def create_scatter_plot(
            x_column: str,
            y_column: str,
            title: str = None
        ) -> Dict[str, Any]:
            """Create scatter plot visualization"""
            return self.create_scatter_plot(x_column, y_column, title)
        
        @self.server.tool("create_line_plot")
        async def create_line_plot(
            x_column: str,
            y_column: str,
            title: str = None
        ) -> Dict[str, Any]:
            """Create line plot visualization"""
            return self.create_line_plot(x_column, y_column, title)
        
        @self.server.tool("create_correlation_heatmap")
        async def create_correlation_heatmap(
            columns: List[str] = None,
            method: str = "pearson"
        ) -> Dict[str, Any]:
            """Create correlation heatmap"""
            return self.create_correlation_heatmap(columns, method)
        
        @self.server.tool("create_box_plot")
        async def create_box_plot(
            column: str,
            group_by: str = None,
            title: str = None
        ) -> Dict[str, Any]:
            """Create box plot visualization"""
            return self.create_box_plot(column, group_by, title)
    
    def create_histogram(self, column: str, bins: int = 30, title: str = None) -> Dict[str, Any]:
        """Create histogram data for visualization"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if column not in self.data.columns:
            return {"success": False, "error": f"Column '{column}' not found"}
        
        series = self.data[column].dropna()
        
        if not pd.api.types.is_numeric_dtype(series):
            return {"success": False, "error": f"Column '{column}' is not numeric"}
        
        # Calculate histogram
        counts, bin_edges = np.histogram(series, bins=bins)
        
        # Prepare data for frontend
        histogram_data = {
            "type": "histogram",
            "column": column,
            "title": title or f"Histogram of {column}",
            "bins": bins,
            "counts": counts.tolist(),
            "bin_edges": bin_edges.tolist(),
            "statistics": {
                "mean": float(series.mean()),
                "median": float(series.median()),
                "std": float(series.std()),
                "min": float(series.min()),
                "max": float(series.max())
            }
        }
        
        return {
            "success": True,
            "visualization": histogram_data
        }
    
    def create_scatter_plot(self, x_column: str, y_column: str, title: str = None) -> Dict[str, Any]:
        """Create scatter plot data"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        missing_cols = [col for col in [x_column, y_column] if col not in self.data.columns]
        if missing_cols:
            return {"success": False, "error": f"Columns not found: {missing_cols}"}
        
        # Get clean data
        plot_data = self.data[[x_column, y_column]].dropna()
        
        if len(plot_data) == 0:
            return {"success": False, "error": "No valid data points after removing missing values"}
        
        # Calculate correlation
        correlation = plot_data[x_column].corr(plot_data[y_column])
        
        scatter_data = {
            "type": "scatter",
            "x_column": x_column,
            "y_column": y_column,
            "title": title or f"{y_column} vs {x_column}",
            "data_points": [
                {"x": float(x), "y": float(y)} 
                for x, y in zip(plot_data[x_column], plot_data[y_column])
            ],
            "correlation": float(correlation),
            "point_count": len(plot_data)
        }
        
        return {
            "success": True,
            "visualization": scatter_data
        }
    
    def create_line_plot(self, x_column: str, y_column: str, title: str = None) -> Dict[str, Any]:
        """Create line plot data"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        missing_cols = [col for col in [x_column, y_column] if col not in self.data.columns]
        if missing_cols:
            return {"success": False, "error": f"Columns not found: {missing_cols}"}
        
        # Get clean data and sort by x
        plot_data = self.data[[x_column, y_column]].dropna().sort_values(x_column)
        
        if len(plot_data) == 0:
            return {"success": False, "error": "No valid data points after removing missing values"}
        
        line_data = {
            "type": "line",
            "x_column": x_column,
            "y_column": y_column,
            "title": title or f"{y_column} over {x_column}",
            "data_points": [
                {"x": float(x), "y": float(y)} 
                for x, y in zip(plot_data[x_column], plot_data[y_column])
            ],
            "point_count": len(plot_data)
        }
        
        return {
            "success": True,
            "visualization": line_data
        }
    
    def create_correlation_heatmap(self, columns: List[str] = None, method: str = "pearson") -> Dict[str, Any]:
        """Create correlation heatmap data"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        # Get numeric columns
        numeric_data = self.data.select_dtypes(include=[np.number])
        
        if columns:
            # Filter to specified columns
            available_cols = [col for col in columns if col in numeric_data.columns]
            if not available_cols:
                return {"success": False, "error": "No valid numeric columns found"}
            numeric_data = numeric_data[available_cols]
        
        if len(numeric_data.columns) < 2:
            return {"success": False, "error": "Need at least 2 numeric columns for correlation"}
        
        # Calculate correlation matrix
        corr_matrix = numeric_data.corr(method=method)
        
        # Prepare heatmap data
        heatmap_data = {
            "type": "heatmap",
            "method": method,
            "title": f"Correlation Matrix ({method.title()})",
            "columns": corr_matrix.columns.tolist(),
            "correlation_matrix": corr_matrix.values.tolist(),
            "size": len(corr_matrix)
        }
        
        return {
            "success": True,
            "visualization": heatmap_data
        }
    
    def create_box_plot(self, column: str, group_by: str = None, title: str = None) -> Dict[str, Any]:
        """Create box plot data"""
        if self.data is None:
            return {"success": False, "error": "No data loaded"}
        
        if column not in self.data.columns:
            return {"success": False, "error": f"Column '{column}' not found"}
        
        if group_by and group_by not in self.data.columns:
            return {"success": False, "error": f"Group column '{group_by}' not found"}
        
        series = self.data[column].dropna()
        
        if not pd.api.types.is_numeric_dtype(series):
            return {"success": False, "error": f"Column '{column}' is not numeric"}
        
        if group_by:
            # Grouped box plot
            groups = {}
            for group_val in self.data[group_by].unique():
                if pd.notna(group_val):
                    group_data = self.data[self.data[group_by] == group_val][column].dropna()
                    if len(group_data) > 0:
                        groups[str(group_val)] = {
                            "q1": float(group_data.quantile(0.25)),
                            "median": float(group_data.median()),
                            "q3": float(group_data.quantile(0.75)),
                            "min": float(group_data.min()),
                            "max": float(group_data.max()),
                            "count": len(group_data)
                        }
            
            box_data = {
                "type": "box_plot_grouped",
                "column": column,
                "group_by": group_by,
                "title": title or f"Box Plot of {column} by {group_by}",
                "groups": groups
            }
        else:
            # Single box plot
            box_data = {
                "type": "box_plot",
                "column": column,
                "title": title or f"Box Plot of {column}",
                "statistics": {
                    "q1": float(series.quantile(0.25)),
                    "median": float(series.median()),
                    "q3": float(series.quantile(0.75)),
                    "min": float(series.min()),
                    "max": float(series.max()),
                    "count": len(series)
                }
            }
        
        return {
            "success": True,
            "visualization": box_data
        }
    
    def run(self):
        """Run the MCP server"""
        return self.server.run()