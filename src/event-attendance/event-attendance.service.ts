import { Injectable } from '@nestjs/common';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';

@Injectable()
export class EventAttendanceService {
  create(createEventAttendanceDto: CreateEventAttendanceDto) {
    return 'This action adds a new eventAttendance';
  }

  findAll() {
    return `This action returns all eventAttendance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventAttendance`;
  }

  update(id: number, updateEventAttendanceDto: UpdateEventAttendanceDto) {
    return `This action updates a #${id} eventAttendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventAttendance`;
  }
}
