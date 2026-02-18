import React from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';

const TABS = [
  { id: 'featured', label: 'Featured', path: '/', icon: FeaturedIcon, iconActive: FeaturedIconActive },
  { id: 'playlists', label: 'Playlists', path: '/playlists', icon: PlaylistsIcon, iconActive: PlaylistsIconActive },
  { id: 'profile', label: 'Profile', path: '/profile', icon: ProfileIcon, iconActive: ProfileIconActive },
];

function FeaturedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FeaturedIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12.707 2.293a1 1 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13h1v7a2 2 0 0 0 2 2h4v-6h4v6h4a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9Z" />
    </svg>
  );
}

function PlaylistsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15V6" />
      <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M12 12H3" />
      <path d="M16 6H3" />
      <path d="M12 18H3" />
    </svg>
  );
}

function PlaylistsIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M1 6a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Zm1 5a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H2Zm18-3a3.5 3.5 0 1 0-1-6.916V6a1 1 0 1 0-2 0v9.05A3.5 3.5 0 0 0 20 14Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ProfileIconActive() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="7" r="5" />
      <path d="M3 21v-2a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export default function BottomTabBar() {
  const { currentTab, switchTab } = useTabNavigation();

  return (
    <nav className="bottom-tab-bar" role="tablist">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = isActive ? tab.iconActive : tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            className={`bottom-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            <span className="bottom-tab-icon">
              <Icon />
            </span>
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
