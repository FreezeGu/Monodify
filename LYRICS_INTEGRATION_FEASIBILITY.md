# Lyrics Integration Feasibility Analysis

## Overview
Analysis of using Poyo.ai's get-timestamped-lyrics API and Gemini translation for Apple Music-style synchronized lyrics.

## Poyo.ai API Analysis

### ✅ What Works
- **Word-level timestamps**: Provides `start_s` and `end_s` for each word with millisecond precision
- **Structured output**: Returns `aligned_words` array perfect for Apple Music-style highlighting
- **Waveform data**: Includes amplitude data for visualizations
- **Cost**: 1 credit per generation (affordable)

### ⚠️ Limitations & Challenges

1. **Workflow Complexity**:
   - Requires `task_id` and `audio_id` from a previous music generation task
   - Designed primarily for audio generated through Poyo.ai's music generation API
   - May require uploading audio first, then getting IDs, then requesting lyrics

2. **Upload Process**:
   - The "upload-and-extend-audio" API is for extending audio, not analyzing arbitrary files
   - Need to verify if uploaded audio can be analyzed for lyrics extraction
   - May require audio to be hosted at a public URL (`upload_url`)

3. **Processing Time**:
   - Asynchronous processing with webhook callbacks
   - Not instant - requires polling or waiting for callback
   - May add delay to upload workflow

## Gemini Translation Analysis

### ✅ What Works
- **High-quality translation**: Gemini Translation LLM provides natural translations
- **Fast option available**: Cloud Translation NMT model (~100ms latency)
- **Arabic support**: Google Translate supports Arabic → English

### ⚠️ Challenges

1. **Timing Synchronization**:
   - Translation changes word count and structure
   - Need to map translated words back to original timestamps
   - Complex alignment required for word-by-word highlighting

2. **Two Approaches**:
   - **Word-by-word translation**: Less natural, but preserves timing
   - **Sentence translation**: More natural, but loses word-level sync

3. **Implementation Complexity**:
   - Would need to translate each word/phrase separately
   - Or translate full text and re-align timestamps (very complex)

## Recommended Implementation Strategy

### Option 1: Poyo.ai (If It Supports Uploaded Audio)

**Workflow**:
1. User uploads audio file → Upload to Firebase Storage
2. Get public URL → Pass to Poyo.ai upload endpoint
3. Receive `audio_id` → Use with get-timestamped-lyrics API
4. Process lyrics → Store word-level timestamps in Firestore
5. Translate with Gemini → Store translation with aligned timestamps
6. Display in player → Apple Music-style word highlighting

**Pros**:
- Word-level precision
- Professional quality
- Structured data format

**Cons**:
- Complex workflow
- May not support arbitrary uploads
- Requires API key and credits

### Option 2: Alternative APIs (Recommended)

**Better Options**:
1. **AssemblyAI**:
   - Direct audio file upload
   - Word-level timestamps
   - Supports Arabic transcription
   - Real-time processing

2. **OpenAI Whisper API**:
   - High accuracy
   - Multiple languages including Arabic
   - Word-level timestamps available
   - Direct file upload

3. **Google Speech-to-Text**:
   - Word-level timestamps
   - Arabic support
   - Can combine with Translation API

### Option 3: Hybrid Approach

1. **Extract lyrics**: Use AssemblyAI or Whisper for transcription + timestamps
2. **Translate**: Use Gemini/Google Translate API for translation
3. **Align**: Map translated words to original timestamps
4. **Store**: Save both original and translated lyrics with timestamps

## Implementation Requirements

### Data Structure Needed

```javascript
{
  lyrics: {
    original: [
      { word: "بسم", start: 0.5, end: 0.8 },
      { word: "الله", start: 0.8, end: 1.2 },
      // ...
    ],
    translated: [
      { word: "In", start: 0.5, end: 0.8 },
      { word: "the", start: 0.8, end: 1.0 },
      { word: "name", start: 1.0, end: 1.2 },
      // ...
    ]
  }
}
```

### Player Implementation

- Track current playback time
- Highlight words where `currentTime >= word.start && currentTime <= word.end`
- Smooth scrolling to keep current word visible
- Apple Music-style animations

## Next Steps

1. **Test Poyo.ai**: Verify if uploaded audio files can be analyzed
2. **Compare APIs**: Test AssemblyAI vs Whisper vs Poyo.ai
3. **Prototype**: Build simple word-highlighting component
4. **Translation Strategy**: Decide on word-by-word vs sentence translation
5. **Cost Analysis**: Compare pricing across services

## Conclusion

**Feasibility**: ✅ **YES, but with considerations**

- Poyo.ai may work but workflow is complex
- Alternative APIs (AssemblyAI, Whisper) might be better suited
- Translation timing synchronization is challenging but solvable
- Apple Music-style display is definitely implementable

**Recommendation**: Start with AssemblyAI or Whisper API for more straightforward integration, then add Gemini translation layer.
