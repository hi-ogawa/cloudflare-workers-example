# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

# use ad-hoc script rather than wrangler migration cli e.g.
# https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/d1/migrations/apply.tsx#L152-L159

db/reset:
	mkdir -p .wrangler/.node-env/development
	rm -f .wrangler/.node-env/development/d1.sqlite
	echo 'PRAGMA table_list' | sqlite3 .wrangler/.node-env/development/d1.sqlite

db/reset/test:
	mkdir -p .wrangler/.node-env/test
	rm -f .wrangler/.node-env/test/d1.sqlite
	echo 'PRAGMA table_list' | sqlite3 .wrangler/.node-env/development/d1.sqlite

db/migrate:
	sqlite3 .wrangler/.node-env/development/d1.sqlite < src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/migrate/test:
	sqlite3 .wrangler/.node-env/test/d1.sqlite < src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/reset/preview:
	rm -rf .wrangler/state/v3/d1/demo-preview/db.sqlite

db/migrate/preview:
	npx wrangler d1 execute demo --env preview --local --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/migrate/production:
	npx wrangler d1 execute demo --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/migrate/production/down:
	npx wrangler d1 execute demo --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/down.sql

test-setup:
	rm -rf .wrangler/.node-env/test
	make db/reset/test db/migrate/test
	# TODO: workerd preview
	# rm -rf .wrangler/.node-env/test .wrangler/state
	# make db/reset/test db/migrate/test db/migrate/preview
