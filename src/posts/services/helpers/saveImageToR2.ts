import { BadRequestException } from '@nestjs/common';
import { StorageService } from '../../../utils/services/storage.service';
import { randomBytes } from 'crypto';

/**
 * Fetch an image from a URL (remote or data:base64) and upload it to R2.
 * Returns the public URL from R2.
 */
export async function saveImageToR2(
  url: string,
  storageService: StorageService,
  token?: string,
): Promise<string> {
  if (!url) throw new BadRequestException('Image URL is required');

  // ── Handle data URLs (base64) ──
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) throw new BadRequestException('Invalid base64 image URL');

    const mime = match[1];
    const b64 = match[2];
    const buffer = Buffer.from(b64, 'base64');
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}.img`;

    return storageService.upload(buffer, name, mime);
  }

  // ── Handle remote URLs ──
  const headers: Record<string, string> = {};
  if (token) headers['authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new BadRequestException(`Failed to fetch image: ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new BadRequestException(
      'Remote URL did not return an image content-type',
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.img`;

  return storageService.upload(buffer, name, contentType);
}
