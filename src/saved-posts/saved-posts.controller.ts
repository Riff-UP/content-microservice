import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SavedPostsService } from './saved-posts.service';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { UpdateSavedPostDto } from './dto/update-saved-post.dto';

@Controller()
export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  @MessagePattern('createSavedPost')
  create(@Payload() createSavedPostDto: CreateSavedPostDto) {
    return this.savedPostsService.create(createSavedPostDto);
  }

  @MessagePattern('findAllSavedPosts')
  findAll() {
    return this.savedPostsService.findAll();
  }
  
  @MessagePattern('removeSavedPost')
  remove(@Payload() id: number) {
    return this.savedPostsService.remove(id);
  }
}
