import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRef, UserRefDocument } from './schemas/user-ref.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserRef.name)
    private readonly userRefModel: Model<UserRefDocument>,
  ) { }

  /**
   * Upsert user replica from auth.tokenGenerated event.
   * Stores user info + token in Mongo (user_refs collection).
   */
  async upsert(user: Record<string, any>, token?: string) {
    if (!user || (!user.user_id && !user.id)) {
      this.logger.warn('upsert called without user_id');
      return null;
    }

    const userId = user.user_id || user.id;

    const data: Record<string, any> = {
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      picture: user.picture,
      role: user.role,
    };

    if (token) {
      data.token = token;
    }

    const updated = await this.userRefModel.findOneAndUpdate(
      { user_id: userId },
      { $set: data },
      { upsert: true, new: true },
    );

    this.logger.log(`User ref upserted: ${userId}`);
    return updated;
  }

  /**
   * Get cached user replica from Mongo.
   */
  async get(userId: string): Promise<UserRefDocument | null> {
    if (!userId) return null;
    return this.userRefModel.findOne({ user_id: userId });
  }
}
