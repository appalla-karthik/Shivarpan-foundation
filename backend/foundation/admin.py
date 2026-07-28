from __future__ import annotations

import csv

from foundation.models import GalleryItem
from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from django.db.models import BigIntegerField, F, Sum, Value
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import format_html
from .models import StoryItem

from core.admin_site import admin_site
from foundation.models import (
    Article,
    Award,
    AwardNomination,
    Category,
    ContactSubmission,
    Donation,
    DonationPaymentLog,
    DonationTransaction,
    Homepage,
    HomepageSection,
    ImpactVideo,
    MagazineIssue,
    MagazineStory,
    MediaAsset,
    Page,
    PageView,
    PageSection,
    PodcastEpisode,
    Project,
    SiteSettings,
    Story,
    Subscriber,
    Tag,
    TeamMember,
    TeamState,
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


class TestimonialAdminForm(forms.ModelForm):
    profile_photo_upload = forms.FileField(
        required=False,
        label="Upload reviewer profile photo",
        help_text=(
            "Optional. Upload a JPEG, PNG, or WebP image up to 10 MB. "
            "This replaces the initials circle beside the reviewer's name."
        ),
    )
    review_upload = forms.FileField(
        required=False,
        label="Upload new testimonial image or video",
        help_text=(
            "Upload JPEG, PNG, WebP, MP4, WebM, MOV, or M4V. "
            "Images can be up to 10 MB and videos up to 100 MB."
        ),
    )

    class Meta:
        model = Testimonial
        fields = "__all__"

    def clean_profile_photo_upload(self):
        uploaded = self.cleaned_data.get("profile_photo_upload")
        if not uploaded:
            return uploaded

        file_name = (uploaded.name or "").lower()
        if not file_name.endswith((".jpg", ".jpeg", ".png", ".webp")):
            raise ValidationError("Upload a JPEG, PNG, or WebP profile photo.")
        if uploaded.size > 10 * 1024 * 1024:
            raise ValidationError("Reviewer profile photos must be 10 MB or smaller.")
        try:
            width, height = get_image_dimensions(uploaded)
            uploaded.seek(0)
        except Exception as exc:
            raise ValidationError("The reviewer profile photo is not valid.") from exc
        if not width or not height:
            raise ValidationError("The reviewer profile photo is not valid.")
        return uploaded

    def clean_review_upload(self):
        uploaded = self.cleaned_data.get("review_upload")
        if not uploaded:
            return uploaded

        file_name = (uploaded.name or "").lower()
        image_extensions = (".jpg", ".jpeg", ".png", ".webp")
        video_extensions = (".mp4", ".webm", ".mov", ".m4v")

        if file_name.endswith(image_extensions):
            if uploaded.size > 10 * 1024 * 1024:
                raise ValidationError("Testimonial images must be 10 MB or smaller.")
            try:
                width, height = get_image_dimensions(uploaded)
                uploaded.seek(0)
            except Exception as exc:
                raise ValidationError("The uploaded testimonial image is not valid.") from exc
            if not width or not height:
                raise ValidationError("The uploaded testimonial image is not valid.")
            return uploaded

        if file_name.endswith(video_extensions):
            if uploaded.size > 100 * 1024 * 1024:
                raise ValidationError(
                    "Testimonial videos must be 100 MB or smaller."
                )
            content_type = (getattr(uploaded, "content_type", "") or "").lower()
            if content_type and not (
                content_type.startswith("video/")
                or content_type == "application/octet-stream"
            ):
                raise ValidationError("The uploaded file is not a valid video.")
            return uploaded

        raise ValidationError(
            "Upload a JPEG, PNG, WebP, MP4, WebM, MOV, or M4V file."
        )

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("review_upload") and cleaned_data.get("media"):
            self.add_error(
                "review_upload",
                "Choose either a new upload or an existing Media Asset, not both.",
            )
        if cleaned_data.get("profile_photo_upload") and cleaned_data.get("photo"):
            self.add_error(
                "profile_photo_upload",
                "Choose either a new reviewer photo or an existing Media Asset, not both.",
            )
        return cleaned_data


class ProjectAdminForm(forms.ModelForm):
    current_public_raised_amount = forms.IntegerField(
        min_value=0,
        required=True,
        label="Set current public raised amount (INR)",
        help_text=(
            "Enter the exact total that should be visible on the website right now. "
            "Verified online payments are preserved separately and every new successful "
            "payment will automatically increase this total."
        ),
    )
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
            "<code>partners</code>, <code>objective</code>, and <code>outcomes</code>. "
            "Funding values belong only in the Funding control fields above."
        ),
    )

    class Meta:
        model = Project
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["current_public_raised_amount"].initial = (
                self.instance.public_raised_amount
            )
        else:
            self.fields["current_public_raised_amount"].initial = 0

    def clean_impact_numbers(self):
        impact_numbers = dict(self.cleaned_data.get("impact_numbers") or {})
        for reserved_key in (
            "budget",
            "target",
            "allocated_budget",
            "spent",
            "raised",
            "utilized",
            "deployed",
            "remaining",
            "progress",
        ):
            impact_numbers.pop(reserved_key, None)
        return impact_numbers

    def clean_current_public_raised_amount(self):
        desired_total = self.cleaned_data["current_public_raised_amount"]
        actual_online = (
            self.instance.actual_online_raised_amount
            if self.instance and self.instance.pk
            else 0
        )
        if desired_total < actual_online:
            raise forms.ValidationError(
                f"Public raised amount cannot be below the actual online collection "
                f"of INR {actual_online:,}."
            )
        return desired_total

    def save(self, commit=True):
        project = super().save(commit=False)
        desired_total = self.cleaned_data["current_public_raised_amount"]
        actual_online = (
            self.instance.actual_online_raised_amount
            if self.instance and self.instance.pk
            else 0
        )
        project.manual_raised_amount = max(desired_total - actual_online, 0)
        if commit:
            project.save()
            self.save_m2m()
        return project


