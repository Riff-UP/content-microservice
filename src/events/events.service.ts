import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.schema';
import { Model } from 'mongoose';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { envs } from 'src/config';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class EventsService {
  private logger = new Logger('EventsService');
  private client: ClientProxy;

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbitUrl],
        queue: 'riff_queue',
        queueOptions: { durable: true },
      },
    });
  }

  async create(createEventDto: CreateEventDto) {
    const { followers, ...eventData } = createEventDto;

    const event = await this.eventModel.create(eventData);

    this.client.emit('new.event', {
      artistId: event.sql_user_id,
      eventTitle: event.title,
      followers: followers ?? [],
    });

    this.logger.log(`Event emmited: new event ${event.id}`);
    return event;
  }

  async findAll() {
    return await this.eventModel.find().exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id).exec();

    if (!event) RpcExceptionHelper.notFound('Event', id)
    return event!;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    const { followers, ...eventData } = updateEventDto;

    const eventUpdated = await this.eventModel
      .findByIdAndUpdate(id, eventData, { new: true })
      .exec();

    this.client.emit('event.update', {
      artistId: eventUpdated!.sql_user_id,
      eventTitle: eventUpdated!.title,
      followers: followers ?? [],
    });

    return eventUpdated;
  }

  async remove(id: string, followers: string[] = []) {
    await this.findOne(id);

    const eventRemoved = await this.eventModel.findByIdAndDelete(id).exec();

    this.client.emit('event.cancelled', {
      artistId: eventRemoved!.sql_user_id,
      eventTitle: eventRemoved!.title,
      followers,
    });

    return { message: `Event with id ${id} removed` };
  }
}
