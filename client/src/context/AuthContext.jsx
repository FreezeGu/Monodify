import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load user profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          // Update profile picture from Google if available and not set
          if (!profileData.profilePicture && firebaseUser.photoURL) {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              profilePicture: firebaseUser.photoURL,
            }, { merge: true });
            setUserProfile({ id: firebaseUser.uid, ...profileData, profilePicture: firebaseUser.photoURL });
          } else {
            setUserProfile({ id: firebaseUser.uid, ...profileData });
          }
        } else {
          // Create default profile with Google data if available
          const defaultProfile = {
            name: firebaseUser.displayName || '',
            handle: firebaseUser.email?.split('@')[0] || '',
            bio: '',
            background: null,
            profilePicture: firebaseUser.photoURL || null,
            admin: false,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
          setUserProfile({ id: firebaseUser.uid, ...defaultProfile });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, displayName, handle) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    const userProfile = {
      name: displayName,
      handle: handle || `@${displayName.toLowerCase().replace(/\s+/g, '')}`,
      bio: '',
      background: null,
      admin: false,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    return userCredential.user;
  };

  const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    // Check if profile exists, if not create one with Google profile picture
    const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!profileDoc.exists()) {
      const defaultProfile = {
        name: firebaseUser.displayName || '',
        handle: firebaseUser.email?.split('@')[0] || '',
        bio: '',
        background: null,
        profilePicture: firebaseUser.photoURL || null, // Save Google profile picture
        admin: false,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
    } else {
      // Update profile picture if user doesn't have one but Google provides it
      const existingProfile = profileDoc.data();
      if (!existingProfile.profilePicture && firebaseUser.photoURL) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          profilePicture: firebaseUser.photoURL,
        }, { merge: true });
      }
      // Update name if it's empty but Google provides it
      if (!existingProfile.name && firebaseUser.displayName) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName,
        }, { merge: true });
      }
    }
    
    return firebaseUser;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    isAdmin: userProfile?.admin === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
