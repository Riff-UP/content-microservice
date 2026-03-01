import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventService } from './services/createEvent.service';
import { FindAllEventsService } from './services/findAllEvents.service';
import { FindOneEventService } from './services/findOneEvent.service';
import { UpdateEventService } from './services/updateEvent.service';
import { RemoveEventService } from './services/removeEvent.service';

@Controller()
export class EventsController {
  constructor(
    private readonly createEventService: CreateEventService,
    private readonly findAllEventsService: FindAllEventsService,
    private readonly findOneEventService: FindOneEventService,
    private readonly updateEventService: UpdateEventService,
    private readonly removeEventService: RemoveEventService,
  ) { }

  @MessagePattern('createEvent')
  create(@Payload() dto: CreateEventDto) {
    return this.createEventService.execute(dto);
  }

  @MessagePattern('findAllEvents')
  findAll() {
    return this.findAllEventsService.execute();
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventService.execute(payload.id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() dto: UpdateEventDto) {
    return this.updateEventService.execute(dto.id, dto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() data: { id: string }) {
    return this.removeEventService.execute(data.id);
  }
}
