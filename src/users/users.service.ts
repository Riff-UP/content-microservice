import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRef, UserRefDocument } from './schemas/user-ref.schema';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserRef.name)
    private readonly userRefModel: Model<UserRefDocument>,
  ) {}

  /**
   * Upsert user replica from auth.tokenGenerated event.
   * Stores user info + token in Mongo (user_refs collection).
   */
  async upsert(data: AuthTokenGeneratedDto) {
    if (!data || !data.userId) {
      this.logger.warn('⚠️ upsert called without userId', data);
      return null;
    }

    this.logger.debug(`Upserting user: ${data.userId}`);
    this.logger.debug(`Data: ${JSON.stringify(data)}`);

    const userRefData: Partial<UserRef> = {
      name: data.name,
      slug: data.slug,
      email: data.email,
      googleId: data.googleId,
      picture: data.picture,
      role: data.role,
      token: data.token,
    };

    try {
      const updated = await this.userRefModel.findOneAndUpdate(
        { user_id: data.userId },
        { $set: userRefData },
        { upsert: true, new: true },
      );

      this.logger.log(`✅ User ref upserted successfully: ${data.userId}`);
      this.logger.debug(`Updated document: ${JSON.stringify(updated)}`);
      return updated;
    } catch (error) {
      this.logger.error(`❌ Error upserting user ${data.userId}:`, error);
      throw error;
    }
  }

  /**
   * Get cached user replica from Mongo.
   */
  async get(userId: string): Promise<UserRefDocument | null> {
    if (!userId) {
      this.logger.warn('⚠️ get called without userId');
      return null;
    }

    this.logger.debug(`Looking up user: ${userId}`);
    const user = await this.userRefModel.findOne({ user_id: userId });

    if (user) {
      this.logger.debug(`✅ User found: ${userId}`);
    } else {
      this.logger.warn(`⚠️ User NOT found in cache: ${userId}`);
    }

    return user;
  }
}
