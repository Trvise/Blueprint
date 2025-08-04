#!/usr/bin/env python3
"""
Test script to verify Google Cloud setup for AI Video Breakdown
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend.env')

def test_environment():
    """Test if environment variables are set correctly"""
    print("🔍 Testing Environment Variables...")
    
    required_vars = [
        'GOOGLE_CLOUD_PROJECT_ID',
        'GOOGLE_CLOUD_STORAGE_BUCKET',
        'GOOGLE_VERTEX_AI_LOCATION',
        'GOOGLE_APPLICATION_CREDENTIALS'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n❌ Missing environment variables: {missing_vars}")
        return False
    
    print("✅ All environment variables are set!")
    return True

def test_service_account():
    """Test if service account key file exists"""
    print("\n🔍 Testing Service Account...")
    
    key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if not key_path:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS not set")
        return False
    
    if os.path.exists(key_path):
        print(f"✅ Service account key file exists: {key_path}")
        return True
    else:
        print(f"❌ Service account key file not found: {key_path}")
        return False

def test_ffmpeg():
    """Test if FFmpeg is installed"""
    print("\n🔍 Testing FFmpeg...")
    
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ FFmpeg is installed and working")
            return True
        else:
            print("❌ FFmpeg command failed")
            return False
    except FileNotFoundError:
        print("❌ FFmpeg not found in PATH")
        return False

def test_google_cloud_apis():
    """Test Google Cloud API access"""
    print("\n🔍 Testing Google Cloud APIs...")
    
    try:
        from google.cloud import storage
        from google.cloud import speech
        from google.cloud import aiplatform
        
        print("✅ Google Cloud libraries imported successfully")
        
        # Test storage access
        try:
            storage_client = storage.Client()
            bucket_name = os.getenv('GOOGLE_CLOUD_STORAGE_BUCKET')
            bucket = storage_client.bucket(bucket_name)
            print(f"✅ Storage access working for bucket: {bucket_name}")
        except Exception as e:
            print(f"❌ Storage access failed: {e}")
            return False
        
        # Test Vertex AI access
        try:
            project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
            location = os.getenv('GOOGLE_VERTEX_AI_LOCATION')
            aiplatform.init(project=project_id, location=location)
            print(f"✅ Vertex AI access working for project: {project_id}")
        except Exception as e:
            print(f"❌ Vertex AI access failed: {e}")
            return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Google Cloud libraries not installed: {e}")
        print("Install with: pip install google-cloud-storage google-cloud-speech google-cloud-aiplatform")
        return False
    except Exception as e:
        print(f"❌ Google Cloud API test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing AI Video Breakdown Setup\n")
    
    tests = [
        test_environment,
        test_service_account,
        test_ffmpeg,
        test_google_cloud_apis
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready for AI video breakdown.")
        print("\nNext steps:")
        print("1. Install Python dependencies: pip install -r backend_requirements.txt")
        print("2. Run the backend: python backend_implementation_example.py")
        print("3. Test the frontend AI breakdown functionality")
    else:
        print("❌ Some tests failed. Please fix the issues above before proceeding.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 