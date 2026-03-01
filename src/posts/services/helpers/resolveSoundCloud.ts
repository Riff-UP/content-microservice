import { BadRequestException } from '@nestjs/common';

export interface SoundCloudResolved {
  media_url: string;
  provider_meta: Record<string, unknown>;
}

export async function resolveSoundCloud(
  url: string,
): Promise<SoundCloudResolved> {
  if (!url) throw new BadRequestException('SoundCloud URL is required');
  // Use oEmbed to validate and get embed HTML + thumbnail
  const oembed = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(
    url,
  )}`;
  const res = await fetch(oembed);
  if (!res.ok) throw new BadRequestException('Invalid SoundCloud URL');
  const json = (await res.json()) as Record<string, unknown>;
  const provider_meta: Record<string, unknown> = {
    title: json.title,
    author_name: json.author_name,
    thumbnail_url: json.thumbnail_url,
    embed_html: json.html,
    provider_url: url,
  };

  const media_url = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url,
  )}&color=%23ff5500&auto_play=false&show_artwork=true`;

  return { media_url, provider_meta };
}
