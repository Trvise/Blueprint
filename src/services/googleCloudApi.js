// Google Cloud API Service
// This file contains functions to interact with Google Cloud services

const GOOGLE_CLOUD_API_BASE = process.env.REACT_APP_VIDEO_BREAKDOWN_API_URL || 'http://localhost:8000';

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

    // Transcribe audio using Google Speech-to-Text API
    transcribeAudio: async (audioUrl, languageCode = 'en-US') => {
        console.log('🎤 Starting transcription for:', audioUrl);
        const response = await fetch(`${GOOGLE_CLOUD_API_BASE}/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                language_code: languageCode,
            }),
        });
        
        console.log('📥 Transcription response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Transcription failed:', errorData);
            throw new Error(errorData.detail || 'Failed to transcribe audio');
        }
        
        const result = await response.json();
        console.log('✅ Transcription completed:', result.transcript?.substring(0, 100) + '...');
        return result;
    },

    // Analyze transcript using Google Gemini AI
    analyzeTranscript: async (transcript, videoMetadata, projectContext) => {
        const response = await fetch(`${GOOGLE_CLOUD_API_BASE}/analyze-transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcript: transcript,
                video_metadata: videoMetadata,
                project_context: projectContext,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to analyze transcript with AI');
        }
        
        return await response.json();
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
            
            // Step 3: Analyze with AI
            if (onProgress) onProgress(`Processing video ${i + 1}/${videoFiles.length}: Analyzing with AI...`);
            const analysisResult = await googleCloudApi.analyzeTranscript(
                transcriptionResult.transcript,
                {
                    filename: videoFile.name,
                    duration: videoFile.duration || 0,
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
                cautions: analysisResult.cautions,
                questions: analysisResult.questions,
            });
        }
        
        return results;
    },
};

export default googleCloudApi; 