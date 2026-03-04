import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { RpcExceptionHelper } from '../../common';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly publisher: PublisherService,
  ) {}

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto, auth?: { _token?: string }) {
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

    // Para type:'audio', validar SoundCloud
    if (createPostDto.type === 'audio') {
      const contentUrl = createPostDto.content || '';
      if (
        createPostDto.provider?.toLowerCase() === 'soundcloud' ||
        /soundcloud\.com/.test(contentUrl)
      ) {
        // Construir embed de SoundCloud
        createPostDto.provider = 'soundcloud';
        createPostDto.provider_meta = {
          provider_url: contentUrl,
        };
        createPostDto.content = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
          contentUrl,
        )}&color=%23ff5500&auto_play=false&show_artwork=true`;
      } else if (!createPostDto.content) {
        RpcExceptionHelper.badRequest(
          'content (audio URL) is required for audio posts',
        );
      }
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

    // Publish notification event
    await this.publisher.publish('post.created', {
      type: 'new_post',
      message: `New post: ${createPostDto.title}`,
      userId: createPostDto.sql_user_id,
      postId: String(post._id),
    });

    // Publish event to promote user to ARTIST role
    await this.publisher.publish('user.publishedContent', {
      userId: createPostDto.sql_user_id,
    });

    this.logger.log(`✅ Post created successfully: ${String(post._id)}`);
    return post;
  }
}
