import closeWithGrace from 'close-with-grace';
import * as dotenv from 'dotenv';
import fastify from 'fastify';

import { appService } from './app';

dotenv.config();

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'error',
  },
  pluginTimeout: 10_000,
});
app.register(appService);

closeWithGrace(async ({ err }: { err?: Error }) => {
  if (err) {
    app.log.error(err);
  }
  await app.close();
});

app.listen(
  { port: parseInt(process.env.PORT || '8080'), host: '0.0.0.0' },
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  },
);
