import { BadRequestException, Logger } from '@nestjs/common';
import { StorageService } from '../../../utils/services/storage.service';
import { randomBytes } from 'crypto';
import { isImageUrl } from './isImageUrl';

const logger = new Logger('saveImageToR2');

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

  // ── Remote URLs are not accepted anymore ──
  // The frontend should either submit a `data:` URL (base64) or upload the file
  // directly to storage (presigned PUT) and provide the resulting public URL.
  if (url.startsWith('http://') || url.startsWith('https://')) {
    throw new BadRequestException(
      'Remote URLs are not accepted. Upload the file to storage and provide the public URL, or submit a data URL (data:image/...)',
    );
  }

  throw new BadRequestException('Unsupported URL format');
}
