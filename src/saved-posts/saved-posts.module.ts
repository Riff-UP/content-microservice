import { Module } from '@nestjs/common';
import { SavedPostsController } from './saved-posts.controller';
import { SavedPostsConsumerController } from './saved-posts.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedPost, SavedPostSchema } from './schemas/saved-post.schema';
import { UsersModule } from '../users/users.module';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { FindSavedPostsByUserService } from './services/findSavedPostsByUser.service';
import { RemoveSavedPostService } from './services/removeSavedPost.service';

@Module({
  controllers: [SavedPostsController, SavedPostsConsumerController],
  providers: [
    CreateSavedPostService,
    FindSavedPostsByUserService,
    RemoveSavedPostService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: SavedPost.name, schema: SavedPostSchema },
    ]),
    UsersModule,
  ],
})
export class SavedPostsModule {}
