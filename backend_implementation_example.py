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
import vertexai
from vertexai.generative_models import GenerativeModel
import google.generativeai as genai
import json
import uuid
from dotenv import load_dotenv
from google.cloud import billing_v1
from datetime import datetime, timedelta, timezone

# Load environment variables
load_dotenv('backend.env')

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Google Cloud configuration
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
GOOGLE_CLOUD_STORAGE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_BUCKET")
GOOGLE_VERTEX_AI_LOCATION = os.getenv("GOOGLE_VERTEX_AI_LOCATION", "us-central1")

print(f"🔧 Environment variables loaded:")
print(f"   Project ID: {GOOGLE_CLOUD_PROJECT_ID}")
print(f"   Storage Bucket: {GOOGLE_CLOUD_STORAGE_BUCKET}")
print(f"   Vertex AI Location: {GOOGLE_VERTEX_AI_LOCATION}")

# Initialize Google Cloud clients
storage_client = storage.Client(project=GOOGLE_CLOUD_PROJECT_ID)
bucket = storage_client.bucket(GOOGLE_CLOUD_STORAGE_BUCKET)
print(f"✅ Google Cloud clients initialized")

# Initialize Vertex AI
try:
    vertexai.init(project=GOOGLE_CLOUD_PROJECT_ID, location=GOOGLE_VERTEX_AI_LOCATION)
    print(f"✅ Vertex AI initialized successfully")
except Exception as e:
    print(f"❌ Vertex AI initialization failed: {e}")
    print(f"   Project ID: {GOOGLE_CLOUD_PROJECT_ID}")
    print(f"   Location: {GOOGLE_VERTEX_AI_LOCATION}")

def get_actual_costs(project_id: str, start_time: datetime, end_time: datetime) -> Dict[str, float]:
    """
    Get actual costs from Google Cloud Billing API for the specified time period
    """
    try:
        # For now, return estimated costs since billing API requires special permissions
        # In production, you would implement proper billing API calls here
        
        # This is a placeholder - in a real implementation, you would:
        # 1. Use the Cloud Billing API to get actual usage data
        # 2. Calculate costs based on your actual billing rates
        # 3. Return the real costs from your billing account
        
        return {
            "Speech-to-Text": 0.0,
            "Generative AI": 0.0, 
            "Cloud Storage": 0.0,
            "Total": 0.0
        }
        
    except Exception as e:
        print(f"❌ Error getting billing costs: {e}")
        return {"Total": 0.0}

def estimate_request_costs(transcript_length: int, audio_duration: float) -> Dict[str, float]:
    """
    Estimate costs for a specific request based on usage
    """
    # Google Cloud pricing (as of 2024) - these are estimates
    # You should verify current pricing on Google Cloud Console
    
    costs = {}
    
    # Speech-to-Text costs (per 15 seconds)
    speech_seconds = audio_duration
    speech_units = max(1, speech_seconds / 15)
    speech_cost = speech_units * 0.006  # $0.006 per 15 seconds
    costs["Speech-to-Text"] = speech_cost
    
    # Generative AI costs (per 1K characters input + output)
    total_chars = transcript_length + 1000  # Estimate output length
    ai_units = total_chars / 1000
    ai_cost = ai_units * 0.0005  # $0.0005 per 1K characters (Gemini 1.5 Pro)
    costs["Generative AI"] = ai_cost
    
    # Cloud Storage costs (per GB per month)
    storage_gb = 0.001  # Small audio file
    storage_cost = storage_gb * 0.02  # $0.02 per GB per month
    costs["Cloud Storage"] = storage_cost
    
    # Total
    costs["Total"] = sum(costs.values())
    
    return costs

