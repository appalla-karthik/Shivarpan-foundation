from __future__ import annotations

import uuid

from django.conf import settings
from django.utils import timezone

from foundation.models import PageView, Visitor


class AnalyticsMiddleware:
    """
    Minimal visitor + pageview tracking to power the admin dashboard KPIs.
    - Sets a first-party cookie `sf_vid` (UUID)
    - Logs GET/HEAD requests, excluding admin/static/media paths
    """

    COOKIE_NAME = "sf_vid"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method not in {"GET", "HEAD"}:
            return response

        path = request.path or "/"
        if path.startswith(("/admin/", "/api/", "/static/", "/media/")):
            return response

        visitor_uuid = self._get_or_set_visitor_cookie(request, response)
        if not visitor_uuid:
            return response

        visitor, _ = Visitor.objects.get_or_create(
            visitor_id=visitor_uuid,
            defaults={"first_seen_at": timezone.now(), "last_seen_at": timezone.now()},
        )
        Visitor.objects.filter(pk=visitor.pk).update(last_seen_at=timezone.now())

        PageView.objects.create(
            visitor=visitor,
            path=path,
            full_path=request.get_full_path()[:1024],
            referer=(request.META.get("HTTP_REFERER") or "")[:1024],
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:1024],
        )
        return response

    def _get_or_set_visitor_cookie(self, request, response):
        raw = request.COOKIES.get(self.COOKIE_NAME)
        if raw:
            try:
                return uuid.UUID(raw)
            except ValueError:
                pass

        new_uuid = uuid.uuid4()
        response.set_cookie(
            self.COOKIE_NAME,
            str(new_uuid),
            max_age=60 * 60 * 24 * 365 * 2,
            samesite="Lax",
            secure=not settings.DEBUG,
            httponly=True,
        )
        return new_uuid
