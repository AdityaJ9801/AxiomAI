#!/usr/bin/env python3
"""
Data Cleaning MCP Server
MCP server wrapper for data cleaning operations
"""

from mcp import McpServer
from typing import Dict, Any
from .data_cleaner import DataCleaner

class DataCleaningMCPServer:
    """MCP server for data cleaning operations"""
    
    def __init__(self):
        self.server = McpServer("data-cleaning")
        self.cleaner = DataCleaner()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.tool("assess_quality")
        async def assess_quality() -> Dict[str, Any]:
            """Assess data quality"""
            return self.cleaner.execute("assess_quality", {})
        
        @self.server.tool("fix_missing_values")
        async def fix_missing_values(
            strategy: str = "auto",
            column: str = None,
            fill_value: Any = None
        ) -> Dict[str, Any]:
            """Fix missing values in dataset"""
            return self.cleaner.execute("fix_missing_values", {
                "strategy": strategy,
                "column": column,
                "fill_value": fill_value
            })
        
        @self.server.tool("remove_duplicates")
        async def remove_duplicates(
            subset: list = None,
            keep: str = "first"
        ) -> Dict[str, Any]:
            """Remove duplicate rows"""
            return self.cleaner.execute("remove_duplicates", {
                "subset": subset,
                "keep": keep
            })
        
        @self.server.tool("handle_outliers")
        async def handle_outliers(
            method: str = "iqr",
            columns: list = None,
            threshold: float = 1.5
        ) -> Dict[str, Any]:
            """Handle outliers in numeric columns"""
            return self.cleaner.execute("handle_outliers", {
                "method": method,
                "columns": columns,
                "threshold": threshold
            })
        
        @self.server.tool("get_cleaning_report")
        async def get_cleaning_report() -> Dict[str, Any]:
            """Get comprehensive cleaning report"""
            return self.cleaner.execute("get_cleaning_report", {})
    
    def run(self):
        """Run the MCP server"""
        return self.server.run()