import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BackgroundProvider, useBackground } from './context/BackgroundContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { TabNavigationProvider } from './context/TabNavigationContext';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Search from './pages/Search';
import SearchResults from './pages/SearchResults';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Queue from './pages/Queue';
import Lyrics from './pages/Lyrics';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import PlaylistPage from './pages/PlaylistPage';
import FullScreenPlayer from './components/FullScreenPlayer';
import MiniPlayer from './components/MiniPlayer';
import BottomTabBar from './components/BottomTabBar';

function AppLayout() {
  const { background } = useBackground();
  const { currentTrack, fullScreenOpen } = usePlayer();
  const location = useLocation();

  const bgStyle = background?.url?.startsWith('http')
    ? { backgroundImage: `url(${background.url})` }
    : { background: background?.url || 'linear-gradient(135deg, #1a0a2e, #16213e)' };

  return (
    <>
      <div className="app-background dimmed" style={bgStyle} aria-hidden />

      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="app-shell">
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname + location.search}>
              <Route path="/" element={<Home />} />
              <Route path="/album/:id" element={<AlbumPage />} />
              <Route path="/artist/:id" element={<ArtistPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/search" element={<Search />} />
              <Route path="/search/results" element={<SearchResults />} />
              <Route path="/library" element={<Library />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/lyrics" element={<Lyrics />} />
            </Routes>
          </AnimatePresence>
        </main>

        {currentTrack && <MiniPlayer />}

        <BottomTabBar />
      </div>

      <AnimatePresence>
        {fullScreenOpen && <FullScreenPlayer />}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BackgroundProvider>
      <PlayerProvider>
        <TabNavigationProvider>
          <AppLayout />
        </TabNavigationProvider>
      </PlayerProvider>
    </BackgroundProvider>
  );
}
