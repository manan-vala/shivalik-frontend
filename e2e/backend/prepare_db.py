"""
Create the e2e Postgres database if it does not exist yet.

Run from the backend directory, so its `.env` supplies the connection
settings. The database name comes from `DB_NAME`, which the e2e start script
overrides — this never creates or touches the development database.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path.cwd() / ".env", override=False)

if os.environ.get("DB_ENGINE", "postgresql").lower() != "postgresql":
    sys.exit(0)  # SQLite creates its file on first connect.

import psycopg  # noqa: E402
from psycopg import sql  # noqa: E402

name = os.environ["DB_NAME"]
params = dict(
    user=os.environ.get("DB_USER", "shivalik"),
    password=os.environ.get("DB_PASSWORD", "shivalik"),
    host=os.environ.get("DB_HOST", "127.0.0.1"),
    port=os.environ.get("DB_PORT", "5432"),
)

with psycopg.connect(dbname="postgres", autocommit=True, **params) as conn:
    exists = conn.execute("SELECT 1 FROM pg_database WHERE datname = %s", [name]).fetchone()
    if not exists:
        conn.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
        print(f"Created database {name}")
