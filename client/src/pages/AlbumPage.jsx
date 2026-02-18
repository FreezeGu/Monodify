import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';

export default function AlbumPage() {
  const { id } = useParams();
  const { setCurrentTrack } = usePlayer();
  const { push } = useTabNavigation();
  
  // Albums are not yet implemented - show empty state
  const album = null;

  return (
    <ScreenLayout>
      <div style={{ paddingTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Album pages are not yet implemented.</p>
          <GlassButton onClick={() => push('/')} style={{ marginTop: 16 }}>
            Back to Featured
          </GlassButton>
        </div>
      </div>
    </ScreenLayout>
  );
}
