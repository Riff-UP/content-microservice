import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { postsConsumerController } from './posts.consumer.controller';
import { createPostService } from './services/createPost.service';
import { FindAllPostsService } from './services/findAllPosts.service';
import { FindOnePostService } from './services/findOnePost.service';
import { UpdatePostService } from './services/updatePost.service';
import { RemovePostService } from './services/removePost.service';
import { UploadService } from '../utils/services/upload.service';
import { StorageService } from '../utils/services/storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [PostsController, postsConsumerController],
  providers: [
    createPostService,
    FindAllPostsService,
    FindOnePostService,
    UpdatePostService,
    RemovePostService,
    UploadService,
    StorageService,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
  ],
})
export class PostsModule {}
