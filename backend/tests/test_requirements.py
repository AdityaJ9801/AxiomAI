#!/usr/bin/env python3
"""
Test Requirements and Dependencies
Verify that all required packages are available and working
"""

import unittest
import sys
import importlib
import subprocess

class TestRequirements(unittest.TestCase):
    """Test cases for verifying system requirements"""
    
    def test_python_version(self):
        """Test Python version compatibility"""
        version = sys.version_info
        
        # Require Python 3.8 or higher
        self.assertGreaterEqual(version.major, 3)
        if version.major == 3:
            self.assertGreaterEqual(version.minor, 8)
        
        print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    def test_core_packages(self):
        """Test core required packages"""
        core_packages = [
            'pandas',
            'numpy',
            'fastapi',
            'uvicorn'
        ]
        
        for package in core_packages:
            with self.subTest(package=package):
                try:
                    module = importlib.import_module(package)
                    self.assertIsNotNone(module)
                    print(f"✓ {package} available")
                    
                    # Try to get version if available
                    if hasattr(module, '__version__'):
                        print(f"  Version: {module.__version__}")
                        
                except ImportError as e:
                    self.fail(f"Required package '{package}' not available: {e}")
    
    def test_optional_packages(self):
        """Test optional packages (warn if missing)"""
        optional_packages = [
            ('scipy', 'Advanced statistical functions'),
            ('scikit-learn', 'Machine learning algorithms'),
            ('statsmodels', 'Statistical modeling'),
            ('plotly', 'Interactive visualizations'),
            ('python-docx', 'Word document export'),
            ('reportlab', 'PDF generation'),
            ('openpyxl', 'Excel file support'),
            ('xlsxwriter', 'Excel writing'),
            ('streamlit', 'Web interface'),
            ('rich', 'CLI formatting')
        ]
        
        missing_packages = []
        
        for package, description in optional_packages:
            try:
                module = importlib.import_module(package.replace('-', '_'))
                print(f"✓ {package} available - {description}")
                
                if hasattr(module, '__version__'):
                    print(f"  Version: {module.__version__}")
                    
            except ImportError:
                missing_packages.append((package, description))
                print(f"⚠ {package} missing - {description}")
        
        if missing_packages:
            print(f"\nOptional packages missing: {len(missing_packages)}")
            print("Install with: pip install " + " ".join([pkg for pkg, _ in missing_packages]))
    
    def test_mcp_packages(self):
        """Test MCP-related packages"""
        mcp_packages = [
            'mcp',
            'fastmcp'
        ]
        
        for package in mcp_packages:
            with self.subTest(package=package):
                try:
                    module = importlib.import_module(package)
                    self.assertIsNotNone(module)
                    print(f"✓ {package} available")
                    
                    if hasattr(module, '__version__'):
                        print(f"  Version: {module.__version__}")
                        
                except ImportError as e:
                    print(f"⚠ MCP package '{package}' not available: {e}")
                    print("  MCP functionality may be limited")
    
    def test_langchain_packages(self):
        """Test LangChain packages"""
        langchain_packages = [
            'langchain',
            'langchain_core',
            'langchain_openai'
        ]
        
        available_count = 0
        
        for package in langchain_packages:
            try:
                module = importlib.import_module(package)
                available_count += 1
                print(f"✓ {package} available")
                
                if hasattr(module, '__version__'):
                    print(f"  Version: {module.__version__}")
                    
            except ImportError:
                print(f"⚠ {package} not available")
        
        if available_count == 0:
            print("⚠ No LangChain packages found - AI agent functionality will be limited")
    
    def test_data_science_stack(self):
        """Test data science package versions and compatibility"""
        try:
            import pandas as pd
            import numpy as np
            
            # Test basic functionality
            df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
            self.assertEqual(len(df), 3)
            
            arr = np.array([1, 2, 3])
            self.assertEqual(len(arr), 3)
            
            # Test pandas-numpy integration
            result = df['A'].values
            self.assertIsInstance(result, np.ndarray)
            
            print("✓ Pandas-NumPy integration working")
            
        except Exception as e:
            self.fail(f"Data science stack test failed: {e}")
    
    def test_fastapi_functionality(self):
        """Test FastAPI basic functionality"""
        try:
            from fastapi import FastAPI
            from fastapi.responses import JSONResponse
            
            app = FastAPI()
            
            @app.get("/test")
            def test_endpoint():
                return {"message": "test"}
            
            # Test that we can create the app
            self.assertIsNotNone(app)
            print("✓ FastAPI basic functionality working")
            
        except Exception as e:
            self.fail(f"FastAPI functionality test failed: {e}")
    
    def test_json_serialization(self):
        """Test JSON serialization with numpy types"""
        try:
            import json
            import pandas as pd
            import numpy as np
            
            # Test data with various types
            test_data = {
                "int": int(42),
                "float": float(3.14),
                "numpy_int": np.int64(42),
                "numpy_float": np.float64(3.14),
                "list": [1, 2, 3],
                "string": "test"
            }
            
            # This should work with proper conversion
            json_str = json.dumps({
                "int": int(test_data["int"]),
                "float": float(test_data["float"]),
                "numpy_int": int(test_data["numpy_int"]),
                "numpy_float": float(test_data["numpy_float"]),
                "list": test_data["list"],
                "string": test_data["string"]
            })
            
            self.assertIsInstance(json_str, str)
            print("✓ JSON serialization with type conversion working")
            
        except Exception as e:
            self.fail(f"JSON serialization test failed: {e}")
    
    def test_file_operations(self):
        """Test file I/O operations"""
        import tempfile
        import os
        
        try:
            # Test CSV operations
            import pandas as pd
            
            df = pd.DataFrame({'A': [1, 2, 3], 'B': ['x', 'y', 'z']})
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
                df.to_csv(f.name, index=False)
                temp_file = f.name
            
            # Read back
            df_read = pd.read_csv(temp_file)
            self.assertEqual(len(df_read), 3)
            
            # Clean up
            os.unlink(temp_file)
            
            print("✓ File I/O operations working")
            
        except Exception as e:
            self.fail(f"File operations test failed: {e}")
    
    def test_environment_variables(self):
        """Test environment variable access"""
        import os
        
        # Test that we can access environment variables
        path = os.environ.get('PATH')
        self.assertIsNotNone(path)
        
        # Test setting and getting custom variables
        test_var = 'KIRO_TEST_VAR'
        test_value = 'test_value_123'
        
        os.environ[test_var] = test_value
        retrieved_value = os.environ.get(test_var)
        
        self.assertEqual(retrieved_value, test_value)
        
        # Clean up
        if test_var in os.environ:
            del os.environ[test_var]
        
        print("✓ Environment variable operations working")
    
    def test_system_info(self):
        """Display system information"""
        import platform
        import os
        
        print(f"\nSystem Information:")
        print(f"Platform: {platform.platform()}")
        print(f"Python: {platform.python_version()}")
        print(f"Architecture: {platform.architecture()}")
        print(f"Processor: {platform.processor()}")
        print(f"Working Directory: {os.getcwd()}")
        
        # This test always passes, it's just for information
        self.assertTrue(True)

if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)