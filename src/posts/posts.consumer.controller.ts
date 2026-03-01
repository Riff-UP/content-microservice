import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { UsersService } from '../users/users.service';

@Controller('posts-consumer')
export class postsConsumerController {
  private readonly logger = new Logger('PostsConsumer');

  constructor(private readonly usersService: UsersService) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data.user, data.token);
      this.logger.log(
        `User ref upserted: ${data.user?.id || (data.user as any)?.user_id}`,
      );
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err);
    }
  }
}
