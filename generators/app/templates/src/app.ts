import { FastifyInstance } from 'fastify';

import {
  configPlugin,
  IConfigOpts,<% if (plugins.includes('cors')) {%>
  corsPlugin,
  ICorsPluginOpts,<%}%><% if (plugins.includes('sensible')) {%>
  sensiblePlugin,<%}%><% if (db === 'mongodb') {%>
  mongodbPlugin,
  IMongoDBPluginOpts,<%}%><% if (db === 'postgresql') {%>
  prismaPlugin,<%}%><% if (plugins.includes('swagger')) {%>
  swaggerPlugin,
  ISwaggerPluginOpts,<%}%><% if (plugins.includes('redis')) {%>
  redisPlugin,
  IRedisPluginOpts,<%}%><% if (plugins.includes('mailer')) {%>
  mailerPlugin,
  IMailerPluginOpts,<%}%><% if (plugins.includes('s3')) {%>
  s3Plugin,
  IS3PluginOpts,<%}%><% if (plugins.includes('multipart')) {%>
  multipartPlugin,
  IMultipartPluginOpts,<%}%><% if (plugins.includes('cookie')) {%>
  cookiePlugin,
  ICookiePluginOpts,<%}%><% if (plugins.includes('jwt')) {%>
  jwtPlugin,
  IJwtPluginOpts,<%}%>
} from '@/plugins';
import { registerRoutes } from '@/routes';

export const appService = async function (app: FastifyInstance) {
  /**
   * ! Register positions are important
   */

  await app.register(configPlugin, {
    envsWhitelist: [
      'NODE_ENV',
      'API_VERSION',
      'DATABASE_URL',<% if (plugins.includes('redis')) {%>
      'REDIS_URL',<%}%><% if (plugins.includes('mailer')) {%>
      'MAIL_HOST',
      'MAIL_PORT',
      'MAIL_USER',
      'MAIL_PASS',
      'MAIL_FROM',<%}%><% if (plugins.includes('cookie')) {%>
      'COOKIE_SECRET',<%}%><% if (plugins.includes('s3')) {%>
      'S3_PROVIDER',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'S3_BUCKET',
      'S3_REGION',<%}%><% if (plugins.includes('jwt')) {%>
      'JWT_SECRET',<%}%>
    ],
  } as IConfigOpts);

  <% if (plugins.length) {%>await Promise.all([
    <% if (plugins.includes('cors')) {%>app.register(corsPlugin, {
      credentials: true,
      origin: true,
    } as ICorsPluginOpts),<%}%><% if (plugins.includes('sensible')) {%>
    app.register(sensiblePlugin),<%}%><% if (plugins.includes('cookie')) {%>
    app.register(cookiePlugin, {
      secret: app.cfg.get('COOKIE_SECRET'),
      parseOptions: {
        sameSite: 'none',
      },
    } as ICookiePluginOpts),<%}%><% if (plugins.includes('multipart')) {%>
    app.register(multipartPlugin, {
      attachFieldsToBody: true,
      limits: {
        fileSize: 1024 * 1024 * 5,
        files: 10,
        fields: 0,
      },
    } as IMultipartPluginOpts),<%}%><% if (plugins.includes('mailer')) {%>
    app.register(mailerPlugin, {
      transport: {
        host: app.cfg.get('MAIL_HOST'),
        port: app.cfg.get('MAIL_PORT'),
        auth: {
          user: app.cfg.get('MAIL_USER'),
          pass: app.cfg.get('MAIL_PASS'),
        },
      },
      defaults: {
        from: app.cfg.get('MAIL_FROM'),
      },
    } as IMailerPluginOpts),<%}%><% if (plugins.includes('swagger')) {%>
    app.register(swaggerPlugin, {
      swagger: {
        swagger: {
          info: {
            title: 'API documentation',
            version: '0.1.0',
          },
          consumes: ['application/json'],
          produces: ['application/json'],
          securityDefinitions: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
            },
          },
          security: [
            {
              Bearer: [],
            },
          ],
        },
      },
      swaggerUI: {
        routePrefix: '/api/doc',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: false,
        },
      },
    } as ISwaggerPluginOpts),<%}%><% if (plugins.includes('s3')) {%>
    app.register(s3Plugin, {
      provider: app.cfg.get('S3_PROVIDER'),
      region: app.cfg.get('S3_REGION'),
      bucketName: app.cfg.get('S3_BUCKET'),
      accessKeyId: app.cfg.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: app.cfg.get('S3_SECRET_ACCESS_KEY'),
    } as IS3PluginOpts),<%}%><% if (plugins.includes('redis')) {%>
    app.register(redisPlugin, {
      url: app.cfg.get('REDIS_URL'),
    } as IRedisPluginOpts),<%}%><% if (db === 'mongodb') {%>
    app.register(mongodbPlugin, {
      mydb: {
        uri: app.cfg.get('DATABASE_URL'),
      },
    } as IMongoDBPluginOpts),<%} else {%>app.register(prismaPlugin),<%}%>
  ]);<%}%><% if (plugins.includes('jwt')) {%>
    app.register(jwtPlugin, {
      secret: app.cfg.get('JWT_SECRET'),
    } as IJwtPluginOpts),<%}%>

  await app.register(registerRoutes, {
    prefix: `/api/v${app.cfg.get('API_VERSION') || 1}`,
  });
};
