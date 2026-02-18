import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

// Export useAuth for BackgroundUpload component
export { useAuth };

// Default backgrounds - using high resolution (3840x2160 for 4K displays)
const DEFAULT_BACKGROUNDS = [
  { id: 'default-1', name: 'Cosmic', url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-2', name: 'Aurora', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-3', name: 'Sunset', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-4', name: 'Ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-5', name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-6', name: 'Desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-7', name: 'Mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3840&h=2160&fit=crop&q=95' },
  { id: 'default-8', name: 'City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=3840&h=2160&fit=crop&q=95' },
];

const STORAGE_KEY = 'monody-background'; // Fallback for non-logged-in users

const BackgroundContext = createContext(null);

export function BackgroundProvider({ children }) {
  // Safely get auth context (may not be available if AuthProvider isn't ready)
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (err) {
    // AuthProvider not available yet, continue without user
  }

  const [background, setBackground] = useState(() => {
    // Start with default background
    return { id: 'default-1', name: 'Cosmic', url: DEFAULT_BACKGROUNDS[0].url };
  });
  const [loading, setLoading] = useState(true);

  // Load background from Firestore when user logs in
  useEffect(() => {
    const loadBackground = async () => {
      if (user && user.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.background) {
              // Background stored in Firestore
              setBackground(userData.background);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Error loading background from Firestore:', err);
        }
      }
      
      // Fallback to localStorage for non-logged-in users or if Firestore fails
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.url) {
            setBackground(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (_) {}
      
      setLoading(false);
    };

    loadBackground();
  }, [user]);

  // Save background to Firestore when it changes
  useEffect(() => {
    if (!loading && background) {
      const saveBackground = async () => {
        if (user && user.uid) {
          try {
            // Save to Firestore
            await setDoc(
              doc(db, 'users', user.uid),
              { background },
              { merge: true }
            );
          } catch (err) {
            console.error('Error saving background to Firestore:', err);
            // Fallback to localStorage on error
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(background));
            } catch (_) {}
          }
        } else {
          // Save to localStorage for non-logged-in users
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(background));
          } catch (_) {}
        }
      };

      saveBackground();
    }
  }, [background, user, loading]);

  const setCustomUrl = (url) => {
    const newBackground = { id: 'custom', name: 'Custom', url };
    setBackground(newBackground);
  };

  const setDefault = (bg) => {
    setBackground(bg);
  };

  const getDefaults = () => DEFAULT_BACKGROUNDS;

  return (
    <BackgroundContext.Provider value={{ background, setCustomUrl, setDefault, getDefaults, setBackground, loading }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackground must be used inside BackgroundProvider');
  return ctx;
}
