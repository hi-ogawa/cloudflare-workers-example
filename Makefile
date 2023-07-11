# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

db/reset: db/reset/dev db/reset/test db/reset/preview

db/reset/dev:
	rm -rf .wrangler/.node-env/development
	mkdir -p .wrangler/.node-env/development
	pnpm -s migrate init-latest

db/reset/test:
	rm -rf .wrangler/.node-env/test
	mkdir -p .wrangler/.node-env/test
	NODE_ENV=test pnpm -s migrate init-latest

db/reset/preview:
	rm -rf .wrangler/state/v3/{d1,kv}
	mkdir -p .wrangler/state/v3/d1/demo-preview
	D1_SQLITE_PATH=.wrangler/state/v3/d1/demo-preview/db.sqlite pnpm -s migrate init-latest
