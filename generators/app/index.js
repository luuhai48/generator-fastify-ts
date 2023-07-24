'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  async prompting() {
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
        name: 'modules',
        message: 'Select pre-defined module(s)',
        choices: ['authenticate'],
        default: ['authenticate'],
      },
    ];

    await this.prompt(prompts).then((props) => {
      this.props = props;
    });

    const selectPluginsPrompts = [
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select optional plugin(s)',
        choices: this.props.modules.includes('authenticate')
          ? ['cors', 'sensible', 'swagger', 'multer', 's3']
          : [
              'cors',
              'sensible',
              'swagger',
              's3',
              'multer',
              'redis',
              'cookie',
              'mailer',
              'jwt',
              'bcrypt',
            ],
        default: ['cors', 'sensible', 'swagger'],
      },
    ];

    await this.prompt(selectPluginsPrompts).then((props) => {
      this.props.plugins = [
        ...props.plugins,
        ...(this.props.modules.includes('authenticate')
          ? ['redis', 'cookie', 'mailer', 'jwt', 'bcrypt']
          : []),
      ];
    });
  }

  _getPluginIgnoreFiles(pluginName, paths) {
    return this.props.plugins.includes(pluginName)
      ? []
      : paths || [`${this.sourceRoot()}/src/plugins/${pluginName}.ts`];
  }

  writing() {
    const props = this.props;
    const template = this.sourceRoot();
    const dest = this.destinationPath(`${props.name}`);

    const copyOpts = {
      globOptions: {
        dot: true,
        ignore: [
          `${template}/gitignore`,
          ...(props.db === 'postgresql'
            ? [`${template}/src/plugins/mongo`, `${template}/src/errors`]
            : [`${template}/src/plugins/prisma.ts`, `${template}/prisma`]),
          ...(props.plugins.includes('multer') || props.plugins.includes('s3')
            ? []
            : [`${template}/src/plugins/multer.ts`]),
          ...this._getPluginIgnoreFiles('mailer', [
            `${template}/src/plugins/mailer.ts`,
            `${template}/src/template/email`,
          ]),
          ...['redis', 'cors', 'sensible', 'swagger', 's3', 'cookie', 'bcrypt', 'jwt']
            .map((p) => this._getPluginIgnoreFiles(p))
            .flat(),
        ],
      },
    };

    this.fs.copyTpl(template, dest, props, {}, copyOpts);
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
