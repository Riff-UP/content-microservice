import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { PaginationDto, PaginatedResult } from '../../common';

@Injectable()
export class FindAllPostsService {
  private readonly logger = new Logger(FindAllPostsService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Returns paginated posts, sorted by newest first.
   */
  async execute(
    pagination?: PaginationDto,
  ): Promise<PaginatedResult<PostDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.postModel
        .find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments().exec(),
    ]);

    this.logger.log(
      `Found ${data.length} posts (page ${page}/${Math.ceil(total / limit)})`,
    );
    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
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
