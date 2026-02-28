import { Module } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { SavedPostsController } from './saved-posts.controller';
import { SavedPostsConsumerController } from './saved-posts.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedPost, SavedPostSchema } from './schemas/saved-post.schema';

@Module({
  controllers: [SavedPostsController, SavedPostsConsumerController],
  providers: [SavedPostsService],
  imports: [
    MongooseModule.forFeature([
      { name: SavedPost.name, schema: SavedPostSchema },
    ]),
  ],
})
export class SavedPostsModule {}
