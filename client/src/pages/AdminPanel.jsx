import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassListRow from '../components/GlassListRow';
import NasheedDetailModal from '../components/NasheedDetailModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { setCurrentTrack } = usePlayer();
  const [nasheeds, setNasheeds] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected
  const [loading, setLoading] = useState(true);
  const [selectedNasheed, setSelectedNasheed] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    loadNasheeds();
  }, [isAdmin, filter]);

  const loadNasheeds = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'nasheeds'), where('status', '==', filter));
      const snapshot = await getDocs(q);
      setNasheeds(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error loading nasheeds:', err);
    }
    setLoading(false);
  };

  const updateStatus = async (nasheedId, newStatus) => {
    try {
      await updateDoc(doc(db, 'nasheeds', nasheedId), { 
        status: newStatus,
        // Update approvedAt timestamp when approving
        ...(newStatus === 'approved' && { approvedAt: new Date().toISOString() })
      });
      loadNasheeds(); // Reload to refresh the list
      
      // Clear cache so Featured page will reload with new approved nasheed
      localStorage.removeItem('monodify-nasheeds-cache');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleSaveEdit = async (nasheedId, editData) => {
    try {
      await updateDoc(doc(db, 'nasheeds', nasheedId), {
        ...editData,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setNasheeds(nasheeds.map(n => 
        n.id === nasheedId ? { ...n, ...editData } : n
      ));
      
      // Update selected nasheed if it's the one being edited
      if (selectedNasheed?.id === nasheedId) {
        setSelectedNasheed({ ...selectedNasheed, ...editData });
      }
      
      // Clear cache
      localStorage.removeItem('monodify-nasheeds-cache');
      
      alert('Nasheed updated successfully');
    } catch (err) {
      console.error('Error updating nasheed:', err);
      alert('Failed to update nasheed: ' + (err.message || 'Unknown error'));
    }
  };

  const deleteNasheed = async (nasheed) => {
    if (!window.confirm(`Are you sure you want to delete "${nasheed.title}" by ${nasheed.artist}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'nasheeds', nasheed.id));

      // Delete audio file from Storage
      if (nasheed.audioUrl) {
        try {
          // Extract the path from the download URL
          // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
          const url = new URL(nasheed.audioUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const audioRef = ref(storage, filePath);
            await deleteObject(audioRef);
          }
        } catch (storageErr) {
          console.warn('Error deleting audio file:', storageErr);
          // Continue even if storage delete fails
        }
      }

      // Delete image file from Storage
      if (nasheed.imageUrl && nasheed.imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const url = new URL(nasheed.imageUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const imageRef = ref(storage, filePath);
            await deleteObject(imageRef);
          }
        } catch (storageErr) {
          console.warn('Error deleting image file:', storageErr);
          // Continue even if storage delete fails
        }
      }

      // Remove from local state
      setNasheeds(nasheeds.filter((n) => n.id !== nasheed.id));
      
      // Clear cache so Featured page will reload
      localStorage.removeItem('monodify-nasheeds-cache');
    } catch (err) {
      console.error('Error deleting nasheed:', err);
      alert('Failed to delete nasheed: ' + (err.message || 'Unknown error'));
    }
  };

  if (!isAdmin) {
    return (
      <ScreenLayout title="Admin Panel">
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Access denied. Admin privileges required.</p>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Admin Panel">
      <div style={{ paddingTop: 16 }}>
        {/* Filter tabs */}
        <div className="glass-segmented-control" style={{ marginBottom: 24 }}>
          <div
            className={`glass-segmented-control-item ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({nasheeds.filter((n) => n.status === 'pending').length})
          </div>
          <div
            className={`glass-segmented-control-item ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </div>
          <div
            className={`glass-segmented-control-item ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p className="text-tertiary">Loading...</p>
          </div>
        ) : nasheeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p className="text-tertiary">No nasheeds found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {nasheeds.map((nasheed) => (
              <GlassCard key={nasheed.id} style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  {nasheed.imageUrl && (
                    <img
                      src={nasheed.imageUrl}
                      alt={nasheed.title}
                      style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{nasheed.title}</h3>
                    <p className="text-secondary" style={{ fontSize: 14, marginBottom: 8 }}>{nasheed.artist}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <span className="liquid-glass-btn" style={{ padding: '4px 8px', fontSize: 11 }}>
                        {nasheed.genre || 'No genre'}
                      </span>
                      {nasheed.isPoem && (
                        <span className="liquid-glass-btn" style={{ padding: '4px 8px', fontSize: 11, background: 'rgba(255, 200, 0, 0.2)' }}>
                          📜 Poem
                        </span>
                      )}
                      {nasheed.isAuthor && (
                        <span className="liquid-glass-btn" style={{ padding: '4px 8px', fontSize: 11 }}>
                          Author: {nasheed.authorName}
                        </span>
                      )}
                    </div>
                    {nasheed.description && (
                      <p className="text-tertiary" style={{ fontSize: 13, marginBottom: 8 }}>{nasheed.description}</p>
                    )}
                    <div className="text-tertiary" style={{ fontSize: 12 }}>
                      Uploaded: {new Date(nasheed.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {nasheed.subtitles && nasheed.subtitles.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="text-secondary" style={{ fontSize: 12, marginBottom: 8 }}>Subtitles Preview</div>
                    <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: 12 }}>
                      {nasheed.subtitles.slice(0, 3).map((sub, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                          <span className="text-tertiary">{sub.time}s:</span> {sub.text}
                          {sub.translation && <span className="text-tertiary"> ({sub.translation})</span>}
                        </div>
                      ))}
                      {nasheed.subtitles.length > 3 && (
                        <div className="text-tertiary" style={{ fontSize: 11 }}>
                          +{nasheed.subtitles.length - 3} more lines
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <GlassButton
                    onClick={() => setSelectedNasheed(nasheed)}
                    style={{ flex: 1, minWidth: 100 }}
                  >
                    View Details
                  </GlassButton>
                  {filter === 'pending' && (
                    <>
                      <GlassButton
                        onClick={() => updateStatus(nasheed.id, 'approved')}
                        style={{ flex: 1, minWidth: 100 }}
                      >
                        Approve
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        onClick={() => updateStatus(nasheed.id, 'rejected')}
                        style={{ flex: 1, minWidth: 100 }}
                      >
                        Reject
                      </GlassButton>
                    </>
                  )}
                  {/* Delete button - available for all statuses */}
                  <GlassButton
                    variant="secondary"
                    onClick={() => deleteNasheed(nasheed)}
                    style={{ 
                      padding: '8px 16px',
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      color: '#ff6b6b',
                      minWidth: 80,
                    }}
                  >
                    Delete
                  </GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNasheed && (
        <NasheedDetailModal
          nasheed={selectedNasheed}
          onClose={() => setSelectedNasheed(null)}
          onSave={handleSaveEdit}
        />
      )}
    </ScreenLayout>
  );
}
