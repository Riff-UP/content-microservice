export interface ProviderResult {
  provider: 'youtube' | 'soundcloud' | 'spotify' | 'bandcamp';
  embedUrl: string;
  originalUrl: string;
}

export function detectProvider(rawUrl: string): ProviderResult | null {
  const url = rawUrl.trim();

  // YouTube
  const ytLong = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytLong) {
    const videoId = ytLong[1];
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`,
      originalUrl: url,
    };
  }

  // SoundCloud
  if (/soundcloud\.com\//.test(url)) {
    return {
      provider: 'soundcloud',
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_artwork=true`,
      originalUrl: url,
    };
  }

  // Spotify
  const spotifyMatch = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/,
  );
  if (spotifyMatch) {
    const [, type, id] = spotifyMatch;
    return {
      provider: 'spotify',
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      originalUrl: url,
    };
  }

  // Bandcamp
  // https://artist.bandcamp.com/track/track-name
  if (/bandcamp\.com\//.test(url)) {
    return {
      provider: 'bandcamp',
      embedUrl: url, // frontend will render a link card
      originalUrl: url,
    };
  }

  return null;
}