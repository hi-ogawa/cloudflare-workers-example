#!/bin/bash
set -eu -o pipefail

# usage:
#   bash prisma/create-migration.sh create-xxx-table

name="$(date --utc '+%Y-%m-%d-%H-%M-%S')-${1}"
base_dir="${2:-src/db/migrations}"

out_dir="$base_dir/$name"
mkdir -p "$out_dir"

echo ":: generating '$out_dir/up.sql'..."
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > "$out_dir/up.sql"

echo ":: generating '$out_dir/down.sql'..."
npx prisma migrate diff --to-schema-datasource prisma/schema.prisma --from-schema-datamodel prisma/schema.prisma --script > "$out_dir/down.sql"
