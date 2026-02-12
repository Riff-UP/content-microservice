import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { EventAttendanceModule } from './event-attendance/event-attendance.module';
import { EventReviewsModule } from './event-reviews/event-reviews.module';
import { PostReactionsModule } from './post-reactions/post-reactions.module';
import { SavedPostsModule } from './saved-posts/saved-posts.module';

@Module({
  imports: [PostsModule, EventsModule, EventAttendanceModule, EventReviewsModule, PostReactionsModule, SavedPostsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
