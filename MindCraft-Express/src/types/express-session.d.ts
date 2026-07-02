import 'express-session';

declare module 'express-session' {
  interface SessionData {
    googleTokens?: {
      accessToken?: string | null;
      refreshToken?: string | null;
      idToken?: string | null;
      expiresIn?: number; // seconds
      issuedAt?: number; // Date.now()
      // optional jitter to avoid stampedes
      _refreshingUntil?: number; // ms epoch
    };
  }
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      _id: string;
      googleId: string;
      email: string;
      name?: string;
      photo?: string;
    }
  }
}
