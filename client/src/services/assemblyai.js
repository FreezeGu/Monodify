// AssemblyAI API service for audio transcription with word-level timestamps

const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY || 'f8f7ff1defbc4fb2830e91216691cafd';
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

/**
 * Upload audio file to AssemblyAI and get upload URL
 */
export async function uploadAudioToAssemblyAI(audioFile) {
  try {
    // First, upload the file
    const uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
      body: audioFile,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error || 'Failed to upload audio');
    }

    const { upload_url } = await uploadResponse.json();
    return upload_url;
  } catch (error) {
    console.error('AssemblyAI upload error:', error);
    throw error;
  }
}

/**
 * Submit transcription job to AssemblyAI
 */
export async function submitTranscription(audioUrl, languageCode = 'ar') {
  try {
    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: languageCode, // 'ar' for Arabic, 'en' for English, etc.
        speech_models: ['universal-2'], // Required: must be a non-empty list
        punctuate: true,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to submit transcription';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.id; // Return transcript ID for polling
  } catch (error) {
    console.error('AssemblyAI transcription submission error:', error);
    throw error;
  }
}

/**
 * Poll for transcription results
 */
export async function getTranscriptionResult(transcriptId) {
  try {
    const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get transcription');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AssemblyAI get transcription error:', error);
    throw error;
  }
}

/**
 * Poll transcription until complete (with timeout)
 */
export async function waitForTranscription(transcriptId, onProgress = null, timeout = 300000) {
  const startTime = Date.now();
  const pollInterval = 3000; // Poll every 3 seconds

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = await getTranscriptionResult(transcriptId);

        if (result.status === 'completed') {
          resolve(result);
        } else if (result.status === 'error') {
          reject(new Error(result.error || 'Transcription failed'));
        } else {
          // Still processing
          if (onProgress) {
            onProgress(result.status);
          }

          // Check timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Transcription timeout'));
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Extract lyrics with word-level timestamps from AssemblyAI result
 */
export function extractLyricsFromTranscription(transcriptionResult) {
  if (!transcriptionResult.words || transcriptionResult.words.length === 0) {
    return [];
  }

  return transcriptionResult.words.map((word) => ({
    word: word.text,
    start: word.start / 1000, // Convert ms to seconds
    end: word.end / 1000,
    confidence: word.confidence,
  }));
}

/**
 * Complete workflow: Upload, transcribe, and get lyrics
 */
export async function transcribeAudioFile(audioFile, languageCode = 'ar', onProgress = null) {
  try {
    // Step 1: Upload audio
    if (onProgress) onProgress('uploading');
    const audioUrl = await uploadAudioToAssemblyAI(audioFile);

    // Step 2: Submit transcription
    if (onProgress) onProgress('submitting');
    const transcriptId = await submitTranscription(audioUrl, languageCode);

    // Step 3: Wait for transcription
    if (onProgress) onProgress('processing');
    const result = await waitForTranscription(transcriptId, onProgress);

    // Step 4: Extract lyrics
    const lyrics = extractLyricsFromTranscription(result);

    return {
      lyrics,
      fullText: result.text,
      language: result.language_code,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error('Transcription workflow error:', error);
    throw error;
  }
}
