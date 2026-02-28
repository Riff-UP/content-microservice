import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }

  async create(createPostDto: CreatePostDto) {
    const post = await this.postModel.create(createPostDto as any);
    this.logger.log(`Post created: ${post.id}`);
    return post;
  }
}
