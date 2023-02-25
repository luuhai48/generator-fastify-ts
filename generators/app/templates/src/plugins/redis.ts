import Redis, { FastifyRedisPluginOptions } from '@fastify/redis';
import fp from 'fastify-plugin';

export type IRedisPluginOpts = FastifyRedisPluginOptions;

export const redisPlugin = fp(async (app, opts) => {
  await app.register(Redis, opts);
});