@admin.register(MediaAsset, site=admin_site)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("__str__", "category", "media_type", "created_at")
    list_filter = ("category", "media_type", "created_at")
    search_fields = ("title", "category", "file", "alt_text")


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


@admin.register(Story, site=admin_site)
class StoryAdmin(RichTextAdminMixin, admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "status",
        "publish_at",
        "is_featured",
        "sort_order",
        "updated_at",
    )
    list_filter = ("status", "is_featured", "category")
    list_editable = ("is_featured", "sort_order")
    search_fields = ("title", "slug", "excerpt", "body", "location_label")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("featured_image", "og_image")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "slug",
                    "status",
                    "publish_at",
                    "is_featured",
                    "sort_order",
                )
            },
        ),
        (
            "Story content",
            {
                "fields": (
                    "featured_image",
                    "excerpt",
                    "body",
                    "date_label",
                    "location_label",
                    "read_time",
                    "category",
                )
            },
        ),
        (
            "SEO",
            {
                "classes": ("collapse",),
                "fields": (
                    "seo_title",
                    "seo_description",
                    "canonical_url",
                    "og_title",
                    "og_description",
                    "og_image",
                ),
            },
        ),
    )


@admin.register(ImpactVideo, site=admin_site)
class ImpactVideoAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "video_source",
        "published_on",
        "is_featured",
        "is_active",
        "sort_order",
    )
    list_filter = ("is_active", "is_featured", "category", "published_on")
    list_editable = ("is_featured", "is_active", "sort_order")
    search_fields = ("title", "slug", "short_description", "category", "youtube_url")
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        (
            "Video details",
            {
                "fields": (
                    "title",
                    "slug",
                    "short_description",
                    "category",
                    "published_on",
                )
            },
        ),
        (
            "Video source",
            {
                "description": (
                    "Choose one source only. YouTube is recommended and its thumbnail "
                    "loads automatically unless a custom thumbnail is uploaded. "
                    "For a direct upload, add both the video file and its thumbnail here."
                ),
                "fields": ("youtube_url", "video_file", "thumbnail"),
            },
        ),
        (
            "Display controls",
            {"fields": ("is_featured", "sort_order", "is_active")},
        ),
    )

    @admin.display(description="Source")
    def video_source(self, obj):
        return "YouTube" if obj.youtube_url else "Direct upload"


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
    form = TestimonialAdminForm
    list_display = (
        "name",
        "organization",
        "designation",
        "rating",
        "review_format",
        "is_approved",
        "is_hidden",
        "created_at",
    )
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
                    "rating",
                    "is_approved",
                    "is_hidden",
                )
            },
        ),
        (
            "Image or video review",
            {
                "description": (
                    "Upload a new review image/video directly, or select an existing "
                    "Media Asset."
                ),
                "fields": ("review_upload", "media"),
            },
        ),
        (
            "Reviewer profile photo",
            {
                "description": (
                    "Upload the reviewer's photo directly, or select an existing image "
                    "Media Asset. If empty, the reviewer's initials are shown."
                ),
                "fields": ("profile_photo_upload", "photo"),
            },
        ),
    )

    @admin.display(description="Review format")
    def review_format(self, obj):
        review_media = obj.media or obj.photo
        if not review_media:
            return "Text only"
        return review_media.get_media_type_display()

    def save_model(self, request, obj, form, change):
        profile_photo = form.cleaned_data.get("profile_photo_upload")
        if profile_photo:
            photo_asset = MediaAsset(
                title=f"{obj.name} profile photo",
                category="Testimonials",
                file=profile_photo,
                alt_text=f"{obj.name} profile photo",
            )
            photo_asset.save()
            obj.photo = photo_asset

        uploaded = form.cleaned_data.get("review_upload")
        if uploaded:
            media_asset = MediaAsset(
                title=f"{obj.name} testimonial",
                category="Testimonials",
                file=uploaded,
                alt_text=f"{obj.name} testimonial review",
            )
            media_asset.save()
            obj.media = media_asset
        super().save_model(request, obj, form, change)


