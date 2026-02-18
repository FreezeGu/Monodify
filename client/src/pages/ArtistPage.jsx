import React from 'react';
import { useParams } from 'react-router-dom';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassButton from '../components/GlassButton';

export default function ArtistPage() {
  const { id } = useParams();
  const { push } = useTabNavigation();

  return (
    <ScreenLayout>
      <div style={{ paddingTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Artist pages are not yet implemented.</p>
          <GlassButton onClick={() => push('/')} style={{ marginTop: 16 }}>
            Back to Featured
          </GlassButton>
        </div>
      </div>
    </ScreenLayout>
  );
}
