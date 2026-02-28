import { Injectable } from '@nestjs/common';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { UpdateEventReviewDto } from './dto/update-event-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventReview } from './schemas/event-reviews.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventReviewsService {
  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewService: Model<EventReview>,
  ) {}

  async create(createEventReviewDto: CreateEventReviewDto) {
    return await this.eventReviewService.create(createEventReviewDto);
  }

  async findAll() {
    return await this.eventReviewService.find().exec();
  }

  async findOne(id: number) {
    const review = await this.eventReviewService.findById(id).exec();

    if (!review) {
      throw new Error(`Review with id ${id} not found`);
    }

    return review;
  }

  async update(id: number, updateEventReviewDto: UpdateEventReviewDto) {
    const reviewUpdated = await this.eventReviewService.findByIdAndUpdate(
      id,
      updateEventReviewDto,
      { new: true },
    );

    if (!reviewUpdated) {
      throw new Error(`Review with id ${id} not found`);
    }

    return reviewUpdated;
  }

  async remove(id: number) {
    const reviewDeleted = await this.eventReviewService
      .findByIdAndDelete(id)
      .exec();

    if (!reviewDeleted) {
      throw new Error(`Review with id ${id} not found`);
    }

    return reviewDeleted;
  }
}
