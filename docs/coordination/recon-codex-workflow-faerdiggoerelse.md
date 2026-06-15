# workflow-faerdiggoerelse — Codex-recon

**Form:** kun fund + åbne spørgsmål. Ingen plan, intet design, ingen funktionsvalg.
**Status:** Codex' recon-artefakt til deling mellem aktører.
**Dato:** 2026-06-15.

## Fund

✓ **Kildegrundlaget i repoet er ikke ét samlet workflow-grundlag endnu.**
Det nye krav-dok (`docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`) siger selv, at det eksisterende workflow kun er inspiration på linje med net-søgning og aktør-flader. Det lokale sandhedsgrundlag er derfor blandet: `disciplin.md` beskriver nuværende V5/kæde-tilstand, gov-5-rapporten bærer live-bevis og ærlige grænser, gov-6-kataloget bærer forslag/udskudte tråde, og Claude Code-kataloget bærer ekstern funktions-recon. Kilder: `docs/coordination/workflow-faerdiggoerelse-krav-og-data.md`, `docs/strategi/disciplin.md`, `docs/coordination/rapport-historik/2026-06-11-gov-5-automation.md`, `docs/coordination/gov-6-forslag-og-udskudte.md`, `docs/teknisk/claude-code-egenskaber.md`.

✓ **Live-testet i vores setup: kæde-kernen findes som lokal transportmekanik, ikke som dømmekraft.**
Gov-5-rapporten bogfører 111 grønne selftest-cases, live Codex-adapter-led, online dry-run og `claude -p` headless-auth med exit 0. Det muliggør metoden "tilstand + deklaration + regelbog + adapter" frem for chat-relæ: kuréren læser state, regelbog og aktør-deklarationer, og den fryser leverancer som transport. Alternativerne i materialet er GitHub Actions/runner, lokal watcher, stående session eller cloud-rutine; ingen af dem ændrer rolle-dømmekraften.

✓ **Live-testet i vores setup: fail-closed og selvtjek er centrale, ikke pynt.**
`scripts/kaede/dirigent.mjs` stopper ved divergens, ukendt betingelse, åben gate, aktiv kørsel, stale spor og halvskrevet leverance. `scripts/kaede/kaede-regler.json` bærer betingelser som hash-match, SHA-bundet approval/PASS og begge recon-docs før syntese. Det muliggør metoden "ingen routing før mekanisk sandhed er opfyldt". Alternativerne er prosa-disciplin eller manuel polling; materialet viser netop, at de alternativer tidligere gav stale status, race og relæ-glid.

✓ **Live-testet i vores setup: headless Claude.ai-rolle er mulig som rolle-kørsel, men ikke det samme som app-chatten.**
`scripts/kaede/adapters/claude-ai-rolle.sh` bruger `claude -p` og skriver untracked leverancer for recon-syntese, krav-troskabs-tjek, slut-rapport-review og gate-anmodning. Gov-5-rapportens grænse er vigtig: Windows-/desktop-chatten består til dialog med Mathias; headless er rollen i kæden. Det muliggør metoden "rolle-leverance uden Mathias som relæ". Alternativerne er manuel Claude.ai-chat, Agent SDK/programmatisk agent eller platform-/routine-trigger.

✓ **Live-testet i vores setup: Codex-adapteren kan levere review/recon som fil, men formel gate og uformel før-review er forskellige ting.**
`scripts/kaede/adapters/codex.sh` wrapper `scripts/codex-review.sh`, accepterer review-exits som legitime verdikter og skriver recon/research via tmp-fil før `mv`. Det muliggør metoden "uafhængig read-only kode-recon som artefakt". Alternativerne er manuel review-kørsel, GitHub PR review-integration eller uformel Codex-in-Claude før-review; formel gate må ikke udhules af uformel integration.

