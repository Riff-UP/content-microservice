import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { FindSavedPostsByUserService } from './services/findSavedPostsByUser.service';
import { RemoveSavedPostService } from './services/removeSavedPost.service';

@Controller()
export class SavedPostsController {
  constructor(
    private readonly createSavedPostService: CreateSavedPostService,
    private readonly findSavedPostsByUserService: FindSavedPostsByUserService,
    private readonly removeSavedPostService: RemoveSavedPostService,
  ) { }

  @MessagePattern('createSavedPost')
  create(@Payload() dto: CreateSavedPostDto) {
    return this.createSavedPostService.execute(dto);
  }

  @MessagePattern('findSavedPostsByUser')
  findByUser(@Payload() payload: { sql_user_id: string }) {
    return this.findSavedPostsByUserService.execute(payload.sql_user_id);
  }

  @MessagePattern('removeSavedPost')
  remove(@Payload() payload: { id: string }) {
    return this.removeSavedPostService.execute(payload.id);
  }
}
