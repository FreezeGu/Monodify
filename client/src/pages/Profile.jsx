import React, { useState, useEffect } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import { useAuth } from '../context/AuthContext';
import { useBackground } from '../context/BackgroundContext';
import ScreenLayout from '../components/ScreenLayout';
import BackgroundUpload from '../components/BackgroundUpload';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function Profile() {
  const { push } = useTabNavigation();
  const { user, userProfile, loading, signUp, signIn, signInWithGoogle, logout, updateUserProfile, isAdmin } = useAuth();
  const { background, setBackground } = useBackground();
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', handle: '' });
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      // Load user's public playlists
      loadPublicPlaylists();
      // Load user's background from profile
      if (userProfile.background) {
        setBackground(userProfile.background);
      }
    }
  }, [user, userProfile]);

  const loadPublicPlaylists = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid), where('public', '==', true));
      const snapshot = await getDocs(q);
      setPublicPlaylists(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      setAuthError('Please fill in all required fields');
      return;
    }
    if (registerData.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      await signUp(registerData.email, registerData.password, registerData.name, registerData.handle);
      setShowRegister(false);
      setRegisterData({ name: '', email: '', password: '', handle: '' });
    } catch (error) {
      setAuthError(error.message || 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!registerData.email || !registerData.password) {
      setAuthError('Please enter email and password');
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      await signIn(registerData.email, registerData.password);
      setShowRegister(false);
      setRegisterData({ name: '', email: '', password: '', handle: '' });
    } catch (error) {
      setAuthError(error.message || 'Failed to log in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setShowRegister(false);
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      await updateUserProfile({
        name: userProfile.name,
        handle: userProfile.handle,
        bio: userProfile.bio,
      });
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert(error.message || 'Failed to save profile');
    }
  };

  // Helper to update profile state locally (auto-saves to Firebase)
  const updateProfileField = (field, value) => {
    if (!userProfile) return;
    const updated = { ...userProfile, [field]: value };
    setUserProfile(updated);
    // Auto-save to Firebase (debounced in updateUserProfile)
    updateUserProfile({ [field]: value }).catch(err => {
      console.error('Failed to save field:', err);
    });
  };

  const handleBackgroundUpdate = async (bgData) => {
    if (!userProfile) return;
    try {
      await updateUserProfile({ background: bgData });
      // BackgroundContext will be updated via Profile's useEffect that watches userProfile.background
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };

  // Sync background from Firebase to BackgroundContext
  useEffect(() => {
    if (userProfile?.background) {
      setBackground(userProfile.background);
    }
  }, [userProfile?.background]);

  if (loading) {
    return (
      <ScreenLayout showBackButton={false}>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ScreenLayout>
    );
  }

  // Registration/Login Screen - Modern Spotify-style
  if (!user || showRegister) {
    return (
      <ScreenLayout showBackButton={false}>
        <div style={{ paddingTop: 32, maxWidth: 440, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
          {/* Logo/Brand */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h1 className="monodify-logo" style={{ fontSize: 56, fontWeight: 700, marginBottom: 8 }}>
              Monodify
            </h1>
            <p className="text-secondary" style={{ fontSize: 16 }}>
              {showRegister ? 'Sign up to start listening' : 'Welcome back'}
            </p>
          </div>

          <div className="liquid-glass-card" style={{ padding: 32 }}>
            {/* Google Sign In Button - Modern */}
            <GlassButton
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '14px',
                marginBottom: 24,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {authLoading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </GlassButton>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
              <span className="text-tertiary" style={{ padding: '0 16px', fontSize: 13 }}>
                OR
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Error Message */}
            {authError && (
              <div
                className="liquid-glass-card"
                style={{
                  padding: 12,
                  marginBottom: 20,
                  background: 'rgba(255, 107, 107, 0.15)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                }}
              >
                <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{authError}</p>
              </div>
            )}

            {/* Email/Password Form */}
            {showRegister && (
              <>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary-text)' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, name: e.target.value });
                    setAuthError('');
                  }}
                  placeholder="What should we call you?"
                  className="liquid-glass-input"
                  style={{ width: '100%', marginBottom: 20 }}
                  disabled={authLoading}
                />
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary-text)' }}>
                  Username (optional)
                </label>
                <input
                  type="text"
                  value={registerData.handle}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, handle: e.target.value });
                    setAuthError('');
                  }}
                  placeholder="@username"
                  className="liquid-glass-input"
                  style={{ width: '100%', marginBottom: 20 }}
                  disabled={authLoading}
                />
              </>
            )}

            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary-text)' }}>
              Email address
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => {
                setRegisterData({ ...registerData, email: e.target.value });
                setAuthError('');
              }}
              placeholder="name@domain.com"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 20 }}
              disabled={authLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showRegister && registerData.password) {
                  handleLogin();
                }
              }}
            />

            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--primary-text)' }}>
              Password
            </label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => {
                setRegisterData({ ...registerData, password: e.target.value });
                setAuthError('');
              }}
              placeholder="Enter your password"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 24 }}
              disabled={authLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (showRegister) {
                    handleRegister();
                  } else {
                    handleLogin();
                  }
                }
              }}
            />

            {/* Submit Button */}
            <GlassButton
              onClick={showRegister ? handleRegister : handleLogin}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '14px',
                marginBottom: 16,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {authLoading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', marginRight: 8, animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {showRegister ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                showRegister ? 'Sign up' : 'Log in'
              )}
            </GlassButton>

            {/* Toggle Sign up/Log in */}
            <div style={{ textAlign: 'center' }}>
              <button
                className="liquid-glass-btn"
                onClick={() => {
                  setShowRegister(!showRegister);
                  setAuthError('');
                  setRegisterData({ name: '', email: '', password: '', handle: '' });
                }}
                disabled={authLoading}
                style={{
                  padding: '10px',
                  fontSize: 14,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--secondary-text)',
                }}
              >
                {showRegister ? (
                  <>
                    Already have an account? <span style={{ color: 'var(--primary-text)', fontWeight: 600 }}>Log in</span>
                  </>
                ) : (
                  <>
                    Don't have an account? <span style={{ color: 'var(--primary-text)', fontWeight: 600 }}>Sign up</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terms/Privacy */}
          <p className="text-tertiary" style={{ fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 1.5 }}>
            By continuing, you agree to Monodify's Terms of Service and Privacy Policy.
          </p>
        </div>
      </ScreenLayout>
    );
  }

  const displayName = userProfile?.name || 'User';
  const displayHandle = userProfile?.handle || '@username';

  // Profile Screen
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
            background: userProfile?.profilePicture 
              ? `url(${userProfile.profilePicture}) center/cover`
              : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
            border: '2px solid rgba(255,255,255,0.15)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}>
            {!userProfile?.profilePicture && (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{displayName}</h1>
          <p className="text-tertiary" style={{ fontSize: 14, marginBottom: 12 }}>{displayHandle}</p>
          {userProfile?.bio && (
            <p className="text-secondary" style={{ fontSize: 14, marginBottom: 12, maxWidth: 280, margin: '0 auto 12px' }}>
              {userProfile.bio}
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
              <div style={{ fontWeight: 700, fontSize: 18 }}>{publicPlaylists.length}</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Playlists</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>0</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Liked</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>0</div>
              <div className="text-tertiary" style={{ fontSize: 12 }}>Following</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <GlassButton
              onClick={() => setEditMode(!editMode)}
              style={{ padding: '8px 24px', fontSize: 14 }}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </GlassButton>
            {isAdmin && (
              <GlassButton
                variant="secondary"
                onClick={() => push('/admin')}
                style={{ padding: '8px 24px', fontSize: 14 }}
              >
                Admin Panel
              </GlassButton>
            )}
            <GlassButton
              variant="secondary"
              onClick={logout}
              style={{ padding: '8px 24px', fontSize: 14 }}
            >
              Log out
            </GlassButton>
          </div>
        </div>

        {/* Edit Profile form */}
        {editMode && userProfile && (
          <div className="liquid-glass-card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Display name</label>
            <input
              type="text"
              value={userProfile.name || ''}
              onChange={(e) => updateProfileField('name', e.target.value)}
              placeholder="Your name"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />
            {user?.photoURL && (
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <p className="text-secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  Profile picture from Google
                </p>
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid rgba(255,255,255,0.1)'
                  }} 
                />
              </div>
            )}
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Handle</label>
            <input
              type="text"
              value={userProfile.handle || ''}
              onChange={(e) => updateProfileField('handle', e.target.value)}
              placeholder="@username"
              className="liquid-glass-input"
              style={{ width: '100%', marginBottom: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--secondary-text)' }}>Bio</label>
            <textarea
              value={userProfile.bio || ''}
              onChange={(e) => updateProfileField('bio', e.target.value)}
              placeholder="Tell everyone about yourself..."
              rows={3}
              className="liquid-glass-input"
              style={{ width: '100%', resize: 'vertical', marginBottom: 20 }}
            />
            <GlassButton onClick={handleSave} style={{ width: '100%' }}>
              {saved ? 'Saved!' : 'Save Profile'}
            </GlassButton>
          </div>
        )}

        {/* Public Playlists */}
        {publicPlaylists.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Public Playlists</h2>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              {publicPlaylists.map((p) => (
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
                    background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    marginBottom: 10,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  }} />
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 12 }}>{p.songCount || 0} songs</div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* Settings */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Settings</h2>

          {/* Upload Nasheed link */}
          <div
            className="glass-list-row"
            onClick={() => push('/upload-nasheed')}
            style={{ borderRadius: 12, cursor: 'pointer', padding: '14px 16px', marginBottom: 8 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Upload Nasheed</div>
              <div className="text-tertiary" style={{ fontSize: 13 }}>Submit nasheeds for review</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tertiary-text)" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Background customization */}
          <div className="liquid-glass-card" style={{ padding: 16, marginTop: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Background</h3>
            <BackgroundUpload variant="full" onUploadComplete={handleBackgroundUpdate} />
          </div>
        </section>

        {/* Disclaimer */}
        <section style={{ marginBottom: 24 }}>
          <div className="liquid-glass-card" style={{ padding: 16 }}>
            <p className="text-tertiary" style={{ fontSize: 11, lineHeight: 1.6, textAlign: 'center' }}>
              <strong>Disclaimer:</strong> The author of this website does not condemn or support any actions called in any of the nasheeds.
            </p>
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
