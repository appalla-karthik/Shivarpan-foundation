from __future__ import annotations

import csv

from foundation.models import GalleryItem
from django import forms
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import format_html
from .models import StoryItem

from core.admin_site import admin_site
from foundation.models import (
    Article,
    Award,
    Category,
    ContactSubmission,
    Donation,
    DonationPaymentLog,
    Homepage,
    HomepageSection,
    MagazineIssue,
    MagazineStory,
    MediaAsset,
    Page,
    PageView,
    PageSection,
    PodcastEpisode,
    Project,
    SiteSettings,
    Subscriber,
    Tag,
    TeamMember,
    Testimonial,
    UpcomingEvent,
    Visitor,
)


TINYMCE_API_KEY = getattr(settings, "TINYMCE_API_KEY", "")
TINYMCE_JS = []
if TINYMCE_API_KEY:
    TINYMCE_JS = [
        f"https://cdn.tiny.cloud/1/{TINYMCE_API_KEY}/tinymce/6/tinymce.min.js",
        "foundation/js/tinymce-init.js",
    ]


class RichTextAdminMixin:
    rich_text_fields: tuple[str, ...] = ("body",)

    class Media:
        js = TINYMCE_JS

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        for field_name in getattr(self, "rich_text_fields", ()):
            if field_name in form.base_fields:
                widget = form.base_fields[field_name].widget
                if isinstance(widget, forms.Textarea):
                    widget.attrs["class"] = (widget.attrs.get("class", "") + " richtext").strip()
        return form


class ProjectAdminForm(forms.ModelForm):
    impact_numbers = forms.JSONField(
        required=False,
        widget=forms.Textarea(
            attrs={
                "rows": 18,
                "class": "vLargeTextField code",
                "style": "font-family: ui-monospace, SFMono-Regular, Consolas, monospace;",
                "placeholder": (
                    '{\n'
                    '  "focus": "Healthcare",\n'
                    '  "status": "Active",\n'
                    '  "location": "Nashik and Palghar Blocks",\n'
                    '  "timeline": "Feb 2026 - Apr 2026",\n'
                    '  "beneficiaries": 860,\n'
                    '  "volunteers": 48,\n'
                    '  "partners": 7,\n'
                    '  "budget": 260000,\n'
                    '  "spent": 252000,\n'
                    '  "objective": "Expand access to preventive diagnostics.",\n'
                    '  "outcomes": ["500+ patients screened", "Referral desk active"]\n'
                    '}'
                ),
            }
        ),
        help_text=format_html(
            "Recent Projects showcase uses this JSON dynamically. "
            "Recommended keys: <code>focus</code>, <code>status</code>, <code>location</code>, "
            "<code>timeline</code>, <code>beneficiaries</code>, <code>volunteers</code>, "
            "<code>partners</code>, <code>budget</code>, <code>spent</code>, "
            "<code>objective</code>, and <code>outcomes</code>."
        ),
    )

    class Meta:
        model = Project
        fields = "__all__"


@admin.register(MediaAsset, site=admin_site)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("__str__", "media_type", "created_at")
    list_filter = ("media_type", "created_at")
    search_fields = ("title", "file", "alt_text")


class PageSectionInline(admin.StackedInline):
    model = PageSection
    extra = 0
    fields = (
        "sort_order",
        "section_type",
        "title",
        "body",
        "image",
        "embed_html",
        "button_text",
        "button_url",
        "is_enabled",
        "extra",
    )
    ordering = ("sort_order", "id")
    autocomplete_fields = ("image",)


@admin.register(Page, site=admin_site)
class PageAdmin(RichTextAdminMixin, admin.ModelAdmin):
    inlines = [PageSectionInline]
    list_display = ("title", "slug", "status", "publish_at", "updated_at")
    list_filter = ("status", "show_in_nav")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("cover_image", "og_image")
    fieldsets = (
        (None, {"fields": ("title", "slug", "status", "publish_at", "show_in_nav", "menu_title")}),
        ("Content", {"fields": ("cover_image", "body", "embed_html")}),
        (
            "SEO",
            {
                "fields": (
                    "seo_title",
                    "seo_description",
                    "canonical_url",
                    "og_title",
                    "og_description",
                    "og_image",
                )
            },
        ),
    )


@admin.register(Category, site=admin_site)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag, site=admin_site)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article, site=admin_site)
class ArticleAdmin(RichTextAdminMixin, admin.ModelAdmin):
    list_display = ("title", "slug", "status", "publish_at", "is_featured", "updated_at")
    list_filter = ("status", "is_featured", "categories", "tags")
    search_fields = ("title", "slug", "author_name")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("featured_image", "og_image", "social_share_image")
    filter_horizontal = ("categories", "tags")
    fieldsets = (
        (None, {"fields": ("title", "slug", "status", "publish_at", "author_name", "is_featured")}),
        ("Content", {"fields": ("featured_image", "excerpt", "body", "categories", "tags")}),
        (
            "SEO",
            {
                "fields": (
                    "seo_title",
                    "seo_description",
                    "canonical_url",
                    "og_title",
                    "og_description",
                    "og_image",
                )
            },
        ),
        ("Social Preview", {"fields": ("social_share_title", "social_share_description", "social_share_image")}),
    )


