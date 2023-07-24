import multer from 'fastify-multer';
import fp from 'fastify-plugin';

import type { File } from 'fastify-multer/lib/interfaces';

declare module 'fastify' {
  interface FastifyInstance {
    multer: ReturnType<typeof multer>;
  }
  interface FastifyRequest {
    file?: File;
    files: {
      [key: string]: File[];
    };
  }
}

export const multerPlugin = fp(
  async (app) => {
    await app.register(multer.contentParser);
    app.decorate(
      'multer',
      multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 20 * 1024 * 1024, // 20MB
        },
      }),
    );
  },
  {
    name: 'multer',
    dependencies: ['cfg'],
  },
);

