# AI Video Breakdown System - Implementation Guide

## Overview

This implementation adds AI-powered video breakdown functionality to the VortexHub application using Google Cloud services. The system automatically extracts audio from uploaded videos, transcribes the content using Google Speech-to-Text, and analyzes the transcript using Google Gemini AI to generate structured step-by-step instructions.

## Features

- **Automatic Audio Extraction**: Uses FFmpeg to extract high-quality audio from video files
- **Speech-to-Text Transcription**: Leverages Google Speech-to-Text API for accurate transcription
- **AI-Powered Analysis**: Uses Google Gemini Pro to extract:
  - Step-by-step instructions
  - Required materials and quantities
  - Tools and equipment needed
  - Safety cautions and warnings
  - Validation questions for learning
- **Progress Tracking**: Real-time progress updates during processing
- **Cost Optimization**: Uses the most cost-effective Google Cloud services

## Architecture

```
[User Uploads Video] → [Frontend] → [Backend API] → [Google Cloud Services]
                                                      ↓
[Audio Extraction (FFmpeg)] → [Speech-to-Text] → [Gemini AI Analysis] → [Structured Output]
```

## Frontend Implementation

### New Components Added

1. **AI Video Analysis Section** (`CreateProject.js`)
   - New button: "Analyze with AI"
   - Progress indicator during processing
   - Results display showing detected steps, materials, and tools
   - Integration with existing project creation flow

2. **Google Cloud API Service** (`src/services/googleCloudApi.js`)
   - Centralized service for all Google Cloud API calls
   - Error handling and retry logic
   - Progress callback support

### Key Features

- **Conditional Submission**: Form automatically uses AI data when available
- **Progress Feedback**: Real-time updates during AI processing
- **Error Handling**: Comprehensive error messages and recovery
- **Data Integration**: AI results seamlessly integrated into project creation

## Backend Implementation

### Required API Endpoints

1. **POST /extract-audio**
   - Accepts video file upload
   - Extracts audio using FFmpeg
   - Uploads audio to Google Cloud Storage
   - Returns GCS audio URL

2. **POST /transcribe**
   - Accepts GCS audio URL
   - Uses Google Speech-to-Text API
   - Returns transcript with timestamps
   - Supports multiple languages

3. **POST /analyze-transcript**
   - Accepts transcript and context
   - Uses Google Gemini Pro for analysis
   - Returns structured step data
   - Includes materials, tools, cautions, and questions

### Technology Stack

- **Framework**: FastAPI (Python)
- **Audio Processing**: FFmpeg
- **Cloud Services**: Google Cloud Platform
- **AI Model**: Google Gemini Pro (via Vertex AI)
- **Storage**: Google Cloud Storage

## Setup Instructions

### 1. Google Cloud Project Setup

1. Create a new Google Cloud Project or use existing
2. Enable required APIs:
   ```bash
   gcloud services enable speech.googleapis.com
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable storage.googleapis.com
   ```
3. Create a service account with appropriate permissions:
   ```bash
   gcloud iam service-accounts create video-breakdown-sa \
     --display-name="Video Breakdown Service Account"
   ```
4. Grant necessary roles:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:video-breakdown-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/speech.client"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:video-breakdown-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:video-breakdown-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.objectViewer"
   ```
5. Download the service account key:
   ```bash
   gcloud iam service-accounts keys create service-account-key.json \
     --iam-account=video-breakdown-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### 2. Environment Variables

Create a `.env` file in your backend directory:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket
GOOGLE_VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Backend Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 3. Backend Installation

1. Install Python dependencies:
   ```bash
   pip install -r backend_requirements.txt
   ```

2. Install FFmpeg (required for audio extraction):
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

3. Run the backend:
   ```bash
   python backend_implementation_example.py
   ```

### 4. Frontend Configuration

Update your frontend `.env` file:

```env
# Existing Firebase config...
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
# ... other Firebase variables

# Backend API URL
REACT_APP_API_URL=http://localhost:8000
```

## Usage

### 1. Upload Videos
- Navigate to the Create Project page
- Upload one or more video files
- Fill in project details (name, description, tags)

### 2. AI Analysis
- Click "Analyze with AI" button
- Wait for processing to complete (progress shown in real-time)
- Review the generated results

### 3. Create Project
- Click "Save with AI Data & Continue"
- Project is created with AI-generated steps
- Continue to annotation page for manual refinement

## Cost Analysis

### Google Cloud Pricing (as of 2024)

**Speech-to-Text API:**
- Standard Model: $0.006 per 15 seconds
- Enhanced Model: $0.009 per 15 seconds
- Video Model: $0.006 per 15 seconds (recommended)

**Gemini Pro (Vertex AI):**
- Input: $0.0005 per 1K characters
- Output: $0.0015 per 1K characters

**Storage:**
- Standard: $0.020 per GB per month
- Audio files are typically small (< 10MB per video)

### Example Cost Calculation

For a 10-minute video:
- Audio extraction: ~$0.24 (Speech-to-Text)
- AI analysis: ~$0.05-0.15 (Gemini Pro)
- Storage: ~$0.0002 (audio file)
- **Total per video**: ~$0.30-0.40

## Best Practices

### 1. Video Quality
- Use clear audio for better transcription
- Avoid background noise
- Speak clearly and at normal pace

### 2. Cost Optimization
- Use the "video" model for Speech-to-Text (optimized for video content)
- Implement caching for repeated transcriptions
- Clean up temporary files regularly

### 3. Error Handling
- Implement retry logic for API failures
- Provide clear error messages to users
- Log errors for debugging

### 4. Security
- Validate uploaded files
- Implement rate limiting
- Use service accounts with minimal permissions
- Secure API keys and credentials

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in PATH
   - Check installation with `ffmpeg -version`

2. **Google Cloud authentication errors**
   - Verify service account key is correct
   - Check API permissions
   - Ensure APIs are enabled

3. **CORS errors**
   - Update CORS configuration in backend
   - Check frontend URL is in allowed origins

4. **Audio extraction failures**
   - Verify video file format is supported
   - Check file size limits
   - Ensure sufficient disk space

### Debug Steps

1. Check backend logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test API endpoints individually using tools like Postman
4. Monitor Google Cloud Console for API usage and errors

## Future Enhancements

1. **Batch Processing**: Process multiple videos simultaneously
2. **Custom Models**: Train custom models for specific domains
3. **Video Analysis**: Add computer vision for visual step detection
4. **Multi-language Support**: Support for multiple languages
5. **Real-time Processing**: Stream processing for live videos
6. **Advanced Analytics**: Detailed usage analytics and insights

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Google Cloud documentation
3. Check application logs for detailed error messages
4. Monitor Google Cloud Console for API usage and quotas 