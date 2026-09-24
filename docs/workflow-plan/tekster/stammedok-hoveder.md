# Stamme-dokumenternes hoveder (linje 5)

Formuleret af claude-ai-rollen efter forfatterreglen (disciplin.md l.263); Mathias' `ok` til workflow-planen er forhåndsgodkendelsen; Code indsætter ordret.

Kilde: `origin/claude/workflow-implementeringsplan`. Kun linje 5 ændres i hver fil. Alt andet i linjen står ordret.

## 1. `docs/strategi/vision-og-principper.md` l.5

**NUVÆRENDE:**

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias via PR. CODEOWNERS håndhæver at kun Mathias kan approve ændringer. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

**NY:**

> **LÅST DOKUMENT.** Dette er grundstenen i Stork 2.0. Ændringer kræver eksplicit godkendelse fra Mathias: hans ord i chatten, efter at rettelsen er fremlagt dér, skrevet ordret i ledgeren. Dokumentet er autoritativ kilde for vision og principper — ved konflikt mellem dette dokument og master-plan/andre dokumenter, vinder dette. Undtagelse (D4): `forretningsforstaaelse.md` er med-stamme-doc — en modsigelse mellem de to er et hul der STOPPER arbejdet og lukkes af Mathias, ikke en konflikt dette dokument vinder.

**Begrundelse:** »via PR« og »CODEOWNERS håndhæver at kun Mathias kan approve ændringer« erstattes af den måde Mathias faktisk godkender på: hans ord i chatten efter fremlæggelse, skrevet ordret i ledgeren (workflow-planen §2 og §5; ny `disciplin.md` §2 »Godkendelses-ordene«). Mathias rører ikke GitHub (hans ord i implementeringsplanen, bekræftelses-linje i workflow-planen §5). Håndhævelsespåstanden er ikke sand: PR #172 blev merget uden review. LÅST, »grundstenen«, autoriteten og D4-undtagelsen står ordret.

## 2. `docs/strategi/forretningsforstaaelse.md` l.5

**NUVÆRENDE:**

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias via PR; CODEOWNERS håndhæver. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4). Mekanisk håndhævelse (required code-owner-review) er aktiv på main (gov-4).

**NY:**

> **LÅST DOKUMENT (stamme-doc med vision-og-principper.md).** Ændringer kræver eksplicit godkendelse fra Mathias: hans ord i chatten, efter at rettelsen er fremlagt dér, skrevet ordret i ledgeren. Opdateres når Mathias' tanker udvikler sig — men de to stamme-docs må aldrig være indbyrdes uenige: en modsigelse er et hul der STOPPER og lukkes af Mathias (D4).

**Begrundelse:** Samme rettelse af godkendelses-måden, med samme ordlyd som i visionen, så de to stamme-dokumenter siger det samme (D4-konsistens). Sidste sætning, »Mekanisk håndhævelse (required code-owner-review) er aktiv på main (gov-4).«, fjernes, fordi den ikke er sand (PR #172 gik igennem uden review). LÅST, stamme-doc-status, »Opdateres når Mathias' tanker udvikler sig« og D4-sætningen står ordret.

## D4-tjek

De to nye linjer bruger samme sætning om godkendelse. Ingen af dem ændrer autoritet eller rangorden. Ingen modsigelse mellem de to.
