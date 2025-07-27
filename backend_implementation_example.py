"""
Backend Implementation Example for Google Cloud Video Breakdown System
This is a FastAPI example showing how to implement the required endpoints.
"""

import os
import tempfile
import subprocess
from typing import List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.cloud.speech as speech
import google.cloud.storage as storage
import google.cloud.aiplatform as aiplatform
from google.cloud import aiplatform_v1
import json
import uuid

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Cloud configuration
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
GOOGLE_CLOUD_STORAGE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET")
GOOGLE_VERTEX_AI_LOCATION = os.getenv("GOOGLE_VERTEX_AI_LOCATION", "us-central1")

# Initialize Google Cloud clients
storage_client = storage.Client(project=GOOGLE_CLOUD_PROJECT_ID)
bucket = storage_client.bucket(GOOGLE_CLOUD_STORAGE_BUCKET)

# Initialize Vertex AI
aiplatform.init(project=GOOGLE_CLOUD_PROJECT_ID, location=GOOGLE_VERTEX_AI_LOCATION)

class TranscriptionRequest(BaseModel):
    audio_url: str
    language_code: str = "en-US"

class AnalysisRequest(BaseModel):
    transcript: str
    video_metadata: Dict[str, Any]
    project_context: Dict[str, Any]

@app.post("/extract-audio")
async def extract_audio(video: UploadFile = File(...)):
    """
    Extract audio from uploaded video file using FFmpeg
    """
    try:
        # Create temporary file for video
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{video.filename.split('.')[-1]}") as temp_video:
            content = await video.read()
            temp_video.write(content)
            temp_video_path = temp_video.name

        # Create temporary file for audio output
        audio_filename = f"audio_{uuid.uuid4()}.wav"
        temp_audio_path = tempfile.mktemp(suffix=".wav")

        # Extract audio using FFmpeg
        cmd = [
            "ffmpeg", "-i", temp_video_path,
            "-vn",  # No video
            "-acodec", "pcm_s16le",  # PCM 16-bit
            "-ar", "16000",  # 16kHz sample rate
            "-ac", "1",  # Mono
            "-y",  # Overwrite output file
            temp_audio_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {result.stderr}")

        # Upload audio to Google Cloud Storage
        blob_name = f"audio_extracts/{audio_filename}"
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(temp_audio_path)

        # Clean up temporary files
        os.unlink(temp_video_path)
        os.unlink(temp_audio_path)

        return {
            "audio_url": f"gs://{GOOGLE_CLOUD_STORAGE_BUCKET}/{blob_name}",
            "filename": audio_filename
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio extraction failed: {str(e)}")

@app.post("/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio using Google Speech-to-Text API
    """
    try:
        # Initialize Speech-to-Text client
        client = speech.SpeechClient()

        # Get audio from GCS
        audio = speech.RecognitionAudio(uri=request.audio_url)

        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=request.language_code,
            enable_word_time_offsets=True,
            enable_automatic_punctuation=True,
            model="video",  # Optimized for video content
        )

        # Perform transcription
        operation = client.long_running_recognize(config=config, audio=audio)
        response = operation.result()

        # Extract transcript and timestamps
        transcript = ""
        timestamps = []
        
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
            
            for word_info in result.alternatives[0].words:
                timestamps.append({
                    "word": word_info.word,
                    "start_time": word_info.start_time.total_seconds(),
                    "end_time": word_info.end_time.total_seconds()
                })

        return {
            "transcript": transcript.strip(),
            "timestamps": timestamps,
            "confidence": response.results[0].alternatives[0].confidence if response.results else 0.0
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/analyze-transcript")
async def analyze_transcript(request: AnalysisRequest):
    """
    Analyze transcript using Google Gemini AI to extract steps, materials, tools, etc.
    """
    try:
        # Prepare prompt for Gemini AI
        prompt = f"""
        Analyze this instructional video transcript and extract structured information for a step-by-step guide.

        Project Context:
        - Name: {request.project_context.get('project_name', 'Unknown')}
        - Description: {request.project_context.get('project_description', '')}
        - Tags: {', '.join(request.project_context.get('tags', []))}

        Video Metadata:
        - Filename: {request.video_metadata.get('filename', 'Unknown')}
        - Duration: {request.video_metadata.get('duration', 0)} seconds

        Transcript:
        {request.transcript}

        Please extract and return the following information in JSON format:

        1. Steps: Array of step objects with:
           - name: Clear, concise step name
           - description: Detailed description of what to do
           - estimated_duration: Estimated time in seconds
           - difficulty_level: "Beginner", "Intermediate", or "Advanced"

        2. Materials: Array of material objects with:
           - name: Material name
           - quantity: Required amount
           - specification: Any specific requirements

        3. Tools: Array of tool objects with:
           - name: Tool name
           - specification: Any specific requirements
           - safety_notes: Safety considerations

        4. Cautions: Array of safety warnings and important notes

        5. Questions: Array of validation questions to test understanding

        Return only valid JSON without any additional text.
        """

        # Use Vertex AI Gemini model
        model = aiplatform.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        
        # Parse the response
        try:
            analysis_result = json.loads(response.text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                analysis_result = json.loads(json_match.group())
            else:
                raise ValueError("Failed to parse AI response as JSON")

        # Validate and structure the response
        structured_result = {
            "steps": analysis_result.get("steps", []),
            "materials": analysis_result.get("materials", []),
            "tools": analysis_result.get("tools", []),
            "cautions": analysis_result.get("cautions", []),
            "questions": analysis_result.get("questions", []),
        }

        return structured_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "video-breakdown-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 