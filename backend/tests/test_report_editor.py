#!/usr/bin/env python3
"""
Test Report Editor Functionality
"""

import unittest
import os
import tempfile
from mcp_tools.report_editor import ReportEditor

class TestReportEditor(unittest.TestCase):
    """Test cases for report editor operations"""
    
    def setUp(self):
        """Set up test report editor"""
        self.editor = ReportEditor()
        self.test_title = "Test Economic Analysis Report"
        self.test_author = "Test Author"
    
    def test_create_new_report(self):
        """Test creating a new report"""
        result = self.editor.create_new_report(self.test_title, self.test_author)
        
        self.assertIsInstance(result, str)
        self.assertIn(self.test_title, result)
        
        # Check report data
        self.assertEqual(self.editor.report_data['title'], self.test_title)
        self.assertEqual(self.editor.report_data['author'], self.test_author)
        self.assertIsInstance(self.editor.report_data['sections'], list)
        self.assertEqual(len(self.editor.report_data['sections']), 0)
    
    def test_add_section(self):
        """Test adding sections to report"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        heading = "Introduction"
        content = "This is the introduction section."
        
        result = self.editor.add_section(heading, content)
        
        self.assertTrue(result['success'])
        self.assertIn('section_id', result)
        self.assertEqual(result['section_id'], 0)
        
        # Check section was added
        self.assertEqual(len(self.editor.report_data['sections']), 1)
        section = self.editor.report_data['sections'][0]
        self.assertEqual(section['heading'], heading)
        self.assertEqual(section['content'], content)
        self.assertEqual(section['type'], 'text')
    
    def test_add_multiple_sections(self):
        """Test adding multiple sections"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        sections = [
            ("Introduction", "Introduction content"),
            ("Methodology", "Methodology content"),
            ("Results", "Results content")
        ]
        
        for i, (heading, content) in enumerate(sections):
            result = self.editor.add_section(heading, content)
            self.assertTrue(result['success'])
            self.assertEqual(result['section_id'], i)
        
        self.assertEqual(len(self.editor.report_data['sections']), 3)
    
    def test_update_section(self):
        """Test updating existing section"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Original Heading", "Original content")
        
        new_heading = "Updated Heading"
        new_content = "Updated content"
        
        result = self.editor.update_section(0, new_heading, new_content)
        
        self.assertTrue(result['success'])
        
        # Check section was updated
        section = self.editor.report_data['sections'][0]
        self.assertEqual(section['heading'], new_heading)
        self.assertEqual(section['content'], new_content)
        self.assertIn('modified_date', section)
    
    def test_update_section_partial(self):
        """Test partial section update"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Original Heading", "Original content")
        
        # Update only heading
        result = self.editor.update_section(0, heading="New Heading")
        self.assertTrue(result['success'])
        
        section = self.editor.report_data['sections'][0]
        self.assertEqual(section['heading'], "New Heading")
        self.assertEqual(section['content'], "Original content")  # Should remain unchanged
    
    def test_delete_section(self):
        """Test deleting a section"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Section 1", "Content 1")
        self.editor.add_section("Section 2", "Content 2")
        self.editor.add_section("Section 3", "Content 3")
        
        result = self.editor.delete_section(1)  # Delete middle section
        
        self.assertTrue(result['success'])
        self.assertIn("Section 2", result['message'])
        
        # Check section was removed and IDs updated
        self.assertEqual(len(self.editor.report_data['sections']), 2)
        self.assertEqual(self.editor.report_data['sections'][0]['heading'], "Section 1")
        self.assertEqual(self.editor.report_data['sections'][1]['heading'], "Section 3")
        self.assertEqual(self.editor.report_data['sections'][0]['id'], 0)
        self.assertEqual(self.editor.report_data['sections'][1]['id'], 1)
    
    def test_add_analysis_results_descriptive(self):
        """Test adding descriptive analysis results"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        results = {
            "statistics": {
                "column1": {"mean": 10.5, "std": 2.3, "min": 5, "max": 15},
                "column2": {"mean": 20.1, "std": 4.1, "min": 12, "max": 28}
            },
            "correlations": {
                "column1": {"column2": 0.75}
            }
        }
        
        result = self.editor.add_analysis_results("descriptive", results)
        
        self.assertTrue(result['success'])
        self.assertIn('section_id', result)
        
        # Check section was added with correct type
        section = self.editor.report_data['sections'][0]
        self.assertEqual(section['type'], 'analysis')
        self.assertIn('Descriptive Analysis Results', section['heading'])
        self.assertIn('Summary Statistics', section['content'])
    
    def test_add_analysis_results_regression(self):
        """Test adding regression analysis results"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        results = {
            "r_squared": 0.85,
            "coefficients": {
                "variable1": 1.23,
                "variable2": -0.45
            }
        }
        
        result = self.editor.add_analysis_results("regression", results)
        
        self.assertTrue(result['success'])
        
        section = self.editor.report_data['sections'][0]
        self.assertIn('Regression Analysis Results', section['heading'])
        self.assertIn('R-squared', section['content'])
        self.assertIn('Coefficients', section['content'])
    
    def test_add_visualization(self):
        """Test adding visualization section"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        chart_data = {
            "data": [1, 2, 3, 4, 5],
            "labels": ["A", "B", "C", "D", "E"]
        }
        
        result = self.editor.add_visualization("bar_chart", chart_data, "Sample Chart")
        
        self.assertTrue(result['success'])
        
        section = self.editor.report_data['sections'][0]
        self.assertEqual(section['heading'], "Sample Chart")
        self.assertEqual(section['type'], 'visualization')
        self.assertIn('bar_chart', section['content'])
    
    def test_get_report_data(self):
        """Test getting report data"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Section 1", "Content with multiple words here")
        self.editor.add_section("Section 2", "More content with additional words")
        
        result = self.editor.get_report_data()
        
        self.assertTrue(result['success'])
        self.assertIn('report', result)
        self.assertIn('section_count', result)
        self.assertIn('word_count', result)
        
        self.assertEqual(result['section_count'], 2)
        self.assertGreater(result['word_count'], 0)
        self.assertEqual(result['report']['title'], self.test_title)
    
    def test_export_to_word_no_library(self):
        """Test Word export when library is not available"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Test Section", "Test content")
        
        # This should handle the case where python-docx is not installed
        result = self.editor.export_to_word("test_report.docx")
        
        # Should either succeed or fail gracefully with library error
        self.assertIn('success', result)
        if not result['success']:
            self.assertIn('python-docx', result['error'])
    
    def test_export_to_pdf_no_library(self):
        """Test PDF export when library is not available"""
        self.editor.create_new_report(self.test_title, self.test_author)
        self.editor.add_section("Test Section", "Test content")
        
        # This should handle the case where reportlab is not installed
        result = self.editor.export_to_pdf("test_report.pdf")
        
        # Should either succeed or fail gracefully with library error
        self.assertIn('success', result)
        if not result['success']:
            self.assertIn('reportlab', result['error'])
    
    def test_error_handling_invalid_section_id(self):
        """Test error handling for invalid section IDs"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        # Try to update non-existent section
        result = self.editor.update_section(999, "New Heading")
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        
        # Try to delete non-existent section
        result = self.editor.delete_section(999)
        self.assertFalse(result['success'])
        self.assertIn('error', result)
    
    def test_format_analysis_results_unknown_type(self):
        """Test formatting unknown analysis type"""
        content = self.editor._format_analysis_results("unknown_type", {"data": "test"})
        
        self.assertIn("unknown_type", content.lower())
        self.assertIn("test", content)
    
    def test_section_timestamps(self):
        """Test that sections have proper timestamps"""
        self.editor.create_new_report(self.test_title, self.test_author)
        
        result = self.editor.add_section("Test Section", "Test content")
        section_id = result['section_id']
        
        section = self.editor.report_data['sections'][section_id]
        self.assertIn('created_date', section)
        
        # Update section and check for modified timestamp
        self.editor.update_section(section_id, content="Updated content")
        self.assertIn('modified_date', section)
    
    def tearDown(self):
        """Clean up any test files"""
        test_files = ["test_report.docx", "test_report.pdf"]
        for filename in test_files:
            if os.path.exists(filename):
                try:
                    os.remove(filename)
                except:
                    pass  # Ignore cleanup errors

if __name__ == '__main__':
    unittest.main()