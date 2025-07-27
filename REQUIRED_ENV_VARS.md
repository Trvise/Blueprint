# Required Environment Variables for AI Video Breakdown System

## Frontend (.env file)

```env
# Existing Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend API URL (NEW)
REACT_APP_API_URL=http://localhost:8000
# or for production: https://your-backend-domain.com
```

## Backend (.env file)

```env
# Google Cloud Configuration (NEW)
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket-name
GOOGLE_VERTEX_AI_LOCATION=us-central1

# Google Cloud Authentication (NEW)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
# OR use environment variable:
# GOOGLE_CLOUD_CREDENTIALS_JSON={"type": "service_account", ...}

# Backend Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

## Quick Setup Checklist

### 1. Google Cloud Project Setup
- [ ] Create Google Cloud Project
- [ ] Enable APIs: Speech-to-Text, Vertex AI, Cloud Storage
- [ ] Create service account with appropriate permissions
- [ ] Download service account key JSON file

### 2. Environment Variables
- [ ] Add frontend variables to `.env` file
- [ ] Add backend variables to backend `.env` file
- [ ] Verify all paths and URLs are correct

### 3. Backend Setup
- [ ] Install Python dependencies: `pip install -r backend_requirements.txt`
- [ ] Install FFmpeg
- [ ] Test backend endpoints

### 4. Frontend Setup
- [ ] Verify `REACT_APP_API_URL` points to your backend
- [ ] Test AI video breakdown functionality

## Cost Estimation

**Per 10-minute video:**
- Speech-to-Text: ~$0.24
- Gemini AI Analysis: ~$0.05-0.15
- Storage: ~$0.0002
- **Total: ~$0.30-0.40 per video**

## Security Notes

- Never commit `.env` files to version control
- Use service accounts with minimal required permissions
- Implement proper CORS configuration
- Validate uploaded files
- Monitor API usage and costs 