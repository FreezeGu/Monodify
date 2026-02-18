import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import GlassButton from './GlassButton';

export default function NasheedDetailModal({ nasheed, onClose, onEdit, onSave }) {
  const { setCurrentTrack, isPlaying } = usePlayer();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: nasheed.title || '',
    artist: nasheed.artist || '',
    genre: nasheed.genre || '',
    description: nasheed.description || '',
    isPoem: nasheed.isPoem || false,
  });

  // Update editData when nasheed changes
  React.useEffect(() => {
    setEditData({
      title: nasheed.title || '',
      artist: nasheed.artist || '',
      genre: nasheed.genre || '',
      description: nasheed.description || '',
      isPoem: nasheed.isPoem || false,
    });
  }, [nasheed]);

  const handlePlay = () => {
    if (nasheed.audioUrl) {
      setCurrentTrack({
        id: nasheed.id,
        title: nasheed.title,
        artist: nasheed.artist,
        artworkUrl: nasheed.imageUrl,
        audioUrl: nasheed.audioUrl,
        lyrics: nasheed.lyrics,
      });
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(nasheed.id, editData);
    }
    setIsEditing(false);
  };

  const lyrics = nasheed.lyrics || {};
  const originalLyrics = lyrics.original || [];
  const translatedLyrics = lyrics.translated || [];

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="liquid-glass-card"
          style={{
            maxWidth: 600,
            maxHeight: '90vh',
            width: '100%',
            padding: 24,
            overflowY: 'auto',
            position: 'relative',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="liquid-glass-btn glass-btn-icon"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              padding: 0,
            }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Header */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {nasheed.imageUrl && (
              <img
                src={nasheed.imageUrl}
                alt={nasheed.title}
                style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="liquid-glass-input"
                    style={{ width: '100%', marginBottom: 8, fontSize: 18, fontWeight: 700 }}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editData.artist}
                    onChange={(e) => setEditData({ ...editData, artist: e.target.value })}
                    className="liquid-glass-input"
                    style={{ width: '100%', marginBottom: 8, fontSize: 14 }}
                    placeholder="Artist"
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <select
                      value={editData.genre}
                      onChange={(e) => setEditData({ ...editData, genre: e.target.value })}
                      className="liquid-glass-input"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      <option value="">Select genre</option>
                      {['Happy', 'War', 'Peaceful', 'Motivational', 'Religious', 'Spiritual', 'Other'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editData.isPoem}
                        onChange={(e) => setEditData({ ...editData, isPoem: e.target.checked })}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12 }}>📜 Poem</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{nasheed.title}</h2>
                  <p className="text-secondary" style={{ fontSize: 16, marginBottom: 12 }}>{nasheed.artist}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span className="liquid-glass-btn" style={{ padding: '6px 12px', fontSize: 12 }}>
                      {nasheed.genre || 'No genre'}
                    </span>
                    {nasheed.isPoem && (
                      <span className="liquid-glass-btn" style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(255, 200, 0, 0.2)' }}>
                        📜 Poem
                      </span>
                    )}
                  </div>
                </>
              )}

              {nasheed.audioUrl && (
                <GlassButton onClick={handlePlay} style={{ marginBottom: 12 }}>
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </GlassButton>
              )}
            </div>
          </div>

          {/* Description */}
          {isEditing ? (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--secondary-text)' }}>
                Description
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="liquid-glass-input"
                style={{ width: '100%', minHeight: 80 }}
                placeholder="Description"
              />
            </div>
          ) : (
            nasheed.description && (
              <div style={{ marginBottom: 24 }}>
                <h3 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Description
                </h3>
                <p className="text-tertiary" style={{ fontSize: 14, lineHeight: 1.6 }}>{nasheed.description}</p>
              </div>
            )
          )}

          {/* Lyrics */}
          {(originalLyrics.length > 0 || translatedLyrics.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <h3 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                Full Lyrics
              </h3>
              
              {originalLyrics.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="text-secondary" style={{ fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
                    Arabic (Original)
                  </div>
                  <div
                    className="liquid-glass-card"
                    style={{
                      padding: 16,
                      maxHeight: 200,
                      overflowY: 'auto',
                      fontSize: 14,
                      lineHeight: 1.8,
                    }}
                  >
                    {originalLyrics.map((word, i) => (
                      <span key={i} style={{ marginRight: 4 }}>
                        {word.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {translatedLyrics.length > 0 && (
                <div>
                  <div className="text-secondary" style={{ fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
                    English (Translated)
                  </div>
                  <div
                    className="liquid-glass-card"
                    style={{
                      padding: 16,
                      maxHeight: 200,
                      overflowY: 'auto',
                      fontSize: 14,
                      lineHeight: 1.8,
                    }}
                  >
                    {translatedLyrics.map((word, i) => (
                      <span key={i} style={{ marginRight: 4 }}>
                        {word.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtitles */}
          {nasheed.subtitles && nasheed.subtitles.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                Subtitles ({nasheed.subtitles.length} lines)
              </h3>
              <div
                className="liquid-glass-card"
                style={{
                  padding: 16,
                  maxHeight: 200,
                  overflowY: 'auto',
                  fontSize: 12,
                }}
              >
                {nasheed.subtitles.map((sub, i) => (
                  <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-tertiary" style={{ fontSize: 11 }}>{sub.time}s:</span>{' '}
                    <span>{sub.text}</span>
                    {sub.translation && (
                      <span className="text-tertiary" style={{ display: 'block', marginTop: 4 }}>
                        ({sub.translation})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ marginBottom: 24 }}>
            <div className="text-tertiary" style={{ fontSize: 12 }}>
              <div>Uploaded: {new Date(nasheed.uploadedAt).toLocaleString()}</div>
              {nasheed.uploadedBy && <div>User ID: {nasheed.uploadedBy}</div>}
              {nasheed.views !== undefined && <div>Views: {nasheed.views}</div>}
              {nasheed.likes !== undefined && <div>Likes: {nasheed.likes}</div>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {isEditing ? (
              <>
                <GlassButton onClick={handleSave} style={{ flex: 1 }}>
                  Save Changes
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                  Cancel
                </GlassButton>
              </>
            ) : (
              <>
                <GlassButton onClick={() => setIsEditing(true)} style={{ flex: 1 }}>
                  ✏️ Edit
                </GlassButton>
                <GlassButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                  Close
                </GlassButton>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
