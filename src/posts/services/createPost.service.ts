import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
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
// Note: SoundCloud oEmbed resolution is optional. For reliability in containerized
// environments we avoid doing network oEmbed requests and instead construct the
// embeddable player URL directly from the provided SoundCloud link.
import { saveImageToR2 } from './helpers/saveImageToR2';
import { RpcExceptionHelper } from '../../common';

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
      RpcExceptionHelper.badRequest('Auth token is required to create a post');
      return; // unreachable — RpcExceptionHelper throws, but helps TS narrowing
    }

    // Accept SoundCloud links either when the client sets provider:'soundcloud'
    // or when the post is `type: 'audio'` and the content URL contains soundcloud.com.
    if (
      (normalized.provider && normalized.provider.toLowerCase() === 'soundcloud') ||
      (normalized.type === 'audio' && /soundcloud\.com/.test(contentUrl))
    ) {
      if (!normalized.provider) normalized.provider = 'soundcloud';
      // Handle SoundCloud provider without performing network oEmbed requests.
      // Construct the embeddable player URL so the frontend can use the widget directly.
      normalized.type = 'audio';
      normalized.provider = 'soundcloud';
      normalized.provider_meta = {
        provider_url: contentUrl,
      };
      normalized.content = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        contentUrl,
      )}&color=%23ff5500&auto_play=false&show_artwork=true`;
    } else {
      // Assume image flow
      if (!contentUrl) {
        RpcExceptionHelper.badRequest('Image URL is required');
      }

      // Image flow: two supported inputs from the client:
      // - data: URL (base64) -> server will upload to R2 via saveImageToR2
      // - publicUrl already hosted in our storage (R2) -> accept as-is
      // Remote external URLs are rejected; the frontend must upload to storage
      // and supply the resulting publicUrl.
      normalized.type = 'image';

      if (contentUrl.startsWith('data:')) {
        // handle data URLs (base64)
        const publicUrl = await saveImageToR2(
          normalized.content ?? '',
          this.storageService,
        );
        normalized.content = publicUrl;
      } else if (contentUrl.startsWith('http://') || contentUrl.startsWith('https://')) {
        // accept only if the URL belongs to our configured publicUrl (already uploaded to R2)
        if (!this.storageService.isOwnPublicUrl(contentUrl)) {
          RpcExceptionHelper.badRequest(
            'Remote URLs are not accepted. Upload the file to storage and provide the public URL, or submit a data URL (data:image/...)',
          );
        }

        // Validate the uploaded object (HEAD) to ensure it's an image and accessible
        try {
          const { contentType } = await this.storageService.validatePublicUrl(contentUrl);
          if (!contentType.startsWith('image/')) {
            RpcExceptionHelper.badRequest('Uploaded object is not an image');
          }
        } catch (err) {
          this.logger.warn(`Validation failed for uploaded publicUrl: ${err?.message ?? err}`);
          RpcExceptionHelper.badRequest('Uploaded object is not accessible or invalid');
        }
      } else {
        RpcExceptionHelper.badRequest('Unsupported image content format');
      }
    }

    const post = await this.postModel.create(normalized);

    // Emit notification event (Notifications-MS resolves followers via ECST)
    this.client.emit('post.created', {
      type: 'new_post',
      message: `New post: ${normalized.title}`,
      userId: normalized.sql_user_id,
      postId: String(post._id),
    });

    // Emit event to promote user to ARTIST role 
    this.client.emit('user.publishedContent', {
      userId: normalized.sql_user_id,
    });

    this.logger.log(`Post created: ${String(post._id)}`);
    return post;
  }
}