@admin.register(MagazineIssue, site=admin_site)
class MagazineIssueAdmin(RichTextAdminMixin, admin.ModelAdmin):
    rich_text_fields = ("description",)
    list_display = ("title", "slug", "status", "publish_at", "is_featured", "updated_at")
    list_filter = ("status", "is_featured")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("cover_image", "og_image")


@admin.register(MagazineStory, site=admin_site)
class MagazineStoryAdmin(RichTextAdminMixin, admin.ModelAdmin):
    list_display = ("title", "issue", "status", "publish_at", "highlight_on_homepage", "sort_order")
    list_filter = ("status", "issue", "highlight_on_homepage")
    search_fields = ("title", "slug", "author_name")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("featured_image", "og_image")


@admin.register(Testimonial, site=admin_site)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "designation", "is_approved", "is_hidden", "created_at")
    list_filter = ("is_approved", "is_hidden")
    search_fields = ("name", "organization", "designation", "quote")
    autocomplete_fields = ("photo", "media")
    fieldsets = (
        (
            "Testimonial",
            {
                "fields": (
                    "name",
                    "designation",
                    "organization",
                    "quote",
                    "is_approved",
                    "is_hidden",
                )
            },
        ),
        (
            "Media",
            {
                "description": "Use Media for either a testimonial photo or video. Photo remains as an image fallback.",
                "fields": ("media", "photo"),
            },
        ),
    )


@admin.register(TeamMember, site=admin_site)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "state", "position", "is_active", "sort_order", "updated_at")
    list_filter = ("state", "is_active")
    search_fields = ("name", "position", "note")
    autocomplete_fields = ("photo",)
    fields = ("state", "name", "position", "photo", "note", "sort_order", "is_active")


@admin.register(Award, site=admin_site)
class AwardAdmin(admin.ModelAdmin):
    list_display = ("title", "presenter", "year", "sort_order", "is_active", "created_at")
    list_filter = ("is_active", "year")
    search_fields = ("title", "presenter", "year")
    autocomplete_fields = ("image",)
    filter_horizontal = ("detail_images",)

@admin.register(PodcastEpisode, site=admin_site)
class PodcastEpisodeAdmin(RichTextAdminMixin, admin.ModelAdmin):
    rich_text_fields = ("description", "summary")
    list_display = ("title", "slug", "status", "publish_at", "is_featured", "sort_order")
    list_filter = ("status", "is_featured")
    search_fields = ("title", "slug", "host")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("cover_image",)


