export interface DetectedImage {
  ext: 'jpg' | 'png' | 'webp' | 'gif' | 'avif';
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/avif';
}

const startsWith = (buf: Buffer, bytes: number[], offset = 0) => bytes.every((byte, i) => buf[offset + i] === byte);
const ascii = (buf: Buffer, start: number, end: number) => buf.subarray(start, end).toString('latin1');

/**
 * Detects the real image type from the file's magic bytes. The client-supplied MIME type and
 * filename are never trusted. SVG is intentionally unsupported (it can carry scripts).
 */
export function detectImageType(buf: Buffer): DetectedImage | null {
  if (buf.length < 12) return null;

  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { ext: 'jpg', mime: 'image/jpeg' };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ext: 'png', mime: 'image/png' };
  if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return { ext: 'gif', mime: 'image/gif' };
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  if (ascii(buf, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(buf, 8, 12))) {
    return { ext: 'avif', mime: 'image/avif' };
  }
  return null;
}
