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
import {
  UploadService,
  NormalizedPostPayload,
} from '../../utils/services/upload.service';
import { StorageService } from '../../utils/services/storage.service';
import { resolveSoundCloud } from './helpers/resolveSoundCloud';
import { isImageUrl } from './helpers/isImageUrl';
import { saveImageToR2 } from './helpers/saveImageToR2';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly uploadService: UploadService,
    private readonly storageService: StorageService,
  ) {}

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto, auth?: { _token?: string }) {
    // Normalize payload (shared validations)
    const normalized: NormalizedPostPayload =
      this.uploadService.normalizePostPayload(
        createPostDto as unknown as Record<string, unknown>,
      );

    const url = normalized.url ?? '';

    // Require auth token to proceed (we use it for inserts/downloads)
    if (!auth || !auth._token) {
      throw new BadRequestException('Auth token is required to create a post');
    }

    if (
      normalized.provider &&
      normalized.provider.toLowerCase() === 'soundcloud'
    ) {
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
        throw new BadRequestException(
          'Provided URL does not look like an image',
        );
      }

      // ensure type set to 'image'
      normalized.type = 'image';

      // Upload image to Cloudflare R2 and get public URL
      const publicUrl = await saveImageToR2(
        normalized.url ?? '',
        this.storageService,
        auth._token,
      );
      normalized.url = publicUrl;
    }

    const post = await this.postModel.create(normalized);
    this.logger.log(`Post created: ${String(post._id)}`);
    return post;
  }
}
