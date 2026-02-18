import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';

const MOCK_PLAYLIST = {
  id: '1',
  title: 'My Favorites',
  description: 'A collection of my favorite nasheeds',
  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  owner: 'You',
  songCount: 24,
  tracks: [
    { id: '1', title: 'Bismillah', artist: 'Maher Zain', duration: '3:45', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', title: 'Allahu', artist: 'Sami Yusuf', duration: '4:12', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: '3', title: 'Salam', artist: 'Mesut Kurtis', duration: '3:30', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  ],
};

export default function PlaylistPage() {
  const { id } = useParams();
  const { setCurrentTrack } = usePlayer();
  const playlist = MOCK_PLAYLIST;

  const handlePlay = () => {
    if (playlist.tracks.length > 0) {
      setCurrentTrack({
        ...playlist.tracks[0],
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
              background: `url(${playlist.image}) center/cover`,
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{playlist.title}</h1>
          {playlist.description && (
            <p className="text-tertiary" style={{ fontSize: 14, marginBottom: 8 }}>{playlist.description}</p>
          )}
          <div className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
            {playlist.owner} • {playlist.songCount} songs
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <GlassButton onClick={handlePlay}>Play</GlassButton>
            <GlassButton variant="secondary" onClick={handlePlay}>Shuffle</GlassButton>
          </div>
        </section>

        <section>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
            Tracklist
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {playlist.tracks.map((track, index) => (
              <GlassListRow
                key={track.id}
                leftContent={
                  <img
                    src={track.image}
                    alt={track.title}
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                  />
                }
                rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{track.duration}</span>}
                onClick={() => {
                  setCurrentTrack({
                    ...track,
                  });
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{track.title}</div>
                <div className="text-tertiary" style={{ fontSize: 13 }}>{track.artist}</div>
              </GlassListRow>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
