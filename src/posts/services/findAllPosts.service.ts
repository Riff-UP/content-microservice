import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';

@Injectable()
export class FindAllPostsService {
  private readonly logger = new Logger(FindAllPostsService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Returns all posts, sorted by newest first.
   */
  async execute(): Promise<PostDocument[]> {
    const posts = await this.postModel.find().sort({ created_at: -1 }).exec();
    this.logger.log(`Found ${posts.length} posts`);
    return posts;
  }

  /**
   * Returns all posts for a specific user.
   */
  async byUser(sqlUserId: string): Promise<PostDocument[]> {
    return this.postModel
      .find({ sql_user_id: sqlUserId })
      .sort({ created_at: -1 })
      .exec();
  }
}
