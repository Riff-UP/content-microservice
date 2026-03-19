import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { RpcExceptionHelper } from '../../common';
import { detectProvider } from '../utils/provider-detector.util';
import { UsersService } from '../../users/users.service';

type ArtistSnapshot = {
  name?: string;
  slug?: string;
  picture?: string;
};

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');
  private readonly frontendBaseUrl =
    process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL || '';

  private trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
  }

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly publisher: PublisherService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(
    createPostDto: CreatePostDto,
    auth?: { _token?: string },
    artist?: ArtistSnapshot,
  ) {
    this.logger.log(`Creating post: ${JSON.stringify(createPostDto)}`);

    // Require auth token
    if (!auth || !auth._token) {
      RpcExceptionHelper.badRequest('Auth token is required to create a post');
      return;
    }

    // Validar campos requeridos
    if (!createPostDto.sql_user_id) {
      RpcExceptionHelper.badRequest('sql_user_id is required');
    }
    if (!createPostDto.title) {
      RpcExceptionHelper.badRequest('title is required');
    }
    if (!createPostDto.type) {
      RpcExceptionHelper.badRequest('type is required');
    }

    // Para type:'image', content debe tener la URL (ya procesada por el gateway)
    if (createPostDto.type === 'image' && !createPostDto.content) {
      RpcExceptionHelper.badRequest(
        'content (image URL) is required for image posts',
      );
    }

    // ── Para type:'audio', detectar proveedor automáticamente ──
    if (createPostDto.type === 'audio') {
      const rawUrl = createPostDto.content || '';

      if (!rawUrl) {
        RpcExceptionHelper.badRequest(
          'content (URL de la canción) es requerido para posts de audio',
        );
        return;
      }

      const detected = detectProvider(rawUrl);

      if (!detected) {
        RpcExceptionHelper.badRequest(
          'URL no reconocida. Pega un enlace de YouTube, SoundCloud, Spotify o Bandcamp.',
        );
        return;
      }

      this.logger.log(
        `🎵 Provider detected: ${detected.provider} for URL: ${rawUrl}`,
      );

      // Sobrescribir con los valores normalizados
      createPostDto.provider = detected.provider;
      createPostDto.content = detected.embedUrl;
      createPostDto.provider_meta = {
        provider_url: detected.originalUrl,
      };
    }

    // Crear post
    const post = await this.postModel.create({
      sql_user_id: createPostDto.sql_user_id,
      type: createPostDto.type,
      title: createPostDto.title,
      description: createPostDto.description,
      content: createPostDto.content,
      provider: createPostDto.provider,
      ...(createPostDto.provider_meta && {
        provider_meta: createPostDto.provider_meta,
      }),
    } as any);

    const artistRef =
      artist ?? (await this.usersService.get(createPostDto.sql_user_id));
    const postId = String(post._id);
    const pathBase = createPostDto.postPathBase || '/posts';
    const normalizedPathBase = pathBase.startsWith('/')
      ? pathBase
      : `/${pathBase}`;
    const urlBaseFromPayload = createPostDto.postUrlBase?.trim() || '';
    const urlBaseFromEnv = this.frontendBaseUrl
      ? `${this.trimTrailingSlash(this.frontendBaseUrl)}${normalizedPathBase}`
      : '';
    const postUrlBase = urlBaseFromPayload || urlBaseFromEnv;
    const postUrl = postUrlBase
      ? `${this.trimTrailingSlash(postUrlBase)}/${postId}`
      : `${this.trimTrailingSlash(normalizedPathBase)}/${postId}`;

    // Publish notification event
    await this.publisher.publish('post.created', {
      type: 'new_post',
      message: `New post: ${createPostDto.title}`,
      userId: createPostDto.sql_user_id,
      artistName: createPostDto.artistName || artistRef?.name,
      artistSlug: createPostDto.artistSlug || artistRef?.slug,
      artistAvatar: createPostDto.artistAvatar || artistRef?.picture,
      postId,
      postUrl,
      deepLink: postUrl,
    });

    // Publish event to promote user to ARTIST role
    await this.publisher.publish('user.publishedContent', {
      userId: createPostDto.sql_user_id,
    });

    this.logger.log(`Post created successfully: ${String(post._id)}`);
    return post;
  }
}