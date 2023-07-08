# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

db/reset:
	mkdir -p .wrangler/.node-env/development
	rm -f .wrangler/.node-env/development/d1.sqlite
	echo 'PRAGMA table_list' | sqlite3 .wrangler/.node-env/development/d1.sqlite

db/migrate:
	sqlite3 .wrangler/.node-env/development/d1.sqlite < src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/reset/preview:
	rm -rf .wrangler/state/v3/d1/demo-preview/db.sqlite

db/migrate/preview:
	npx wrangler d1 execute demo --env preview --local --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/migrate/production:
	npx wrangler d1 execute demo --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql

db/migrate/production/down:
	npx wrangler d1 execute demo --file src/db/migrations/2023-07-08-11-49-30-create-table-counter/down.sql
