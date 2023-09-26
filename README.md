# decomposerize

[![Build Status](https://travis-ci.org/outilslibre/decomposerize.svg?branch=master)](https://travis-ci.com/github/outilslibre/decomposerize)
[![npm](https://img.shields.io/npm/v/decomposerize.svg)](https://www.npmjs.com/package/decomposerize)
            
http://decomposerize.com - Turns docker-compose file into `docker run` commands!

## CLI

decomposerize can be run in the cli.

`npm install decomposerize -g` to install, and run as such:

```bash
$ decomposerize << docker-compose.yml
```

## Contributing

- [Clone a fork of the repo](https://guides.github.com/activities/forking/) and install the project dependencies by running `yarn`
- Make your changes, and build the project by running `make build`
- Test your changes with `make test`

### yarn version

Needs yarn@1.19.1. See https://github.com/yarnpkg/yarn/issues/7734.

## Maintainers

- ShareVB
