import fp from 'fastify-plugin';

import { mongoConnector } from './connector';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: Awaited<ReturnType<typeof mongoConnector>>;
  }
}

export const mongodbPlugin = fp(async (app, opts) => {
  const dbsManager = await mongoConnector(opts);
  app.decorate('mongo', dbsManager);
  app.addHook('onClose', async () => dbsManager.closeAllConnections());
});

export { IMongoDBPluginOpts } from './connector';
