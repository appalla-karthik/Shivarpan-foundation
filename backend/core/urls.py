
from __future__ import annotations

from django.conf import settings
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path, re_path
from django.views.static import serve

from core.admin_site import admin_site
from core.views import (
    blog_detail,
    blog_list,
    homepage_preview,
    magazine_issue_detail,
    magazine_list,
    magazine_story_detail,
    page_detail,
    projects_detail,
    projects_list,
    robots_txt,
    testimonials_list,
)

from foundation.sitemaps import SITEMAPS


urlpatterns = [
    # Homepage
    path("", homepage_preview, name="homepage-preview"),

    # Admin
    path("admin/", admin_site.urls),

    # API
    path("api/", include("core.api_urls")),

    # SEO files
    path("robots.txt", robots_txt),
    path("sitemap.xml", sitemap, {"sitemaps": SITEMAPS}, name="sitemap"),

    # Blog
    path("blog/", blog_list, name="blog-list"),
    path("blog/<slug:slug>/", blog_detail, name="blog-detail"),

    # Projects
    path("projects/", projects_list, name="projects-list"),
    path("projects/<slug:slug>/", projects_detail, name="projects-detail"),

    # Magazine
    path("magazine/", magazine_list, name="magazine-list"),
    path("magazine/story/<slug:slug>/", magazine_story_detail, name="magazine-story-detail"),
    path("magazine/<slug:slug>/", magazine_issue_detail, name="magazine-issue-detail"),

    # Testimonials
    path("testimonials/", testimonials_list, name="testimonials"),

    # Dynamic pages
    path("<slug:slug>/", page_detail, name="page-detail"),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(
            rf"^{settings.MEDIA_URL.lstrip('/')}(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
