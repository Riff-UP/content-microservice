import { Injectable, BadRequestException, Logger } from '@nestjs/common';

export interface NormalizedPostPayload {
  sql_user_id: string;
  type: string;
  title: string;
  description?: string;
  provider?: string;
  provider_meta?: Record<string, unknown>;
  content?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger('UploadService');

  validateProviderLink(provider?: string, content?: string) {
    if (!provider) return true;
    if (!content)
      throw new BadRequestException(
        'Provider specified but content is missing',
      );

    switch ((provider || '').toLowerCase()) {
      case 'soundcloud':
        // very small validation: must contain soundcloud domain
        if (!/soundcloud\.com/.test(content)) {
          this.logger.warn(`Invalid soundcloud url: ${content}`);
          throw new BadRequestException('Invalid SoundCloud URL');
        }
        return true;
      default:
        // unknown provider: accept but warn
        this.logger.warn(
          `Unknown provider ${provider}, skipping provider-specific validation`,
        );
        return true;
    }
  }

  normalizePostPayload(
    payload: Record<string, unknown>,
  ): NormalizedPostPayload {
    // Ensure minimal normalized DTO shape for creation
    const dto: NormalizedPostPayload = {
      sql_user_id: payload.sql_user_id as string,
      type: payload.type as string,
      title: payload.title as string,
      description: payload.description as string | undefined,
      provider: payload.provider as string | undefined,
      content: payload.content as string | undefined,
    };

    if (!dto.sql_user_id || !dto.type || !dto.title) {
      throw new BadRequestException('Missing required post fields');
    }

    // If provider is set, validate link
    if (dto.provider) this.validateProviderLink(dto.provider, dto.content);

    // If neither url nor provider/file is provided, it's caller's responsibility to ensure file was uploaded.
    return dto;
  }
}
