import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(private readonly eventsService: EventsService) {}

  @EventPattern('events.created')
  async handleEventCreated(@Payload() payload: CreateEventDto) {
    this.logger.log('events.created received');
    try {
      await this.eventsService.create(payload);
      this.logger.log('Event persisted from consumer');
    } catch (err) {
      this.logger.error('Error persisting event from consumer', err as any);
    }
  }
}
