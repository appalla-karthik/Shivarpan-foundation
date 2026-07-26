
from __future__ import annotations

import os


if os.environ.get("DJANGO_DB_ENGINE", "sqlite").strip().lower() == "mysql":
    import pymysql

    pymysql.install_as_MySQLdb()
