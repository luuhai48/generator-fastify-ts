import cors, { FastifyCorsOptions, FastifyCorsOptionsDelegate } from '@fastify/cors';
import fp from 'fastify-plugin';

export type ICorsPluginOpts = NonNullable<FastifyCorsOptions> | FastifyCorsOptionsDelegate;

export const corsPlugin = fp(
  async (app, opts: ICorsPluginOpts) => {
    await app.register(cors, opts);
  },
  {
    name: 'cors',
    dependencies: ['cfg'],
  },
);
