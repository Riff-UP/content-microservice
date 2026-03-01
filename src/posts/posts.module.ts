import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsController } from './posts.controller';
import { postsConsumerController } from './posts.consumer.controller';
import { createPostService } from './services/createPost.service';
import { UploadService } from '../utils/services/upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [PostsController, postsConsumerController],
  providers: [createPostService, UploadService],
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
  ],
})
export class PostsModule {}