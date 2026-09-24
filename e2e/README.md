# End-to-end tests

Playwright drives the real app in Chromium against a real Django backend.
Nothing is mocked: every screen reads and writes through the API.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # headless, list + HTML report
npm run test:e2e:ui               # interactive
```

## What a run does

Playwright starts both servers itself (`playwright.config.js`):

| Server | Port | Notes |
|---|---|---|
| Django (`e2e/backend/start.mjs`) | 8010 | Database `shivalik_e2e`: created if missing, then migrated, **flushed**, seeded (`seed_inventory` + `e2e/backend/fixtures.py`) on every run |
| Vite | 5180 | `API_PROXY_TARGET` points `/api` at the Django above |

Your development server on :8000 and the `shivalik` database are never
touched. `auth.setup.js` signs in once through the login form; the other
specs reuse that session.

## Requirements

- The backend checked out next to this repo (`../backend-shivalik`), its
  Python dependencies installed, and its `.env` present.
- Its database reachable — for the default Postgres, `docker compose up -d db`
  in the backend. The `.env` user needs `CREATEDB`, as it already does for
  pytest.

## Overrides

| Variable | Default |
|---|---|
| `E2E_BACKEND_DIR` | `../backend-shivalik` |
| `E2E_PYTHON` | `python` (point it at a virtualenv's interpreter if you use one) |
| `E2E_DB_NAME` | `shivalik_e2e` |
| `E2E_BACKEND_PORT` / `E2E_FRONTEND_PORT` | `8010` / `5180` |

## Writing specs

- Each spec that changes stock owns its fixture title (`fixtures.py`), so
  specs do not depend on run order. New titles use `uniqueIsbn()`.
- Check what a screen claims to have saved against the API (`adminApi()` in
  `support/api.js`), not only against the screen.
