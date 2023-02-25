import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authVerify: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export type IJwtPluginOpts = FastifyJWTOptions;

export const jwtPlugin = fp(async (app, opts) => {
  await app.register(fastifyJwt, opts as FastifyJWTOptions);

  app.decorate('authVerify', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
