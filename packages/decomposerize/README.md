# decomposerize

[![Build Status](https://travis-ci.org/outilslibre/decomposerize.svg?branch=master)](https://travis-ci.com/github/outilslibre/decomposerize)
[![npm](https://img.shields.io/npm/v/decomposerize.svg)](https://www.npmjs.com/package/decomposerize)
[ShareVB on GitHub](https://github.com/sharevb)
            
http://decomposerize.com - Turns docker-compose file into `docker run` commands!

Looking for the reverse : http://composerize.com / [Composerize](https://github.com/magicmark/composerize)

## CLI

decomposerize can be run in the cli.

`npm install decomposerize -g` to install, and run as such:

```bash
$ decomposerize << docker-compose.yml
```

# API

**convertToDockerRunCommands(dockerComposeContent, configuration={})**

   - `dockerComposeContent`: A string representing the Docker Compose file input.
   - `configuration`: optional configuration options in form of an object
	   - `command`: A string that defines the Docker command to generate (e.g., 'docker run', 'docker create', 'docker container run'). It has a default value of 'docker run'.
	   - `rm`: A boolean that, when true, adds the '--rm' option to the command line arguments. The default value is `false`.
	   - `detach`: A boolean that, when true, adds the '-d' option to the command line arguments. The default value is `false`.
	   - `multiline`: A boolean that, when true, emits the command in multiline shell command format. The default value is `false`.
	   - `'long-args'`: A boolean that, when true, emits long command line arguments (e.g., '--tty' instead of '-t'). The default value is `false`.
	   - `'arg-value-separator'`: A string representing the separator used between command arguments and their values. It can be either ' ' (space) or '='. The default value is ' ' (space).

**returns**

It returns the Docker run command(s) generated based on the input Docker Compose file and the provided configuration

# How to use with node.js

Make sure to install the `composerize` package in your project by running:

```bash
npm install decomposerize
```

With the following code, you can easily integrate **Decomposerize** into your Node.js project and generate Docker run command(s) from Docker Compose configurations.


```javascript
const convertToDockerRunCommands = require('decomposerize');

const dockerComposeInput = `
version: '3'
services:
  myapp:
    image: myapp-image
`;

const configuration = {
  command: 'docker run',
  rm: true,
  detach: false,
  multiline: true,
  'long-args': false,
  'arg-value-separator': ' ',
};

const dockerRunCommands = convertToDockerRunCommands(dockerComposeInput, configuration);

console.log('Generated Docker Run Commands:');
console.log(dockerRunCommands);
```

## Contributing

- [Clone a fork of the repo](https://guides.github.com/activities/forking/) and install the project dependencies by running `yarn`
- Make your changes, and build the project by running `make build`
- Test your changes with `make test`

### yarn version

Needs yarn@1.19.1. See https://github.com/yarnpkg/yarn/issues/7734.

## Maintainers

- ShareVB [GitHub](https://github.com/sharevb)