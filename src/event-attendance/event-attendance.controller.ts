import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventAttendanceService } from './event-attendance.service';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';

@Controller()
export class EventAttendanceController {
  constructor(
    private readonly eventAttendanceService: EventAttendanceService,
  ) {}

  @MessagePattern('createEventAttendance')
  create(@Payload() createEventAttendanceDto: CreateEventAttendanceDto) {
    return this.eventAttendanceService.create(createEventAttendanceDto);
  }

  @MessagePattern('findAllEventAttendance')
  findAll() {
    return this.eventAttendanceService.findAll();
  }

  @MessagePattern('findOneEventAttendance')
  findOne(@Payload() id: string) {
    return this.eventAttendanceService.findOne(id);
  }

  @MessagePattern('updateEventAttendance')
  update(@Payload() updateEventAttendanceDto: UpdateEventAttendanceDto) {
    return this.eventAttendanceService.update(
      updateEventAttendanceDto.id,
      updateEventAttendanceDto,
    );
  }

  @MessagePattern('removeEventAttendance')
  remove(@Payload() id: string) {
    return this.eventAttendanceService.remove(id);
  }
}
