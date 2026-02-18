import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackground } from '../context/BackgroundContext';
import { uploadToImgBB } from '../config/imgbb';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

export default function BackgroundUpload({ variant = 'compact' }) {
  const { background, setCustomUrl, setDefault, getDefaults } = useBackground();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setUploadError(null);
    setUploading(true);

    try {
      // Upload to ImgBB
      const result = await uploadToImgBB(file);
      
      // Set the ImgBB URL as background (use display_url for best quality)
      setCustomUrl(result.displayUrl || result.url);
      
      // Store additional metadata if needed
      if (result.deleteUrl) {
        // Could store deleteUrl for future deletion feature
        console.log('Image uploaded successfully to ImgBB:', result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      // Don't show alert, let the error message display in the UI
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeCustom = () => {
    // Note: We don't delete from ImgBB here (would need deleteUrl)
    // The image will remain on ImgBB but won't be used as background
    setDefault(getDefaults()[0]);
  };

  const isCustomBackground = background?.id === 'custom';

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {getDefaults().map((bg) => (
          <button
            key={bg.id}
            type="button"
            className="liquid-glass-btn"
            style={{
              background: bg.url,
              border: background?.id === bg.id ? '2px solid rgba(255,255,255,0.9)' : undefined,
              width: 72,
              height: 72,
              borderRadius: 14,
              padding: 0,
            }}
            onClick={() => setDefault(bg)}
            aria-label={`Set background to ${bg.name}`}
          />
        ))}
        <label
          className="liquid-glass-btn"
          style={{
            width: 72,
            height: 72,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            border: dragActive ? '2px dashed rgba(255,255,255,0.5)' : undefined,
            pointerEvents: uploading ? 'none' : 'auto',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            disabled={uploading}
          />
        </label>
        {isCustomBackground && background?.url && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="liquid-glass-btn"
              style={{
                backgroundImage: `url(${background.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid rgba(255,255,255,0.9)',
                width: 72,
                height: 72,
                borderRadius: 14,
                padding: 0,
                position: 'relative',
              }}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change custom background"
            >
              <div
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustom();
                }}
                aria-label="Remove custom background"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full variant with drag-and-drop
  return (
    <div>
      <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
        Custom Background
      </h2>
      
      <GlassCard
        hoverable={false}
        style={{
          padding: 24,
          border: dragActive ? '2px dashed rgba(255,255,255,0.5)' : undefined,
          background: dragActive ? 'rgba(255,255,255,0.1)' : undefined,
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isCustomBackground && background?.url ? (
          <div>
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 12,
                backgroundImage: `url(${background.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: 16,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <GlassButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Image'}
              </GlassButton>
              <GlassButton variant="secondary" onClick={removeCustom} disabled={uploading}>
                Remove
              </GlassButton>
            </div>
            {uploadError && (
              <p className="text-tertiary" style={{ fontSize: 12, marginTop: 12, color: 'rgba(255, 100, 100, 0.8)' }}>
                {uploadError}
              </p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ margin: '0 auto 16px', opacity: 0.5 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {uploading ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  <span className="text-secondary">Uploading to ImgBB...</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-secondary" style={{ marginBottom: 16 }}>
                  Drag and drop an image here, or click to browse
                </p>
                <GlassButton onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  Choose Image
                </GlassButton>
                <p className="text-tertiary" style={{ fontSize: 12, marginTop: 12 }}>
                  Supported: JPG, PNG, WebP. Images are stored on ImgBB.
                </p>
              </>
            )}
            {uploadError && (
              <p className="text-tertiary" style={{ fontSize: 12, marginTop: 12, color: 'rgba(255, 100, 100, 0.8)' }}>
                {uploadError}
              </p>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          disabled={uploading}
        />
      </GlassCard>

      <div style={{ marginTop: 24 }}>
        <h3 className="text-secondary" style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          Default Backgrounds
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {getDefaults().map((bg) => (
            <button
              key={bg.id}
              type="button"
              className="liquid-glass-btn"
              style={{
                background: bg.url,
                border: background?.id === bg.id ? '2px solid rgba(255,255,255,0.9)' : undefined,
                width: 80,
                height: 80,
                borderRadius: 14,
                padding: 0,
              }}
              onClick={() => setDefault(bg)}
              aria-label={`Set background to ${bg.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
