// Google Cloud API Service
// This file contains functions to interact with Google Cloud services

const GOOGLE_CLOUD_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to get video duration from a video file
const getVideoDuration = (videoFile) => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            const duration = video.duration || 0;
            console.log(`📹 Video duration for ${videoFile.name}: ${duration} seconds`);
            resolve(duration);
        };
        
        video.onerror = () => {
            console.warn(`⚠️ Could not get duration for ${videoFile.name}, using 0`);
            resolve(0);
        };
        
        video.src = URL.createObjectURL(videoFile);
    });
};

export const googleCloudApi = {
    // Extract audio from video using FFmpeg (handled by backend)
    extractAudio: async (videoFile) => {
        console.log('🎵 Starting audio extraction for:', videoFile.name);
        const formData = new FormData();
        formData.append('video', videoFile);
        
        console.log('📤 Sending request to:', `${GOOGLE_CLOUD_API_BASE}/extract-audio`);
        const response = await fetch(`${GOOGLE_CLOUD_API_BASE}/extract-audio`, {
            method: 'POST',
            body: formData,
        });
        
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Audio extraction failed:', errorData);
            throw new Error(errorData.detail || 'Failed to extract audio from video');
        }
        
        const result = await response.json();
        console.log('✅ Audio extraction completed:', result);
        return result;
    },

    // Transcribe audio using Google Speech-to-Text
    transcribeAudio: async (audioUrl) => {
        console.log('🎤 Starting transcription for:', audioUrl);
        
        const response = await fetch(`${GOOGLE_CLOUD_API_BASE}/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                language_code: 'en-US'
            }),
        });
        
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Transcription failed:', errorData);
            throw new Error(errorData.detail || 'Failed to transcribe audio');
        }
        
        const result = await response.json();
        console.log('✅ Transcription completed:', result.transcript.length, 'characters');
        return result;
    },

    // Analyze transcript using AI
    analyzeTranscript: async (transcript, videoMetadata, projectContext) => {
        console.log('🤖 Starting AI analysis for transcript');
        
        const response = await fetch(`${GOOGLE_CLOUD_API_BASE}/analyze-transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcript: transcript,
                video_metadata: videoMetadata,
                project_context: projectContext
            }),
        });
        
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ AI analysis failed:', errorData);
            throw new Error(errorData.detail || 'Failed to analyze transcript');
        }
        
        const result = await response.json();
        console.log('✅ AI analysis completed:', result.steps?.length || 0, 'steps');
        return result;
    },

    // Process multiple videos for AI breakdown
    processVideoBreakdown: async (videoFiles, projectContext, onProgress) => {
        const results = [];
        
        for (let i = 0; i < videoFiles.length; i++) {
            const videoFile = videoFiles[i];
            
            // Step 1: Extract audio
            if (onProgress) onProgress(`Processing video ${i + 1}/${videoFiles.length}: Extracting audio...`);
            const audioResult = await googleCloudApi.extractAudio(videoFile);
            
            // Step 2: Transcribe audio
            if (onProgress) onProgress(`Processing video ${i + 1}/${videoFiles.length}: Transcribing audio...`);
            const transcriptionResult = await googleCloudApi.transcribeAudio(audioResult.audio_url);
            
            // Step 3: Get video duration
            if (onProgress) onProgress(`Processing video ${i + 1}/${videoFiles.length}: Getting video duration...`);
            const videoDuration = await getVideoDuration(videoFile);
            
            // Step 4: Analyze with AI
            if (onProgress) onProgress(`Processing video ${i + 1}/${videoFiles.length}: Analyzing with AI...`);
            const analysisResult = await googleCloudApi.analyzeTranscript(
                transcriptionResult.transcript,
                {
                    filename: videoFile.name,
                    duration: videoDuration,
                    size: videoFile.size,
                },
                projectContext
            );
            
            results.push({
                videoName: videoFile.name,
                transcript: transcriptionResult.transcript,
                steps: analysisResult.steps,
                materials: analysisResult.materials,
                tools: analysisResult.tools,
            });
        }
        
        return results;
    },
};

export default googleCloudApi; 