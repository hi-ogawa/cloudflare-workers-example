# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

# TODO: migration cli
db/reset:
	mkdir -p .wrangler/.node-env/development
	rm -f .wrangler/.node-env/development/d1.sqlite
	echo 'PRAGMA table_list' | sqlite3 .wrangler/.node-env/development/d1.sqlite

db/migrate:
	sqlite3 .wrangler/.node-env/development/d1.sqlite < src/db/migrations/2023-07-08-11-49-30-create-table-counter/up.sql
