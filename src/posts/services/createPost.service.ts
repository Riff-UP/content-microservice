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
import { resolveSoundCloud } from './helpers/resolveSoundCloud';
import { isImageUrl } from './helpers/isImageUrl';
import { saveImageToDisk } from './helpers/saveImageToDisk';
import { toPublicUploadsPath } from './helpers/toPublicUploadsPath';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly uploadService: UploadService,
  ) { }

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto, auth?: Record<string, any>) {
    // Normalize payload (shared validations)
    const normalized = this.uploadService.normalizePostPayload(
      createPostDto as any,
    );

    const type = (normalized.type || '').toString().toLowerCase();
    const url = (normalized.url || '').toString();

    // Require auth token to proceed (we use it for inserts/downloads)
    if (!auth || !auth._token) {
      throw new BadRequestException('Auth token is required to create a post');
    }

    if (normalized.provider && (normalized.provider || '').toString().toLowerCase() === 'soundcloud') {
      // Handle SoundCloud provider: resolve oEmbed, persist provider_meta and media url
      const resolved = await resolveSoundCloud(url);
      normalized.type = 'audio';
      normalized.provider = 'soundcloud';
      normalized.provider_meta = resolved.provider_meta;
      normalized.url = resolved.media_url; // this is the widget URL the frontend can use
    } else {
      // Assume image flow
      if (!url) {
        throw new BadRequestException('Image URL is required');
      }

      if (!isImageUrl(url)) {
        throw new BadRequestException('Provided URL does not look like an image');
      }

      // ensure type set to 'image'
      normalized.type = 'image';

      // Save image to disk and replace url with local path
      const savedPath = await saveImageToDisk(normalized.url, auth._token);
      // savedPath is absolute on disk; persist a web-accessible path under /uploads
      const publicPath = toPublicUploadsPath(savedPath);
      normalized.url = publicPath;
    }

    const post = await this.postModel.create(normalized as any);
    this.logger.log(`Post created: ${post.id}`);
    return post;
  }
}
