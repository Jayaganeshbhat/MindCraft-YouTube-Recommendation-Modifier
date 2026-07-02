import type { RequestHandler } from 'express';
import { refreshAccessToken } from './tokens.js';

// seconds of skew before expiry when we proactively refresh
const EXPIRY_SKEW_SECONDS = 60;
// stampede control window (ms) to avoid multiple concurrent refreshes
const REFRESH_WINDOW_MS = 10_000;

function isAccessTokenFresh(
  session:
    | {
        accessToken?: string | null;
        refreshToken?: string | null;
        idToken?: string | null;
        expiresIn?: number;
        issuedAt?: number;
      }
    | undefined,
) {
  if (!session?.accessToken || !session?.expiresIn || !session?.issuedAt)
    return false;
  const expiresAt = session.issuedAt + session.expiresIn * 1000;
  return Date.now() < expiresAt - EXPIRY_SKEW_SECONDS * 1000;
}

async function accessTokenSeemsValid(accessToken: string) {
  try {
    //  - call a Google API endpoint you already use and accept 200/401
    //  - tokeninfo endpoint: https://oauth2.googleapis.com/tokeninfo?access_token=...
    const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return r.ok; // 200 => valid, 401/403 => invalid
  } catch {
    return false;
  }
}

export const ensureGoogleSession: RequestHandler = async (req, res, next) => {
  try {
    // 1) must be logged in (Passport has deserialized req.user)
    if (!req.isAuthenticated?.() || !req.user) {
      return res.status(401).json({ ok: false, error: 'Unauthenticated' });
    }

    const t = req.session.googleTokens;
    // 2) must have tokens in session
    if (!t || (!t.accessToken && !t.refreshToken)) {
      return res.status(401).json({ ok: false, error: 'No tokens in session' });
    }

    // 3) If access token looks fresh by expiry, you can proceed immediately.
    if (isAccessTokenFresh(t)) {
      return next();
    }

    // 4) If not fresh, try a quick live check (optional).
    if (t.accessToken && !isAccessTokenFresh(t)) {
      const stillValid = await accessTokenSeemsValid(t.accessToken);
      if (stillValid) {
        // The token is valid even if our local clock thought it was close/expired.
        return next();
      }
    }

    // 5) Need to refresh; ensure we have a refresh token.
    if (!t.refreshToken) {
      return res
        .status(401)
        .json({ ok: false, error: 'Missing refresh token' });
    }

    // Stampede control: if another request just refreshed, avoid duplicate refreshes.
    const now = Date.now();
    if (t._refreshingUntil && now < t._refreshingUntil) {
      // Another request is/was refreshing recently — allow a short pass-through.
      // You can also short-sleep and re-check, but simple pass-through usually works.
      return next();
    }
    t._refreshingUntil = now + REFRESH_WINDOW_MS;

    // 6) Refresh
    try {
      const { accessToken, expiresIn, idToken } = await refreshAccessToken(
        t.refreshToken,
      );
      req.session.googleTokens = {
        ...t,
        accessToken,
        idToken: idToken ?? t.idToken ?? null,
        expiresIn,
        issuedAt: Date.now(),
        _refreshingUntil: undefined,
      };
      return next();
    } catch (e: any) {
      // If refresh fails due to invalid_grant, the user must re-consent/login.
      if (e?.oauthError === 'invalid_grant') {
        // Optional: clear tokens so the client knows it must re-login
        req.session.googleTokens = undefined;
        return res
          .status(401)
          .json({ ok: false, error: 'Session expired; re-consent required' });
      }

      // Unknown failure — don’t expose details.
      return res.status(401).json({ ok: false, error: 'Token refresh failed' });
    }
  } catch (err) {
    return next(err);
  }
};
