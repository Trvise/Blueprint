#!/usr/bin/env python3
"""
Test script to verify the backend works with cost tracking
"""

import requests
import json

# Test data
test_transcript = "Epigenetics is a rapidly growing field with even work being done to reverse aging. So very soon aging may just as well become a thing of the past. Thank you for watching."

test_video_metadata = {
    "filename": "test_video.mp4",
    "duration": 30,
    "size": 1000000
}

test_project_context = {
    "project_name": "Epigenetics Research",
    "project_description": "Study of epigenetic changes and aging reversal",
    "tags": ["Science", "Health", "Research"]
}

def test_analyze_transcript():
    """Test the analyze-transcript endpoint"""
    
    url = "http://localhost:8000/analyze-transcript"
    
    payload = {
        "transcript": test_transcript,
        "video_metadata": test_video_metadata,
        "project_context": test_project_context
    }
    
    print(f"🧪 Testing analyze-transcript endpoint...")
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Analysis successful!")
            
            # Display cost information prominently
            costs = result.get('costs', {})
            if costs:
                print(f"\n💰 COST BREAKDOWN:")
                print(f"=" * 50)
                
                estimated = costs.get('estimated', {})
                print(f"📊 ESTIMATED COSTS:")
                for service, cost in estimated.items():
                    print(f"   {service}: ${cost:.4f}")
                
                print(f"\n📈 ACTUAL COSTS:")
                actual = costs.get('actual', {})
                for service, cost in actual.items():
                    print(f"   {service}: ${cost:.4f}")
                
                print(f"=" * 50)
            else:
                print(f"❌ No cost information found in response")
            
            # Show analysis results
            print(f"\n📋 ANALYSIS RESULTS:")
            print(f"   Steps: {len(result.get('steps', []))}")
            print(f"   Materials: {len(result.get('materials', []))}")
            print(f"   Tools: {len(result.get('tools', []))}")
            print(f"   Cautions: {len(result.get('cautions', []))}")
            print(f"   Questions: {len(result.get('questions', []))}")
                
        else:
            print(f"❌ Analysis failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_health_check():
    """Test the health check endpoint"""
    
    url = "http://localhost:8000/health"
    
    print(f"🧪 Testing health check endpoint...")
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health check successful: {result}")
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check request failed: {e}")

if __name__ == "__main__":
    test_health_check()
    test_analyze_transcript() 