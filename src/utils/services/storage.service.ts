import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import * as path from 'path';
import { envs } from '../../config/envs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: envs.r2.endpoint,
      credentials: {
        accessKeyId: envs.r2.accessKey,
        secretAccessKey: envs.r2.secretKey,
      },
    });
    this.bucket = envs.r2.bucket;
    this.publicUrl = envs.r2.publicUrl;
  }

  /**
   * Upload a buffer to R2 and return the public URL.
   */
  async upload(
    buffer: Buffer,
    originalName: string,
    contentType: string,
  ): Promise<string> {
    const ext = path.extname(originalName) || this.extFromMime(contentType);
    const key = `Images/${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const url = `${this.publicUrl}/${key}`;
    this.logger.log(`Uploaded to R2: ${key}`);
    return url;
  }

  /**
   * Delete an object from R2 by its public URL.
   */
  async delete(publicUrl: string): Promise<void> {
    const key = this.extractKey(publicUrl);
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    this.logger.log(`Deleted from R2: ${key}`);
  }

  /**
   * Extract the R2 key from a public URL.
   */
  extractKey(url: string): string {
    if (!url || !url.startsWith(this.publicUrl)) return '';
    return url.replace(`${this.publicUrl}/`, '');
  }

  /**
   * Derive file extension from MIME type.
   */
  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/bmp': '.bmp',
      'image/svg+xml': '.svg',
    };
    return map[mime] || '.bin';
  }
}
