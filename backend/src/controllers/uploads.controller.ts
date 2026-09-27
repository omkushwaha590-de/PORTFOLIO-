import type { Request, Response } from 'express';
import { storeImage } from '../services/storage.service';
import { AppError } from '../utils/app-error';

/** POST /admin/uploads (multipart, field `file`) — returns the public URL of the stored image. */
export async function uploadImage(req: Request, res: Response) {
  if (!req.file) throw AppError.badRequest('Attach an image in the "file" field');
  const stored = await storeImage(req.file.buffer);
  res.status(201).json({ data: stored });
}
