import { put } from '@vercel/blob';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { AppError } from '../utils/app-error';
import { detectImageType } from './file-signature';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

if (env.STORAGE_DRIVER === 'cloudinary') {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface StoredFile {
  url: string;
  mime: string;
  size: number;
}

/**
 * Validates an uploaded image by its magic bytes and stores it under a random, server-generated
 * name. The original filename is discarded entirely.
 */
export async function storeImage(buffer: Buffer): Promise<StoredFile> {
  const detected = detectImageType(buffer);
  if (!detected) throw AppError.badRequest('Only JPEG, PNG, WebP, GIF and AVIF images are allowed');

  const id = randomUUID();

  if (env.STORAGE_DRIVER === 'vercel-blob') {
    // Credentials come from BLOB_READ_WRITE_TOKEN, which Vercel sets when a Blob store is connected.
    const blob = await put(`portfolio/${id}.${detected.ext}`, buffer, {
      access: 'public',
      contentType: detected.mime,
      addRandomSuffix: false,
    });
    return { url: blob.url, mime: detected.mime, size: buffer.length };
  }

  if (env.STORAGE_DRIVER === 'cloudinary') {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'portfolio', public_id: id, resource_type: 'image', overwrite: false },
        (error, uploaded) => (error || !uploaded ? reject(error ?? new Error('Upload failed')) : resolve(uploaded)),
      );
      stream.end(buffer);
    });
    return { url: result.secure_url, mime: detected.mime, size: buffer.length };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${id}.${detected.ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer, { flag: 'wx' });
  return { url: `${env.PUBLIC_API_URL.replace(/\/$/, '')}/uploads/${filename}`, mime: detected.mime, size: buffer.length };
}
