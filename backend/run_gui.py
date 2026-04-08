#!/usr/bin/env python3
"""
GUI Runner for Economic Analysis System
Provides options to run either the Streamlit GUI or start the backend API
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Check if required packages are installed"""
    try:
        import streamlit
        import fastapi
        import pandas
        import plotly
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("💡 Please run: pip install -r requirements.txt")
        return False

def run_streamlit_gui():
    """Run the Streamlit GUI application"""
    print("🚀 Starting Streamlit GUI...")
    print("📱 The GUI will open in your default web browser")
    print("🌐 URL: http://localhost:8501")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "streamlit_app.py",
            "--server.port", "8501",
            "--server.address", "0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Streamlit GUI stopped by user")
    except Exception as e:
        print(f"\n❌ Failed to start Streamlit GUI: {e}")

def run_backend_api():
    """Run the FastAPI backend server"""
    print("🚀 Starting FastAPI Backend...")
    print("📡 API will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    try:
        subprocess.run([sys.executable, "backend_api.py"])
    except KeyboardInterrupt:
        print("\n🛑 Backend API stopped by user")
    except Exception as e:
        print(f"\n❌ Failed to start Backend API: {e}")

def run_both():
    """Run both GUI and API (requires multiple terminals)"""
    print("🚀 Starting Both GUI and API...")
    print()
    print("This will start both services:")
    print("📱 Streamlit GUI: http://localhost:8501")
    print("📡 Backend API: http://localhost:8000")
    print()
    print("⚠️  Note: This requires running in separate terminals")
    print("💡 Recommended: Use separate terminal windows for each service")
    print()
    
    choice = input("Continue? (y/n): ").lower().strip()
    if choice == 'y':
        print("Starting Backend API first...")
        try:
            # Start backend in background
            api_process = subprocess.Popen([sys.executable, "backend_api.py"])
            
            # Wait a moment for API to start
            import time
            time.sleep(3)
            
            print("Starting Streamlit GUI...")
            # Start Streamlit
            subprocess.run([
                sys.executable, "-m", "streamlit", "run", "streamlit_app.py",
                "--server.port", "8501",
                "--server.address", "0.0.0.0"
            ])
            
        except KeyboardInterrupt:
            print("\n🛑 Services stopped by user")
            if 'api_process' in locals():
                api_process.terminate()
        except Exception as e:
            print(f"\n❌ Failed to start services: {e}")
            if 'api_process' in locals():
                api_process.terminate()

def main():
    """Main function"""
    print("🎯 Economic Analysis System - GUI Runner")
    print("=" * 60)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    print("\nChoose how to run the system:")
    print("1. 📱 Streamlit GUI (Web Interface)")
    print("2. 📡 Backend API (REST API Server)")
    print("3. 🔄 Both GUI and API")
    print("4. ❌ Exit")
    
    while True:
        try:
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == "1":
                run_streamlit_gui()
                break
            elif choice == "2":
                run_backend_api()
                break
            elif choice == "3":
                run_both()
                break
            elif choice == "4":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
        
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()