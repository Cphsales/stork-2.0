# Codex CLI — sandbox-opsætning

Reference for hvordan `~/.codex/config.toml` er sat op til Stork 2.0.

---

## Aktiv config

```toml
approval_policy = "on-request"       # codex spørger ved risikofyldte ops
sandbox_mode = "workspace-write"     # læs alt, skriv kun i cwd + /tmp
model = "gpt-5.5"
model_reasoning_effort = "xhigh"

[sandbox_workspace_write]
network_access = true                # remote Supabase, GitHub, git push

[plugins."github@openai-curated"]
enabled = true

[projects."/home/mathias/stork-2.0"]
trust_level = "trusted"

[projects."/home/mathias"]
trust_level = "trusted"
```

---

## Hvad det giver

| Område                                                                | Adgang                 |
| --------------------------------------------------------------------- | ---------------------- |
| Læse alle filer i repo + system                                       | ✅                     |
| Skrive i `stork-2.0/` (inkl. `docs/`, `supabase/`, tests)             | ✅                     |
| Skrive i `/tmp/`                                                      | ✅                     |
| Skrive udenfor cwd (`~/`, `/etc`, andet)                              | ❌ Blokeret af sandbox |
| Køre shell-kommandoer (`npm test`, `pytest`, `supabase test`, `psql`) | ✅                     |
| Netværk (`curl`, remote Supabase, GitHub API, `git push`)             | ✅                     |
| Destruktive ops (force-push, drops, `rm -rf`)                         | ⚠️ Spørger først       |

---

## Verifikation

```bash
codex doctor
# Forventet: sandbox  restricted fs + enabled network · approval OnRequest
```

Smoke-test:

```bash
codex exec --skip-git-repo-check "Kør 'ls -la docs/teknisk/' og rapportér."
```

---

## Hvorfor ikke en custom permissions-profil?

Forsøgt med en `permissions.stork_supabase` profil (filsystem + netværks-allowlist) — det virkede ikke i praksis: custom profiler arver ikke base-mounts som de indbyggede modes (`workspace-write`, `read-only`, `danger-full-access`), så `/usr`, `/bin`, `/etc` osv. var ikke mounted ind i sandboxen og _ingen_ shell-kommando kunne køres. Fejlmønstret var:

```
bwrap: execvp /home/mathias/.nvm/.../codex/codex: No such file or directory
```

eller senere i kæden:

```
Failed to execvp /bin/bash: No such file or directory
```

`workspace-write` mounter system-paths korrekt. Hvis stramning ønskes senere, brug `[sandbox_workspace_write]` sektionen til at finjustere (`writable_roots`, `exclude_tmpdir_env_var`, osv.) i stedet for at definere en custom profil fra bunden.

---

## Hurtigt fallback

Hvis Codex pludselig ikke kan køre kommandoer:

```bash
codex doctor                                   # tjek sandbox/auth/network
ls /home/mathias/.codex/config.toml.bak.*      # tidligere konfigurationer
```

Backup-filer ligger som `~/.codex/config.toml.bak.<timestamp>`.

---

**Sidste opdatering:** 2026-05-19 — etablering af workspace-write opsætning efter fix af bwrap-sandbox-fejl.
