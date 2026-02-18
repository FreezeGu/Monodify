import React, { useState, useEffect } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import ScreenLayout from '../components/ScreenLayout';
import GlassButton from '../components/GlassButton';
import { transcribeAudioFile } from '../services/assemblyai';
import { translateLyrics } from '../services/gemini';

const GENRES = ['Happy', 'War', 'Peaceful', 'Motivational', 'Religious', 'Spiritual', 'Other'];

export default function UploadNasheed() {
  const { push } = useTabNavigation();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Audio upload, 2: Basic info (pre-filled), 3: Image, 4: Subtitles, 5: Review
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    isAuthor: false,
    authorName: '',
    genre: '',
    description: '',
    isPoem: false,
    audioFile: null,
    imageFile: null,
    subtitles: [{ time: 0, text: '', translation: '' }],
  });
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractingLyrics, setExtractingLyrics] = useState(false);
  const [lyricsProgress, setLyricsProgress] = useState('');
  const [error, setError] = useState('');
  const [lyricsData, setLyricsData] = useState({
    original: [], // Arabic lyrics with timestamps
    translated: [], // English lyrics with timestamps
  });
  const [isDragging, setIsDragging] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSubtitleLine = () => {
    setFormData((prev) => ({
      ...prev,
      subtitles: [...prev.subtitles, { time: 0, text: '', translation: '' }],
    }));
  };

  const removeSubtitleLine = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtitles: prev.subtitles.filter((_, i) => i !== index),
    }));
  };

  const updateSubtitle = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      subtitles: prev.subtitles.map((sub, i) => (i === index ? { ...sub, [field]: value } : sub)),
    }));
  };

  // Extract metadata from audio file using jsmediatags
  const extractMetadata = async (file) => {
    setExtracting(true);
    setError('');
    
    try {
      const fallbackTitle = file.name.replace(/\.[^.]*$/, '') || 'Unknown Title';
      let title = fallbackTitle;
      let artist = 'Unknown Artist';
      let artworkBlob = null;
      let artworkUrl = null;

      // Helper function to build artwork URL from picture data
      const buildArtworkUrl = (picture) => {
        if (!picture || !picture.data) return null;
        const data = picture.data;
        const mime = picture.format || picture.imageFormat || picture.mimeType || 'image/jpeg';
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(Array.isArray(data) ? data : Array.from(data));
        const blob = new Blob([bytes], { type: mime });
        return URL.createObjectURL(blob);
      };

      // Try jsmediatags (loaded globally from index.html)
      // Check both window and globalThis for compatibility
      const jsmediatags = window.jsmediatags || globalThis.jsmediatags;
      if (typeof jsmediatags !== 'undefined') {
        try {
          const tag = await new Promise((resolve, reject) => {
            jsmediatags.read(file, { 
              onSuccess: resolve, 
              onError: reject 
            });
          });
          
          if (tag && tag.tags) {
            if (tag.tags.title) title = tag.tags.title;
            if (tag.tags.artist) artist = tag.tags.artist;
            
            // Extract artwork
            const pic = tag.tags.picture;
            if (pic) {
              const data = pic.data;
              const mime = pic.format || 'image/jpeg';
              const bytes = data instanceof Uint8Array ? data : new Uint8Array(Array.isArray(data) ? data : Array.from(data));
              const blob = new Blob([bytes], { type: mime });
              artworkBlob = new File([blob], 'cover.jpg', { type: mime });
              artworkUrl = URL.createObjectURL(artworkBlob);
            }
          }
        } catch (e) {
          console.warn('jsmediatags read failed:', e.message);
          // Continue with fallback values
        }
      }

      // Update form data with extracted metadata
      setFormData((prev) => ({
        ...prev,
        title: title,
        artist: artist,
        imageFile: artworkBlob, // Set extracted artwork as image file
      }));

      setExtracting(false);
      
      // Auto-advance to next step
      setStep(2);
      
      // Start lyrics extraction in background
      extractLyrics(file);
    } catch (err) {
      console.error('Metadata extraction error:', err);
      setError('Failed to extract metadata. You can still fill in the information manually.');
      setExtracting(false);
      // Still advance to next step so user can fill manually
      setStep(2);
    }
  };

  // Extract lyrics from audio file using AssemblyAI
  const extractLyrics = async (audioFile) => {
    setExtractingLyrics(true);
    setLyricsProgress('Extracting lyrics...');
    
    try {
      // Detect language from form data or default to Arabic
      const languageCode = 'ar'; // Arabic for nasheeds
      
      // Transcribe audio
      const transcriptionResult = await transcribeAudioFile(
        audioFile,
        languageCode,
        (status) => {
          setLyricsProgress(`Processing: ${status}...`);
        }
      );

      const originalLyrics = transcriptionResult.lyrics;
      
      // Translate to English
      setLyricsProgress('Translating to English...');
      let translatedLyrics = [];
      try {
        translatedLyrics = await translateLyrics(originalLyrics, 'en', 'ar');
      } catch (translationError) {
        console.warn('Translation failed, continuing without translation:', translationError);
        // Continue without translation
      }

      setLyricsData({
        original: originalLyrics,
        translated: translatedLyrics,
      });

      setLyricsProgress('Lyrics extracted successfully!');
      setExtractingLyrics(false);
    } catch (err) {
      console.error('Lyrics extraction error:', err);
      setLyricsProgress('');
      setExtractingLyrics(false);
      // Don't show error to user - lyrics extraction is optional
    }
  };

  const handleAudioFileSelect = async (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/webm'];
    const isValidAudio = validTypes.includes(file.type) || file.name.match(/\.(mp3|m4a|ogg|wav|flac|webm)$/i);
    
    if (!isValidAudio) {
      setError('Please select a valid audio file (MP3, M4A, OGG, WAV, FLAC, WebM)');
      return;
    }
    
    updateField('audioFile', file);
    await extractMetadata(file);
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    await handleAudioFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/wav', 'audio/flac', 'audio/webm'];
      return validTypes.includes(file.type) || file.name.match(/\.(mp3|m4a|ogg|wav|flac|webm)$/i);
    });

    if (audioFile) {
      await handleAudioFileSelect(audioFile);
    } else {
      setError('Please drop a valid audio file (MP3, M4A, OGG, WAV, FLAC, WebM)');
    }
  };

  // Prevent default drag behaviors on the document to avoid browser opening files
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to upload nasheeds');
      return;
    }

    if (!formData.title || !formData.artist || !formData.audioFile || !formData.imageFile) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const timestamp = Date.now();
      const userId = user.uid;

      // Upload audio file
      const audioRef = ref(storage, `nasheeds/${userId}/${timestamp}_${formData.audioFile.name}`);
      const audioSnapshot = await uploadBytes(audioRef, formData.audioFile);
      const audioUrl = await getDownloadURL(audioSnapshot.ref);

      // Upload image file
      const imageRef = ref(storage, `nasheeds/${userId}/${timestamp}_${formData.imageFile.name}`);
      const imageSnapshot = await uploadBytes(imageRef, formData.imageFile);
      const imageUrl = await getDownloadURL(imageSnapshot.ref);

      // Save to Firestore
      const nasheedData = {
        title: formData.title,
        artist: formData.artist,
        isAuthor: formData.isAuthor,
        authorName: formData.isAuthor ? formData.authorName : formData.artist,
        genre: formData.genre,
        description: formData.description,
        isPoem: formData.isPoem || false,
        audioUrl,
        imageUrl,
        subtitles: formData.subtitles.filter((s) => s.text.trim()),
        // Lyrics with word-level timestamps
        lyrics: {
          original: lyricsData.original, // Arabic with timestamps
          translated: lyricsData.translated, // English with timestamps
        },
        status: 'pending', // pending, approved, rejected
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
      };

      await addDoc(collection(db, 'nasheeds'), nasheedData);

      // Reset form
      setFormData({
        title: '',
        artist: '',
        isAuthor: false,
        authorName: '',
        genre: '',
        description: '',
        isPoem: false,
        audioFile: null,
        imageFile: null,
        subtitles: [{ time: 0, text: '', translation: '' }],
      });
      setStep(1);
      setUploading(false);
      setExtracting(false);
      setExtractingLyrics(false);
      setLyricsProgress('');
      setLyricsData({ original: [], translated: [] });
      // Reset file input
      const audioInput = document.getElementById('audio-input');
      if (audioInput) audioInput.value = '';
      push('/profile');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload nasheed');
      setUploading(false);
    }
  };

  return (
    <ScreenLayout title="Upload Nasheed">
      <div style={{ paddingTop: 16 }}>
        {/* Progress indicator */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: s <= step ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--tertiary-text)' }}>
            <span>Audio</span>
            <span>Info</span>
            <span>Image</span>
            <span>Subtitles</span>
            <span>Review</span>
          </div>
        </div>

        {error && (
          <div className="liquid-glass-card" style={{ padding: 12, marginBottom: 16, background: 'rgba(255,107,107,0.2)' }}>
            <p style={{ color: '#ff6b6b', fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* Step 1: Audio File Upload */}
        {step === 1 && (
          <div className="liquid-glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Upload Audio File</h3>
            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
              Select your audio file. We'll extract the title, artist, artwork, and generate AI subtitles automatically.
            </p>
            
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              id="audio-input"
              disabled={extracting}
            />
            <label htmlFor="audio-input">
              <div
                className="liquid-glass-card"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  padding: 32,
                  textAlign: 'center',
                  cursor: extracting ? 'wait' : 'pointer',
                  opacity: extracting ? 0.6 : 1,
                  border: isDragging 
                    ? '2px solid rgba(33, 150, 243, 0.6)' 
                    : formData.audioFile 
                      ? '2px solid rgba(255,255,255,0.3)' 
                      : '2px dashed rgba(255,255,255,0.2)',
                  background: isDragging ? 'rgba(33, 150, 243, 0.1)' : undefined,
                  transition: 'all 0.2s ease',
                }}
              >
                {extracting ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Extracting metadata...</div>
                    <div className="text-tertiary" style={{ fontSize: 14 }}>Reading title, artist, and artwork</div>
                  </>
                ) : formData.audioFile ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                    <div style={{ fontWeight: 600 }}>{formData.audioFile.name}</div>
                    <div className="text-tertiary" style={{ fontSize: 12, marginTop: 4 }}>
                      {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="text-secondary" style={{ fontSize: 12, marginTop: 8 }}>
                      ✓ Metadata extracted
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: isDragging ? 0.8 : 0.5 }}>
                      {isDragging ? (
                        <>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </>
                      ) : (
                        <>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </>
                      )}
                    </svg>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {isDragging ? 'Drop audio file here' : 'Select audio file or drag & drop'}
                    </div>
                    <div className="text-tertiary" style={{ fontSize: 14 }}>MP3, M4A, OGG, WAV, FLAC</div>
                  </>
                )}
              </div>
            </label>

            {/* Lyrics extraction status */}
            {extractingLyrics && (
              <div className="liquid-glass-card" style={{ padding: 16, marginTop: 16, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Extracting Lyrics</div>
                    <div className="text-tertiary" style={{ fontSize: 12 }}>{lyricsProgress || 'Processing audio...'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {!extractingLyrics && lyricsData.original.length > 0 && (
              <div className="liquid-glass-card" style={{ padding: 16, marginTop: 16, background: 'rgba(76, 175, 80, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#4caf50' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Lyrics Extracted</div>
                    <div className="text-secondary" style={{ fontSize: 12 }}>
                      {lyricsData.original.length} words • {lyricsData.translated.length > 0 ? 'Translated' : 'Translation pending'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info about AI subtitle generation */}
            {formData.audioFile && !extracting && (
              <div className="liquid-glass-card" style={{ padding: 12, marginTop: 16, background: 'rgba(33, 150, 243, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#2196F3', flexShrink: 0, marginTop: 2 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    <strong>AI Subtitle Generation:</strong> After you continue, our AI will automatically extract and translate lyrics from your audio file. 
                    This happens in the background and may take 30-60 seconds.
                  </div>
                </div>
              </div>
            )}

            {formData.audioFile && !extracting && (
              <GlassButton onClick={() => setStep(2)} style={{ width: '100%', marginTop: 16 }}>
                Continue: Review & Edit Information
              </GlassButton>
            )}
          </div>
        )}

        {/* Step 2: Basic Info (Pre-filled from metadata) */}
        {step === 2 && (
          <div className="liquid-glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
              Review and edit the information extracted from your audio file.
            </p>
            
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Nasheed title"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />

            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>
              Artist/Performer *
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => updateField('artist', e.target.value)}
              placeholder="Artist name"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={formData.isAuthor}
                onChange={(e) => updateField('isAuthor', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ fontSize: 14 }}>I am the author</span>
            </label>

            {formData.isAuthor && (
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => updateField('authorName', e.target.value)}
                placeholder="Your name as author"
                className="liquid-glass-input"
                style={{ width: '100%', marginBottom: 16 }}
              />
            )}

            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>
              Genre *
            </label>
            <select
              value={formData.genre}
              onChange={(e) => updateField('genre', e.target.value)}
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            >
              <option value="">Select genre</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />

            {/* Poem checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isPoem}
                onChange={(e) => updateField('isPoem', e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: 'var(--primary-text)' }}>
                📜 Mark as Poem
              </span>
            </label>

            <div style={{ display: 'flex', gap: 12 }}>
              <GlassButton variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </GlassButton>
              <GlassButton onClick={() => setStep(3)} disabled={!formData.title || !formData.artist || !formData.genre} style={{ flex: 1 }}>
                Next: Cover Image
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 3: Image File */}
        {step === 3 && (
          <div className="liquid-glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Cover Image</h3>
            {formData.imageFile && (
              <p className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
                ✓ Cover image extracted from audio file. You can replace it if needed.
              </p>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateField('imageFile', e.target.files?.[0] || null)}
              style={{ display: 'none' }}
              id="image-input"
            />
            <label htmlFor="image-input">
              <div
                className="liquid-glass-card"
                style={{
                  padding: 32,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: formData.imageFile ? '2px solid rgba(255,255,255,0.3)' : '2px dashed rgba(255,255,255,0.2)',
                }}
              >
                {formData.imageFile ? (
                  <>
                    <img
                      src={URL.createObjectURL(formData.imageFile)}
                      alt="Preview"
                      style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 12, margin: '0 auto 12px' }}
                    />
                    <div style={{ fontWeight: 600 }}>{formData.imageFile.name || 'Cover Image'}</div>
                    <div className="text-tertiary" style={{ fontSize: 12, marginTop: 4 }}>
                      Click to replace
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Select cover image</div>
                    <div className="text-tertiary" style={{ fontSize: 14 }}>JPG, PNG, WebP</div>
                  </>
                )}
              </div>
            </label>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <GlassButton variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Back
              </GlassButton>
              <GlassButton onClick={() => setStep(4)} disabled={!formData.imageFile} style={{ flex: 1 }}>
                Next: Add Subtitles
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 4: Subtitles */}
        {step === 4 && (
          <div className="liquid-glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Subtitles & Translation</h3>
            
            {/* AI-Generated Lyrics Status */}
            {extractingLyrics && (
              <div className="liquid-glass-card" style={{ padding: 16, marginBottom: 20, background: 'rgba(33, 150, 243, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', color: '#2196F3' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>AI is generating subtitles...</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>{lyricsProgress || 'Processing audio with AssemblyAI'}</div>
                    <div className="text-tertiary" style={{ fontSize: 11, marginTop: 4 }}>
                      This may take 30-60 seconds. Please wait...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!extractingLyrics && lyricsData.original.length > 0 && (
              <div className="liquid-glass-card" style={{ padding: 16, marginBottom: 20, background: 'rgba(76, 175, 80, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#4caf50', flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>AI-Generated Subtitles Ready</div>
                    <div className="text-secondary" style={{ fontSize: 13, marginBottom: 8 }}>
                      {lyricsData.original.length} words extracted • {lyricsData.translated.length > 0 ? 'Translated to English' : 'Translation pending'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tertiary-text)', lineHeight: 1.6 }}>
                      These synchronized subtitles will be displayed during playback with word-by-word highlighting. 
                      You can add additional manual subtitles below if needed.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!extractingLyrics && lyricsData.original.length === 0 && (
              <div className="liquid-glass-card" style={{ padding: 16, marginBottom: 20, background: 'rgba(255, 152, 0, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#FF9800', flexShrink: 0, marginTop: 2 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No AI Subtitles Generated</div>
                    <div className="text-secondary" style={{ fontSize: 13 }}>
                      AI subtitle generation may have failed or is still processing. You can add manual subtitles below.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-secondary" style={{ fontSize: 13, marginBottom: 16 }}>
              {lyricsData.original.length > 0 
                ? 'AI-generated subtitles are ready. You can add additional manual subtitles below if needed.'
                : 'Add synchronized subtitles manually. Time is in seconds from the start of the track.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {formData.subtitles.map((sub, index) => (
                <div key={index} className="liquid-glass-card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="number"
                      value={sub.time}
                      onChange={(e) => updateSubtitle(index, 'time', parseFloat(e.target.value) || 0)}
                      placeholder="Time (s)"
                      className="liquid-glass-input"
                      style={{ width: 80 }}
                    />
                    <GlassButton
                      variant="secondary"
                      onClick={() => removeSubtitleLine(index)}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      Remove
                    </GlassButton>
                  </div>
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => updateSubtitle(index, 'text', e.target.value)}
                    placeholder="Subtitle text"
                    className="liquid-glass-input"
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <input
                    type="text"
                    value={sub.translation}
                    onChange={(e) => updateSubtitle(index, 'translation', e.target.value)}
                    placeholder="Translation (optional)"
                    className="liquid-glass-input"
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <GlassButton variant="secondary" onClick={addSubtitleLine} style={{ width: '100%', marginBottom: 20 }}>
              + Add Subtitle Line
            </GlassButton>

            <div style={{ display: 'flex', gap: 12 }}>
              <GlassButton variant="secondary" onClick={() => setStep(3)} style={{ flex: 1 }}>
                Back
              </GlassButton>
              <GlassButton 
                onClick={() => setStep(5)} 
                disabled={extractingLyrics}
                style={{ flex: 1 }}
              >
                {extractingLyrics ? 'Generating Subtitles...' : 'Review & Submit'}
              </GlassButton>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="liquid-glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Review & Submit</h3>

            <div style={{ marginBottom: 16 }}>
              <div className="text-secondary" style={{ fontSize: 12, marginBottom: 4 }}>Title</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{formData.title}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="text-secondary" style={{ fontSize: 12, marginBottom: 4 }}>Artist</div>
              <div style={{ fontSize: 16 }}>{formData.artist}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="text-secondary" style={{ fontSize: 12, marginBottom: 4 }}>Genre</div>
              <div style={{ fontSize: 16 }}>{formData.genre}</div>
              {formData.isPoem && (
                <div style={{ marginTop: 8 }}>
                  <span className="liquid-glass-btn" style={{ padding: '4px 12px', fontSize: 12, background: 'rgba(255, 200, 0, 0.2)' }}>
                    📜 Poem
                  </span>
                </div>
              )}
            </div>

            {formData.imageFile && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={URL.createObjectURL(formData.imageFile)}
                  alt="Cover"
                  style={{ width: '100%', maxWidth: 300, borderRadius: 12 }}
                />
              </div>
            )}

            {/* AI-Generated Lyrics Preview */}
            {lyricsData.original.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="text-secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  AI-Generated Subtitles ({lyricsData.original.length} words)
                </div>
                <div className="liquid-glass-card" style={{ padding: 12, marginBottom: 12, background: 'rgba(76, 175, 80, 0.1)' }}>
                  <div style={{ fontSize: 11, color: 'var(--tertiary-text)', marginBottom: 8 }}>
                    Original (Arabic) • {lyricsData.translated.length > 0 ? 'Translated (English)' : 'Translation pending'}
                  </div>
                  <div style={{ fontSize: 13, maxHeight: 150, overflowY: 'auto', lineHeight: 1.8 }}>
                    {lyricsData.original.slice(0, 20).map((word, i) => (
                      <span key={i} style={{ marginRight: 4 }}>
                        {word.word}
                      </span>
                    ))}
                    {lyricsData.original.length > 20 && (
                      <span className="text-tertiary" style={{ fontSize: 11 }}>
                        ... and {lyricsData.original.length - 20} more words
                      </span>
                    )}
                  </div>
                  {lyricsData.translated.length > 0 && (
                    <div style={{ fontSize: 13, maxHeight: 150, overflowY: 'auto', lineHeight: 1.8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      {lyricsData.translated.slice(0, 20).map((word, i) => (
                        <span key={i} style={{ marginRight: 4 }}>
                          {word.word}
                        </span>
                      ))}
                      {lyricsData.translated.length > 20 && (
                        <span className="text-tertiary" style={{ fontSize: 11 }}>
                          ... and {lyricsData.translated.length - 20} more words
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Subtitles */}
            {formData.subtitles.filter((s) => s.text.trim()).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="text-secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  Manual Subtitles ({formData.subtitles.filter((s) => s.text.trim()).length} lines)
                </div>
                <div style={{ fontSize: 13, maxHeight: 200, overflowY: 'auto' }}>
                  {formData.subtitles.filter((s) => s.text.trim()).map((sub, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: 'var(--tertiary-text)', marginBottom: 4 }}>{sub.time}s</div>
                      <div>{sub.text}</div>
                      {sub.translation && (
                        <div className="text-tertiary" style={{ fontSize: 12, marginTop: 4 }}>{sub.translation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <GlassButton variant="secondary" onClick={() => setStep(4)} style={{ flex: 1 }}>
                Back
              </GlassButton>
              <GlassButton 
                onClick={handleSubmit} 
                disabled={uploading || extractingLyrics} 
                style={{ flex: 1 }}
              >
                {uploading ? 'Uploading...' : extractingLyrics ? 'Generating Subtitles...' : 'Submit for Review'}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