def create_fallback_analysis(transcript, video_metadata, project_context):
    """
    Create a fallback analysis when Gemini AI is not available
    """
    print(f"🔄 Creating fallback analysis for transcript: '{transcript[:100]}...'")
    
    # Extract keywords from transcript
    transcript_lower = transcript.lower()
    keywords = []
    
    # Common instructional keywords
    instruction_keywords = ['step', 'first', 'next', 'then', 'finally', 'begin', 'start', 'end', 'complete']
    for keyword in instruction_keywords:
        if keyword in transcript_lower:
            keywords.append(keyword)
    
    # Project context keywords
    project_tags = project_context.get('tags', [])
    project_name = project_context.get('project_name', 'Project')
    
    # Create steps based on transcript length and content
    steps = []
    if len(transcript.strip()) > 50:
        # Split transcript into potential steps
        sentences = transcript.split('.')
        step_count = 0
        for i, sentence in enumerate(sentences):
            if sentence.strip() and step_count < 5:  # Limit to 5 steps
                # Clean up the sentence
                clean_sentence = sentence.strip()
                if len(clean_sentence) > 10:  # Only include meaningful sentences
                    steps.append({
                        "name": f"Step {step_count + 1}: {clean_sentence[:60].strip()}",
                        "description": clean_sentence,
                        "estimated_duration": 30 + (step_count * 15),
                        "difficulty_level": "Beginner",
                        "sign_off_requirements": "Complete the described action and verify understanding",
                        "cautionary_notes": "Ensure you understand the content before proceeding",
                        "best_practice_notes": "Take time to fully comprehend the information presented",
                        "validation_question": "Did you understand the key points of this step?",
                        "expected_answer": "Yes, I understand the main concepts and can explain them"
                    })
                    step_count += 1
    else:
        # Create generic steps for short transcripts
        steps = [
            {
                "name": "Video Analysis",
                "description": "Review the video content and identify key instructional elements.",
                "estimated_duration": 30,
                "difficulty_level": "Beginner",
                "sign_off_requirements": "Complete video review and identify main topics",
                "cautionary_notes": "Ensure you have watched the entire video before proceeding",
                "best_practice_notes": "Take notes on key points while watching",
                "validation_question": "Can you identify the main topics covered in the video?",
                "expected_answer": "Yes, I can list the key topics and concepts discussed"
            },
            {
                "name": "Content Review", 
                "description": "Analyze the video for important steps, materials, and tools mentioned.",
                "estimated_duration": 45,
                "difficulty_level": "Beginner",
                "sign_off_requirements": "Complete content analysis and note important elements",
                "cautionary_notes": "Pay attention to safety information and warnings",
                "best_practice_notes": "Pause and rewind to catch important details",
                "validation_question": "Did you identify the key materials and tools mentioned?",
                "expected_answer": "Yes, I noted the important materials, tools, and safety considerations"
            }
        ]
    
    # Create materials and tools based on project context and transcript content
    materials = []
    tools = []
    
    # Extract potential materials and tools from transcript
    transcript_words = transcript_lower.split()
    
    # Common materials and tools keywords
    material_keywords = {
        'wood': 'Wood', 'paper': 'Paper', 'fabric': 'Fabric', 'metal': 'Metal',
        'plastic': 'Plastic', 'glass': 'Glass', 'ceramic': 'Ceramic',
        'ingredients': 'Ingredients', 'seasonings': 'Seasonings', 'spices': 'Spices',
        'flour': 'Flour', 'sugar': 'Sugar', 'oil': 'Oil', 'butter': 'Butter'
    }
    
    tool_keywords = {
        'knife': 'Knife', 'saw': 'Saw', 'hammer': 'Hammer', 'drill': 'Drill',
        'screwdriver': 'Screwdriver', 'wrench': 'Wrench', 'pliers': 'Pliers',
        'scissors': 'Scissors', 'ruler': 'Ruler', 'tape': 'Tape measure',
        'pot': 'Pot', 'pan': 'Pan', 'spoon': 'Spoon', 'fork': 'Fork'
    }
    
    # Find materials and tools mentioned in transcript
    found_materials = set()
    found_tools = set()
    
    for word in transcript_words:
        for keyword, material in material_keywords.items():
            if keyword in word and material not in found_materials:
                materials.append({
                    "name": material,
                    "quantity": "As needed",
                    "specification": f"Mentioned in video: {material.lower()}"
                })
                found_materials.add(material)
        
        for keyword, tool in tool_keywords.items():
            if keyword in word and tool not in found_tools:
                tools.append({
                    "name": tool,
                    "specification": f"Mentioned in video: {tool.lower()}",
                    "safety_notes": "Follow safety guidelines"
                })
                found_tools.add(tool)
    
    # Add context-specific materials and tools if none found
    if not materials:
        if 'Woodworking' in project_tags:
            materials.extend([
                {"name": "Wood", "quantity": "As needed", "specification": "Appropriate type and size"},
                {"name": "Sandpaper", "quantity": "Various grits", "specification": "80, 120, 220 grit"}
            ])
        elif 'Cooking' in project_tags:
            materials.extend([
                {"name": "Ingredients", "quantity": "As per recipe", "specification": "Fresh ingredients recommended"},
                {"name": "Seasonings", "quantity": "To taste", "specification": "Salt, pepper, herbs"}
            ])
        else:
            materials = [
                {"name": "Basic Materials", "quantity": "As needed", "specification": "Materials specific to your project"}
            ]
    
    if not tools:
        if 'Woodworking' in project_tags:
            tools.extend([
                {"name": "Saw", "specification": "Hand saw or power saw", "safety_notes": "Wear safety glasses"},
                {"name": "Hammer", "specification": "Claw hammer", "safety_notes": "Use proper grip"}
            ])
        elif 'Cooking' in project_tags:
            tools.extend([
                {"name": "Knife", "specification": "Sharp chef's knife", "safety_notes": "Keep fingers away from blade"},
                {"name": "Cutting Board", "specification": "Stable surface", "safety_notes": "Secure board properly"}
            ])
        else:
            tools = [
                {"name": "Basic Tools", "specification": "Tools appropriate for your project", "safety_notes": "Follow safety guidelines"}
            ]
    
    # Create context-aware cautions and questions
    cautions = [
        "Please review the video content carefully before proceeding",
        "Ensure you have all necessary materials and tools",
        "Follow safety guidelines for your specific project type"
    ]
    
    # Add specific cautions based on project type
    if 'Woodworking' in project_tags:
        cautions.extend([
            "Wear appropriate safety gear including safety glasses",
            "Ensure your workspace is well-ventilated",
            "Keep tools sharp and in good condition"
        ])
    elif 'Cooking' in project_tags:
        cautions.extend([
            "Wash hands thoroughly before handling food",
            "Use clean utensils and surfaces",
            "Follow proper food safety guidelines"
        ])
    
    questions = [
        "Did you understand the main steps in the video?",
        "Do you have all the required materials and tools?",
        "Are you familiar with the safety procedures for this project?"
    ]
    
    # Add specific questions based on transcript content
    if 'aging' in transcript_lower or 'health' in transcript_lower:
        questions.extend([
            "Did you understand the health-related concepts mentioned?",
            "Are you aware of any medical considerations for this topic?"
        ])
    
    if 'safety' in transcript_lower or 'danger' in transcript_lower:
        questions.extend([
            "Did you note all the safety warnings mentioned?",
            "Do you have the proper safety equipment?"
        ])
    
    return {
        "steps": steps,
        "materials": materials,
        "tools": tools,
        "cautions": cautions,
        "questions": questions
    }

