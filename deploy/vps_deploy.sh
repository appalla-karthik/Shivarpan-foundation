#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="/var/www/shivarpanfoundation"
BACKEND_ROOT="$APP_ROOT/backend"
PYTHON="$BACKEND_ROOT/venv/bin/python"
PIP="$BACKEND_ROOT/venv/bin/pip"
BACKUP_ROOT="/var/backups/shivarpanfoundation"

cd "$APP_ROOT"

test -f "$BACKEND_ROOT/.env"
test -x "$PYTHON"
git diff --quiet
git diff --cached --quiet

npm ci
npm run build

"$PIP" install -r "$BACKEND_ROOT/requirements.txt"

install -d -m 700 "$BACKUP_ROOT"
"$PYTHON" - "$BACKEND_ROOT" \
  "$BACKUP_ROOT/db-$(date -u +%Y%m%dT%H%M%SZ).sqlite3" <<'PY'
import os
import sqlite3
import sys

backend_root, backup_path = sys.argv[1:3]
sys.path.insert(0, backend_root)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from django.conf import settings

database = settings.DATABASES["default"]
if database["ENGINE"] == "django.db.backends.sqlite3":
    source_path = str(database["NAME"])
    if not os.path.isfile(source_path):
        raise SystemExit(f"SQLite database does not exist: {source_path}")
    with sqlite3.connect(source_path) as source:
        with sqlite3.connect(backup_path) as backup:
            source.backup(backup)
else:
    print("Non-SQLite database configured; use the database provider backup policy.")
PY

"$PYTHON" "$BACKEND_ROOT/manage.py" migrate --noinput
"$PYTHON" "$BACKEND_ROOT/manage.py" collectstatic --noinput
"$PYTHON" "$BACKEND_ROOT/manage.py" check --deploy

install -m 644 \
  "$APP_ROOT/deploy/nginx_performance.conf" \
  "/etc/nginx/conf.d/shivarpan-performance.conf"

NGINX_SITE_LINK="/etc/nginx/sites-enabled/shivarpan"
NGINX_SITE_CONFIG="$(readlink -f -- "$NGINX_SITE_LINK")"
case "$NGINX_SITE_CONFIG" in
  /etc/nginx/*) ;;
  *)
    echo "Refusing to edit unexpected nginx site path: $NGINX_SITE_CONFIG" >&2
    exit 1
    ;;
esac
test -f "$NGINX_SITE_CONFIG"

if ! grep -Eq '^[[:space:]]*listen[[:space:]]+443[[:space:]]+ssl[[:space:]]+http2;' "$NGINX_SITE_CONFIG"; then
  nginx -V 2>&1 | grep -q -- '--with-http_v2_module'
  NGINX_SITE_BACKUP="$BACKUP_ROOT/nginx-shivarpan-$(date -u +%Y%m%dT%H%M%SZ).conf"
  cp --preserve=mode,ownership,timestamps "$NGINX_SITE_CONFIG" "$NGINX_SITE_BACKUP"
  sed -i -E \
    's/^([[:space:]]*listen[[:space:]]+443[[:space:]]+ssl);/\1 http2;/' \
    "$NGINX_SITE_CONFIG"
  grep -Eq '^[[:space:]]*listen[[:space:]]+443[[:space:]]+ssl[[:space:]]+http2;' "$NGINX_SITE_CONFIG"
fi

nginx -t

systemctl restart django
sleep 3
systemctl is-active --quiet django
systemctl reload nginx

curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/admin/login/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/api/homepage/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/api/donations/funding-summary/"

echo "Deployment and health checks completed successfully."
