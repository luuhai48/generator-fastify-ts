import { FastifyInstance } from 'fastify';

export const registerRoutes = async (app: FastifyInstance) => {
  app.get('/', () => ({
    status: 'ok',
  }));
};
