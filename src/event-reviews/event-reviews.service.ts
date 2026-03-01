import { Injectable } from '@nestjs/common';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { UpdateEventReviewDto } from './dto/update-event-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventReview } from './schemas/event-reviews.schema';
import { Model } from 'mongoose';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class EventReviewsService {
  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReview>,
  ) {}

  async create(createEventReviewDto: CreateEventReviewDto) {
    return await this.eventReviewModel.create(createEventReviewDto);
  }

  async findAll() {
    return await this.eventReviewModel.find().exec();
  }

  async findOne(id: string) {
    const review = await this.eventReviewModel.findById(id).exec();

    if (!review) RpcExceptionHelper.notFound('eventReview', id);

    return review!;
  }

  async update(id: string, updateEventReviewDto: UpdateEventReviewDto) {
    await this.findOne(id);
    return await this.eventReviewModel
      .findByIdAndUpdate(id, updateEventReviewDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.eventReviewModel.findByIdAndDelete(id).exec();
  }
}
