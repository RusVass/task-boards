import { createApp } from './app';
import { env } from './config/env';
import { connectDb } from './config/db';

const main = async () => {
  await connectDb();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
};

main().catch((err) => {
  console.error('Fatal error', err);
  process.exit(1);
});
