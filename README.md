# cloudflare-workers-example

trying out cloudflare workers and wrangler cli workflow.

```sh
# dev
pnpm i
make db/reset
pnpm dev

# run local workerd
pnpm build
pnpm preview

# release
pnpm build
pnpm release

# migration on D1
pnpm migrate-production status
```

## summary

- [x] SSR server
- [x] API server
- [x] client assets on `bucket`
- [x] persistence on `KV` and `D1`
- [x] both local and remote `D1` migration with `kysely` (see `./src/db/migrate-cli.ts`)
- [x] HMR dev server with `vite`
- [x] local preview server with `wrangler dev`
- [x] E2E testing on CI
