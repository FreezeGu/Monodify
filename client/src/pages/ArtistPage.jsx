import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';

const MOCK_ARTIST = {
  id: '1',
  name: 'Maher Zain',
  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  popularTracks: [
    { id: '1', title: 'Bismillah', duration: '3:45', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', title: 'Allahu', duration: '4:12', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: '3', title: 'Salam', duration: '3:30', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  ],
  albums: [
    { id: '1', title: 'Thank You Allah', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', title: 'Forgive Me', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  ],
};

export default function ArtistPage() {
  const { id } = useParams();
  const { setCurrentTrack } = usePlayer();
  const { push } = useTabNavigation();
  const artist = MOCK_ARTIST;

  const handleShuffle = () => {
    if (artist.popularTracks.length > 0) {
      setCurrentTrack({
        ...artist.popularTracks[0],
        artist: artist.name,
      });
    }
  };

  return (
    <ScreenLayout>
      <div style={{ paddingTop: 16 }}>
        <section style={{ marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `url(${artist.image}) center/cover`,
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>{artist.name}</h1>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <GlassButton variant="secondary">Follow</GlassButton>
            <GlassButton variant="secondary" onClick={handleShuffle}>Shuffle</GlassButton>
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
            Popular
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {artist.popularTracks.map((track) => (
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
                    artist: artist.name,
                  });
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{track.title}</div>
              </GlassListRow>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
            Albums
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {artist.albums.map((album) => (
              <GlassCard key={album.id} hoverable onClick={() => push(`/album/${album.id}`)}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: `url(${album.image}) center/cover`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 15 }}>{album.title}</div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
