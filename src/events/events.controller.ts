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
    this.logger.log(`Received createEvent with payload: ${JSON.stringify(payload)}`);

    // Transform userId to sql_user_id if needed
    const dto: CreateEventDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };

    this.logger.log(`🔄 Transformed DTO: ${JSON.stringify(dto)}`);
    return this.createEventService.execute(dto);
  }

  @MessagePattern('findAllEvents')
  findAll(@Payload() pagination: PaginationDto) {
    return this.findAllEventsService.execute(pagination);
  }

  @MessagePattern('findEventsByOrganizer')
  findByOrganizer(@Payload() payload: { organizerId: string }) {
    // Mapear organizerId (UUID del gateway) a sql_user_id del esquema
    const sqlUserId = payload.organizerId;
    this.logger.log(`findEventsByOrganizer - sql_user_id: ${sqlUserId}`);
    return this.findAllEventsService.byOrganizer(sqlUserId);
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventService.execute(payload.id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() payload: any) {
    this.logger.log(`📥 Received updateEvent with payload: ${JSON.stringify(payload)}`);

    // Transform userId to sql_user_id if needed
    const dto: UpdateEventDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };

    this.logger.log(`🔄 Transformed DTO: ${JSON.stringify(dto)}`);
    return this.updateEventService.execute(dto.id, dto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() data: { id: string }) {
    return this.removeEventService.execute(data.id);
  }
}
