import { Injectable } from '@nestjs/common';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { UpdateSavedPostDto } from './dto/update-saved-post.dto';

@Injectable()
export class SavedPostsService {
  create(createSavedPostDto: CreateSavedPostDto) {
    return 'This action adds a new savedPost';
  }

  findAll() {
    return `This action returns all savedPosts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savedPost`;
  }

  update(id: number, updateSavedPostDto: UpdateSavedPostDto) {
    return `This action updates a #${id} savedPost`;
  }

  remove(id: number) {
    return `This action removes a #${id} savedPost`;
  }
}
