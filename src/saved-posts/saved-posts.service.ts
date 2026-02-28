import { Injectable } from '@nestjs/common';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { UpdateSavedPostDto } from './dto/update-saved-post.dto';
import { SavedPost } from './schemas/saved-post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPost>,
  ) {}

  async create(createSavedPostDto: any) {
    return await this.savedPostModel.create(createSavedPostDto);
  }

  async findAll() {
    return await this.savedPostModel.find().exec();
  }

  async findOne(id: number) {
    const savedPost = await this.savedPostModel.findById(id).exec();

    if (!savedPost) {
      throw new Error(`Saved post with id ${id} not found`);
    }
    return savedPost;
  }

  async update(id: number, updateSavedPostDto: UpdateSavedPostDto) {
    return await this.savedPostModel.findByIdAndUpdate(id, updateSavedPostDto, {
      new: true,
    });
  }

  async remove(id: number) {
    const deletedSavedPost = await this.savedPostModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedSavedPost) {
      throw new Error(`Saved post with id ${id} not found`);
    }
    return deletedSavedPost;
  }
}
