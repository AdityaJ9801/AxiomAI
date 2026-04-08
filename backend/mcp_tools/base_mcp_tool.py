#!/usr/bin/env python3
"""
Base MCP Tool Class
Provides common functionality for all MCP tools
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import logging

class BaseMCPTool(ABC):
    """Base class for all MCP tools"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"mcp_tools.{name}")
        self.data = None
        
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Return tool capabilities"""
        pass
    
    @abstractmethod
    def execute(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute tool action"""
        pass
    
    def validate_parameters(self, parameters: Dict[str, Any], required: List[str]) -> bool:
        """Validate required parameters"""
        for param in required:
            if param not in parameters:
                raise ValueError(f"Missing required parameter: {param}")
        return True
    
    def log_action(self, action: str, parameters: Dict[str, Any], result: Dict[str, Any]):
        """Log tool action"""
        self.logger.info(f"Action: {action}, Parameters: {parameters}, Success: {result.get('success', False)}")