#!/usr/bin/env python3
"""
Tool Registry for MCP Tools
Manages registration and discovery of available tools
"""

from typing import Dict, Any, List, Type
from .base_mcp_tool import BaseMCPTool
from .data_processing import DataProcessingTool
from .data_cleaner import DataCleaner
from .report_editor import ReportEditor

class ToolRegistry:
    """Registry for managing MCP tools"""
    
    def __init__(self):
        self.tools: Dict[str, BaseMCPTool] = {}
        self.tool_classes: Dict[str, Type[BaseMCPTool]] = {
            "data_processing": DataProcessingTool,
            "data_cleaner": DataCleaner,
            "report_editor": ReportEditor
        }
        
    def register_tool(self, tool: BaseMCPTool) -> bool:
        """Register a tool instance"""
        try:
            self.tools[tool.name] = tool
            return True
        except Exception as e:
            print(f"Failed to register tool {tool.name}: {e}")
            return False
    
    def get_tool(self, name: str) -> BaseMCPTool:
        """Get a tool instance by name"""
        if name not in self.tools:
            if name in self.tool_classes:
                # Auto-instantiate tool
                self.tools[name] = self.tool_classes[name]()
            else:
                raise ValueError(f"Tool '{name}' not found")
        
        return self.tools[name]
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """List all available tools"""
        tools_info = []
        
        for name, tool_class in self.tool_classes.items():
            if name in self.tools:
                tool = self.tools[name]
            else:
                tool = tool_class()
            
            capabilities = tool.get_capabilities()
            tools_info.append({
                "name": name,
                "description": capabilities.get("description", ""),
                "actions": capabilities.get("actions", []),
                "instantiated": name in self.tools
            })
        
        return tools_info
    
    def execute_tool_action(self, tool_name: str, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an action on a specific tool"""
        try:
            tool = self.get_tool(tool_name)
            result = tool.execute(action, parameters)
            tool.log_action(action, parameters, result)
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_tool_capabilities(self, tool_name: str) -> Dict[str, Any]:
        """Get capabilities of a specific tool"""
        try:
            tool = self.get_tool(tool_name)
            return tool.get_capabilities()
        except Exception as e:
            return {"error": str(e)}
    
    def initialize_all_tools(self) -> Dict[str, bool]:
        """Initialize all available tools"""
        results = {}
        
        for name in self.tool_classes.keys():
            try:
                self.get_tool(name)
                results[name] = True
            except Exception as e:
                print(f"Failed to initialize tool {name}: {e}")
                results[name] = False
        
        return results

# Global registry instance
registry = ToolRegistry()