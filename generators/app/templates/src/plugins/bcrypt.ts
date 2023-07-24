import fastifyBcrypt from 'fastify-bcrypt';
import fp from 'fastify-plugin';

export interface IBcryptOpts {
  saltWorkFactor: number;
}

export const bcryptPlugin = fp(
  async (app, opts: IBcryptOpts) => {
    await app.register(fastifyBcrypt, opts);
  },
  {
    name: 'bcrypt',
    dependencies: ['cfg'],
  },
);
