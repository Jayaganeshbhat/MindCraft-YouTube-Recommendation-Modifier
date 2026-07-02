import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './auth/passport.js';
import { connectDB } from './config/db.js';
import { env, validateEnv } from './config/env.js';
import authRoutes from './routes/auth.js';
import { createPath } from './routes/paths/create';
import { paths } from './routes/paths/list';
import mongoose from 'mongoose';
import { deletePath } from './routes/paths/delete';
import { youtubeResources } from './routes/paths/youtubeResources';
import { watchHistory } from './routes/watchHistory'; 

async function bootstrap() {
  validateEnv();
  await connectDB();

  const app = express();

  app.set('trust proxy', 1);

  app.use(express.json());

  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: MongoStore.create({
        mongoUrl: env.MONGO_URI,
        ttl: 60 * 60 * 24 * 14,
      }),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);

  app.use('/paths', createPath);
  app.use('/paths', youtubeResources);
  app.use('/paths', paths);
  app.use('/paths', deletePath);
  app.use('/', watchHistory);
 

  const mongo = process.env.MONGO_URI;
  if (!mongo) throw new Error('MONGODB_URI not set');
  await mongoose.connect(mongo);

  app.listen(env.PORT, () => {
    console.log(`[server] Listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[bootstrap] Error:', err);
  process.exit(1);
});
