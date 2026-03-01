import { Injectable } from '@nestjs/common';
import { UpdateSavedPostDto } from './dto/update-saved-post.dto';
import { SavedPost } from './schemas/saved-post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcExceptionHelper } from 'src/common';
import { CreateSavedPostDto } from './dto';

@Injectable()
export class SavedPostsService {
  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPost>,
  ) {}

  async create(createSavedPostDto: CreateSavedPostDto) {
    return await this.savedPostModel.create(createSavedPostDto);
  }

  async findAll() {
    return await this.savedPostModel.find().exec();
  }

  async findOne(id: string) {
    const savedPost = await this.savedPostModel.findById(id).exec();

    if (!savedPost) RpcExceptionHelper.notFound('savedPost', id)
    
    return savedPost!;
  }

  async update(id: string, updateSavedPostDto: UpdateSavedPostDto) {
    await this.findOne(id);

    return await this.savedPostModel.findByIdAndUpdate(
      id,
      updateSavedPostDto,
      { new: true }
    ).exec();
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.savedPostModel.findByIdAndDelete(id).exec();
  }
}