✓ **Live-testet i vores setup: GitHub/CODEOWNERS kan skelne beslutnings-stier og ramme-stier, men snittet er governance-følsomt.**
Den aktuelle `.github/CODEOWNERS` har default `@mgrubak` og ejer-løse mønstre for rolle-valideret bogføring og recon-leverancer. GitHub-dokumentationen understøtter mønsteret: sidste match vinder, og en senere linje uden owner kan efterlade en undermappe uden code owner. Metoden muliggør "Mathias klikker på beslutnings-stier, ikke ren transport". Alternativerne i gov-5-recon var rulesets/bypass eller direkte main-push; lokale docs afviser direkte main-push som brud på gated main. Kilde: GitHub CODEOWNERS docs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

✓ **Live-testet i vores setup: branch protection og stale approvals skaber reel friktion ved mange små PR'er.**
Gov-5-recon målte re-approval-ping-pong/merge-kø, og GitHub-dokumentationen beskriver, at stale approval kan blive dismissed når diff eller merge base ændrer sig. Det muliggør fundet "mange små transport-PR'er kræver en særskilt klik-strategi". Alternativerne er merge queue, løsere stale-policy, ejer-løse ramme-stier eller færre PR-enheder. Kilde: GitHub protected branches docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

✓ **Live-testet i vores setup: en reel værtsafbrydelse beviste artefakt-disciplin, ikke daemon-drift.**
Gov-5-morgenrecon efter ukontrolleret shutdown fandt rent worktree, HEAD=origin, ingen halvskrevne filer og fail-closed fordi dispatch-log manglede efter reboot. Det er stærk evidens for commit/push-pr.-led og baseline-guard. Det er ikke evidens for fuld automatisk kædedrift; gov-5-rapporten siger selv, at fuldt end-to-end bevis udestår.

✦ **Bred netsøgning: feltets mønster er "agent som konfigureret teammate", ikke enkeltstående prompt.**
OpenAI Codex-manualen beskriver samme overordnede mønster: giv opgaven kontekst og done-kriterier, gør gentagne regler durable i repo-/agent-instruktioner, forbind eksterne systemer via MCP, pak gentagne arbejdsgange som skills/plugins, og automatiser stabile flows. Claude Code-docs beskriver tilsvarende CLAUDE.md, hooks, skills, MCP, scheduled tasks, routines, channels, GitHub Actions, subagents, worktrees og SDK. Mønsteret er ikke "vælg én feature"; det er lagdeling: instruktioner, værktøjsadgang, lifecycle-værn, event-trigger, review/test og menneskelig gate. Kilder: OpenAI Codex manual (friskhedsverificeret 2026-06-15): https://developers.openai.com/codex/codex-manual.md · Claude Code overview: https://code.claude.com/docs/en/overview

✦ **Bred netsøgning: robuste workflows flytter gentagelser til lifecycle hooks og CI, mens vurdering bliver i reviews/gates.**
Claude Code hooks har events før/efter tool use, prompt, task, stop, file changes m.m.; Codex hooks har tilsvarende lifecycle-håndhævelse i manualen. GitHub Actions/CI-mønsteret bruges til PR-automation, review, issue triage og custom prompts. Det muliggør metoden "mekanisk håndhævelse ved hver overgang". Alternativet er at bede aktøren huske regler i prosa; både vores lokale erfaring og docs peger på, at prosa alene er svagere. Kilder: https://code.claude.com/docs/en/hooks · https://code.claude.com/docs/en/github-actions

✦ **Bred netsøgning: scheduling deler sig i cloud, lokal desktop og åben session.**
Claude Code docs skelner cloud routines, desktop scheduled tasks og `/loop`: cloud kører uden tændt maskine men med frisk clone/connector-scope; desktop tasks har lokale filer/værktøjer men kræver åben app og vågen maskine; `/loop` er session-polling. Det matcher vores eget skel mellem "pålidelig baggrund" og "lokal fil-adgang". Kilde: https://code.claude.com/docs/en/desktop-scheduled-tasks og https://code.claude.com/docs/en/routines

✦ **Bred netsøgning: indgående events til en kørende session findes som mønster, men er sessions-afhængigt.**
Claude Code Channels kan pushe events ind i en kørende session fra MCP-servere og kan være to-vejs via fx chat-bridge; Remote Control kan fortsætte en lokal session fra mobil/browser, mens selve sessionen kører lokalt. Det muliggør metoden "telefon/input som vindue til en eksisterende session". Alternativet er cloud routine eller GitHub issue/comment-trigger, som starter/driver via GitHub-state i stedet for en åben lokal session. Kilder: https://code.claude.com/docs/en/channels og https://code.claude.com/docs/en/remote-control

