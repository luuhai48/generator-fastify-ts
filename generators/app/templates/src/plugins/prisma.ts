import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (app) => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate('prisma', prisma);
  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
});
