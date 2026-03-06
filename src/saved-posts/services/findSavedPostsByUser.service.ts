import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';
import { Post, PostDocument } from '../../posts/schemas/post.schema';

export interface SavedPostWithPost {
  savedPostId: string;
  saved_at: Date | undefined;
  post: Record<string, unknown> | null;
}

@Injectable()
export class FindSavedPostsByUserService {
  private readonly logger = new Logger(FindSavedPostsByUserService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Devuelve los posts guardados por el usuario enriquecidos con los datos del post.
   * Ordena por más recientemente guardado.
   */
  async execute(sqlUserId: string): Promise<SavedPostWithPost[]> {
    const savedPosts = await this.savedPostModel
      .find({ sql_user_id: sqlUserId })
      .sort({ saved_at: -1 })
      .lean<Record<string, unknown>[]>()
      .exec();

    this.logger.log(
      `Found ${savedPosts.length} saved posts for user ${sqlUserId}`,
    );

    if (savedPosts.length === 0) return [];

    const postIds = savedPosts
      .map((sp) => {
        try {
          return new Types.ObjectId(sp['post_id'] as string);
        } catch {
          return null;
        }
      })
      .filter((id): id is Types.ObjectId => id !== null);

    const posts = await this.postModel
      .find({ _id: { $in: postIds }, deleted_at: { $exists: false } })
      .lean<Record<string, unknown>[]>()
      .exec();

    const postsMap = new Map<string, Record<string, unknown>>(
      posts.map((p) => {
        const id = (p['_id'] as Types.ObjectId).toHexString();
        return [id, { ...p, id }];
      }),
    );

    return savedPosts.map((sp) => ({
      savedPostId: (sp['_id'] as Types.ObjectId).toHexString(),
      saved_at: sp['saved_at'] as Date | undefined,
      post: postsMap.get(sp['post_id'] as string) ?? null,
    }));
  }
}
