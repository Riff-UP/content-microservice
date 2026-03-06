import { Module } from '@nestjs/common';
import { PostReactionsController } from './post-reactions.controller';
import { PostReactionsConsumerController } from './post-reactions.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PostReaction,
  PostReactionSchema,
} from './schemas/post-reactions.schema';
import { UsersModule } from '../users/users.module';
import { CreatePostReactionService } from './services/createPostReaction.service';
import { FindReactionsByPostService } from './services/findReactionsByPost.service';
import { FindReactionsByUserService } from './services/findReactionsByUser.service';
import { RemovePostReactionService } from './services/removePostReaction.service';
import { FindReactionsByPostAndUserService } from './services/findReactionsByPostAndUser.service';

@Module({
  controllers: [PostReactionsController, PostReactionsConsumerController],
  providers: [
    CreatePostReactionService,
    FindReactionsByPostService,
    FindReactionsByUserService,
    RemovePostReactionService,
    FindReactionsByPostAndUserService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: PostReaction.name, schema: PostReactionSchema },
    ]),
    UsersModule,
  ],
})
export class PostReactionsModule {}
