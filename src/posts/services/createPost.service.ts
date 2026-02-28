import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Mongoose } from 'mongoose';

@Injectable()
export class createPostService implements OnModuleInit {
  private readonly logger = new Logger('PostCreationService');

  onModuleInit() {
    this.logger.log('PostCreationService initialized');
  }
}
