import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_BACKGROUNDS = [
  { id: 'default-1', name: 'Dusk', url: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)' },
  { id: 'default-2', name: 'Deep night', url: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)' },
  { id: 'default-3', name: 'Amber', url: 'linear-gradient(145deg, #2d1b0e 0%, #4a2c0a 40%, #1a0a00 100%)' },
  { id: 'default-4', name: 'Teal', url: 'linear-gradient(160deg, #0d1b1b 0%, #1a3a3a 50%, #0d2828 100%)' },
];

const STORAGE_KEY = 'monody-background';

const BackgroundContext = createContext(null);

export function BackgroundProvider({ children }) {
  const [background, setBackground] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.url) return parsed;
      }
    } catch (_) {}
    return { id: 'default-1', name: 'Dusk', url: DEFAULT_BACKGROUNDS[0].url };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(background));
    } catch (_) {}
  }, [background]);

  const setCustomUrl = (url) => setBackground({ id: 'custom', name: 'Custom', url });
  const setDefault = (bg) => setBackground(bg);
  const getDefaults = () => DEFAULT_BACKGROUNDS;

  return (
    <BackgroundContext.Provider value={{ background, setCustomUrl, setDefault, getDefaults }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackground must be used inside BackgroundProvider');
  return ctx;
}
