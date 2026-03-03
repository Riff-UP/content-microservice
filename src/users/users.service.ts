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
      this.logger.warn('upsert called without userId');
      return null;
    }

    const userRefData: Partial<UserRef> = {
      name: data.name,
      email: data.email,
      googleId: data.googleId,
      picture: data.picture,
      role: data.role,
      token: data.token,
    };

    const updated = await this.userRefModel.findOneAndUpdate(
      { user_id: data.userId },
      { $set: userRefData },
      { upsert: true, returnDocument: 'after' },
    );

    this.logger.log(`User ref upserted: ${data.userId}`);
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
