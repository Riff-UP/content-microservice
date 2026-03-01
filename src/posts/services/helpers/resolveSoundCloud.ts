import { BadRequestException } from '@nestjs/common';

export async function resolveSoundCloud(url: string) {
    if (!url) throw new BadRequestException('SoundCloud URL is required');
    // Use oEmbed to validate and get embed HTML + thumbnail
    const oembed = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(
        url,
    )}`;
    const res = await fetch(oembed);
    if (!res.ok) throw new BadRequestException('Invalid SoundCloud URL');
    const json = await res.json();
    const provider_meta: any = {
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