def map_steps_to_audio_positions(steps, transcript, video_duration):
    """
    Map steps to their actual audio positions by analyzing transcript content
    """
    print(f"🎯 Mapping {len(steps)} steps to audio positions in {video_duration}s video")
    
    # Extract keywords from each step
    step_keywords = []
    for step in steps:
        # Extract key terms from step name and description
        step_text = f"{step.get('name', '')} {step.get('description', '')}".lower()
        # Simple keyword extraction - in production you'd use NLP
        keywords = [word for word in step_text.split() if len(word) > 3]
        step_keywords.append(keywords)
    
    # For now, we'll use a simplified approach
    # In production, you'd use the actual transcript timestamps from Speech-to-Text
    # to find where each step's content actually occurs
    
    # Calculate total estimated duration
    total_estimated = sum(step.get('estimated_duration', 30) for step in steps)
    
    if total_estimated > 0:
        # Scale to fit video duration
        scale_factor = video_duration / total_estimated
        current_time = 0
        
        for i, step in enumerate(steps):
            step_duration = step.get('estimated_duration', 30) * scale_factor
            start_time = current_time
            end_time = current_time + step_duration
            
            # Ensure we don't exceed video duration
            if end_time > video_duration:
                end_time = video_duration
            
            # Format timestamps
            start_formatted = f"{int(start_time // 60):02d}:{start_time % 60:06.3f}"
            end_formatted = f"{int(end_time // 60):02d}:{end_time % 60:06.3f}"
            
            # Add timestamp data
            step["timestamps"] = {
                "start": start_formatted,
                "end": end_formatted,
                "start_seconds": start_time,
                "end_seconds": end_time,
                "duration_seconds": end_time - start_time
            }
            
            step["timestamp_display"] = f"{start_formatted} - {end_formatted}"
            step["video_start_time_ms"] = int(start_time * 1000)
            step["video_end_time_ms"] = int(end_time * 1000)
            
            print(f"   Step {i+1} '{step.get('name', 'Unknown')}': {start_formatted} - {end_formatted}")
            
            current_time = end_time
    else:
        # Fallback: distribute evenly
        time_per_step = video_duration / len(steps)
        for i, step in enumerate(steps):
            start_time = i * time_per_step
            end_time = (i + 1) * time_per_step
            
            start_formatted = f"{int(start_time // 60):02d}:{start_time % 60:06.3f}"
            end_formatted = f"{int(end_time // 60):02d}:{end_time % 60:06.3f}"
            
            step["timestamps"] = {
                "start": start_formatted,
                "end": end_formatted,
                "start_seconds": start_time,
                "end_seconds": end_time,
                "duration_seconds": end_time - start_time
            }
            
            step["timestamp_display"] = f"{start_formatted} - {end_formatted}"
            step["video_start_time_ms"] = int(start_time * 1000)
            step["video_end_time_ms"] = int(end_time * 1000)
            
            print(f"   Step {i+1} '{step.get('name', 'Unknown')}': {start_formatted} - {end_formatted}")
    
    return steps

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
    print(f"🔍 Received audio extraction request for file: {video.filename}")
    try:
        # Create temporary file for video
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{video.filename.split('.')[-1]}") as temp_video:
            content = await video.read()
            temp_video.write(content)
            temp_video_path = temp_video.name
            print(f"📁 Created temporary video file: {temp_video_path}")

        # Create temporary file for audio output
        audio_filename = f"audio_{uuid.uuid4()}.wav"
        temp_audio_path = tempfile.mktemp(suffix=".wav")
        print(f"🎵 Will extract audio to: {temp_audio_path}")

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
        
        print(f"🔄 Running FFmpeg command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ FFmpeg failed with error: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {result.stderr}")
        
        print(f"✅ FFmpeg completed successfully")

        # Upload audio to Google Cloud Storage
        blob_name = f"audio_extracts/{audio_filename}"
        blob = bucket.blob(blob_name)
        print(f"☁️ Uploading audio to GCS: {blob_name}")
        blob.upload_from_filename(temp_audio_path)
        print(f"✅ Audio uploaded successfully")

        # Clean up temporary files
        os.unlink(temp_video_path)
        os.unlink(temp_audio_path)
        print(f"🧹 Cleaned up temporary files")

        result_data = {
            "audio_url": f"gs://{GOOGLE_CLOUD_STORAGE_BUCKET}/{blob_name}",
            "filename": audio_filename
        }
        print(f"🎉 Returning result: {result_data}")
        return result_data

    except Exception as e:
        print(f"❌ Audio extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio extraction failed: {str(e)}")

