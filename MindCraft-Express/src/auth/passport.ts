import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { env } from '../config/env.js';
import { UserModel } from '../models/User.js';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: env.GOOGLE_CALLBACK_URL!, // must match in Cloud Console
      passReqToCallback: true,
    },
    // NOTE: the 4-arg signature with req is (req, accessToken, refreshToken, params, profile, done)
    // Some typings show 5 args; adapt to your version if needed.
    async (
      req: any,
      accessToken: string,
      refreshToken: string | undefined,
      params: any,
      profile: Profile,
      done: VerifyCallback,
    ) => {

      // find or create your user first...
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value ?? null;
      const name = profile.displayName ?? null;
      const photo = profile.photos?.[0]?.value ?? null;

      // Upsert user:
      let user = await UserModel.findOne({ googleId });
      if (!user) {
        user = await UserModel.create({ googleId, email, name, photo });
      } else {
        user.set({ email, name, photo });
        await user.save();
      }

      // Persist access token metadata if you want (expiry = params.expires_in)
      user.tokens = user.tokens || {};
      user.tokens.accessToken = accessToken;
      user.tokens.idToken = params?.id_token ?? user.tokens.idToken;
      user.tokens.expiresIn = params?.expires_in ?? 3600;
      user.tokens.issuedAt = Date.now();

      if (refreshToken) {
        user.tokens.refreshToken = refreshToken;
      }
      await user.save();

      return done(null, user);
    },
  ),
);

export default passport;
