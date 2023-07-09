# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

db/reset: db/reset/dev db/reset/test db/reset/preview

db/reset/dev:
	mkdir -p .wrangler/.node-env/development
	rm -f .wrangler/.node-env/development/d1.sqlite
	pnpm -s migrate latest

db/reset/test:
	mkdir -p .wrangler/.node-env/test
	rm -f .wrangler/.node-env/test/d1.sqlite
	NODE_ENV=test pnpm -s migrate latest

db/reset/preview:
	rm -rf .wrangler/state/v3/d1/demo-preview
	mkdir -p .wrangler/state/v3/d1/demo-preview
	D1_SQLITE_PATH=.wrangler/state/v3/d1/demo-preview/db.sqlite pnpm -s migrate latest
