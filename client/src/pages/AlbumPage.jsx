import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';

const MOCK_ALBUM = {
  id: '1',
  title: 'Thank You Allah',
  artist: 'Maher Zain',
  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  description: 'A beautiful collection of nasheeds praising Allah.',
  tracks: [
    { id: '1', title: 'Bismillah', duration: '3:45', trackNumber: 1 },
    { id: '2', title: 'Allahu', duration: '4:12', trackNumber: 2 },
    { id: '3', title: 'Salam', duration: '3:30', trackNumber: 3 },
  ],
};

export default function AlbumPage() {
  const { id } = useParams();
  const { setCurrentTrack } = usePlayer();
  const album = MOCK_ALBUM;

  const handlePlay = () => {
    if (album.tracks.length > 0) {
      setCurrentTrack({
        ...album.tracks[0],
        title: album.tracks[0].title,
        artist: album.artist,
        artworkUrl: album.image,
      });
    }
  };

  return (
    <ScreenLayout>
      <div style={{ paddingTop: 16 }}>
        <section style={{ marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 'min(280px, 75vw)',
              aspectRatio: '1',
              borderRadius: 16,
              background: `url(${album.image}) center/cover`,
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{album.title}</h1>
          <div className="text-secondary" style={{ fontSize: 16, marginBottom: 20 }}>{album.artist}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <GlassButton onClick={handlePlay}>Play</GlassButton>
            <GlassButton variant="secondary" onClick={handlePlay}>Shuffle</GlassButton>
          </div>
        </section>

        {album.description && (
          <section style={{ marginBottom: 32 }}>
            <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
              About
            </h2>
            <p className="text-tertiary" style={{ fontSize: 14, lineHeight: 1.6 }}>{album.description}</p>
          </section>
        )}

        <section>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
            Tracklist
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {album.tracks.map((track) => (
              <GlassListRow
                key={track.id}
                leftContent={
                  <span className="text-tertiary" style={{ fontSize: 15, width: 28, textAlign: 'center', fontWeight: 500 }}>
                    {track.trackNumber}
                  </span>
                }
                rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{track.duration}</span>}
                onClick={() => {
                  setCurrentTrack({
                    ...track,
                    title: track.title,
                    artist: album.artist,
                    artworkUrl: album.image,
                  });
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{track.title}</div>
              </GlassListRow>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
