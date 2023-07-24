import Redis, { FastifyRedisPluginOptions } from '@fastify/redis';
import fp from 'fastify-plugin';

export type IRedisPluginOpts = FastifyRedisPluginOptions;

export const redisPlugin = fp(
  async (app, opts: IRedisPluginOpts) => {
    await app.register(Redis, opts);
  },
  {
    name: 'redis',
    dependencies: ['cfg'],
  },
);
