
from __future__ import annotations

import os
from pathlib import Path
import importlib.util
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    raw_value = os.environ.get(name, "")
    if raw_value:
        return [item.strip() for item in raw_value.split(",") if item.strip()]
    return list(default or [])


def unique_list(items: list[str]) -> list[str]:
    seen: set[str] = set()
    values: list[str] = []
    for item in items:
        normalized = item.strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            values.append(normalized)
    return values


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env_file(PROJECT_ROOT / ".env")
load_env_file(BASE_DIR / ".env")

# -------------------------------------------------
# SECURITY
# -------------------------------------------------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")

DEBUG = os.environ.get("DJANGO_DEBUG", "1") not in {"0", "false", "False"}
USE_WHITENOISE = importlib.util.find_spec("whitenoise") is not None

TINYMCE_API_KEY = os.environ.get("TINYMCE_API_KEY", "")

production_hosts = [
    "shivarpanfoundation.org",
    "www.shivarpanfoundation.org",
    "shivarpan-foundation.onrender.com",
    "shivarpan-foundation-backend.onrender.com",
]

ALLOWED_HOSTS_ENV = os.environ.get("DJANGO_ALLOWED_HOSTS", "")
if ALLOWED_HOSTS_ENV:
    ALLOWED_HOSTS = unique_list([h.strip() for h in ALLOWED_HOSTS_ENV.split(",") if h.strip()] + production_hosts)
else:
    ALLOWED_HOSTS = ["*"] if DEBUG else production_hosts

# -------------------------------------------------
# INSTALLED APPS
# -------------------------------------------------
INSTALLED_APPS = [
    'jazzmin',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",

    # Third party
    "corsheaders",
    "rest_framework",
    "django_filters",

    # Local apps
    "foundation",
]

# -------------------------------------------------
# JAZZMIN (Django Admin Theme)
# -------------------------------------------------
JAZZMIN_SETTINGS = {
    "site_title": "Shivarpan Foundation Admin",
    "site_header": "Shivarpan Foundation",
    "site_brand": "Shivarpan Foundation",
    "welcome_sign": "Welcome",
    "search_model": "auth.User",
    "user_avatar": None,
    # Bootswatch themes: https://bootswatch.com/ (Jazzmin supports multiple)
    "theme": "lux",
    "dark_mode_theme": None,
    "show_ui_builder": False,
    "navigation_expanded": True,
    "related_modal_active": False,
    "changeform_format": "horizontal_tabs",
    # Optional branding assets (create these files if you want)
    "site_logo": "img/shivarpan-logo-square.png",
    "login_logo": "img/shivarpan-logo-square.png",
    "site_icon": "img/shivarpan-logo-square.png",
    "site_logo_classes": "brand-image",
    "custom_css": "admin/custom.css",
    "topmenu_links": [
        {"name": "View Site", "url": "/", "new_window": True},
    ],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "foundation": "fas fa-hand-holding-heart",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "lux",
    "dark_mode_theme": None,
    "navbar": "navbar-dark navbar-primary",
    "navbar_fixed": True,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_flat_style": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "accent": "accent-primary",
    "button_classes": "btn btn-primary",
}

# -------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    # Custom analytics
    "core.middleware.AnalyticsMiddleware",
]

if USE_WHITENOISE:
    MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

ROOT_URLCONF = "core.urls"

# -------------------------------------------------
# TEMPLATES
# -------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "core" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# -------------------------------------------------
# EMAIL
# -------------------------------------------------
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "1") not in {"0", "false", "False"}
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "info@shivarpanfoundation.org")
ADMIN_NOTIFICATION_EMAIL = os.environ.get("ADMIN_NOTIFICATION_EMAIL", "info@shivarpanfoundation.org")

# -------------------------------------------------
# DATABASE
# -------------------------------------------------
db_engine = os.environ.get("DJANGO_DB_ENGINE", "sqlite").strip().lower()

if db_engine == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ.get("MYSQL_DATABASE", ""),
            "USER": os.environ.get("MYSQL_USER", ""),
            "PASSWORD": os.environ.get("MYSQL_PASSWORD", ""),
            "HOST": os.environ.get("MYSQL_HOST", ""),
            "PORT": os.environ.get("MYSQL_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.environ.get("DJANGO_DB_PATH", str(BASE_DIR / "db.sqlite3")),
        }
    }

# -------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = os.environ.get("DJANGO_TIME_ZONE", "Asia/Kolkata")

USE_I18N = True
USE_TZ = True

# -------------------------------------------------
# STATIC FILES
# -------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

if USE_WHITENOISE:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

# -------------------------------------------------
# MEDIA FILES (Images, uploads)
# -------------------------------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(os.environ.get("DJANGO_MEDIA_ROOT", str(BASE_DIR / "media")))

# -------------------------------------------------
# DEFAULT PRIMARY KEY
# -------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -------------------------------------------------
# DJANGO REST FRAMEWORK
# -------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny"
    ],
}

# -------------------------------------------------
# CORS SETTINGS (Frontend → Django API)
# -------------------------------------------------
default_cors_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://shivarpanfoundation.org",
    "https://www.shivarpanfoundation.org",
    "https://shivarpan-foundation.onrender.com",
    "https://shivarpan-foundation-backend.onrender.com",
]

CORS_ALLOWED_ORIGINS = env_list(
    "DJANGO_CORS_ALLOWED_ORIGINS",
    default_cors_origins if DEBUG else default_cors_origins[6:],
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    "cache-control",
]

# -------------------------------------------------
# CSRF (for POST requests from frontend)
# -------------------------------------------------
default_csrf_origins = [
    "https://shivarpanfoundation.org",
    "https://www.shivarpanfoundation.org",
    "https://shivarpan-foundation.onrender.com",
    "https://shivarpan-foundation-backend.onrender.com",
]

CSRF_TRUSTED_ORIGINS = unique_list(
    env_list("DJANGO_CSRF_TRUSTED_ORIGINS", default_csrf_origins) + default_csrf_origins
)
USE_X_FORWARDED_HOST = True
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# -------------------------------------------------
# RAZORPAY
# -------------------------------------------------
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
RAZORPAY_DONATION_BRAND = os.environ.get("RAZORPAY_DONATION_BRAND", "Shivarpan Foundation")
