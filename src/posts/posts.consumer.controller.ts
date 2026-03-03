import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { UsersService } from '../users/users.service';
import { SoftDeletePostsByUserService } from './services/softDeletePostsByUser.service';

@Controller('posts-consumer')
export class postsConsumerController {
  private readonly logger = new Logger('PostsConsumer');

  constructor(
    private readonly usersService: UsersService,
    private readonly softDeletePostsByUserService: SoftDeletePostsByUserService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data);
      this.logger.log(`User ref upserted: ${data.userId}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err);
    }
  }

  @EventPattern('user.deactivated')
  async handleUserDeactivated(@Payload() data: { userId: string }) {
    this.logger.log(`user.deactivated received for user ${data.userId}`);
    try {
      const count = await this.softDeletePostsByUserService.execute(
        data.userId,
      );
      this.logger.log(
        `Soft deleted ${count} posts for deactivated user ${data.userId}`,
      );
    } catch (err) {
      this.logger.error('Failed to soft delete posts for user', err);
    }
  }
}