@admin.register(Project, site=admin_site)
class ProjectAdmin(RichTextAdminMixin, admin.ModelAdmin):
    form = ProjectAdminForm
    rich_text_fields = ("description", "summary")
    list_display = ("title", "slug", "status", "publish_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "slug", "partner_organization")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("featured_image", "testimonial", "og_image")
    filter_horizontal = ("gallery",)


@admin.register(HomepageSection, site=admin_site)
class HomepageSectionAdmin(RichTextAdminMixin, admin.ModelAdmin):
    list_display = ("section_type", "title", "homepage", "sort_order", "is_enabled", "updated_at")
    list_filter = ("section_type", "is_enabled")
    search_fields = ("title", "section_type")
    autocomplete_fields = ("image",)
    rich_text_fields = ("body", "embed_html")


class HomepageSectionInline(admin.TabularInline):
    model = HomepageSection
    extra = 0
    fields = ("sort_order", "section_type", "title", "is_enabled")
    ordering = ("sort_order", "id")


@admin.register(Homepage, site=admin_site)
class HomepageAdmin(admin.ModelAdmin):
    inlines = [HomepageSectionInline]
    autocomplete_fields = ("hero_background_image", "featured_article", "featured_page")
    filter_horizontal = ("hero_slider_images", "partner_logos")
    fieldsets = (
        (
            "Hero Content",
            {
                "fields": (
                    "hero_title",
                    "hero_subtitle",
                    "hero_cta_text",
                    "hero_cta_url",
                )
            },
        ),
        (
            "Hero Background Slider",
            {
                "description": "Add multiple images here. These images will rotate automatically in the website hero section.",
                "fields": ("hero_slider_images",),
            },
        ),
        (
            "Legacy Single Hero Image",
            {
                "classes": ("collapse",),
                "description": "Used only as a fallback when no slider images are selected.",
                "fields": ("hero_background_image",),
            },
        ),
        (
            "Homepage Links & Display",
            {
                "fields": (
                    "featured_article",
                    "featured_page",
                    "partner_logos",
                    "show_testimonials",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return not Homepage.objects.exists()


@admin.register(SiteSettings, site=admin_site)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()


@admin.register(PageSection, site=admin_site)
class PageSectionAdmin(RichTextAdminMixin, admin.ModelAdmin):
    list_display = ("section_type", "title", "page", "sort_order", "is_enabled", "updated_at")
    list_filter = ("section_type", "is_enabled")
    search_fields = ("title", "section_type", "body")
    autocomplete_fields = ("page", "image")
    rich_text_fields = ("body", "embed_html")


@admin.register(UpcomingEvent, site=admin_site)
class UpcomingEventAdmin(admin.ModelAdmin):
    list_display = ("title", "date_label", "location_label", "is_active", "sort_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title", "subtitle", "description", "date_label", "location_label")
    autocomplete_fields = ("poster_image",)

@admin.register(ContactSubmission, site=admin_site)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "phone", "company", "subject", "message")
    actions = ("export_csv", "mark_contacted")

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        filename = f"contact_submissions_{timezone.now():%Y%m%d_%H%M}.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(["name", "email", "phone", "company", "subject", "message", "status", "created_at"])
        for obj in queryset.order_by("-created_at"):
            writer.writerow(
                [
                    obj.name,
                    obj.email,
                    obj.phone,
                    obj.company,
                    obj.subject,
                    obj.message,
                    obj.status,
                    obj.created_at.isoformat(),
                ]
            )
        return response

    export_csv.short_description = "Export selected to CSV (Excel)"

    def mark_contacted(self, request, queryset):
        queryset.update(status=ContactSubmission.Status.CONTACTED, contacted_at=timezone.now())

    mark_contacted.short_description = "Mark as contacted"


@admin.register(Subscriber, site=admin_site)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "source", "created_at")
    search_fields = ("email", "name", "source")
    actions = ("export_csv",)

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        filename = f"subscribers_{timezone.now():%Y%m%d_%H%M}.csv"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(["email", "name", "source", "created_at"])
        for obj in queryset.order_by("-created_at"):
            writer.writerow([obj.email, obj.name, obj.source, obj.created_at.isoformat()])
        return response

    export_csv.short_description = "Export selected to CSV (Excel)"


class DonationPaymentLogInline(admin.TabularInline):
    model = DonationPaymentLog
    extra = 0
    can_delete = False
    fields = ("created_at", "event_type", "status_snapshot", "message")
    readonly_fields = ("created_at", "event_type", "status_snapshot", "message", "payload")
    ordering = ("-created_at", "-id")
    show_change_link = True


@admin.register(Donation, site=admin_site)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        "donor_name",
        "donor_email",
        "amount",
        "donation_type",
        "status",
        "razorpay_payment_id",
        "created_at",
    )
    list_filter = ("donation_type", "status", "created_at")
    inlines = [DonationPaymentLogInline]
    search_fields = (
        "donor_name",
        "donor_email",
        "donor_phone",
        "receipt",
        "razorpay_order_id",
        "razorpay_subscription_id",
        "razorpay_payment_id",
    )
    readonly_fields = (
        "receipt",
        "razorpay_order_id",
        "razorpay_plan_id",
        "razorpay_subscription_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "verified_at",
        "created_at",
        "updated_at",
    )


@admin.register(DonationPaymentLog, site=admin_site)
class DonationPaymentLogAdmin(admin.ModelAdmin):
    list_display = ("donation", "event_type", "status_snapshot", "message", "created_at")
    list_filter = ("event_type", "status_snapshot", "created_at")
    search_fields = (
        "donation__donor_name",
        "donation__donor_email",
        "donation__receipt",
        "message",
        "payload",
    )
    readonly_fields = ("donation", "event_type", "status_snapshot", "message", "payload", "created_at", "updated_at")


@admin.register(Visitor, site=admin_site)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("visitor_id", "first_seen_at", "last_seen_at")
    search_fields = ("visitor_id",)


@admin.register(PageView, site=admin_site)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ("path", "visitor", "created_at")
    list_filter = ("created_at",)
    search_fields = ("path", "full_path", "referer", "user_agent", "visitor__visitor_id")
    autocomplete_fields = ("visitor",)


@admin.register(GalleryItem, site=admin_site)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_active", "sort_order", "created_at")
    list_filter = ("category", "is_active")
    search_fields = ("title", "category")
    autocomplete_fields = ("image",)

@admin.register(StoryItem, site=admin_site)
class StoryItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "sort_order", "is_active")
    list_editable = ("sort_order", "is_active")
    ordering = ("sort_order",)
    search_fields = ("title",)
