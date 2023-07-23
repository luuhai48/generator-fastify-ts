import { FastifyInstance } from 'fastify';

import {
  configPlugin,<% if (plugins.includes('cors')) {%>
  corsPlugin,<%}%><% if (plugins.includes('sensible')) {%>
  sensiblePlugin,<%}%><% if (db === 'mongodb') {%>
  mongodbPlugin,<%}%><% if (db === 'postgresql') {%>
  prismaPlugin,<%}%><% if (plugins.includes('swagger')) {%>
  swaggerPlugin,<%}%><% if (plugins.includes('redis')) {%>
  redisPlugin,<%}%><% if (plugins.includes('mailer')) {%>
  mailerPlugin,<%}%><% if (plugins.includes('s3')) {%>
  s3Plugin,
  IS3PluginOpts,<%}%><% if (plugins.includes('multer') || plugins.includes('s3')) {%>
  multerPlugin,<%}%><% if (plugins.includes('cookie')) {%>
  cookiePlugin,<%}%><% if (plugins.includes('jwt')) {%>
  jwtPlugin,<%}%>
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
  });

  <% if (plugins.length) {%>await Promise.all([
    <% if (plugins.includes('cors')) {%>app.register(corsPlugin, {
      credentials: true,
      origin: true,
    }),<%}%><% if (plugins.includes('sensible')) {%>
    app.register(sensiblePlugin),<%}%><% if (plugins.includes('cookie')) {%>
    app.register(cookiePlugin, {
      secret: app.cfg.get('COOKIE_SECRET') || 'cookiesecret',
      parseOptions: {
        sameSite: 'none',
      },
    }),<%}%><% if (plugins.includes('multer') || plugins.includes('s3')) {%>
    app.register(multerPlugins),<%}%><% if (plugins.includes('mailer')) {%>
    app.register(mailerPlugin, {
      transport: {
        host: app.cfg.get('MAIL_HOST'),
        port: parseInt(app.cfg.get('MAIL_PORT') || '587'),
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
          <% if (plugins.includes('jwt')) {%>securityDefinitions: {
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
          ],<%}%>
        },
      },
      swaggerUI: {
        routePrefix: '/api/doc',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: false,
        },
      },
    }),<%}%><% if (plugins.includes('s3')) {%>
    app.register(s3Plugin, {
      provider: app.cfg.get('S3_PROVIDER') as IS3PluginOpts['provider'],
      region: app.cfg.get('S3_REGION'),
      bucketName: app.cfg.get('S3_BUCKET'),
      accessKeyId: app.cfg.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: app.cfg.get('S3_SECRET_ACCESS_KEY'),
    }),<%}%><% if (plugins.includes('redis')) {%>
    app.register(redisPlugin, {
      url: app.cfg.get('REDIS_URL'),
    }),<%}%><% if (db === 'mongodb') {%>
    app.register(mongodbPlugin, {
      mydb: {
        uri: app.cfg.get('DATABASE_URL'),
      },
    }),<%} else {%>app.register(prismaPlugin),<%}%><% if (plugins.includes('jwt')) {%>
    app.register(jwtPlugin, {
      secret: app.cfg.get('JWT_SECRET'),
    }),<%}%>
  ]);<%}%>

  await app.register(registerRoutes, {
    prefix: `/api/v${app.cfg.get('API_VERSION') || 1}`,
  });
};
