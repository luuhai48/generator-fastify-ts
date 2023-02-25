import multipart, {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import fp from 'fastify-plugin';

export type IMultipartPluginOpts =
  | FastifyMultipartBaseOptions
  | FastifyMultipartOptions
  | FastifyMultipartAttachFieldsToBodyOptions;

export const multipartPlugin = fp(async (app, opts) => {
  await app.register(multipart, opts);
});
