import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { EventAttendanceModule } from './event-attendance/event-attendance.module';
import { EventReviewsModule } from './event-reviews/event-reviews.module';
import { PostReactionsModule } from './post-reactions/post-reactions.module';
import { SavedPostsModule } from './saved-posts/saved-posts.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from './config/envs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(envs.mongoUri),
    PostsModule,
    EventsModule,
    EventAttendanceModule,
    EventReviewsModule,
    PostReactionsModule,
    SavedPostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
