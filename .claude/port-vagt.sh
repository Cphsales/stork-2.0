#!/usr/bin/env bash
# PORT-VAGT (Stop-hook) — den ÆGTE dør: afbryder svaret mekanisk og kaster
# det tilbage, hvis det IKKE bærer sit eget regnskab. exit 2 + besked på
# stderr = Claude tvinges til at fortsætte og rette; svaret når IKKE Mathias.
# Dette er FORM-tjek (er regnskabet der?), ikke sandheds-tjek (er det sandt?)
# — sandheden bæres af det uafhængige blik + Mathias' stikprøver.
input=$(cat)
# Sidste assistent-svar i transcriptet:
sidste=$(echo "$input" | python3 -c '
import sys,json
try:
    d=json.load(sys.stdin); p=d.get("transcript_path","")
    import os
    if not p or not os.path.exists(p): print(""); sys.exit()
    last=""
    for line in open(p):
        try: o=json.loads(line)
        except: continue
        if o.get("type")=="assistant":
            c=o.get("message",{}).get("content",[])
            t="".join(b.get("text","") for b in c if isinstance(b,dict) and b.get("type")=="text")
            if t.strip(): last=t
    print(last)
except: print("")
' 2>/dev/null)
[ -z "$sidste" ] && exit 0   # intet tekstsvar (ren værktøjstur) → ingen port
# Loop-stop: hvis vagten allerede har bedt om regnskab, og det stadig mangler,
# slip igennem efter at have markeret — ellers uendelig løkke (fail-open med spor).
MRK="$HOME/.claude/.port-vagt-bedt"
mangler=""
echo "$sidste" | grep -qiE 'regnskab|bevist|ubevist|ved ikke' || mangler="${mangler}· sandheds-regnskab (bevist/ubevist/ved ikke) "
echo "$sidste" | grep -qiE 'komplet|færdig|alle |alt er|fuldt' && ! echo "$sidste" | grep -qiE 'fejning|gennemgået|modbevis|falsificer' && mangler="${mangler}· fejnings-/falsificerings-bevis for komplet/færdig/alle (H5) "
if [ -n "$mangler" ]; then
  if [ -f "$MRK" ]; then rm -f "$MRK"; exit 0; fi   # allerede bedt én gang → slip (anti-loop)
  touch "$MRK"
  echo "PORT-VAGT BLOKERER: leverancen mangler $mangler— tilføj regnskabet (porten S5/H5) og svar igen. Dette er en dør, ikke en seddel." >&2
  exit 2
fi
rm -f "$MRK"; exit 0
