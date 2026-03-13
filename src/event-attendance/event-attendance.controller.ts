import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { CreateEventAttendanceService } from './services/createEventAttendance.service';
import { FindAttendanceByEventService } from './services/findAttendanceByEvent.service';
import { FindAttendanceByUserService } from './services/findAttendanceByUser.service';
import { FindOneEventAttendanceService } from './services/findOneEventAttendance.service';
import { UpdateEventAttendanceService } from './services/updateEventAttendance.service';
import { RemoveEventAttendanceService } from './services/removeEventAttendance.service';

@Controller()
export class EventAttendanceController {
  private readonly logger = new Logger(EventAttendanceController.name);

  constructor(
    private readonly createEventAttendanceService: CreateEventAttendanceService,
    private readonly findAttendanceByEventService: FindAttendanceByEventService,
    private readonly findAttendanceByUserService: FindAttendanceByUserService,
    private readonly findOneEventAttendanceService: FindOneEventAttendanceService,
    private readonly updateEventAttendanceService: UpdateEventAttendanceService,
    private readonly removeEventAttendanceService: RemoveEventAttendanceService,
  ) {}

  @MessagePattern('createEventAttendance')
  create(@Payload() payload: any) {
    const dto: CreateEventAttendanceDto = {
      event_id: payload.event_id || payload.eventId,
      sql_user_id: payload.sql_user_id || payload.userId,
      status: payload.status,
    };
    return this.createEventAttendanceService.execute(dto);
  }

  @MessagePattern('findAttendanceByEvent')
  findByEvent(@Payload() payload: { event_id: string }) {
    return this.findAttendanceByEventService.execute(payload.event_id);
  }

  @MessagePattern('findAttendanceByUser')
  findByUser(@Payload() payload: { userId: string }) {
    return this.findAttendanceByUserService.execute(payload.userId);
  }

  @MessagePattern('findOneEventAttendance')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventAttendanceService.execute(payload.id);
  }

  @MessagePattern('updateEventAttendance')
  update(@Payload() payload: any) {
    const dto: UpdateEventAttendanceDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };
    return this.updateEventAttendanceService.execute(dto.id, dto);
  }

  @MessagePattern('removeEventAttendance')
  remove(@Payload() payload: { id: string }) {
    return this.removeEventAttendanceService.execute(payload.id);
  }
}