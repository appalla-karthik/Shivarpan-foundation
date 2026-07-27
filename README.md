# Shivarpan Foundation Website

React + TypeScript + Vite project for Shivarpan Foundation.

## Setup

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Test

```sh
npm run test
```

## VPS deployment

Production is served from `/var/www/shivarpanfoundation` by Nginx and the
`django` systemd service. Runtime files are intentionally not tracked by Git:

- `backend/.env`
- `backend/db.sqlite3`
- `backend/media/`
- `backend/venv/`

After pushing `main`, deploy on the VPS with:

```sh
cd /var/www/shivarpanfoundation
git pull --ff-only origin main
bash deploy/vps_deploy.sh
```

The script installs locked frontend dependencies, builds the frontend, applies
Django migrations, collects static files, restarts Django, and runs health
checks. It does not overwrite secrets, the SQLite database, or uploaded media.

