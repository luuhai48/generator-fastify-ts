import enm, { EjsTransporter } from 'ejs-nodemailer';
import fp from 'fastify-plugin';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

declare module 'fastify' {
  interface FastifyInstance {
    mailer: EjsTransporter;
  }
}

export interface IMailerPluginOpts {
  transport: SMTPTransport | SMTPTransport.Options | string;
  defaults?: SMTPTransport.Options;
}

export const mailerPlugin = fp(
  async (app, { transport, defaults }: IMailerPluginOpts) => {
    let transporter: ReturnType<typeof createTransport>;
    if (!defaults) {
      transporter = createTransport(transport);
    } else {
      transporter = createTransport(transport, defaults);
    }
    transporter.use(
      'compile',
      enm({
        layoutsDir: 'src/template/email/layouts', // Directory where you store all the layout template files
        templatePath: 'src/template/email', // Directory where you store all the template files.
        defaultLayout: 'main',
      }),
    );

    app.decorate('mailer', transporter);
  },
  {
    name: 'mailer',
    dependencies: ['cfg'],
  },
);
