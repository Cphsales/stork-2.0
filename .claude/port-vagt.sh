#!/usr/bin/env bash
# PORT-VAGT (Stop-hook) — FORM-tjek, ikke dybde-dom. Dybde/forståelse kan
# ikke greppes (Mathias 2026-06-13); den dom er en tænkende dommers (blindt
# blik/Mathias). Denne vagt kan kun se om dybde-redegørelsen og de 2
# modstands-fund FINDES — ikke om de er sande. KENDT GRÆNSE: vagten har vist
# falske positiver mod ægte transcript (faldgrube 13); den er fail-OPEN ved
# tvivl (slipper igennem efter én anmodning) så den aldrig råber-ulv-blokerer.
input=$(cat)
sidste=$(echo "$input" | python3 -c '
import sys,json,os
try:
    d=json.load(sys.stdin); p=d.get("transcript_path","")
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
[ -z "$sidste" ] && exit 0          # intet tekstsvar el. transcript-udtræk fejlede → fail-open
# Korte svar/ren dialog kræver ikke fuld redegørelse (kun substantielle leverancer)
[ "$(printf '%s' "$sidste" | wc -w)" -lt 60 ] && exit 0
MRK="$HOME/.claude/.port-vagt-bedt"
mangler=""
echo "$sidste" | grep -qiE 'rød tråd|kilde-dækning|kilde|afdæk|søgekriteri|datagrundlag' || mangler="${mangler}· dybde-redegørelse (kilder/søgekriterier/rød tråd-længde) "
echo "$sidste" | grep -qiE 'modstand|udfordr|skeptiker|modsiger|svaghed|men |dog ' || mangler="${mangler}· min. 2 modstands-fund "
if [ -n "$mangler" ]; then
  if [ -f "$MRK" ]; then rm -f "$MRK"; exit 0; fi   # anti-loop: bedt én gang → slip (fail-open)
  touch "$MRK"
  echo "PORT-VAGT: leverancen mangler $mangler— det er FORM, ikke dybde. Tilføj og svar igen. (Dybden selv dømmes af et tænkende blik, ikke af denne vagt.)" >&2
  exit 2
fi
rm -f "$MRK"; exit 0
