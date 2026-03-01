import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class PostsService implements OnModuleInit {
  private readonly logger = new Logger('PostsService');

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  onModuleInit() {
    this.logger.log('PostsService initialized');
  }

  async create(createPostDto: CreatePostDto) {
    const post = await this.postModel.create(createPostDto);
    this.logger.log(`Post created: ${post.id}`);
    return post;
  }

  async findAll() {
    return await this.postModel.find().sort({ created_at: -1 }).exec();
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post) RpcExceptionHelper.notFound('Post', id);
    return post!;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    await this.findOne(id);
    return await this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.postModel.findByIdAndDelete(id).exec();
  }
}