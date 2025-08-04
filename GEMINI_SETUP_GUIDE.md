# Gemini AI Setup Guide

## Current Issue
The backend is currently using a fallback analysis system because the project doesn't have access to Gemini AI models. This is working fine for basic functionality, but for better AI-powered analysis, you'll need to enable Gemini access.

## Option 1: Enable Gemini AI (Recommended)

### Step 1: Enable Required APIs
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `vortexlens`
3. Enable these APIs:
   - Vertex AI API
   - Generative AI API
   - Cloud Storage API
   - Speech-to-Text API

### Step 2: Configure Model Access
1. Go to Vertex AI in the Google Cloud Console
2. Navigate to "Model Garden"
3. Search for "Gemini" models
4. Enable access to the models you want to use:
   - `gemini-1.5-pro`
   - `gemini-1.5-flash`
   - `gemini-pro`

### Step 3: Update Service Account Permissions
1. Go to IAM & Admin > Service Accounts
2. Find your service account (the one used in `service-account-key.json`)
3. Add these roles:
   - Vertex AI User
   - Vertex AI Service Agent
   - Generative AI User

### Step 4: Test Access
Run the test script to verify access:
```bash
python test_vertex_ai_access.py
```

## Option 2: Use Alternative AI Services

If you can't enable Gemini, consider these alternatives:

### OpenAI GPT (Requires API Key)
```python
import openai

# Add to backend_implementation_example.py
def analyze_with_openai(transcript, video_metadata, project_context):
    # Implementation using OpenAI API
    pass
```

### Local AI Models
```python
# Use local models like Llama or Mistral
def analyze_with_local_model(transcript, video_metadata, project_context):
    # Implementation using local AI models
    pass
```

## Option 3: Continue with Fallback Analysis

The current fallback analysis system is working and provides:
- ✅ Step extraction from transcripts
- ✅ Material and tool detection
- ✅ Context-aware cautions and questions
- ✅ Project-specific recommendations

This is sufficient for basic functionality while you work on enabling Gemini access.

## Testing the Current System

The backend will automatically fall back to the rule-based analysis when Gemini is not available. To test:

1. Start the backend:
```bash
python backend_implementation_example.py
```

2. Test with the provided test script:
```bash
python test_backend.py
```

## Current Status

✅ **Working Features:**
- Audio extraction from videos
- Speech-to-text transcription
- Fallback analysis with context-aware results
- Health check endpoint

❌ **Missing Features:**
- Advanced AI-powered analysis (requires Gemini access)
- More sophisticated step extraction
- Better material/tool detection

The system is functional and will improve significantly once Gemini access is enabled. 