✦ **Bred netsøgning: parallelitet i feltet løses med subagents, worktrees, background agents, cloud tasks og SDK-orchestrering.**
Claude Code subagents bruges til afgrænset research/plan/explore med tool-begrænsninger; Agent SDK giver programmatisk agent-loop, sessions, tools og permissions; Codex-manualen beskriver skills/plugins/MCP/hooks og worktrees som durable workflows. Det muliggør metoden "parallel recon uden at blande hovedkontekst og write-flade". Alternativerne er flere manuelle chats, flere lokale sessions eller GitHub/cloud tasks. Kilder: https://code.claude.com/docs/en/sub-agents · https://code.claude.com/docs/en/agent-sdk/overview

✦ **Bred netsøgning: eksterne systemer kobles typisk via MCP/connectors, ikke ved at kopiere data ind i prompts.**
Claude Code-docs beskriver MCP som forbindelse til eksterne datakilder og værktøjer; Codex-manualen beskriver MCP-servere for docs, browser, Figma, Sentry, GitHub m.m. Metoden er "autoriseret værktøj/context-kilde med scoped adgang". Alternativet er manuel paste eller lokal fil-snapshot; vores historik viser, at snapshots bliver stale.

✦ **Cowork-undersøgelsen: den lokale kandidat er en informations-postkasse, ikke en gate.**
Gov-6-kataloget registrerer Cowork som kandidat til fil-adgang/postkasse, mobil→desktop-opgaver og scheduled tasks til led-status. Hegnet er allerede skrevet: postkassen må være informationskanal for fakta/spørgsmål/observationer, aldrig gate-flade, fordi author-verifikation ikke kan flyttes til en lokal fil. Baseline-kandidaten der skal slås er GitHub-fladen: issue-kommentarer mid-spor + kurér-postet led-status + GitHub Mobile.

⚠ **Cowork-undersøgelsen er flade-begrænset.**
Jeg fandt ikke en officiel Cowork-doc i denne recon, der kunne verificere WSL-/postkasse-adfærd. De officielle Claude Code-docs dækker tilstødende desktop scheduled tasks, Remote Control og Channels, men ikke den konkrete Cowork-test i vores `\\wsl.localhost\Ubuntu\...`-setup. Det vi faktisk ved fra repoet er testspørgsmålet: 10-minutters-test hvor Cowork skriver én fil i gitignored postkasse-mappe, WSL læser, og samme vej tilbage. Resultatet er ikke bogført.

✦ **Adgang/rolle-forslag: Mathias-fladen bør beskrives som beslutningsret, ikke teknik-ret.**
Forslagsstatus, ikke nuværende sandhed: Mathias er gate-author og beslutningstager for hvad/vision/krav/slut/fund der kræver hans ord. Hans adgang bør ikke udvides til hvordan-spørgsmål. GitHub review-request, issue-mention og gate-ord er forskellige transportformer for samme beslutningsret; de må ikke gøre ham til mekanisk relæ.

✦ **Adgang/rolle-forslag: Code-fladen bør beskrives som write/build/transport med teknisk ansvar, ikke forretningsret.**
Forslagsstatus: Code kan skrive repo, bygge, committe og foretage tekniske valg inden for godkendt krav. Code må kunne stoppe ved teknisk blokering og rejse gate-fil, men ikke afgøre forretning, formål eller stamme-doc-indhold.

✦ **Adgang/rolle-forslag: Codex-fladen bør beskrives som uafhængig read-only verifikation.**
Forslagsstatus: Codex kan læse kode, reviewe, lave kode-recon og flage teknisk risiko. Codex bør ikke få write-ret i den formelle gate, og eventuelle Claude/Codex-plugin-mønstre bør kun være uformel før-review, med formel gate separat.

