import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie';
import fp from 'fastify-plugin';

export type ICookiePluginOpts = FastifyCookieOptions;

export const cookiePlugin = fp(
  async (app, opts: ICookiePluginOpts) => {
    await app.register(fastifyCookie, opts);
  },
  {
    name: 'cookie',
    dependencies: ['cfg'],
  },
);
