import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventService } from './services/createEvent.service';
import { FindAllEventsService } from './services/findAllEvents.service';
import { FindOneEventService } from './services/findOneEvent.service';
import { UpdateEventService } from './services/updateEvent.service';
import { RemoveEventService } from './services/removeEvent.service';
import { PaginationDto } from '../common';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly createEventService: CreateEventService,
    private readonly findAllEventsService: FindAllEventsService,
    private readonly findOneEventService: FindOneEventService,
    private readonly updateEventService: UpdateEventService,
    private readonly removeEventService: RemoveEventService,
  ) {}

  @MessagePattern('createEvent')
  create(@Payload() payload: any) {
    this.logger.log(`Received createEvent: ${JSON.stringify(payload)}`);
    const dto: CreateEventDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };
    return this.createEventService.execute(dto);
  }

  @MessagePattern('findAllEvents')
  findAll(@Payload() pagination: PaginationDto) {
    return this.findAllEventsService.execute(pagination);
  }

  @MessagePattern('findEventsByOrganizer')
  findByOrganizer(@Payload() payload: { organizerId: string }) {
    return this.findAllEventsService.byOrganizer(payload.organizerId);
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventService.execute(payload.id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() payload: any) {
    this.logger.log(`Received updateEvent: ${JSON.stringify(payload)}`);
    const dto: UpdateEventDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };
    // requesterId = quien hace la petición (del JWT via gateway)
    const requesterId = payload.requesterId || payload.userId || '';
    return this.updateEventService.execute(dto.id, dto, requesterId);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() payload: { id: string; requesterId?: string; userId?: string }) {
    const requesterId = payload.requesterId || payload.userId || '';
    return this.removeEventService.execute(payload.id, requesterId);
  }
}