import fastifySwagger, { SwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export type ISwaggerPluginOpts = {
  swagger: SwaggerOptions;
  swaggerUI: FastifySwaggerUiOptions;
};

export const swaggerPlugin = fp(async (app, opts: ISwaggerPluginOpts) => {
  await app.register(fastifySwagger, opts.swagger);
  await app.register(fastifySwaggerUi, opts.swaggerUI);
});