@app.post("/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    """
    Transcribe audio using Google Speech-to-Text API
    """
    print(f"🔍 Received transcription request for audio: {request.audio_url}")
    
    # Track request start time for cost calculation
    request_start_time = datetime.now(timezone.utc)
    
    try:
        # Initialize Speech-to-Text client
        client = speech.SpeechClient()
        print(f"🎤 Initialized Speech-to-Text client")

        # Get audio from GCS
        audio = speech.RecognitionAudio(uri=request.audio_url)
        print(f"📥 Getting audio from GCS URI: {request.audio_url}")

        # Configure recognition
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=request.language_code,
            enable_word_time_offsets=True,
            enable_automatic_punctuation=True,
            model="video",  # Optimized for video content
        )
        print(f"⚙️ Configured recognition with language: {request.language_code}")

        # Perform transcription
        print(f"🔄 Starting long-running transcription...")
        operation = client.long_running_recognize(config=config, audio=audio)
        print(f"⏳ Waiting for transcription to complete...")
        response = operation.result()
        print(f"✅ Transcription completed")

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

        # Calculate costs
        request_end_time = datetime.now(timezone.utc)
        audio_duration = sum([word["end_time"] - word["start_time"] for word in timestamps])
        estimated_costs = estimate_request_costs(len(transcript), audio_duration)
        
        # Get actual costs from billing API
        actual_costs = get_actual_costs(GOOGLE_CLOUD_PROJECT_ID, request_start_time, request_end_time)

        result_data = {
            "transcript": transcript.strip(),
            "timestamps": timestamps,
            "confidence": response.results[0].alternatives[0].confidence if response.results else 0.0,
            "costs": {
                "estimated": estimated_costs,
                "actual": actual_costs
            }
        }
        print(f"🎉 Transcription result: {len(transcript)} characters, {len(timestamps)} words")
        print(f"💰 Estimated costs: ${estimated_costs['Total']:.4f}")
        return result_data

    except Exception as e:
        print(f"❌ Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/analyze-transcript")
async def analyze_transcript(request: AnalysisRequest):
    """
    Analyze transcript using Google Gemini AI to extract steps, materials, tools, etc.
    """
    # Track request start time for cost calculation
    request_start_time = datetime.now(timezone.utc)
    
    try:
        print(f"🤖 Starting AI analysis for transcript: '{request.transcript}'")
        print(f"📊 Video metadata: {request.video_metadata}")
        print(f"📋 Project context: {request.project_context}")
        
        # Check if transcript is too short
        if len(request.transcript.strip()) < 10:
            print(f"⚠️ Transcript is very short ({len(request.transcript)} characters), using fallback analysis")
            # Return a basic structure for short/empty transcripts
            result = {
                "steps": [
                    {
                        "name": "Video Analysis",
                        "description": "This video appears to be very short or silent. Please review the video manually.",
                        "estimated_duration": 30,
                        "difficulty_level": "Beginner"
                    }
                ],
                "materials": [],
                "tools": [],
                "cautions": ["Please ensure the video contains clear audio before processing"],
                "questions": ["Does the video contain clear audio narration?"]
            }
            
            # Calculate costs for fallback
            request_end_time = datetime.now(timezone.utc)
            estimated_costs = estimate_request_costs(len(request.transcript), 0)
            actual_costs = get_actual_costs(GOOGLE_CLOUD_PROJECT_ID, request_start_time, request_end_time)
            
            result["costs"] = {
                "estimated": estimated_costs,
                "actual": actual_costs
            }
            
            return result
        
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
           - sign_off_requirements: What needs to be completed to finish this step
           - cautionary_notes: Important safety warnings or precautions for this step
           - best_practice_notes: Tips and recommendations for better results
           - validation_question: Question to help users verify they completed the step correctly
           - expected_answer: Expected answer or acceptable range for validation

        2. Materials: Array of material objects with:
           - name: Material name
           - quantity: Required amount
           - specification: Any specific requirements

        3. Tools: Array of tool objects with:
           - name: Tool name
           - specification: Any specific requirements
           - safety_notes: Safety considerations

        4. Cautions: Array of safety warnings and important notes (as simple strings)

        5. Questions: Array of validation questions to test understanding (as simple strings, not objects)

        IMPORTANT: 
        - Return ONLY valid JSON without any markdown formatting, code blocks, or additional text
        - The response should start with {{ and end with }}
        - Questions should be simple strings, not objects with answers
        - Cautions should be simple strings, not objects
        - Even if the transcript is short or not clearly instructional, try to extract meaningful steps, materials, tools, cautions, and questions based on the content
        - For research or educational content, create steps that help understand the topic
        - For each step, provide specific sign-off requirements, cautionary notes, best practices, validation questions, and expected answers
        """

        print(f"🎯 Sending prompt to Gemini AI...")
        
        try:
            # Check if we have access to Gemini models
            print(f"🔄 Checking Gemini model availability...")
            
            # Try to use Google AI SDK first (more reliable)
            try:
                print(f"🔄 Trying Google AI SDK with gemini-1.5-pro...")
                model = genai.GenerativeModel("gemini-1.5-pro")
                response = model.generate_content(prompt)
                print(f"✅ Successfully used Google AI SDK with gemini-1.5-pro")
            except Exception as google_ai_error:
                print(f"❌ Google AI SDK failed: {google_ai_error}")
                print(f"🔄 Trying Vertex AI as fallback...")
                
                # Fallback to Vertex AI
                model_names = [
                    "gemini-1.5-pro",
                    "gemini-1.5-pro-preview-0409",
                    "gemini-1.5-flash",
                    "gemini-pro"
                ]
                
                model = None
                response = None
                
                for model_name in model_names:
                    try:
                        print(f"🔄 Trying Vertex AI model: {model_name}")
                        model = GenerativeModel(model_name)
                        response = model.generate_content(prompt)
                        print(f"✅ Successfully used Vertex AI model: {model_name}")
                        break
                    except Exception as model_error:
                        print(f"❌ Vertex AI model {model_name} failed: {model_error}")
                        continue
                
                if response is None:
                    print(f"❌ All AI models failed to initialize")
                    print(f"🔄 Falling back to rule-based analysis...")
                    raise Exception("All AI models failed to initialize")
            
            # Parse the response
            try:
                # Clean the response text
                cleaned_response = response.text.strip()
                
                # Remove markdown code blocks if present
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith('```'):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]
                
                cleaned_response = cleaned_response.strip()
                
                analysis_result = json.loads(cleaned_response)
                print(f"✅ Successfully parsed JSON response")
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                
                # If JSON parsing fails, try to extract JSON from the response
                import re
                
                # Try multiple patterns to extract JSON
                patterns = [
                    r'\{.*\}',  # Basic JSON object
                    r'```json\s*(\{.*?\})\s*```',  # JSON in markdown code block
                    r'```\s*(\{.*?\})\s*```',  # JSON in generic code block
                ]
                
                analysis_result = None
                for pattern in patterns:
                    json_match = re.search(pattern, response.text, re.DOTALL)
                    if json_match:
                        try:
                            # If the pattern has a group, use it, otherwise use the whole match
                            json_text = json_match.group(1) if json_match.groups() else json_match.group()
                            analysis_result = json.loads(json_text)
                            print(f"✅ Extracted JSON using pattern: {pattern}")
                            break
                        except json.JSONDecodeError as e2:
                            continue
                
                if analysis_result is None:
                    print(f"❌ Could not extract JSON from response")
                    raise ValueError("Failed to parse AI response as JSON")
        except Exception as ai_error:
            print(f"❌ Gemini AI failed: {ai_error}")
            print(f"🔄 Falling back to rule-based analysis...")
            
            # Fallback: Create analysis based on transcript content and project context
            analysis_result = create_fallback_analysis(request.transcript, request.video_metadata, request.project_context)
            
            print(f"✅ Fallback analysis completed successfully")

        # Validate and structure the response
        structured_result = {
            "steps": analysis_result.get("steps", []),
            "materials": analysis_result.get("materials", []),
            "tools": analysis_result.get("tools", []),
            "cautions": analysis_result.get("cautions", []),
            "questions": analysis_result.get("questions", []),
        }
        
        # Add timestamps to steps if we have timestamp data
        # Use actual video duration and map steps to their real audio positions
        video_duration = request.video_metadata.get('duration', 0)
        
        # If video duration is 0, estimate it from transcript length
        if video_duration == 0:
            print(f"⚠️ Video duration is 0, estimating from transcript length")
            # Estimate duration based on transcript length (average speaking rate is ~150 words per minute)
            word_count = len(request.transcript.split())
            estimated_duration = max(30, word_count * 0.4)  # 0.4 seconds per word
            video_duration = estimated_duration
            print(f"📊 Estimated video duration: {video_duration} seconds from {word_count} words")
        
        # Ensure minimum duration for timestamp generation
        if video_duration <= 0:
            print(f"⚠️ Video duration is still 0, using minimum duration")
            video_duration = 30 * len(structured_result["steps"])  # 30 seconds per step minimum
            print(f"📊 Using minimum duration: {video_duration} seconds")
        
        print(f"📊 Using video duration: {video_duration} seconds")
        
        # Map steps to their actual audio positions
        structured_result["steps"] = map_steps_to_audio_positions(
            structured_result["steps"], 
            request.transcript, 
            video_duration
        )
        
        # Normalize the response format
        def normalize_array(arr):
            """Convert array elements to strings if they are objects"""
            normalized = []
            for item in arr:
                if isinstance(item, dict):
                    # If it's an object, try to extract the question or text
                    if 'question' in item:
                        normalized.append(item['question'])
                    elif 'text' in item:
                        normalized.append(item['text'])
                    elif 'name' in item:
                        normalized.append(item['name'])
                    else:
                        # Convert the entire object to a string representation
                        normalized.append(str(item))
                else:
                    normalized.append(str(item))
            return normalized
        
        # Normalize cautions and questions
        structured_result["cautions"] = normalize_array(structured_result["cautions"])
        structured_result["questions"] = normalize_array(structured_result["questions"])
        
        # Check if AI returned empty results and fall back if needed
        total_items = (len(structured_result["steps"]) + 
                      len(structured_result["materials"]) + 
                      len(structured_result["tools"]) + 
                      len(structured_result["cautions"]) + 
                      len(structured_result["questions"]))
        
        if total_items == 0:
            print(f"⚠️ AI returned empty results, using fallback analysis...")
            analysis_result = create_fallback_analysis(request.transcript, request.video_metadata, request.project_context)
            structured_result = {
                "steps": analysis_result.get("steps", []),
                "materials": analysis_result.get("materials", []),
                "tools": analysis_result.get("tools", []),
                "cautions": analysis_result.get("cautions", []),
                "questions": analysis_result.get("questions", []),
            }
        
        # Calculate costs
        request_end_time = datetime.now(timezone.utc)
        estimated_costs = estimate_request_costs(len(request.transcript), 0)
        actual_costs = get_actual_costs(GOOGLE_CLOUD_PROJECT_ID, request_start_time, request_end_time)
        
        structured_result["costs"] = {
            "estimated": estimated_costs,
            "actual": actual_costs
        }
        
        print(f"🎉 AI analysis completed successfully")
        print(f"💰 Estimated costs: ${estimated_costs['Total']:.4f}")
        return structured_result

    except Exception as e:
        print(f"❌ AI analysis failed: {str(e)}")
        # If we get here, it means both Gemini and fallback failed
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