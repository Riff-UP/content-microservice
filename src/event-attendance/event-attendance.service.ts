import { Injectable } from '@nestjs/common';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventAttendance } from './schemas/event-attendance.schema';
import { Model } from 'mongoose';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class EventAttendanceService {
  constructor(
    @InjectModel(EventAttendance.name)
    private readonly eventAttendanceModel: Model<EventAttendance>,
  ) {}

  async create(createEventAttendanceDto: CreateEventAttendanceDto) {
    return await this.eventAttendanceModel.create(createEventAttendanceDto);
  }

  async findAll() {
    return await this.eventAttendanceModel.find().exec();
  }

  async findOne(id: string) {
    const attendance = await this.eventAttendanceModel.findById(id).exec();

    if (!attendance) RpcExceptionHelper.notFound('EventAttendance', id)

    return attendance!;
  }

  async update(id: string, updateEventAttendanceDto: UpdateEventAttendanceDto) {
    await this.findOne(id)

    return await this.eventAttendanceModel.findByIdAndUpdate(
      id,
      updateEventAttendanceDto,
      {new: true}
    ).exec()
  }

  async remove(id: string) {
    await this.findOne(id)

    return await this.eventAttendanceModel.findByIdAndDelete(id).exec()
  }
}
