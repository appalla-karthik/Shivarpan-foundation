# VPS deployment

After the local changes are pushed to `main`, run:

```sh
cd /var/www/shivarpanfoundation
git pull --ff-only origin main
bash deploy/vps_deploy.sh
```

The script preserves `backend/.env`, `backend/db.sqlite3`, `backend/media/`,
and `backend/venv/`. Before applying migrations it creates an online SQLite
backup under `/var/backups/shivarpanfoundation/`.

## One-time Razorpay webhook setup

In the Razorpay dashboard, create a webhook for:

```text
https://shivarpanfoundation.org/api/donations/webhook/
```

Enable at least `payment.captured`, `payment.refunded`, and
`subscription.charged`. Generate a strong webhook secret and place that same
value in the VPS-only `backend/.env`:

```text
RAZORPAY_WEBHOOK_SECRET=your-separate-webhook-secret
```

The webhook secret is separate from `RAZORPAY_KEY_SECRET` and must never be
committed.
