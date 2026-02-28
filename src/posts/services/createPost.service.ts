import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UploadService } from '../../utils/services/upload.service';

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

  async create(createPostDto: CreatePostDto) {
    // Normalize and validate provider links if present
    const normalized = this.uploadService.normalizePostPayload(
      createPostDto as any,
    );

    const post = await this.postModel.create(normalized as any);
    this.logger.log(`Post created: ${post.id}`);
    return post;
  }
}
