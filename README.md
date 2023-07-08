# cloudflare-workers-example

trying out cloudflare workers and wrangler cli workflow.

```sh
# dev
pnpm i
pnpm dev

# release
pnpm build
pnpm release
```

## summary

- [x] SSR server
- [x] API server
- [x] client assets on `bucket`
- [x] persistence on `KV` and `D1`
- [x] HMR dev server with `vite`
- [x] local preview server with `wrangler dev`
