import { env } from '../config/env.js';

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(`${data.error}: ${data.error_description}`);
    (err as any).oauthError = data.error;
    throw err;
  }

  return {
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) ?? 3600,
    idToken: data.id_token as string | undefined,
  };
}
