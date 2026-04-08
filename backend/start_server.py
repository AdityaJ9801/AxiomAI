#!/usr/bin/env python3
"""
Economic Analysis Backend API Server Startup Script
"""

import os
import sys
import uvicorn
from pathlib import Path

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import pandas
        import numpy
        import sklearn
        import plotly
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("💡 Please run: pip install -r requirements.txt")
        return False

def setup_environment():
    """Set up environment variables if .env file exists"""
    env_file = Path(".env")
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Environment variables loaded from .env")
    else:
        print("ℹ️  No .env file found, using default settings")

def create_directories():
    """Create necessary directories"""
    directories = ["logs", "uploads", "exports", "temp"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✅ Required directories created")

def main():
    """Main startup function"""
    print("🚀 Starting Economic Analysis Backend API Server")
    print("=" * 60)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Create directories
    create_directories()
    
    # Get configuration
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    workers = int(os.getenv("WORKERS", "1"))
    
    print(f"📡 Server configuration:")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print(f"   Workers: {workers}")
    print()
    
    print(f"🌐 Server will be available at:")
    print(f"   API: http://{host}:{port}")
    print(f"   Docs: http://{host}:{port}/docs")
    print(f"   Health: http://{host}:{port}/api/health")
    print()
    
    try:
        # Start the server
        if debug:
            # Development mode with auto-reload
            uvicorn.run(
                "backend_api:app",
                host=host,
                port=port,
                reload=True,
                log_level="info"
            )
        else:
            # Production mode
            uvicorn.run(
                "backend_api:app",
                host=host,
                port=port,
                workers=workers,
                log_level="info"
            )
    
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()