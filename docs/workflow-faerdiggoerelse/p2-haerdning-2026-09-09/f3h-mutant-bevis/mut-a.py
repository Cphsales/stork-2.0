import sys; s=open(sys.argv[1],encoding="utf-8").read()
L=[l for l in s.split("\n") if "matcher ikke binaries.lock.json (${PIN_NATIVE_SHA:0:12})" in l]; assert len(L)==1; sha=L[0].strip()
s=s.replace(L[0]+"\n","",1)
A=[l for l in s.split("\n") if l.startswith('if [ -n "$CODEX_NATIVE" ]; then [ "$CODEX_VER" = "$PIN_VER" ]')]; assert len(A)==1
rest=A[0].split("then ",1)[1]
s=s.replace(A[0], 'if [ -n "$CODEX_NATIVE" ]; then '+sha+'; '+rest, 1)   # MUTANT a: native-sha tjekkes EFTER --version (kun når native er sat)
sys.stdout.write(s)
