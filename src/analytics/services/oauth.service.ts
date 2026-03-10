import { BadRequestException, Injectable } from '@nestjs/common';
import { envs } from '../../config';

@Injectable()
export class OAuthService {
  getAuthorizationUrl(state?: string) {
    if (!envs.analytics.googleClientId || !envs.analytics.callbackUrl) {
      throw new BadRequestException(
        'Faltan GOOGLE_CLIENT_ID o ANALYTICS_CALLBACK_URL en la configuración',
      );
    }

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', envs.analytics.googleClientId);
    url.searchParams.set('redirect_uri', envs.analytics.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'https://www.googleapis.com/auth/bigquery');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');

    if (state) {
      url.searchParams.set('state', state);
    }

    return url.toString();
  }

  async exchangeCodeForTokens(code: string) {
    if (
      !envs.analytics.googleClientId ||
      !envs.analytics.googleClientSecret ||
      !envs.analytics.callbackUrl
    ) {
      throw new BadRequestException(
        'Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o ANALYTICS_CALLBACK_URL',
      );
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: envs.analytics.googleClientId,
        client_secret: envs.analytics.googleClientSecret,
        redirect_uri: envs.analytics.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new BadRequestException({
        message: 'No se pudo intercambiar el authorization code por tokens',
        detail: payload,
      });
    }

    return payload;
  }

  async refreshAccessToken(refreshToken = envs.analytics.googleRefreshToken) {
    if (
      !refreshToken ||
      !envs.analytics.googleClientId ||
      !envs.analytics.googleClientSecret
    ) {
      return null;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: envs.analytics.googleClientId,
        client_secret: envs.analytics.googleClientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      throw new BadRequestException({
        message: 'No se pudo refrescar el access token',
        detail: payload,
      });
    }

    return payload;
  }

  async resolveAccessToken(explicitToken?: string): Promise<string | null> {
    if (explicitToken?.trim()) {
      return explicitToken.trim();
    }

    if (envs.analytics.accessToken.trim()) {
      return envs.analytics.accessToken.trim();
    }

    const refreshed = await this.refreshAccessToken();
    const accessToken = refreshed?.access_token;

    return typeof accessToken === 'string' ? accessToken : null;
  }
}
