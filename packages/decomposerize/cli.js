#!/usr/bin/env node
/* eslint-disable */

const decomposerize = require('./dist/decomposerize');

process.stdin.on("data", data => {
	console.log(decomposerize(data.toString()));
});