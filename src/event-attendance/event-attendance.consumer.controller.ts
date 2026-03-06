import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Controller('event-attendance-consumer')
export class EventAttendanceConsumerController {
  private readonly logger = new Logger('EventAttendanceConsumer');

  constructor(private readonly usersService: UsersService) {}

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
}
