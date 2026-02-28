import { Injectable, Logger } from '@nestjs/common';
import { UsersEvents } from './users.events';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private cache = new Map<number, any>();

  constructor(private readonly usersEvents: UsersEvents) {}

  /**
   * Cache the user info in-memory and emit an in-process event.
   * Note: in-memory only — no persistence to MongoDB.
   */
  async upsert(user: Record<string, any>) {
    if (!user || !user.user_id) {
      this.logger.warn('upsert called without user_id');
      return null;
    }

    this.cache.set(user.user_id, user);
    this.usersEvents.emit('upsert', user);
    this.logger.log(`User cached: ${user.user_id}`);
    return user;
  }

  /** Return cached user or null. */
  async get(user_id: number) {
    if (!user_id) return null;
    return this.cache.get(user_id) ?? null;
  }

  /** Clear in-memory cache (useful for tests). */
  clear() {
    this.cache.clear();
  }
}
