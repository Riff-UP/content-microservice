import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { createPostService } from './services/createPost.service';

@Controller('notification-consumer')
export class postsConsumerController {
  @EventPattern('auth.tokenGenerated')
  async handleFollowEvent(@Payload() data: AuthTokenGeneratedDto) {
    console.log('Evento recibido en consumer:', data);
    const { user, token } = data;
  }
}
