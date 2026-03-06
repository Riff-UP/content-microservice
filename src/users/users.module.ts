import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserRef, UserRefSchema } from './schemas/user-ref.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserRef.name, schema: UserRefSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
