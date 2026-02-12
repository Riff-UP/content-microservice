import { Module } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { SavedPostsController } from './saved-posts.controller';

@Module({
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
})
export class SavedPostsModule {}
