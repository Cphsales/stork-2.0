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
├── supabase/             migrations, tests, config
├── docs/                 Mathias' dokumenter (strategi/), krav og ledger (sandhed/), teknisk gæld (teknisk/)
├── plan-build/           pakkernes planer, målelag og slut-rapporter
├── scripts/v5/           workflowets værktøjer: byggetjek, vagt, hooks, rolletekster
└── .github/workflows/    CI
```

## Toolchain

| Tool         | Version | Pinning                                                                            |
| ------------ | ------- | ---------------------------------------------------------------------------------- |
| Node         | 24 LTS  | `.nvmrc`, `.tool-versions`, `package.json#engines`                                 |
| pnpm         | 10.33.0 | `package.json#packageManager` (Corepack), `.tool-versions`, `package.json#engines` |
| Turborepo    | 2.x     | `package.json#devDependencies`                                                     |
| Supabase CLI | 2.98.x  | workspace devDep, downloadet via postinstall                                       |

`.npmrc` håndhæver `engine-strict=true` — pnpm afviser install hvis
Node- eller pnpm-version ligger uden for engines-range.

## Setup (engangsskridt)

```bash
# Hvis du bruger nvm
nvm install            # læser .nvmrc → 24

# Hvis du bruger asdf/mise
asdf install           # læser .tool-versions

# Aktivér Corepack så packageManager-feltet håndhæves
corepack enable

# Installer alle workspaces
pnpm install
```

## Scripts

Fra repo-rod:

- `pnpm install` — installer alle workspaces
- `pnpm dev` — start alle apps (turbo)
- `pnpm build` — byg alle workspaces
- `pnpm lint` / `pnpm typecheck` / `pnpm test` — på tværs af workspaces
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm exec supabase <cmd>` — Supabase CLI (se `supabase/README.md`)

## Workflow

Hver pakke bygges efter `docs/strategi/disciplin.md`: krav (`krav ok`) → plan (`plan ok`) → tests og byg → slutprøve (`slut ok`).

- **Pre-commit:** rollens zoner (`scripts/v5/pre-commit-zone.mjs`), vagten for Mathias' dokumenter (`scripts/v5/sandhed-vagt.mjs`) og lint-staged (Prettier; ESLint på `apps/web`).
- **CI** (`.github/workflows/ci.yml`): lint, typecheck, test, build, migration-gate, fitness, vagten og byggetjekket. Samle-tjekket `Lint, typecheck, test, build` er det krævede statustjek på main.
- **Deploy:** `migrations-deploy.yml` deployer migrationer ved merge til main.
- **ESLint:** delt config i `@stork/eslint-config`. **TypeScript:** `tsconfig.base.json` med fuld strict.
