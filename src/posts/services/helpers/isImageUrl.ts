export function isImageUrl(u: string) {
  if (!u) return false;
  // accept typical image file extensions and data URLs
  const imgExt = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i;
  if (u.startsWith('data:image/')) return true;
  if (imgExt.test(u)) return true;
  try {
    const parsed = new URL(u);
    return imgExt.test(parsed.pathname);
  } catch (e) {
    return false;
  }
}
