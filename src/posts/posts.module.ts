import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { postsConsumerController } from './posts.consumer.controller';
import { createPostService } from './services/createPost.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';

@Module({
  controllers: [PostsController, postsConsumerController],
  providers: [PostsService, createPostService],
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
})
export class PostsModule {}
