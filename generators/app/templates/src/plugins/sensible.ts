import sensible, { SensibleOptions } from '@fastify/sensible';
import fp from 'fastify-plugin';

export type ISensiblePluginOpts = SensibleOptions;

export const sensiblePlugin = fp(
  async (app, opts: ISensiblePluginOpts) => {
    await app.register(sensible, opts);
  },
  {
    name: 'sensible',
    dependencies: ['cfg'],
  },
);
