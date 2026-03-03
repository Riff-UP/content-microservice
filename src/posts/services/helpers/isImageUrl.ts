import { Logger } from '@nestjs/common';

const logger = new Logger('isImageUrl');

export async function isImageUrl(u: string): Promise<boolean> {
  if (!u) return false;

  // accept typical image file extensions and data URLs
  const imgExt = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i;
  if (u.startsWith('data:image/')) return true;
  if (imgExt.test(u)) return true;

  try {
    const parsed = new URL(u);
    if (imgExt.test(parsed.pathname)) return true;
  } catch {
    // not a valid URL or no extension
  }





  return false;
}