✦ **Adgang/rolle-forslag: Claude.ai-rollen bør deles mellem dialog-flade og headless rolle-flade.**
Forslagsstatus: app-/chatfladen er bedst til Mathias-dialog og kravsprog; headless rollen er bedst til vækbare leverancer som syntese, troskabs-tjek, slut-review og gate-pakker. Rollen må ikke påstå kode-/DB-state uden kilde og må ikke designe datamodel.

✦ **Adgang/rolle-forslag: bot/runner-fladen bør være transportør, ikke aktør.**
Forslagsstatus: botten må flytte artefakter, åbne PR'er, poste status og requeste review efter deklarerede regler. Den må ikke beslutte, om krav er opfyldt, eller bypass'e beslutnings-stier. Admin-adgang bør kun bruges til konkrete repo-indstillinger efter eksplicit mandat.

✦ **Adgang/rolle-forslag: Cowork/desktop/cloud-flader bør starte som lav-tillid.**
Forslagsstatus: Cowork/postkasse, desktop scheduled tasks, channels og routines kan undersøges som input/status-kanaler. Før de er bevist i vores setup, bør de ikke bære gate, merge, direct main write, CODEOWNERS-ændring eller author-verificeret beslutning. Deres naturlige første klasse er "besked/status/fakta", ikke "afgørelse".

⚠ **Reel begrænsning: author-verifikation kan ikke erstattes af en lokal fil.**
GitHub author, review request og issue/comment author kan verificeres mod konto. En lokal postkassefil kan være nyttig transport, men kan ikke alene bevise, at Mathias har besluttet noget. Derfor er Cowork/postkasse som gate en reel begrænsning, ikke bare en utestet flade.

⚠ **Reel begrænsning: lokal scheduling og lokal desktop-flade kræver maskine/app i live.**
Claude Code desktop scheduled tasks har lokal filadgang, men docs siger, at de kun fyrer mens appen er åben og maskinen er vågen. Cloud routines kan køre når maskinen er slukket, men mister direkte lokal working-copy-adgang og kører med repo/connector-scope. Det er et reelt tradeoff, ikke bare en opsætningsdetalje.

⚠ **Reel begrænsning: fuld validering kan ikke reduceres til transport.**
Krav-dokket kræver at vision+forretning, krav, plan og slut hænger sammen. De eksterne værktøjsmønstre kan flytte data, starte agenter, håndhæve hooks og køre review, men de afgør ikke alene, om Mathias' hensigt er korrekt forstået. Det er præcis grænsen "automatiser transport, ikke dømmekraft".

⚠ **Flade-begrænsning: jeg har ikke verificeret private app-/account-indstillinger.**
Remote Control, Channels, Routines, desktop scheduled tasks, Cowork, GitHub Mobile-push, Claude account/admin toggles og connector-permissions kan være plan-/konto-/workspace-afhængige. Recon her bygger på lokale repo-filer, live-bevis fra gov-5 og offentlige docs; ikke på login i Mathias' Claude-app, mobil, GitHub notification settings eller private app-projekt.

⚠ **Flade-begrænsning: jeg har ikke testet Claude Code's aktuelle nye flader i Stork-worktree.**
Claude Code docs beskriver hooks, channels, routines, Remote Control, Agent SDK, subagents, desktop tasks og GitHub Actions. Det er dokumenteret produktfunktionalitet, men ikke live-testet i `/home/mathias/stork-2.0` i denne recon, bortset fra det gov-5-bogførte `claude -p` headless-auth-bevis.

⚠ **Flade-begrænsning: Codex-produktpåstande er hentet fra frisk OpenAI-manual, men ikke gentaget som udstyrsliste.**
OpenAI Codex-manualen blev hentet/friskhedsverificeret 2026-06-15 via `openai-docs`-skillens helper og svarer til https://developers.openai.com/codex/codex-manual.md. Jeg har brugt den til mønstre om durable instruktioner, skills/plugins, MCP, hooks, worktrees og workflow-eksempler. Jeg reciterer ikke lokal Codex-konfiguration eller udstyr.

⚠ **Flade-begrænsning: sekundære Cowork-kilder findes, men er ikke stærke nok som workflow-sandhed.**
Websøgningen fandt presseomtale af Cowork som Claude Code-lignende desktop/app-flade med filadgang, men uden officiel Cowork-doc i reconen er det ikke nok til at konkludere Stork-mekanik. Cowork-påstande må derfor enten komme fra en officiel Anthropic-side, appens egen UI/help, eller en konkret lokal test.

