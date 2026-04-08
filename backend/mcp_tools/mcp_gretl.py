#!/usr/bin/env python3
"""
GRETL MCP Server
MCP server wrapper for econometric analysis using GRETL-style operations
"""

from mcp import McpServer
from typing import Dict, Any, List
from .gretl import GretlTool

class GretlMCPServer:
    """MCP server for econometric analysis"""
    
    def __init__(self):
        self.server = McpServer("gretl-econometrics")
        self.gretl_tool = GretlTool()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.tool("ols_regression")
        async def ols_regression(
            dependent_var: str,
            independent_vars: List[str],
            include_constant: bool = True
        ) -> Dict[str, Any]:
            """Perform OLS regression"""
            return self.gretl_tool.execute("ols_regression", {
                "dependent_var": dependent_var,
                "independent_vars": independent_vars,
                "include_constant": include_constant
            })
        
        @self.server.tool("unit_root_test")
        async def unit_root_test(
            variable: str,
            test_type: str = "adf"
        ) -> Dict[str, Any]:
            """Perform unit root test"""
            return self.gretl_tool.execute("unit_root_test", {
                "variable": variable,
                "test_type": test_type
            })
        
        @self.server.tool("cointegration_test")
        async def cointegration_test(
            variables: List[str],
            test_type: str = "johansen"
        ) -> Dict[str, Any]:
            """Perform cointegration test"""
            return self.gretl_tool.execute("cointegration_test", {
                "variables": variables,
                "test_type": test_type
            })
        
        @self.server.tool("var_model")
        async def var_model(
            variables: List[str],
            lags: int = 2
        ) -> Dict[str, Any]:
            """Estimate VAR model"""
            return self.gretl_tool.execute("var_model", {
                "variables": variables,
                "lags": lags
            })
        
        @self.server.tool("arch_test")
        async def arch_test(
            residuals: str,
            lags: int = 4
        ) -> Dict[str, Any]:
            """Perform ARCH test"""
            return self.gretl_tool.execute("arch_test", {
                "residuals": residuals,
                "lags": lags
            })
    
    def run(self):
        """Run the MCP server"""
        return self.server.run()