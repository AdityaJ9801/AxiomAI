#!/usr/bin/env python3
"""
Environment Check Script
Helps diagnose what packages are missing and provides installation guidance
"""

import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"🐍 Python Version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version is compatible")
        return True
    else:
        print("❌ Python 3.8+ required")
        return False

def check_virtual_environment():
    """Check if running in virtual environment"""
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    
    if in_venv:
        print("✅ Running in virtual environment")
        print(f"   Environment path: {sys.prefix}")
    else:
        print("⚠️  Not in virtual environment")
        print("   Consider using: python -m venv venv && venv\\Scripts\\activate")
    
    return in_venv

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError:
        print(f"❌ {package_name} (missing)")
        return False

def check_requirements():
    """Check all required packages"""
    print("\n📦 Package Status:")
    
    # Core packages
    core_packages = [
        ("pandas", "pandas"),
        ("numpy", "numpy"),
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("streamlit", "streamlit"),
        ("plotly", "plotly"),
        ("python-docx", "docx"),
        ("reportlab", "reportlab"),
        ("rich", "rich"),
        ("python-dotenv", "dotenv"),
    ]
    
    # MCP packages (optional but needed for full functionality)
    mcp_packages = [
        ("mcp", "mcp"),
        ("fastmcp", "fastmcp"),
        ("langchain", "langchain"),
        ("langchain-openai", "langchain_openai"),
        ("langgraph", "langgraph"),
    ]
    
    missing_core = []
    missing_mcp = []
    
    print("\n🔧 Core Packages:")
    for package, import_name in core_packages:
        if not check_package(package, import_name):
            missing_core.append(package)
    
    print("\n🤖 MCP/AI Packages:")
    for package, import_name in mcp_packages:
        if not check_package(package, import_name):
            missing_mcp.append(package)
    
    return missing_core, missing_mcp

def generate_installation_commands(missing_core, missing_mcp):
    """Generate installation commands"""
    print("\n💡 Installation Commands:")
    
    if missing_core:
        print("\n🔧 Core packages (required for basic functionality):")
        core_cmd = f"pip install {' '.join(missing_core)}"
        print(f"   {core_cmd}")
    
    if missing_mcp:
        print("\n🤖 MCP/AI packages (required for full agent functionality):")
        mcp_cmd = f"pip install {' '.join(missing_mcp)}"
        print(f"   {mcp_cmd}")
    
    if missing_core or missing_mcp:
        print("\n📋 Or install everything from requirements.txt:")
        print("   pip install -r requirements.txt")
    else:
        print("✅ All packages are installed!")

def check_project_structure():
    """Check if project structure is correct"""
    print("\n📁 Project Structure:")
    
    required_files = [
        "requirements.txt",
        "backend_api.py",
        "streamlit_app.py",
        "agent.py",
        "simple_agent.py",
        "mcp_tools/",
        "sample_datasets/",
    ]
    
    missing_files = []
    
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} (missing)")
            missing_files.append(file_path)
    
    return missing_files

def main():
    """Main diagnostic function"""
    print("🔍 Economic Analysis Project - Environment Check")
    print("=" * 60)
    
    # Check Python version
    python_ok = check_python_version()
    
    # Check virtual environment
    venv_ok = check_virtual_environment()
    
    # Check packages
    missing_core, missing_mcp = check_requirements()
    
    # Check project structure
    missing_files = check_project_structure()
    
    # Generate recommendations
    print("\n📊 Summary & Recommendations:")
    print("=" * 60)
    
    if not python_ok:
        print("❌ Python version issue - Update to Python 3.8+")
    
    if not venv_ok:
        print("⚠️  Consider using virtual environment for isolation")
    
    if missing_core:
        print("❌ Core packages missing - Install for basic functionality")
    
    if missing_mcp:
        print("⚠️  MCP packages missing - Install for full agent features")
    
    if missing_files:
        print("⚠️  Some project files missing - Check project integrity")
    
    # Generate installation commands
    generate_installation_commands(missing_core, missing_mcp)
    
    # Usage recommendations
    print("\n🚀 Usage Recommendations:")
    print("=" * 60)
    
    if not missing_core:
        print("✅ You can run:")
        print("   • Backend API: python backend_api.py")
        print("   • Streamlit GUI: streamlit run streamlit_app.py")
        print("   • Simple Agent: python simple_agent.py")
    
    if not missing_mcp:
        print("✅ You can run:")
        print("   • Full Agent: python agent.py")
        print("   • MCP Server Tests: python test_mcp_servers.py")
    
    if missing_core or missing_mcp:
        print("\n💡 Next Steps:")
        print("1. Activate your virtual environment (if using one)")
        print("2. Install missing packages using the commands above")
        print("3. Run this check again to verify installation")
        print("4. Start with the backend API or Streamlit GUI")

if __name__ == "__main__":
    main()