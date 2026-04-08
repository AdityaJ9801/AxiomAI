#!/usr/bin/env python3
"""
EDA MCP Server
MCP server wrapper for exploratory data analysis
"""

from mcp import McpServer
from typing import Dict, Any, List
from .advanced_eda import AdvancedEDATool

class EDAmcpServer:
    """MCP server for exploratory data analysis"""
    
    def __init__(self):
        self.server = McpServer("eda-analysis")
        self.eda_tool = AdvancedEDATool()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.tool("distribution_analysis")
        async def distribution_analysis(columns: List[str] = None) -> Dict[str, Any]:
            """Analyze data distributions"""
            return self.eda_tool.execute("distribution_analysis", {"columns": columns})
        
        @self.server.tool("correlation_analysis")
        async def correlation_analysis(method: str = "pearson") -> Dict[str, Any]:
            """Perform correlation analysis"""
            return self.eda_tool.execute("correlation_analysis", {"method": method})
        
        @self.server.tool("feature_importance")
        async def feature_importance(target_column: str) -> Dict[str, Any]:
            """Calculate feature importance"""
            return self.eda_tool.execute("feature_importance", {"target_column": target_column})
        
        @self.server.tool("anomaly_detection")
        async def anomaly_detection(method: str = "isolation_forest") -> Dict[str, Any]:
            """Detect anomalies in data"""
            return self.eda_tool.execute("anomaly_detection", {"method": method})
        
        @self.server.tool("statistical_tests")
        async def statistical_tests(test_type: str) -> Dict[str, Any]:
            """Perform statistical tests"""
            return self.eda_tool.execute("statistical_tests", {"test_type": test_type})
        
        @self.server.tool("data_profiling")
        async def data_profiling() -> Dict[str, Any]:
            """Generate comprehensive data profile"""
            return self.eda_tool.execute("data_profiling", {})
    
    def run(self):
        """Run the MCP server"""
        return self.server.run()