#!/usr/bin/env python3
"""
Report MCP Server
MCP server wrapper for report generation operations
"""

from mcp import McpServer
from typing import Dict, Any, List
from .report_editor import ReportEditor

class ReportMCPServer:
    """MCP server for report generation"""
    
    def __init__(self):
        self.server = McpServer("report-generator")
        self.report_editor = ReportEditor()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup MCP server handlers"""
        
        @self.server.tool("create_new_report")
        async def create_new_report(
            title: str,
            author: str = "AI Agent System"
        ) -> str:
            """Create a new report"""
            return self.report_editor.create_new_report(title, author)
        
        @self.server.tool("add_section")
        async def add_section(
            heading: str,
            content: str,
            section_type: str = "text"
        ) -> Dict[str, Any]:
            """Add a section to the report"""
            return self.report_editor.add_section(heading, content, section_type)
        
        @self.server.tool("add_analysis_results")
        async def add_analysis_results(
            analysis_type: str,
            results: Dict[str, Any]
        ) -> Dict[str, Any]:
            """Add analysis results as a section"""
            return self.report_editor.add_analysis_results(analysis_type, results)
        
        @self.server.tool("export_to_word")
        async def export_to_word(filename: str = "report.docx") -> Dict[str, Any]:
            """Export report to Word document"""
            return self.report_editor.export_to_word(filename)
        
        @self.server.tool("export_to_pdf")
        async def export_to_pdf(filename: str = "report.pdf") -> Dict[str, Any]:
            """Export report to PDF"""
            return self.report_editor.export_to_pdf(filename)
        
        @self.server.tool("get_report_data")
        async def get_report_data() -> Dict[str, Any]:
            """Get current report data"""
            return self.report_editor.get_report_data()
    
    def run(self):
        """Run the MCP server"""
        return self.server.run()