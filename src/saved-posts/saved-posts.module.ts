import { Module } from '@nestjs/common';
import { SavedPostsController } from './saved-posts.controller';
import { SavedPostsConsumerController } from './saved-posts.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedPost, SavedPostSchema } from './schemas/saved-post.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { UsersModule } from '../users/users.module';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { FindSavedPostsByUserService } from './services/findSavedPostsByUser.service';
import { GetPostSavesTotalService } from './services/getPostSavesTotal.service';
import { RemoveSavedPostService } from './services/removeSavedPost.service';
import { RemoveSavedPostByPostAndUserService } from './services/removeSavedPostByPostAndUser.service';

@Module({
  controllers: [SavedPostsController, SavedPostsConsumerController],
  providers: [
    CreateSavedPostService,
    FindSavedPostsByUserService,
    GetPostSavesTotalService,
    RemoveSavedPostService,
    RemoveSavedPostByPostAndUserService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: SavedPost.name, schema: SavedPostSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    UsersModule,
  ],
})
export class SavedPostsModule {}
