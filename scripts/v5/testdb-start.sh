#!/usr/bin/env bash
# testdb-start.sh — starter testdatabasen med styret klokke (libfaketime) og PostgREST.
#
# Postgres kører i supabase/postgres-imaget; postgres-processen startes med libfaketime, så
# now()/current_date følger filen $FT_DIR/faketime.txt ("@YYYY-MM-DD HH:MM:SS"). Testene flytter
# uret fremad ved at skrive filen (test-runner.mjs: lib.ur). Børneprocesser af postgres bruger en
# statisk /bin/sh, så LD_PRELOAD ikke rammer dem. PostgREST og JWT-tokens bruger den rigtige tid.
#
# Brug: scripts/v5/testdb-start.sh <arbejdsmappe>
# Skriver <arbejdsmappe>/testdb.env med PG*, DATABASE_URL, V5_PGRST_* og V5_FAKETIME_FILE.
set -euo pipefail
WORK="$1"; mkdir -p "$WORK/ft"
IMAGE=public.ecr.aws/supabase/postgres:17.6.1.121
PGRST_IMAGE=postgrest/postgrest:v12.2.3
PW=byggetjek; JWT=byggetjek-jwt-secret-for-the-ephemeral-test-database
FT_COMMIT=9fdda43
FT_SO="$WORK/ft/libfaketime.so.1"
NET=stork-testdb

if [ ! -f "$FT_SO" ]; then
  docker run --rm -v "$WORK/ft:/out" debian:bookworm-slim sh -c "
    apt-get update -qq >/dev/null && apt-get install -y -qq git build-essential ca-certificates >/dev/null &&
    git clone -q https://github.com/wolfcw/libfaketime /src && cd /src && git checkout -q $FT_COMMIT &&
    make -s -C src >/dev/null && cp src/libfaketime.so.1 /out/"
fi
echo "@2026-04-01 00:00:00" > "$WORK/ft/faketime.txt"
chmod 666 "$WORK/ft/faketime.txt"

docker network create "$NET" >/dev/null 2>&1 || true
docker rm -f stork-testdb stork-testdb-pgrst >/dev/null 2>&1 || true
docker run -d --name stork-testdb --network "$NET" -p 55432:5432 -e POSTGRES_PASSWORD=$PW -v "$WORK/ft:/ft" \
  --entrypoint sh "$IMAGE" -c '
    set -e
    apk add --no-cache busybox-static >/dev/null 2>&1 || true
    [ -x /bin/busybox.static ] && ln -sf /bin/busybox.static /bin/sh
    KEY=/etc/postgresql-custom/pgsodium_root.key
    [ -f $KEY ] || /bin/busybox.static sh -c "head -c 32 /dev/urandom | od -A n -t x1 | tr -d \" \n\"" > $KEY
    printf "#!/bin/busybox.static sh\nexec /bin/busybox.static cat %s\n" "$KEY" > /usr/lib/postgresql/bin/pgsodium_getkey.sh
    chmod +x /usr/lib/postgresql/bin/pgsodium_getkey.sh
    for B in postgres pg_ctl; do
      P=$(command -v $B); mv "$P" "$P.real"
      printf "#!/bin/sh\nLD_PRELOAD=/ft/libfaketime.so.1 FAKETIME_TIMESTAMP_FILE=/ft/faketime.txt FAKETIME_NO_CACHE=1 FAKETIME_DONT_FAKE_MONOTONIC=1 exec \"%s.real\" \"\$@\"\n" "$P" > "$P"
      chmod +x "$P"
    done
    exec docker-entrypoint.sh postgres -D /etc/postgresql' >/dev/null

for i in $(seq 1 90); do
  docker exec stork-testdb pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 2
done
docker exec stork-testdb pg_isready -U postgres >/dev/null || { docker logs stork-testdb | tail -30; exit 1; }
sleep 3
docker exec -e PGPASSWORD=$PW stork-testdb psql -h localhost -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -qc "alter role authenticator with login password '$PW';"

docker run -d --name stork-testdb-pgrst --network "$NET" -p 53000:3000 \
  -e PGRST_DB_URI="postgres://authenticator:$PW@stork-testdb:5432/postgres" -e PGRST_DB_SCHEMAS=core_identity,core_compliance,public \
  -e PGRST_DB_ANON_ROLE=anon -e PGRST_JWT_SECRET="$JWT" -e PGRST_DB_CHANNEL_ENABLED=true "$PGRST_IMAGE" >/dev/null

cat > "$WORK/testdb.env" <<EOF
PGHOST=localhost
PGPORT=55432
PGUSER=postgres
PGPASSWORD=$PW
PGDATABASE=postgres
DATABASE_URL=postgres://postgres:$PW@localhost:55432/postgres
V5_FAKETIME_FILE=$WORK/ft/faketime.txt
V5_PGRST_URL=http://localhost:53000
V5_PGRST_JWT_SECRET=$JWT
V5_PGRST_SCHEMA=core_identity
EOF
echo "testdb: postgres på 55432 med styret klokke ($(cat "$WORK/ft/faketime.txt"))"