@admin.register(TeamState, site=admin_site)
class TeamStateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "member_count", "sort_order", "is_active", "updated_at")
    list_editable = ("sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "summary")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    fields = ("name", "slug", "summary", "sort_order", "is_active")

    @admin.display(description="Members")
    def member_count(self, obj):
        return obj.members.count()


@admin.register(TeamMember, site=admin_site)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "state", "position", "is_active", "sort_order", "updated_at")
    list_filter = ("state", "is_active")
    search_fields = ("name", "position", "note")
    autocomplete_fields = ("state", "photo")
    fields = ("state", "name", "position", "photo", "note", "sort_order", "is_active")


class AwardAdminForm(forms.ModelForm):
    bulk_detail_image_category = forms.ChoiceField(
        required=False,
        label="Add detail images by media category",
        help_text="Choose a Media Asset category and save. All image assets from that category will be added to Detail images.",
    )

    class Meta:
        model = Award
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        categories = (
            MediaAsset.objects.filter(media_type=MediaAsset.MediaType.IMAGE)
            .exclude(category="")
            .order_by("category")
            .values_list("category", flat=True)
            .distinct()
        )
        self.fields["bulk_detail_image_category"].choices = [("", "-- Select category --")] + [
            (category, category) for category in categories
        ]


@admin.register(Award, site=admin_site)
class AwardAdmin(admin.ModelAdmin):
    form = AwardAdminForm
    list_display = ("title", "category", "presenter", "year", "is_upcoming", "sort_order", "is_active", "created_at")
    list_filter = ("is_upcoming", "is_active", "category", "year")
    search_fields = ("title", "category", "presenter", "year")
    fields = (
        "title",
        "category",
        "presenter",
        "year",
        "summary",
        "image",
        "detail_images",
        "bulk_detail_image_category",
        "is_upcoming",
        "sort_order",
        "is_active",
    )
    autocomplete_fields = ("image",)
    filter_horizontal = ("detail_images",)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        category = form.cleaned_data.get("bulk_detail_image_category")
        if category and form.instance.pk:
            assets = MediaAsset.objects.filter(category=category, media_type=MediaAsset.MediaType.IMAGE)
            form.instance.detail_images.add(*assets)
            self.message_user(request, f"Added {assets.count()} detail images from '{category}'.")

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
    list_display = (
        "title",
        "funding_target_display",
        "public_raised_display",
        "actual_online_display",
        "funding_remaining_display",
        "status",
        "updated_at",
    )
    list_filter = ("status",)
    search_fields = ("title", "slug", "partner_organization")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("featured_image", "testimonial", "og_image")
    filter_horizontal = ("gallery",)
    readonly_fields = (
        "actual_online_collection",
        "manual_opening_balance",
        "calculated_remaining_amount",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (
            "Project",
            {
                "fields": (
                    "title",
                    "slug",
                    "status",
                    "publish_at",
                    "partner_organization",
                )
            },
        ),
        (
            "Funding control",
            {
                "description": (
                    "Set the exact public total here. Actual verified online collection "
                    "is read-only and new successful transactions are added automatically."
                ),
                "fields": (
                    "funding_target_amount",
                    "current_public_raised_amount",
                    "actual_online_collection",
                    "manual_opening_balance",
                    "calculated_remaining_amount",
                ),
            },
        ),
        (
            "Content and impact",
            {
                "fields": (
                    "summary",
                    "description",
                    "impact_numbers",
                    "featured_image",
                    "gallery",
                    "testimonial",
                )
            },
        ),
        (
            "SEO",
            {
                "classes": ("collapse",),
                "fields": (
                    "seo_title",
                    "seo_description",
                    "canonical_url",
                    "og_title",
                    "og_description",
                    "og_image",
                ),
            },
        ),
        (
            "System",
            {
                "classes": ("collapse",),
                "fields": ("created_at", "updated_at"),
            },
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            actual_online_paise=Coalesce(
                Sum(
                    F("transactions__amount_paise")
                    - F("transactions__refunded_amount_paise")
                ),
                Value(0),
                output_field=BigIntegerField(),
            )
        )

    @admin.display(description="Target")
    def funding_target_display(self, obj):
        return f"INR {obj.funding_target_amount:,}"

    @admin.display(description="Public raised")
    def public_raised_display(self, obj):
        return f"INR {obj.public_raised_amount:,}"

    @admin.display(description="Actual online")
    def actual_online_display(self, obj):
        return f"INR {obj.actual_online_raised_amount:,}"

    @admin.display(description="Remaining")
    def funding_remaining_display(self, obj):
        return f"INR {obj.funding_remaining_amount:,}"

    @admin.display(description="Actual verified online collection (read-only)")
    def actual_online_collection(self, obj):
        if not obj or not obj.pk:
            return "INR 0"
        return format_html(
            "<strong>INR {}</strong> — calculated from captured payments after refunds.",
            f"{obj.actual_online_raised_amount:,}",
        )

    @admin.display(description="Manual/opening component (read-only)")
    def manual_opening_balance(self, obj):
        if not obj or not obj.pk:
            return "INR 0"
        return f"INR {obj.manual_raised_amount:,}"

    @admin.display(description="Remaining against target (read-only)")
    def calculated_remaining_amount(self, obj):
        if not obj or not obj.pk:
            return "INR 0"
        return f"INR {obj.funding_remaining_amount:,}"


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
        "donation_category",
        "project",
        "eighty_g_requested",
        "status",
        "razorpay_payment_id",
        "created_at",
    )
    list_filter = ("donation_type", "donation_category", "eighty_g_requested", "status", "created_at")
    inlines = [DonationPaymentLogInline]
    search_fields = (
        "donor_name",
        "donor_email",
        "donor_phone",
        "donation_category",
        "project__title",
        "receipt",
        "razorpay_order_id",
        "razorpay_subscription_id",
        "razorpay_payment_id",
    )
    readonly_fields = (
        "donor_name",
        "donor_email",
        "donor_phone",
        "amount",
        "currency",
        "donation_type",
        "payment_mode_preference",
        "project",
        "project_slug",
        "project_title",
        "donation_category",
        "eighty_g_requested",
        "pan_number",
        "message",
        "status",
        "receipt",
        "razorpay_order_id",
        "razorpay_plan_id",
        "razorpay_subscription_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "razorpay_status",
        "verified_at",
        "created_at",
        "updated_at",
        "notes",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DonationTransaction, site=admin_site)
class DonationTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "razorpay_payment_id",
        "donation",
        "project",
        "net_amount_display",
        "status",
        "source",
        "paid_at",
    )
    list_filter = ("status", "source", "currency", "paid_at")
    search_fields = (
        "razorpay_payment_id",
        "donation__donor_name",
        "donation__donor_email",
        "project__title",
        "project__slug",
    )
    readonly_fields = (
        "donation",
        "project",
        "razorpay_payment_id",
        "amount_paise",
        "refunded_amount_paise",
        "currency",
        "status",
        "source",
        "paid_at",
        "payload",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description="Net actual amount")
    def net_amount_display(self, obj):
        return f"INR {obj.net_amount_paise / 100:,.2f}"


@admin.register(AwardNomination, site=admin_site)
class AwardNominationAdmin(admin.ModelAdmin):
    list_display = ("nominee_full_name", "company_name", "email", "mobile_number", "award_show", "created_at")
    list_filter = ("award_show", "created_at")
    search_fields = ("nominee_full_name", "company_name", "email", "mobile_number", "company_full_address")
    autocomplete_fields = ("award_show",)
    readonly_fields = ("created_at", "updated_at")


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

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Visitor, site=admin_site)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("visitor_id", "first_seen_at", "last_seen_at")
    search_fields = ("visitor_id",)
    readonly_fields = ("visitor_id", "first_seen_at", "last_seen_at")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PageView, site=admin_site)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ("path", "visitor", "created_at")
    list_filter = ("created_at",)
    search_fields = ("path", "full_path", "referer", "user_agent", "visitor__visitor_id")
    autocomplete_fields = ("visitor",)
    readonly_fields = (
        "visitor",
        "path",
        "full_path",
        "referer",
        "user_agent",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


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
