import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { UsersService } from '../users/users.service';

@Controller('posts-consumer')
export class postsConsumerController {
    private readonly logger = new Logger('PostsConsumer');

    constructor(private readonly usersService: UsersService) { }

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('Evento auth.tokenGenerated recibido en consumer');
    const { user, token } = data;
    try {
      // store token together with user in cache so other handlers can use it
      const merged = { ...(user as any), _token: token };
      await this.usersService.upsert(merged as any);
      this.logger.log(`User ref upserted: ${merged?.user_id}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }
}
