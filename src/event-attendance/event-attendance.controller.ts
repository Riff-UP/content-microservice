import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { CreateEventAttendanceService } from './services/createEventAttendance.service';
import { FindAttendanceByEventService } from './services/findAttendanceByEvent.service';
import { FindOneEventAttendanceService } from './services/findOneEventAttendance.service';
import { UpdateEventAttendanceService } from './services/updateEventAttendance.service';
import { RemoveEventAttendanceService } from './services/removeEventAttendance.service';

@Controller()
export class EventAttendanceController {
  constructor(
    private readonly createEventAttendanceService: CreateEventAttendanceService,
    private readonly findAttendanceByEventService: FindAttendanceByEventService,
    private readonly findOneEventAttendanceService: FindOneEventAttendanceService,
    private readonly updateEventAttendanceService: UpdateEventAttendanceService,
    private readonly removeEventAttendanceService: RemoveEventAttendanceService,
  ) {}

  @MessagePattern('createEventAttendance')
  create(@Payload() dto: CreateEventAttendanceDto) {
    return this.createEventAttendanceService.execute(dto);
  }

  @MessagePattern('findAttendanceByEvent')
  findByEvent(@Payload() payload: { event_id: string }) {
    return this.findAttendanceByEventService.execute(payload.event_id);
  }

  @MessagePattern('findOneEventAttendance')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventAttendanceService.execute(payload.id);
  }

  @MessagePattern('updateEventAttendance')
  update(@Payload() dto: UpdateEventAttendanceDto) {
    return this.updateEventAttendanceService.execute(dto.id, dto);
  }

  @MessagePattern('removeEventAttendance')
  remove(@Payload() payload: { id: string }) {
    return this.removeEventAttendanceService.execute(payload.id);
  }
}
