## Plan: Tom side "Stork 2.0"

Opret en ny, tom side med titlen "Stork 2.0" som erstatter den nuværende placeholder på forsiden.

### Ændringer

1. **`src/pages/Index.tsx`** — Erstat placeholder-indholdet med en minimal, tom side der viser overskriften "Stork 2.0" centreret.
2. **`index.html`** — Opdater `<title>` til "Stork 2.0".

### Teknisk

- Bruger semantic tokens (`bg-background`, `text-foreground`) fra design systemet.
- Single `<h1>` for SEO.
- Ingen yderligere ruter eller komponenter — siden ligger på `/`.

Sig til hvis den i stedet skal ligge på en separat rute (fx `/stork-2`) ved siden af forsiden.