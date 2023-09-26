.PHONY: node_modules
node_modules:
	yarn

.PHONY: .env
.env:
	rm -f .env
	touch .env
	echo "SKIP_PREFLIGHT_CHECK=true" >> .env
	echo REACT_APP_DECOMPOSERIZE_VERSION=$(shell yarn info decomposerize version --json | jq .data) >> .env

build: .env node_modules
	yarn build
	cat sw.js > build/service-worker.js

test: .env node_modules
	yarn test --watchAll=false
