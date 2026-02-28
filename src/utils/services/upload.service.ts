import { Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class UploadService {
  private readonly logger = new Logger('UploadService');

  validateProviderLink(provider?: string, url?: string) {
    if (!provider) return true;
    if (!url)
      throw new BadRequestException('Provider specified but url is missing');

    switch ((provider || '').toLowerCase()) {
      case 'soundcloud':
        // very small validation: must contain soundcloud domain
        if (!/soundcloud\.com/.test(url)) {
          this.logger.warn(`Invalid soundcloud url: ${url}`);
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

  normalizePostPayload(payload: any) {
    // Ensure minimal normalized DTO shape for creation
    const dto: any = {
      sql_user_id: payload.sql_user_id,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      provider: payload.provider,
      url: payload.url,
    };

    if (!dto.sql_user_id || !dto.type || !dto.title) {
      throw new BadRequestException('Missing required post fields');
    }

    // If provider is set, validate link
    if (dto.provider) this.validateProviderLink(dto.provider, dto.url);

    // If neither url nor provider/file is provided, it's caller's responsibility to ensure file was uploaded.
    return dto;
  }
}
