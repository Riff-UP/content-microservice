import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { envs } from '../../config/envs';
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
  private readonly client: ClientProxy;

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly uploadService: UploadService,
    private readonly storageService: StorageService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbitUrl],
        queue: 'riff_queue',
        queueOptions: { durable: true },
      },
    });
  }

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto, auth?: { _token?: string }) {
    // Normalize payload (shared validations)
    const normalized: NormalizedPostPayload =
      this.uploadService.normalizePostPayload(
        createPostDto as unknown as Record<string, unknown>,
      );

    const contentUrl = normalized.content ?? '';

    // Require auth token to proceed (we use it for inserts/downloads)
    if (!auth || !auth._token) {
      throw new BadRequestException('Auth token is required to create a post');
    }

    if (
      normalized.provider &&
      normalized.provider.toLowerCase() === 'soundcloud'
    ) {
      // Handle SoundCloud provider: resolve oEmbed, persist provider_meta and media url
      const resolved = await resolveSoundCloud(contentUrl);
      normalized.type = 'audio';
      normalized.provider = 'soundcloud';
      normalized.content = resolved.media_url; // this is the widget URL the frontend can use
    } else {
      // Assume image flow
      if (!contentUrl) {
        throw new BadRequestException('Image URL is required');
      }

      if (!isImageUrl(contentUrl)) {
        throw new BadRequestException(
          'Provided URL does not look like an image',
        );
      }

      // ensure type set to 'image'
      normalized.type = 'image';

      // Upload image to Cloudflare R2 and get public URL
      const publicUrl = await saveImageToR2(
        normalized.content ?? '',
        this.storageService,
        auth._token,
      );
      normalized.content = publicUrl;
    }

    const post = await this.postModel.create(normalized);

    // Emit notification event (Notifications-MS resolves followers via ECST)
    this.client.emit('post.created', {
      type: 'new_post',
      message: `New post: ${normalized.title}`,
      userId: normalized.sql_user_id,
      postId: String(post._id),
    });

    this.logger.log(`Post created: ${String(post._id)}`);
    return post;
  }
}
