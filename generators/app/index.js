'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    this.log(yosay(`${chalk.red('generator-fastify-ts')} generator`));

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'App Name',
        default: 'my-fastify-app',
      },
      {
        type: 'list',
        name: 'db',
        message: 'Select Database',
        choices: ['mongodb', 'postgresql'],
        default: 'mongodb',
      },
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select optional plugin(s)',
        choices: ['cors', 'sensible', 'swagger', 'redis', 'cookie', 'multipart', 'mailer', 's3', 'jwt'],
        default: ['cors', 'sensible', 'swagger'],
      },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = props;
    });
  }

  writing() {
    const template = this.sourceRoot();
    const dest = this.destinationPath(`${this.props.name}`);

    const copyOpts = {
      globOptions: {
        dot: true,
        ignore: [
          `${template}/gitignore`,
          ...(this.props.plugins.includes('redis') ? [] : [`${template}/src/plugins/redis.ts`]),
          ...(this.props.db === 'postgresql'
            ? [`${template}/src/plugins/mongo`, `${template}/src/errors`]
            : [`${template}/src/plugins/prisma.ts`, `${template}/prisma`]),
          ...(this.props.plugins.includes('cors') ? [] : [`${template}/src/plugins/cors.ts`]),
          ...(this.props.plugins.includes('sensible')
            ? []
            : [`${template}/src/plugins/sensible.ts`]),
          ...(this.props.plugins.includes('swagger') ? [] : [`${template}/src/plugins/swagger.ts`]),
          ...(this.props.plugins.includes('multipart')
            ? []
            : [`${template}/src/plugins/multipart.ts`]),
          ...(this.props.plugins.includes('s3') ? [] : [`${template}/src/plugins/s3.ts`]),
          ...(this.props.plugins.includes('cookie') ? [] : [`${template}/src/plugins/cookie.ts`]),
          ...(this.props.plugins.includes('mailer')
          ? []
          : [`${template}/src/plugins/mailer.ts`, `${template}/src/template/email`]),
          ...(this.props.plugins.includes('jwt') ? [] : [`${template}/src/plugins/jwt.ts`]),
        ],
      },
    };

    this.fs.copyTpl(template, dest, this.props, {}, copyOpts);
    this.fs.copy(`${template}/gitignore`, `${dest}/.gitignore`);
  }

  install() {
    this.log(
      yosay(`Done!

${chalk.green(`Run: cd ${this.props.name} && yarn`)}
`),
    );
  }
};
