# prisma schema

use prisma only as a schema-diff tool.

```sh
npx prisma

# up migration
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script

#  down migration
npx prisma migrate diff --to-schema-datasource prisma/schema.prisma --from-schema-datamodel prisma/schema.prisma --script


# 0. edit schema.prisma

# 1. create up/down migrations
bash prisma/create-migration.sh create-xxx-table

# 2. apply migration
pnpm migrate up

npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```
