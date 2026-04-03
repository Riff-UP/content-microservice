import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { FindSavedPostsByUserService } from './services/findSavedPostsByUser.service';
import { GetPostSavesTotalService } from './services/getPostSavesTotal.service';
import { RemoveSavedPostService } from './services/removeSavedPost.service';
import { RemoveSavedPostByPostAndUserService } from './services/removeSavedPostByPostAndUser.service';

interface SavedPostPayload {
  post_id?: string;
  postId?: string;
  sql_user_id?: string;
  userId?: string;
  id?: string | { $oid: string };
}

/** Extrae el string de un _id que puede venir como string o como { $oid: "..." } */
function extractId(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null && '$oid' in raw) {
    return (raw as { $oid: string }).$oid;
  }
  return String(raw);
}

@Controller()
export class SavedPostsController {
  private readonly logger = new Logger(SavedPostsController.name);

  constructor(
    private readonly createSavedPostService: CreateSavedPostService,
    private readonly findSavedPostsByUserService: FindSavedPostsByUserService,
    private readonly getPostSavesTotalService: GetPostSavesTotalService,
    private readonly removeSavedPostService: RemoveSavedPostService,
    private readonly removeSavedPostByPostAndUserService: RemoveSavedPostByPostAndUserService,
  ) {}

  private buildCreateDto(payload: SavedPostPayload): CreateSavedPostDto {
    return {
      post_id: payload.post_id ?? payload.postId ?? '',
      sql_user_id: payload.sql_user_id ?? payload.userId ?? '',
    };
  }

  @MessagePattern('content.savedPosts.create')
  create(@Payload() payload: SavedPostPayload) {
    this.logger.log(
      `content.savedPosts.create payload: ${JSON.stringify(payload)}`,
    );
    return this.createSavedPostService.execute(this.buildCreateDto(payload));
  }

  @MessagePattern('createSavedPost')
  createSavedPost(@Payload() payload: SavedPostPayload) {
    this.logger.log(`createSavedPost payload: ${JSON.stringify(payload)}`);
    return this.createSavedPostService.execute(this.buildCreateDto(payload));
  }

  @MessagePattern('content.savedPosts.findAll')
  findAll(@Payload() payload: SavedPostPayload) {
    const sql_user_id = extractId(payload?.sql_user_id ?? payload?.userId);
    this.logger.log(`content.savedPosts.findAll for user: ${sql_user_id}`);
    return this.findSavedPostsByUserService.execute(sql_user_id);
  }

  @MessagePattern('findAllSavedPosts')
  findAllSavedPosts(@Payload() payload: SavedPostPayload) {
    const sql_user_id = extractId(payload?.sql_user_id ?? payload?.userId);
    this.logger.log(`findAllSavedPosts for user: ${sql_user_id}`);
    return this.findSavedPostsByUserService.execute(sql_user_id);
  }

  @MessagePattern('getPostSavesTotal')
  getPostSavesTotal(@Payload() payload: SavedPostPayload) {
    const postId = extractId(payload?.post_id ?? payload?.postId);
    return this.getPostSavesTotalService.execute(postId);
  }

  @MessagePattern('content.savedPosts.remove')
  remove(@Payload() payload: SavedPostPayload) {
    const id = extractId(payload?.id ?? payload);
    this.logger.log(`content.savedPosts.remove id: ${id}`);
    return this.removeSavedPostService.execute(id);
  }

  @MessagePattern('removeSavedPost')
  removeSavedPost(@Payload() payload: SavedPostPayload) {
    const id = extractId(payload?.id ?? payload);
    this.logger.log(`removeSavedPost id: ${id}`);
    return this.removeSavedPostService.execute(id);
  }

  @MessagePattern('removeSavedPostByPostAndUser')
  removeByPostAndUser(@Payload() payload: SavedPostPayload) {
    const post_id = payload.post_id ?? payload.postId ?? '';
    const sql_user_id = payload.sql_user_id ?? payload.userId ?? '';
    this.logger.log(
      `removeSavedPostByPostAndUser post_id: ${post_id}, user: ${sql_user_id}`,
    );
    return this.removeSavedPostByPostAndUserService.execute(
      post_id,
      sql_user_id,
    );
  }
}
