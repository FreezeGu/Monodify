// Recommendation algorithm for nasheeds (optimized)
export function getRecommendations(userProfile, allNasheeds, userHistory = []) {
  if (!allNasheeds || allNasheeds.length === 0) return [];

  // Filter only approved nasheeds (already filtered in Featured, but keep for safety)
  const approvedNasheeds = allNasheeds.filter((n) => n.status === 'approved');
  
  // Limit processing to top 50 for performance
  const nasheedsToProcess = approvedNasheeds.slice(0, 50);

  // Pre-compute user preferences once
  const userGenres = userHistory
    .map((h) => h.genre)
    .filter((g) => g)
    .reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
  
  const artistCounts = userHistory.reduce((acc, h) => {
    if (h.artist) {
      acc[h.artist] = (acc[h.artist] || 0) + 1;
    }
    return acc;
  }, {});

  // Score each nasheed based on various factors
  const scored = nasheedsToProcess.map((nasheed) => {
    let score = 0;

    // 1. Genre preference (if user has liked similar genres)
    if (nasheed.genre && userGenres[nasheed.genre]) {
      score += userGenres[nasheed.genre] * 10;
    }

    // 2. Popularity (views and likes)
    score += (nasheed.views || 0) * 0.1;
    score += (nasheed.likes || 0) * 2;

    // 3. Recency (newer nasheeds get slight boost)
    if (nasheed.uploadedAt) {
      const daysSinceUpload = (Date.now() - new Date(nasheed.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpload < 30) {
        score += 5;
      }
    }

    // 4. Artist preference (if user has listened to this artist)
    if (nasheed.artist && artistCounts[nasheed.artist]) {
      score += artistCounts[nasheed.artist] * 5;
    }

    return { ...nasheed, score };
  });

  // Sort by score (highest first) - use partial sort for better performance
  scored.sort((a, b) => b.score - a.score);

  // Apply diversity filter (max 2 per artist, max 3 per genre in top 10)
  const diversified = [];
  const finalArtistCounts = {};
  const finalGenreCounts = {};

  for (const nasheed of scored) {
    if (diversified.length >= 10) break;
    
    const artistCount = finalArtistCounts[nasheed.artist] || 0;
    const genreCount = finalGenreCounts[nasheed.genre] || 0;

    if (artistCount < 2 && genreCount < 3) {
      diversified.push(nasheed);
      finalArtistCounts[nasheed.artist] = artistCount + 1;
      finalGenreCounts[nasheed.genre] = genreCount + 1;
    }
  }

  return diversified;
}

// Get "Made for You" playlists - public genre-based playlists available to everyone
export function getMadeForYouPlaylists(userProfile, allNasheeds, userHistory = []) {
  // Filter only approved nasheeds
  const approvedNasheeds = allNasheeds.filter((n) => n.status === 'approved');
  
  // Group ALL nasheeds by genre (not just recommendations)
  const byGenre = approvedNasheeds.reduce((acc, nasheed) => {
    const genre = (nasheed.genre || 'Other').trim();
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(nasheed);
    return acc;
  }, {});

  // Create public playlists for each genre
  // Sort genres by popularity (number of nasheeds)
  const playlists = Object.entries(byGenre)
    .filter(([genre, nasheeds]) => nasheeds.length > 0) // Only genres with nasheeds
    .sort((a, b) => b[1].length - a[1].length) // Sort by count descending
    .slice(0, 10) // Limit to top 10 genres
    .map(([genre, nasheeds]) => {
      // Sort nasheeds by popularity (views + likes)
      const sorted = [...nasheeds].sort((a, b) => {
        const scoreA = (a.views || 0) + (a.likes || 0) * 10;
        const scoreB = (b.views || 0) + (b.likes || 0) * 10;
        return scoreB - scoreA;
      });
      
      return {
        id: `made-for-you-${genre.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${genre} Mix`,
        subtitle: `${nasheeds.length} nasheeds`,
        image: sorted[0]?.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
        nasheeds: sorted.slice(0, 50), // Show up to 50 nasheeds per genre
      };
    });

  return playlists;
}
