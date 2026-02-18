import React, { useState } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import BackgroundUpload from '../components/BackgroundUpload';
import GlassCard from '../components/GlassCard';

const defaults = { name: '', handle: '', bio: '' };
const STORAGE_KEY = 'monody-profile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch (_) {}
  return defaults;
}

function saveProfile(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (_) {}
}

const PUBLIC_PLAYLISTS = [
  { id: '1', title: 'My Favorites', songCount: 24, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '3', title: 'Ramadan Vibes', songCount: 32, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
];

export default function Profile() {
  const { push } = useTabNavigation();
  const [profile, setProfile] = useState(loadProfile);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const update = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const onSave = () => {
    saveProfile(profile);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = profile.name || 'User';
  const displayHandle = profile.handle || '@username';

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 8 }}>
        {/* Profile header - Spotify style */}
        <div className="profile-header" style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* Avatar */}
          <div className="profile-avatar" style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
            border: '2px solid rgba(255,255,255,0.15)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.25)',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{displayName}</h1>
          <p className="text-tertiary" style={{ fontSize: 14, marginBottom: 12 }}>{displayHandle}</p>
          {profile.bio && (
            <p className="text-secondary" style={{ fontSize: 14, marginBottom: 12, maxWidth: 280, margin: '0 auto 12px' }}>
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginBottom: 16,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>2</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Playlists</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>47</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Liked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>12</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Following</div>
            </div>
          </div>

          <button
            className="liquid-glass-btn"
            onClick={() => setEditMode(!editMode)}
            style={{ padding: '8px 24px', fontSize: 14 }}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile form */}
        {editMode && (
          <div className="liquid-glass-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Display name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your name"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Handle</label>
            <input
              type="text"
              value={profile.handle}
              onChange={(e) => update('handle', e.target.value)}
              placeholder="@username"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => update('bio', e.target.value)}
              placeholder="Tell everyone about yourself..."
              rows={3}
              className="liquid-glass-input"
              style={{ width: '100%', resize: 'vertical', marginBottom: 20 }}
            />
            <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={onSave}>
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Public Playlists */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Public Playlists</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {PUBLIC_PLAYLISTS.map((p) => (
              <GlassCard
                key={p.id}
                hoverable
                onClick={() => push(`/playlist/${p.id}`)}
                style={{ flexShrink: 0, width: 150, padding: 12 }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: `url(${p.image}) center/cover`,
                  marginBottom: 10,
                }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                <div className="text-tertiary" style={{ fontSize: 12 }}>{p.songCount} songs</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Settings</h2>

          {/* Upload Audio link */}
          <div
            className="glass-list-row"
            onClick={() => push('/upload')}
            style={{ borderRadius: 12, cursor: 'pointer', padding: '14px 16px', marginBottom: 8 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Upload Audio</div>
              <div className="text-tertiary" style={{ fontSize: 13 }}>Add your own nasheeds</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tertiary-text)" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Background customization */}
          <div className="liquid-glass-card" style={{ padding: 16, marginTop: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Background</h3>
            <BackgroundUpload variant="full" />
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
