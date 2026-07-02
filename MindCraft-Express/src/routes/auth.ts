import { Router } from 'express';
import passport from '../auth/passport.js';
import { ensureGoogleSession } from '../auth/ensureGoogleSession';
import { env } from '../config/env';
import { hasYouTubeScope } from '../utils/common';

const router = Router();

async function revokeToken(token?: string | null) {
  if (!token) return;
  const body = new URLSearchParams({ token });
  // Node 18+ has global fetch; otherwise install node-fetch
  await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  }).catch(() => {
    // swallow network errors—don’t block logout UX
  });
}

// Start Google OAuth flow
router.get('/google', (req, res, next) => {
  const force = req.query.force_consent === '1';

  passport.authenticate('google', {
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    accessType: 'offline', // needed if you want a refresh token (first time)
    includeGrantedScopes: true,
    prompt: force ? 'consent' : undefined, // only ask again when you *explicitly* need to
  })(req, res, next);
});

// GET /auth/google/callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate(
    'google',
    { failureRedirect: '/auth/failure' },
    (err, user, info) => {
      if (err || !user) return res.redirect('/auth/failure');

      req.logIn(user, (err) => {
        if (err) return next(err);

        // Now the session has been regenerated. Safe to write custom fields.
        req.session.googleTokens = {
          accessToken: user.tokens?.accessToken ?? null,
          refreshToken: user.tokens?.refreshToken ?? null,
          idToken: user.tokens?.idToken ?? null,
          expiresIn: user.tokens?.expiresIn ?? null,
          issuedAt: user.tokens?.issuedAt ?? null,
        };

        req.session.save((err) => {
          if (err) return next(err);
          res.redirect(`${env.APP_BASE_URL}/login-success`);
        });
      });
    },
  )(req, res, next);
});

// router.get('/user', ensureGoogleSession, (req, res) => {
//   // No tokens returned to client — just profile data
//   const { _id, id, email, name, photo } = (req.user as any) ?? {};
//   res.json({ ok: true, user: { id: id || _id, email, name, photo } });
// });

router.get('/user', async (req, res) => {
  try {
    const accessToken = req.session.googleTokens?.accessToken;
    if (!accessToken)
      return res.status(401).json({ ok: false, error: 'No token' });

    const infoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
    );
    const info = await infoRes.json();

    res.json({
      ok: true,
      user: { ...req.user, hasYouTubeScope: hasYouTubeScope(info?.scope)},
    });
  } catch (err) {
    console.error('Error in /auth/user:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.get('/failure', (_req, res) => {
  res.status(401).json({ ok: false, error: 'Authentication failed' });
});

router.post('/logout', async (req, res, next) => {
  try {
    const tokens = (req.session as any)?.googleTokens as
      | { accessToken?: string | null; refreshToken?: string | null }
      | undefined;

    // Prefer revoking the refresh token (invalidates related access tokens)
    if (tokens?.refreshToken) {
      await revokeToken(tokens.refreshToken);
    } else if (tokens?.accessToken) {
      await revokeToken(tokens.accessToken);
    }

    // Clear session after revoke attempt
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => res.json({ ok: true }));
    });
  } catch (e) {
    // Still end the local session even if revoke fails
    req.logout(() => {
      req.session.destroy(() =>
        res.json({ ok: true, warn: 'Token revoke failed' }),
      );
    });
  }
});

router.get('/debug-token', async (req, res) => {
  const accessToken = req.session.googleTokens?.accessToken;

  if (!accessToken) {
    return res.json({ error: 'No access token in session' });
  }

  const infoRes = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`,
  );
  const info = await infoRes.json();

  return res.json({ tokenInfo: info });
});

export default router;