⚠ **Reel begrænsning: "to modsvar pr. funktion" er et kvalitetskrav, ikke en simpel tjekliste.**
Krav-dokket kræver mindst to modsvar fra andre funktioner før en funktion kan overvejes videre. Mekanisk kan man tælle modsvar; kvalitativt skal modsvarene faktisk ramme funktionen og bæres af andre funktioner. Den del kræver en review-form, ellers bliver kravet til formularfyld.

⚠ **Reel begrænsning: docs-tests kan fange brud, men ikke automatisk al mening.**
Lokale erfaringer viser, at grep, hash, ordret-diff, CODEOWNERS og governance-checks kan fange stale tekst, manglende mønstre og forkerte filklasser. Men kravets "mening" mellem vision, forretning, krav og slut kræver stadig aktør-review; ren doc-lint kan skabe forkert fokus, hvis den måler ord frem for sammenhæng.

## Åbne spørgsmål

⚠ Hvad er den konkrete, aktuelle Cowork-flade i Mathias' app: folder-scope, skriveadgang, scheduled tasks, mobil/desktop handoff, connector-adgang, permissions og audit?

⚠ Kan Cowork i Mathias' miljø skrive/læse en gitignored postkasse under `\\wsl.localhost\Ubuntu\...`, og kan WSL læse/skrive retur uden encoding, lock, timing eller permission-problemer?

⚠ Hvis Cowork ikke kan nå WSL direkte: er et Windows-side postkasse-spejl acceptabel informationskanal, eller falder kandidat-mekanismen væk fordi den introducerer ny sync-flade?

⚠ Er GitHub-issue/mobil-fladen allerede stærk nok til to-vejs mid-spor-spørgsmål og led-status, så Cowork kun skal slå en etableret baseline?

⚠ Hvilke aktør-flader skal regnes som workflow-rolle vs almindelig rolle for hver aktør, uden at rollen bliver dobbelt-hjem eller driftende prosa?

⚠ Hvilke nye Claude Code-flader er faktisk tilgængelige på Mathias' plan/org: Remote Control, Channels, Routines, desktop scheduled tasks, Agent SDK credits, subagents/agent teams og GitHub Actions?

⚠ Hvilke af de eksterne flader kræver admin toggles, paid plan, local app awake, cloud repo connector eller ny token/adgang, og hvilke kan verificeres uden at ændre Stork-state?

⚠ Hvad er den rigtige klasse for status til telefonen: GitHub issue comment, review-request, dedicated push, Claude Remote Control/Channels, Cowork task, eller flere klasser med hver sin trust?

⚠ Hvor går grænsen mellem informationskanal og gate-kanal, når en kanal er to-vejs og bekvem men ikke author-verificeret på GitHub-niveau?

⚠ Hvordan skal "to modsvar pr. funktion" dokumenteres som fund, uden at dokumentet bliver en plan eller et funktionsvalg?

⚠ Hvad er minimumsbeviset for at en ny workflow-funktion er "testet i vores setup": CLI-exit, lokal file roundtrip, selftest, dry-run, GitHub live event, mobil-push, eller fuldt kæde-led?

⚠ Hvilke docs-tests skaber værdi for workflowet: referencer/hash/ordret-diff/CODEOWNERS/links, og hvilke tests risikerer at flytte opmærksomheden fra mening til formular?

⚠ Skal adgangsmodellen have navne for "beslutnings-sti", "ramme-sti", "informationskanal", "gate-kanal" og "transportør", eller skaber flere begreber ny glid-risiko?

⚠ Hvilke dele af gov-5-kæden er inspiration til workflow-færdiggørelse, og hvilke er gamle løsninger der bevidst skal udfordres på samme niveau som netsøgning?

⚠ Hvilken evidens mangler for at skelne mellem "produktfladen kan det" og "det virker stabilt i Stork med vores repo, WSL, GitHub, mobil og aktørdisciplin"?
