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

| Tool         | Version | Pinning                                                                            |
| ------------ | ------- | ---------------------------------------------------------------------------------- |
| Node         | 22 LTS  | `.nvmrc`, `.tool-versions`, `package.json#engines`                                 |
| pnpm         | 10.33.0 | `package.json#packageManager` (Corepack), `.tool-versions`, `package.json#engines` |
| Turborepo    | 2.x     | `package.json#devDependencies`                                                     |
| Supabase CLI | 2.98.x  | workspace devDep, downloadet via postinstall                                       |

`.npmrc` håndhæver `engine-strict=true` — pnpm afviser install hvis
Node- eller pnpm-version ligger uden for engines-range.

## Setup (engangsskridt)

```bash
# Hvis du bruger nvm
nvm install            # læser .nvmrc → 22

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

## Disciplin-mekanismer

- **Pre-commit:** Husky + lint-staged kører Prettier og ESLint på
  staged files (`.husky/pre-commit`)
- **CI:** GitHub Actions kører hele pipelinen på PRs
  (`.github/workflows/ci.yml`)
- **Branch-protection:** Påkrævede checks + review + linear history.
  Konfiguration dokumenteret i `.github/BRANCH_PROTECTION.md`
- **ESLint:** Delt config i `@stork/eslint-config` med Stork-regler
  (no-console, no-explicit-any, strict no-unused-vars)
- **TypeScript:** `tsconfig.base.json` med fuld strict +
  noUncheckedIndexedAccess + exactOptionalPropertyTypes

## Status

Fase 0 — fundament. Se forrige sessions
`code-forstaaelse-samlet.md` for kontekst og A1-A10-plan.
