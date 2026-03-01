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
            await this.usersService.upsert(user as any, token);
            this.logger.log(`User ref upserted: ${user?.id}`);
        } catch (err) {
            this.logger.error('Failed to upsert user ref', err as any);
        }
    }
}
