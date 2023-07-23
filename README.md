# generator-fastify-ts [![NPM version][npm-image]][npm-url]

> Fastify + Typescript boilerplate

## Plugins included

- You can choose either "[mongoose](https://github.com/Automattic/mongoose)" or "[prisma](https://github.com/prisma/prisma)" for database.
- [@fastify/cors](https://github.com/fastify/fastify-cors)
- [@fastify/sensible](https://github.com/fastify/fastify-sensible) - easier working with response.
- [@fastify/swagger](https://github.com/fastify/fastify-swagger) and [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) - serving Swagger (OpenAPI v2) or OpenAPI v3 schemas, which are automatically generated from your route schemas, or from an existing Swagger/OpenAPI schema.
- [@fastify/jwt](https://github.com/fastify/fastify-jwt)
- [fastify-multer](https://github.com/fox1t/fastify-multer) - handle file upload.
- [@fastify/redis](https://github.com/fastify/fastify-redis) - Connect and work with ioredis
- [@fastify/cookie](https://github.com/fastify/fastify-cookie) - adds support for reading and setting cookies.
- nodemailer - send email with [nodemailer](https://github.com/nodemailer/nodemailer) and [ejs](https://github.com/mde/ejs) template engine.
- aws s3 - upload file to aws s3 (or digitalocean).

## How to use plugins

All plugins are registered in file `src/app.ts`. THE REGISTER ORDER are important, because one plugin can depends on another.

After registration, plugin can be accessed through `app` - which is instance of `FastifyInstance`.

Example:

```typescript
// Example using it inside a route
app.get('/api', async (request, reply) => {
  const msgFromRedis = await app.redis.get('message');

  return reply.send({
    message: msgFromRedis,
  });
});
```

## Installation

First, install [Yeoman](http://yeoman.io) and generator-fastify-ts using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-fastify-ts
```

Then generate your new project:

```bash
yo fastify-ts
```

## Changelog

### [v0.1.6](https://github.com/luuhai48/generator-fastify-ts/tree/0.1.5)

- Update types for plugin `s3`

### [v0.1.5](https://github.com/luuhai48/generator-fastify-ts/tree/0.1.5)

- Replace `@fastify/multipart` with `fastify-multer`
- Fix bug with s3 plugin

### [v0.1.4](https://github.com/luuhai48/generator-fastify-ts/tree/0.1.4)

- Fix bug with email plugin

### [v0.1.3](https://github.com/luuhai48/generator-fastify-ts/tree/0.1.3)

- Fix bug missing `.gitignore` file

## License

MIT © [luuhai48](luuhai48.com)

[npm-image]: https://badge.fury.io/js/generator-fastify-ts.svg
[npm-url]: https://npmjs.org/package/generator-fastify-ts
