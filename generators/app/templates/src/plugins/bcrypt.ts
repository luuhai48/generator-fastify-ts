import fp from 'fastify-plugin';
import fastifyBcrypt from 'fastify-bcrypt';

export interface IBcryptOpts {
  saltWorkFactor: number;
}

export const bcryptPlugin = fp(async (app, opts: IBcryptOpts) => {
  await app.register(fastifyBcrypt, opts);
});
