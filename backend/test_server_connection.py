#!/usr/bin/env python3
"""
Simple test to verify backend server is running and endpoints are accessible
"""

import requests
import json
from pathlib import Path

API_BASE = "http://localhost:8000"

def test_server_health():
    """Test basic server health"""
    print("🏥 Testing server health...")
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is healthy")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - is it running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_cors_headers():
    """Test CORS headers"""
    print("\n🌐 Testing CORS headers...")
    try:
        response = requests.options(f"{API_BASE}/api/health", 
                                  headers={'Origin': 'http://localhost:3000'})
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print("CORS Headers:")
        for header, value in cors_headers.items():
            print(f"  {header}: {value or 'Not set'}")
        
        return True
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def test_visualization_endpoints():
    """Test visualization endpoints without dataset"""
    print("\n📊 Testing visualization endpoints...")
    
    # Test options endpoint (should work without dataset)
    try:
        response = requests.get(f"{API_BASE}/api/visualization/options")
        print(f"Visualization options: {response.status_code}")
        if response.status_code == 404:
            print("  ℹ️  No dataset loaded (expected)")
        elif response.status_code == 200:
            print("  ✅ Options endpoint working")
        else:
            print(f"  ❌ Unexpected status: {response.text}")
    except Exception as e:
        print(f"  ❌ Options endpoint error: {e}")

def test_dataset_endpoints():
    """Test dataset-related endpoints"""
    print("\n📁 Testing dataset endpoints...")
    
    # Test dataset info
    try:
        response = requests.get(f"{API_BASE}/api/dataset/info")
        print(f"Dataset info: {response.status_code}")
        if response.status_code == 404:
            print("  ℹ️  No dataset loaded (expected)")
        elif response.status_code == 200:
            data = response.json()
            print(f"  ✅ Dataset loaded: {data.get('shape', 'Unknown shape')}")
        else:
            print(f"  ❌ Unexpected status: {response.text}")
    except Exception as e:
        print(f"  ❌ Dataset info error: {e}")

def test_capabilities():
    """Test capabilities endpoint"""
    print("\n🔧 Testing capabilities...")
    try:
        response = requests.get(f"{API_BASE}/api/capabilities")
        if response.status_code == 200:
            caps = response.json()
            print("✅ Capabilities loaded:")
            print(f"  Visualization types: {caps.get('capabilities', {}).get('visualization_types', [])}")
            print(f"  Endpoints: {len(caps.get('endpoints', {}))}")
        else:
            print(f"❌ Capabilities failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Capabilities error: {e}")

def main():
    print("🧪 Backend Server Connection Test")
    print("=" * 50)
    
    # Test server health first
    if not test_server_health():
        print("\n💡 To start the server:")
        print("   cd backend")
        print("   python start_server.py")
        return
    
    # Run other tests
    test_cors_headers()
    test_capabilities()
    test_dataset_endpoints()
    test_visualization_endpoints()
    
    print("\n✅ Connection tests completed!")
    print("\n💡 If frontend is still having issues:")
    print("   1. Check that frontend is running on http://localhost:3000")
    print("   2. Verify CORS settings in backend")
    print("   3. Check browser console for detailed error messages")

if __name__ == "__main__":
    main()