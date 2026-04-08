#!/usr/bin/env python3
"""
Test script to verify MCP servers can start individually
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def test_mcp_server(server_name, server_path):
    """Test if an MCP server can start properly"""
    print(f"\n🧪 Testing {server_name}...")
    print(f"📁 Path: {server_path}")
    
    if not os.path.exists(server_path):
        print(f"❌ File not found: {server_path}")
        return False
    
    try:
        # Try to run the server for a short time
        process = subprocess.Popen(
            [sys.executable, server_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a short time to see if it starts
        time.sleep(2)
        
        # Check if process is still running
        if process.poll() is None:
            # Process is running, terminate it
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
            
            print(f"✅ {server_name}: Started successfully")
            return True
        else:
            # Process exited, check output
            stdout, stderr = process.communicate()
            
            if process.returncode == 0:
                print(f"✅ {server_name}: Completed successfully")
                return True
            else:
                print(f"❌ {server_name}: Failed to start")
                print(f"   Return code: {process.returncode}")
                if stderr:
                    print(f"   Error: {stderr.strip()}")
                if stdout:
                    print(f"   Output: {stdout.strip()}")
                return False
    
    except Exception as e:
        print(f"❌ {server_name}: Exception occurred - {str(e)}")
        return False

def check_dependencies():
    """Check if required dependencies are available"""
    print("🔍 Checking Dependencies...")
    
    required_packages = [
        ('mcp', 'MCP framework'),
        ('fastmcp', 'FastMCP server'),
        ('pandas', 'Data processing'),
        ('numpy', 'Numerical computing'),
        ('plotly', 'Visualization'),
        ('docx', 'Document generation'),
        ('reportlab', 'PDF generation')
    ]
    
    missing = []
    
    for package, description in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} - {description}")
        except ImportError:
            print(f"❌ {package} - {description} (MISSING)")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("💡 Install with: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies available")
    return True

def main():
    """Main test function"""
    print("🚀 MCP Server Test Suite")
    print("=" * 50)
    
    # Check dependencies first
    if not check_dependencies():
        print("\n❌ Cannot proceed without required dependencies")
        return False
    
    # Define MCP servers to test
    mcp_servers = {
        "EDA Server": "mcp_tools/mcp_eda.py",
        "Data Cleaning Server": "mcp_tools/data_cleaning_mcp.py",
        "Visualization Server": "mcp_tools/visualization_mcp.py",
        "Econometrics Server": "mcp_tools/mcp_gretl.py",
        "Report Server": "mcp_tools/report_mcp.py"
    }
    
    print(f"\n🧪 Testing {len(mcp_servers)} MCP Servers...")
    
    results = {}
    
    for server_name, server_path in mcp_servers.items():
        results[server_name] = test_mcp_server(server_name, server_path)
    
    # Summary
    print(f"\n📋 Test Results Summary")
    print("=" * 50)
    
    working_servers = []
    failed_servers = []
    
    for server_name, success in results.items():
        if success:
            working_servers.append(server_name)
            print(f"✅ {server_name}")
        else:
            failed_servers.append(server_name)
            print(f"❌ {server_name}")
    
    print(f"\n📊 Statistics:")
    print(f"   Working: {len(working_servers)}/{len(mcp_servers)}")
    print(f"   Failed: {len(failed_servers)}/{len(mcp_servers)}")
    
    if failed_servers:
        print(f"\n🔧 Troubleshooting Failed Servers:")
        for server in failed_servers:
            print(f"   • {server}: Check imports and dependencies")
        
        print(f"\n💡 Common Issues:")
        print("   • Missing Python packages (install requirements.txt)")
        print("   • Import errors in MCP server files")
        print("   • File permission issues")
        print("   • Syntax errors in Python files")
    
    if working_servers:
        print(f"\n✅ Working servers can be used in agent.py")
        print("   Update MCP_CONFIG to include only working servers")
    
    return len(failed_servers) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)