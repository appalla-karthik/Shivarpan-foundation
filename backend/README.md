# Shivarpan Foundation – Admin Panel (Django)

This `backend/` folder contains a Django backend + admin panel to manage:
- Pages (Home/About/Services/Contact/etc.)
- Blog/Articles (draft/publish, featured image, tags/categories, SEO + social preview)
- Media Library (upload/search/reuse)
- Magazine Issues + Stories
- Projects/Portfolio
- Testimonials
- Contact form leads + CSV export
- Newsletter subscribers + CSV export
- SEO + `robots.txt` + `sitemap.xml`
- Basic visitor/pageview tracking for the dashboard

## Run locally
1. Install dependencies:
   - `pip install -r backend/requirements.txt`
2. Create database tables + admin user:
   - `python backend/manage.py makemigrations`
   - `python backend/manage.py migrate`
   - `python backend/manage.py createsuperuser`
3. Start server:
   - `python backend/manage.py runserver`

Admin panel: `http://127.0.0.1:8000/admin/`

### Project funding totals

Open **Projects** in the admin and edit a project:

- **Funding target amount** is the public target in INR.
- **Set current public raised amount** sets the exact amount visible on the website.
- **Actual verified online collection** is read-only and comes from captured Razorpay payments, net of recorded refunds.
- Every new successful project payment is automatically added to the public raised amount.

For recurring payments and refunds, configure a Razorpay webhook pointing to:

- Local/testing: `http://127.0.0.1:8000/api/donations/webhook/`
- Production: `https://shivarpanfoundation.org/api/donations/webhook/`

Enable the `payment.captured`, `subscription.charged`, and `payment.refunded`
events and set the same secret in `RAZORPAY_WEBHOOK_SECRET`.

The webhook secret is a separate value chosen while creating the webhook in
the Razorpay Dashboard. It is not `RAZORPAY_KEY_SECRET`. Keep both values only
in `backend/.env`; never commit them.

Dynamic website pages (Django-rendered):
- Home: `http://127.0.0.1:8000/`
- Any Page by slug: `http://127.0.0.1:8000/<slug>/`
- Blog: `http://127.0.0.1:8000/blog/` and `http://127.0.0.1:8000/blog/<slug>/`
- Projects: `http://127.0.0.1:8000/projects/` and `http://127.0.0.1:8000/projects/<slug>/`
- Magazine: `http://127.0.0.1:8000/magazine/`
- Testimonials: `http://127.0.0.1:8000/testimonials/`

Public APIs (for website/frontend to consume):
- `GET /api/pages/`, `GET /api/pages/by-slug/<slug>/`
- `GET /api/articles/`, `GET /api/articles/by-slug/<slug>/`
- `GET /api/projects/`
- `GET /api/magazine/issues/`, `GET /api/magazine/stories/`
- `GET /api/homepage/`
- `POST /api/contact/`
- `POST /api/newsletter/subscribe/`

## React frontend (CORS)
If your React app runs on `http://localhost:8080/` (or Vite `5173` / CRA `3000`), CORS is already allowed in `backend/core/settings.py`.
After changing CORS settings, restart Django `runserver`.
