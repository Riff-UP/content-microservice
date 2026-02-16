import { Injectable } from '@nestjs/common';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventAttendance } from './schemas/event-attendance.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventAttendanceService {

  constructor(
    @InjectModel(EventAttendance.name) private readonly eventAttendanceService : Model<EventAttendance>
  ){}

  async create(createEventAttendanceDto: CreateEventAttendanceDto) {
    return await this.eventAttendanceService.create(createEventAttendanceDto)
  }

  async findAll() {
    return await this.eventAttendanceService.find().exec()
  }

  async findOne(id: number) {

    const attendance = await this.eventAttendanceService.findById(id).exec()

    if(!attendance){
      throw new Error(`Attendance with id ${id} not found`)
    }

    return attendance
  }

  async update(id: number, updateEventAttendanceDto: UpdateEventAttendanceDto) {

    const attendanceUpdated = await this.eventAttendanceService.findByIdAndUpdate(id).exec()

    if(!attendanceUpdated){
      throw new Error(`Attendance with id ${id} not found`)
    }

    return attendanceUpdated
  }

  async remove(id: number) {

    const deletedAttendance = await this.eventAttendanceService.findByIdAndDelete(id).exec()

    if(!deletedAttendance){
      throw new Error(`Attendance with id ${id} not found`)
    }

    return deletedAttendance
  }
}
