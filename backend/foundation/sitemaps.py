from __future__ import annotations

from django.contrib.sitemaps import Sitemap

from foundation.models import Article, MagazineIssue, MagazineStory, Page, Project, Story


class PageSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Page.objects.published()

    def location(self, obj):
        return f"/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class ArticleSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Article.objects.published()

    def location(self, obj):
        return f"/blog/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class StorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Story.objects.published()

    def location(self, obj):
        return f"/news-stories/{obj.slug}"

    def lastmod(self, obj):
        return obj.updated_at


class ProjectSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Project.objects.published()

    def location(self, obj):
        return f"/projects/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class MagazineIssueSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return MagazineIssue.objects.published()

    def location(self, obj):
        return f"/magazine/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class MagazineStorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return MagazineStory.objects.published()

    def location(self, obj):
        return f"/magazine/story/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


SITEMAPS = {
    "pages": PageSitemap,
    "articles": ArticleSitemap,
    "stories": StorySitemap,
    "projects": ProjectSitemap,
    "magazine_issues": MagazineIssueSitemap,
    "magazine_stories": MagazineStorySitemap,
}

