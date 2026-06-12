# Kæde-node-miljø (rette-til punkt 5, fund 5c) — sources af preflight.sh og
# unit'ens ExecStart. Node afledes af .nvmrc via nvm: unit-filen pinner ALDRIG
# en versions-sti, så en nvm-opgradering (fx v24.15.0 → v24.16.x) ikke dræber
# kæden midt i natlig drift. Fallback: system-node (preflight beviser ≥ 20 +
# .nvmrc-match bagefter — afledningen bevises, antages ikke).
# NB: skal SOURCES (ikke eksekveres) — den muterer PATH i kaldende shell.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # --no-use: indlæs nvm uden auto-skift; 'nvm use' læser .nvmrc i cwd
  # (unit'ens WorkingDirectory/preflightens cd er repo-roden).
  . "$NVM_DIR/nvm.sh" --no-use
  nvm use --silent > /dev/null 2>&1 || true
fi
