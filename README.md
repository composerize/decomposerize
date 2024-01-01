# decomposerize

[![Netlify Status](https://api.netlify.com/api/v1/badges/bebf915c-cdd7-4800-9179-d1f4031b0848/deploy-status)](https://app.netlify.com/sites/decomposerize/deploys)
[![npm](https://img.shields.io/npm/v/decomposerize.svg)](https://www.npmjs.com/package/decomposerize)
[![ShareVB on GitHub](https://img.shields.io/badge/ShareVB-100000?logo=github&logoColor=white)](https://github.com/sharevb)
            
http://decomposerize.com - Turns docker-compose file into `docker run` commands!

Looking for the reverse : http://composerize.com / [Composerize](https://github.com/magicmark/composerize)

Want to convert from Docker compose file formats : http://composeverter.com / [Composeverter](https://github.com/outilslibre/composeverter)

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

## Maintainers

- ShareVB [GitHub](https://github.com/sharevb)