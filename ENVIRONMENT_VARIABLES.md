# Environment Variables for VortexHub

This document lists all the required environment variables for the VortexHub application, including the new Google Cloud video breakdown system.

## Firebase Configuration
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Backend API Configuration
```env
REACT_APP_API_URL=http://localhost:8000
# or for production:
# REACT_APP_API_URL=https://your-backend-domain.com
```

## Google Cloud Configuration (NEW - Required for AI Video Breakdown)

### Google Cloud Project Setup
1. Create a Google Cloud Project
2. Enable the following APIs:
   - Speech-to-Text API
   - Vertex AI API (for Gemini)
   - Cloud Storage API
   - Cloud Functions API (if using Cloud Functions)

### Required Environment Variables for Backend
```env
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id

# Google Cloud Service Account Key (JSON file path or content)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
# OR for environment variable:
GOOGLE_CLOUD_CREDENTIALS_JSON={"type": "service_account", ...}

# Google Cloud Storage Bucket for temporary files
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket-name

# Google Speech-to-Text API Configuration
GOOGLE_SPEECH_TO_TEXT_API_KEY=your_speech_to_text_api_key
# OR use service account (recommended)

# Google Gemini AI Configuration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
# OR use Vertex AI (recommended for production)

# Optional: Vertex AI Configuration (if using Vertex AI instead of direct API)
GOOGLE_VERTEX_AI_LOCATION=us-central1
GOOGLE_VERTEX_AI_PROJECT_ID=your_google_cloud_project_id
```

## Backend API Endpoints Required

The backend needs to implement these new endpoints:

### 1. Audio Extraction Endpoint
```
POST /extract-audio
Content-Type: multipart/form-data
Body: video file
Response: { "audio_url": "gs://bucket/audio.wav" }
```

### 2. Transcription Endpoint
```
POST /transcribe
Content-Type: application/json
Body: {
  "audio_url": "gs://bucket/audio.wav",
  "language_code": "en-US"
}
Response: {
  "transcript": "full transcript text",
  "timestamps": [...]
}
```

### 3. AI Analysis Endpoint
```
POST /analyze-transcript
Content-Type: application/json
Body: {
  "transcript": "transcript text",
  "video_metadata": {...},
  "project_context": {...}
}
Response: {
  "steps": [...],
  "materials": [...],
  "tools": [...],
  "cautions": [...],
  "questions": [...]
}
```

## Cost Optimization Recommendations

### Google Speech-to-Text API
- **Standard Model**: $0.006 per 15 seconds (most cost-effective)
- **Enhanced Model**: $0.009 per 15 seconds (better accuracy)
- **Video Model**: $0.006 per 15 seconds (optimized for video)

### Google Gemini AI
- **Gemini Pro**: $0.0005 per 1K characters input, $0.0015 per 1K characters output
- **Gemini Pro Vision**: $0.0025 per 1K characters input, $0.0075 per 1K characters output

### Cost Estimation Example
For a 10-minute video:
- Audio extraction: ~$0.24 (Speech-to-Text)
- AI analysis: ~$0.05-0.15 (Gemini Pro)
- **Total per video**: ~$0.30-0.40

## Security Considerations

1. **Service Account**: Use a service account with minimal required permissions
2. **API Keys**: Store API keys securely, never commit to version control
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **File Validation**: Validate uploaded video files for security

## Setup Instructions

1. **Google Cloud Console**:
   - Create a new project or use existing
   - Enable required APIs
   - Create a service account with appropriate permissions
   - Download the service account key JSON file

2. **Environment Variables**:
   - Copy the example variables above
   - Replace placeholder values with your actual credentials
   - Add to your `.env` file (frontend) and backend environment

3. **Backend Implementation**:
   - Implement the three new API endpoints
   - Use Google Cloud client libraries
   - Handle file uploads and processing
   - Implement proper error handling

4. **Testing**:
   - Test with small video files first
   - Monitor API usage and costs
   - Verify transcription accuracy
   - Test AI analysis quality

## Troubleshooting

### Common Issues:
1. **CORS errors**: Check backend CORS configuration
2. **Authentication errors**: Verify service account credentials
3. **API quota exceeded**: Check Google Cloud quotas and billing
4. **File upload failures**: Verify file size limits and formats
5. **Transcription failures**: Check audio quality and format

### Debug Steps:
1. Check browser console for frontend errors
2. Check backend logs for API errors
3. Verify environment variables are loaded correctly
4. Test API endpoints individually
5. Monitor Google Cloud Console for API usage 