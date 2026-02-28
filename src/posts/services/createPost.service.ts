import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UploadService } from '../../utils/services/upload.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { randomBytes } from 'crypto';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly uploadService: UploadService,
  ) {}

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto, auth?: Record<string, any>) {
    // Normalize payload (shared validations)
    const normalized = this.uploadService.normalizePostPayload(
      createPostDto as any,
    );

    // Enforce image-only for now
    const type = (normalized.type || '').toString().toLowerCase();
    const url = (normalized.url || '').toString();

    if (type && type !== 'image') {
      throw new BadRequestException('Only image posts are accepted for now');
    }

    if (!url) {
      throw new BadRequestException('Image URL is required');
    }

    if (!isImageUrl(url)) {
      throw new BadRequestException('Provided URL does not look like an image');
    }

    // ensure type set to 'image'
    normalized.type = 'image';

    // Require auth token to proceed (uses token to fetch private images if needed)
    if (!auth || !auth._token) {
      throw new BadRequestException('Auth token is required to create a post');
    }

    // Save image to disk and replace url with local path
    const savedPath = await saveImageToDisk(normalized.url, auth._token);
    // savedPath is absolute on disk; persist a web-accessible path under /uploads
    const publicPath = toPublicUploadsPath(savedPath);
    normalized.url = publicPath;

    const post = await this.postModel.create(normalized as any);
    this.logger.log(`Post created: ${post.id}`);
    return post;
  }
}

function isImageUrl(u: string) {
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

function toPublicUploadsPath(absolutePath: string) {
  // convert CWD/uploads/... to /uploads/...
  const cwd = process.cwd();
  const rel = path.relative(cwd, absolutePath).split(path.sep).join('/');
  return '/' + rel;
}

async function saveImageToDisk(url: string, token?: string) {
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
  if (!res.ok)
    throw new BadRequestException(`Failed to fetch image: ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new BadRequestException(
      'Remote URL did not return an image content-type',
    );
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
