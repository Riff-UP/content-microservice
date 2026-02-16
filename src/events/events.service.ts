import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema'
import { Model } from 'mongoose';

@Injectable()
export class EventsService {

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ){}

  async create(createEventDto: CreateEventDto) {
    return await this.eventModel.create(createEventDto)
  }

  async findAll() {
    return await this.eventModel.find().exec()
  }

  async findOne(id: number) {
    const event = await this.eventModel.findById(id).exec()

    if(!event){
      throw new Error(`Event with id ${id} not found`)
    }
    return event
  }

  async update(id: number, updateEventDto: UpdateEventDto) {

    const eventUpdated = await this.eventModel.findByIdAndUpdate(id, updateEventDto, {new: true}).exec()

    if(!eventUpdated){
      throw new Error(`Event with id ${id} not found`)
    }

    return eventUpdated
  }

  async remove(id: number) {
    return await this.eventModel.findByIdAndDelete(id)
  }
}
