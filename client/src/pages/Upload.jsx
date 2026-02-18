import React, { useState } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import { usePlayer } from '../context/PlayerContext';

function readTags(file) {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.jsmediatags === 'undefined') {
      reject(new Error('Tag reader not loaded'));
      return;
    }
    globalThis.jsmediatags.read(file, { onSuccess: resolve, onError: reject });
  });
}

function buildArtworkUrl(pic) {
  if (!pic || !pic.data) return null;
  const data = pic.data;
  const mime = pic.format || 'image/jpeg';
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(Array.isArray(data) ? data : Array.from(data));
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

export default function Upload() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentTrack } = usePlayer();

  const processFile = async (file) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please choose an audio file (e.g. MP3, M4A).');
      return;
    }
    setError('');
    setUploading(true);
    let title = file.name.replace(/\.[^.]*$/, '') || 'Unknown';
    let artist = 'Unknown Artist';
    let artworkUrl = null;
    try {
      const tag = await readTags(file);
      if (tag?.tags) {
        if (tag.tags.title) title = tag.tags.title;
        if (tag.tags.artist) artist = tag.tags.artist;
        const pic = tag.tags.picture;
        if (pic) artworkUrl = buildArtworkUrl({ data: pic.data, format: pic.format });
      }
    } catch (_) {}
    const audioUrl = URL.createObjectURL(file);
    setCurrentTrack({
      title,
      artist,
      artworkUrl: artworkUrl || undefined,
      albumArt: artworkUrl,
      audioUrl,
    });
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) processFile(f);
  };

  const onFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  return (
    <ScreenLayout title="Upload">
      <div style={{ paddingTop: 16 }}>
        <p className="text-secondary" style={{ marginBottom: 24, fontSize: 15 }}>
          Select an audio file from your device. It will play in the app with metadata and artwork.
        </p>

        <div
          className="liquid-glass-card"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            padding: 48,
            textAlign: 'center',
            border: dragging ? '2px dashed rgba(255,255,255,0.6)' : '2px dashed rgba(255,255,255,0.2)',
            transition: 'border-color 0.2s, background 0.2s',
            background: dragging ? 'rgba(255,255,255,0.15)' : undefined,
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            id="upload-input"
            onChange={onFileInput}
            disabled={uploading}
          />
          <label htmlFor="upload-input" style={{ cursor: 'pointer', display: 'block' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 17 }}>{uploading ? 'Processing…' : 'Drop file or tap to choose'}</div>
            <div className="text-tertiary" style={{ fontSize: 14 }}>MP3, M4A, OGG, WAV, FLAC</div>
          </label>
        </div>

        {error && (
          <p style={{ color: '#ff6b6b', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}
