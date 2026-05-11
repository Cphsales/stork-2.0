# Stork 2.0

Greenfield successor til Stork 1.0 (sales-commission-hub). Bygges som
pnpm + Turborepo monorepo med shared TypeScript-engine i `@stork/core`,
shadcn/Vite-frontend i `apps/web`, og Supabase som backend.

## Layout

```
stork-2.0/
├── apps/
│   └── web/              shadcn + Vite + React 18 frontend
├── packages/
│   ├── core/             @stork/core: formel-engine, status-model
│   ├── types/            @stork/types: auto-generated Database-typer
│   ├── utils/            @stork/utils: rene helpers
│   └── eslint-config/    @stork/eslint-config: delt ESLint-config
├── supabase/             migrations, edge functions, config
└── .github/workflows/    CI
```

## Toolchain

- Node 22 LTS (`.nvmrc`)
- pnpm 10 (håndhævet via `packageManager`-feltet + Corepack)
- Turborepo 2.x

## Scripts

Fra repo-rod:

- `pnpm install` — installer alle workspaces
- `pnpm dev` — start alle apps (turbo)
- `pnpm build` — byg alle workspaces
- `pnpm lint` / `pnpm typecheck` / `pnpm test` — på tværs af workspaces

## Status

Fase 0 — fundament. Se forrige sessions
`code-forstaaelse-samlet.md` for kontekst og A1-A10-plan.
