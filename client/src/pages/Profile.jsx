import React, { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import BackgroundUpload from '../components/BackgroundUpload';

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

export default function Profile() {
  const [profile, setProfile] = useState(loadProfile);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const onSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScreenLayout showBackButton={false} title="Profile">
      <div style={{ paddingTop: 16 }}>
        <div className="liquid-glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--secondary-text)' }}>Display name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your name"
            className="liquid-glass-input"
            style={{ width: '100%', marginBottom: 16 }}
          />
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--secondary-text)' }}>Handle</label>
          <input
            type="text"
            value={profile.handle}
            onChange={(e) => update('handle', e.target.value)}
            placeholder="@username"
            className="liquid-glass-input"
            style={{ width: '100%', marginBottom: 16 }}
          />
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--secondary-text)' }}>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="A short bio..."
            rows={3}
            className="liquid-glass-input"
            style={{ width: '100%', resize: 'vertical', marginBottom: 20 }}
          />
          <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={onSave}>
            {saved ? 'Saved' : 'Save profile'}
          </button>
        </div>

        <div className="liquid-glass-section" style={{ padding: 20 }}>
          <BackgroundUpload variant="full" />
        </div>
      </div>
    </ScreenLayout>
  );
}
