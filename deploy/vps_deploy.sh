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

systemctl restart django
sleep 3
systemctl is-active --quiet django
nginx -t

curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/admin/login/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/api/homepage/"
curl --fail --silent --show-error --output /dev/null \
  "https://shivarpanfoundation.org/api/donations/funding-summary/"

echo "Deployment and health checks completed successfully."
