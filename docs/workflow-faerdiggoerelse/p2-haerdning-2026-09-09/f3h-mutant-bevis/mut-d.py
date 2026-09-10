import sys; s=open(sys.argv[1],encoding="utf-8").read()
anchor="# --- F-3d (runde 10c): node autoriseres FØR første node-start"
assert s.count(anchor)==1
s=s.replace(anchor, '"$NODE" -e "" 2>/dev/null || true   # MUTANT d: en node-start FØR node.pin-autorisationen\n'+anchor, 1)
sys.stdout.write(s)
