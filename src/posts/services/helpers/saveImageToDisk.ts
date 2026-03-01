import { BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { randomBytes } from 'crypto';

export async function saveImageToDisk(url: string, token?: string) {
    if (!url) throw new BadRequestException('Image URL is required');

    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    await fs.mkdir(uploadsDir, { recursive: true });

    // handle data URLs
    if (url.startsWith('data:')) {
        const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!match) throw new BadRequestException('Invalid data image URL');
        const mime = match[1];
        const b64 = match[2];
        const ext = mime.split('/')[1].replace('+', '');
        const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
        const filePath = path.join(uploadsDir, name);
        const buffer = Buffer.from(b64, 'base64');
        await fs.writeFile(filePath, buffer);
        return filePath;
    }

    // remote URL: fetch and stream to disk
    const headers: Record<string, string> = {};
    if (token) headers['authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new BadRequestException(`Failed to fetch image: ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
        throw new BadRequestException('Remote URL did not return an image content-type');
    }

    // derive extension
    let ext = '';
    const ctParts = contentType.split('/');
    if (ctParts[1]) ext = ctParts[1].split(';')[0];
    if (ext.includes('jpeg')) ext = 'jpg';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, name);
    const dest = createWriteStream(filePath);
    await pipeline(res.body as any, dest);
    return filePath;
}
