from __future__ import annotations

import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse
from django.utils import timezone

from .video_utils import extract_youtube_video_id


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ContentStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class PublishableQuerySet(models.QuerySet):
    def published(self):
        now = timezone.now()
        return self.filter(status=ContentStatus.PUBLISHED, publish_at__lte=now)


class PublishableModel(TimeStampedModel):
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.DRAFT)
    publish_at = models.DateTimeField(default=timezone.now)

    objects = PublishableQuerySet.as_manager()

    class Meta:
        abstract = True


class MediaAsset(TimeStampedModel):
    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        PDF = "pdf", "PDF"
        DOCUMENT = "document", "Document"
        OTHER = "other", "Other"

    title = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=120, blank=True)
    file = models.FileField(upload_to="uploads/%Y/%m/")
    file_name = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    file_blob = models.BinaryField(blank=True, null=True, editable=False)
    alt_text = models.CharField(max_length=255, blank=True)
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.OTHER)

    def __str__(self) -> str:
        return self.title or self.file.name.rsplit("/", 1)[-1]

    def save(self, *args, **kwargs):
        if self.file and self.file.name:
            name = self.file.name.lower()
            self.file_name = self.file.name.rsplit("/", 1)[-1]

            uploaded_file = None
            if not getattr(self.file, "_committed", True):
                # Uploaded media lives on the persistent media volume. Do not
                # duplicate every new file inside the database as a binary blob.
                self.file_blob = None
                uploaded_file = getattr(self.file, "file", None)

            self.content_type = (
                getattr(uploaded_file, "content_type", "") or self.content_type
            )
            if name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
                self.media_type = self.MediaType.IMAGE
            elif name.endswith((".mp4", ".mov", ".webm", ".mkv")):
                self.media_type = self.MediaType.VIDEO
            elif name.endswith(".pdf"):
                self.media_type = self.MediaType.PDF
            elif name.endswith((".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx")):
                self.media_type = self.MediaType.DOCUMENT
            else:
                self.media_type = self.MediaType.OTHER
        return super().save(*args, **kwargs)

    def public_url(self, request=None) -> str:
        if self.file_blob:
            relative = reverse("mediaasset-file", args=[self.pk])
        elif self.file:
            try:
                relative = self.file.url
            except Exception:
                return ""
        else:
            return ""

        # Keep public media same-origin. Absolute URLs generated behind a reverse
        # proxy can accidentally use http:// when proxy headers are incomplete,
        # which causes mixed-content failures on the HTTPS frontend.
        return relative


class SeoFields(models.Model):
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    canonical_url = models.URLField(blank=True)
    og_title = models.CharField(max_length=255, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    class Meta:
        abstract = True


class Page(PublishableModel, SeoFields):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    body = models.TextField(blank=True)
    cover_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="page_covers"
    )
    embed_html = models.TextField(blank=True, help_text="Optional: YouTube/embed code.")

    show_in_nav = models.BooleanField(default=False)
    menu_title = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return self.title


class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class Tag(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    def __str__(self) -> str:
        return self.name


class Article(PublishableModel, SeoFields):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True)
    body = models.TextField(blank=True)
    author_name = models.CharField(max_length=255, blank=True)
    featured_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="article_images"
    )
    categories = models.ManyToManyField(Category, blank=True, related_name="articles")
    tags = models.ManyToManyField(Tag, blank=True, related_name="articles")
    is_featured = models.BooleanField(default=False)

    social_share_title = models.CharField(max_length=255, blank=True)
    social_share_description = models.TextField(blank=True)
    social_share_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="article_social_images"
    )

    def __str__(self) -> str:
        return self.title


class MagazineIssue(PublishableModel, SeoFields):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    cover_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="magazine_covers"
    )
    is_featured = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.title


class MagazineStory(PublishableModel, SeoFields):
    issue = models.ForeignKey(MagazineIssue, on_delete=models.CASCADE, related_name="stories")
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True)
    body = models.TextField(blank=True)
    author_name = models.CharField(max_length=255, blank=True)
    featured_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="magazine_story_images"
    )
    sort_order = models.PositiveIntegerField(default=0)
    highlight_on_homepage = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "-publish_at"]

    def __str__(self) -> str:
        return self.title


class Testimonial(TimeStampedModel):
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    quote = models.TextField()
    photo = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="testimonial_photos"
    )
    media = models.ForeignKey(
        MediaAsset,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="testimonial_media",
        help_text="Upload/select a testimonial photo or video. If empty, photo is used as fallback.",
    )
    is_approved = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)

    def clean(self):
        super().clean()
        errors = {}
        if self.photo_id and self.photo.media_type != MediaAsset.MediaType.IMAGE:
            errors["photo"] = "Select an image asset for the profile photo."
        if self.media_id and self.media.media_type not in {
            MediaAsset.MediaType.IMAGE,
            MediaAsset.MediaType.VIDEO,
        }:
            errors["media"] = "Testimonial media must be an image or video."
        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return f"{self.name} ({self.organization})" if self.organization else self.name


class TeamMember(TimeStampedModel):
    class State(models.TextChoices):
        ANDHRA_PRADESH = "andhra_pradesh", "Andhra Pradesh"
        WEST_BENGAL = "west_bengal", "West Bengal"
        UTTAR_PRADESH = "uttar_pradesh", "Uttar Pradesh"

    state = models.CharField(max_length=80, choices=State.choices)
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    photo = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="team_member_photos"
    )
    note = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["state", "sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_state_display()}"


class Project(PublishableModel, SeoFields):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    partner_organization = models.CharField(max_length=255, blank=True)
    funding_target_amount = models.PositiveBigIntegerField(
        default=0,
        help_text="Public fundraising target in rupees.",
    )
    manual_raised_amount = models.PositiveBigIntegerField(
        default=0,
        editable=False,
        help_text="Internal opening/offline balance in rupees. Use the admin funding control to update it.",
    )
    impact_numbers = models.JSONField(default=dict, blank=True)
    featured_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="project_images"
    )
    gallery = models.ManyToManyField(MediaAsset, blank=True, related_name="project_galleries")
    testimonial = models.ForeignKey(
        Testimonial, null=True, blank=True, on_delete=models.SET_NULL, related_name="projects"
    )

    def save(self, *args, **kwargs):
        if self.impact_numbers is None:
            self.impact_numbers = {}
        super().save(*args, **kwargs)

    @property
    def actual_online_raised_amount(self) -> int:
        annotated_total = getattr(self, "actual_online_paise", None)
        if annotated_total is None:
            annotated_total = self.transactions.aggregate(
                total=models.Sum(
                    models.F("amount_paise") - models.F("refunded_amount_paise")
                )
            )["total"]
        return max(int(annotated_total or 0) // 100, 0)

    @property
    def public_raised_amount(self) -> int:
        return int(self.manual_raised_amount or 0) + self.actual_online_raised_amount

    @property
    def funding_remaining_amount(self) -> int:
        return max(int(self.funding_target_amount or 0) - self.public_raised_amount, 0)

    def __str__(self) -> str:
        return self.title


class ContactSubmission(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    notes = models.TextField(blank=True)
    contacted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.name} - {self.email}"


class Subscriber(TimeStampedModel):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return self.email


class Donation(TimeStampedModel):
    class DonationType(models.TextChoices):
        ONE_TIME = "one_time", "One Time"
        MONTHLY = "monthly", "Monthly"

    class Status(models.TextChoices):
        CREATED = "created", "Created"
        CHECKOUT_CREATED = "checkout_created", "Checkout Created"
        PAID = "paid", "Paid"
        SUBSCRIPTION_AUTHORIZED = "subscription_authorized", "Subscription Authorized"
        FAILED = "failed", "Failed"

    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    donor_phone = models.CharField(max_length=32)
    amount = models.PositiveIntegerField(help_text="Amount in rupees.")
    currency = models.CharField(max_length=8, default="INR")
    donation_type = models.CharField(
        max_length=20,
        choices=DonationType.choices,
        default=DonationType.ONE_TIME,
    )
    payment_mode_preference = models.CharField(max_length=50, blank=True)
    project = models.ForeignKey(
        Project,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="donations",
    )
    project_slug = models.SlugField(max_length=255, blank=True)
    project_title = models.CharField(max_length=255, blank=True)
    donation_category = models.CharField(max_length=80, blank=True)
    eighty_g_requested = models.BooleanField(
        default=False,
        verbose_name="80G certificate requested",
    )
    pan_number = models.CharField(max_length=10, blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.CREATED)
    receipt = models.CharField(max_length=80, unique=True)

    razorpay_order_id = models.CharField(max_length=80, blank=True)
    razorpay_plan_id = models.CharField(max_length=80, blank=True)
    razorpay_subscription_id = models.CharField(max_length=80, blank=True)
    razorpay_payment_id = models.CharField(max_length=80, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    razorpay_status = models.CharField(max_length=40, blank=True)

    notes = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.donor_name} - Rs {self.amount} ({self.get_donation_type_display()})"


class AwardNomination(TimeStampedModel):
    nominee_full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField()
    company_name = models.CharField(max_length=255)
    award_show = models.ForeignKey("Award", null=True, blank=True, on_delete=models.SET_NULL, related_name="nominations")
    nominee_profile_photo = models.FileField(upload_to="award_nominations/%Y/%m/", blank=True)
    company_full_address = models.TextField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.nominee_full_name} - {self.company_name}"


class DonationPaymentLog(TimeStampedModel):
    class EventType(models.TextChoices):
        CREATED = "created", "Created"
        CHECKOUT_REQUESTED = "checkout_requested", "Checkout Requested"
        ORDER_CREATED = "order_created", "Order Created"
        PLAN_CREATED = "plan_created", "Plan Created"
        SUBSCRIPTION_CREATED = "subscription_created", "Subscription Created"
        VERIFY_REQUESTED = "verify_requested", "Verify Requested"
        VERIFIED = "verified", "Verified"
        FAILED = "failed", "Failed"

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name="payment_logs")
    event_type = models.CharField(max_length=40, choices=EventType.choices)
    status_snapshot = models.CharField(max_length=32, blank=True)
    message = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self) -> str:
        return f"{self.donation_id} - {self.event_type}"


class DonationTransaction(TimeStampedModel):
    class Status(models.TextChoices):
        CAPTURED = "captured", "Captured"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially Refunded"
        REFUNDED = "refunded", "Refunded"

    donation = models.ForeignKey(
        Donation,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    project = models.ForeignKey(
        Project,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="transactions",
    )
    razorpay_payment_id = models.CharField(max_length=80, unique=True)
    amount_paise = models.PositiveBigIntegerField()
    refunded_amount_paise = models.PositiveBigIntegerField(default=0)
    currency = models.CharField(max_length=8, default="INR")
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.CAPTURED,
    )
    source = models.CharField(max_length=32, blank=True)
    paid_at = models.DateTimeField(default=timezone.now)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-paid_at", "-id"]

    @property
    def net_amount_paise(self) -> int:
        return max(int(self.amount_paise) - int(self.refunded_amount_paise), 0)

    def __str__(self) -> str:
        return f"{self.razorpay_payment_id} - Rs {self.net_amount_paise / 100:g}"


class Homepage(TimeStampedModel):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)

    hero_title = models.CharField(max_length=255, blank=True)
    hero_subtitle = models.TextField(blank=True)
    hero_background_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="homepage_hero_images"
    )
    hero_slider_images = models.ManyToManyField(
        MediaAsset,
        blank=True,
        related_name="homepage_hero_slider_sets",
        help_text="Select multiple images for the homepage hero background slider.",
    )
    hero_cta_text = models.CharField(max_length=100, blank=True)
    hero_cta_url = models.URLField(blank=True)

    featured_article = models.ForeignKey(
        Article, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    featured_page = models.ForeignKey(Page, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")

    partner_logos = models.ManyToManyField(MediaAsset, blank=True, related_name="partner_logo_sets")
    show_testimonials = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        return super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self) -> str:
        return "Homepage"


class HomepageSection(TimeStampedModel):
    homepage = models.ForeignKey(Homepage, on_delete=models.CASCADE, related_name="sections")
    section_type = models.CharField(max_length=50, default="section")
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="homepage_section_images"
    )
    embed_html = models.TextField(blank=True)
    button_text = models.CharField(max_length=100, blank=True)
    button_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        base = f"{self.section_type}"
        if self.title:
            base += f": {self.title}"
        return base


class PageSection(TimeStampedModel):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="sections")
    section_type = models.CharField(max_length=50, default="section")
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="page_section_images"
    )
    embed_html = models.TextField(blank=True)
    button_text = models.CharField(max_length=100, blank=True)
    button_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        base = f"{self.section_type}"
        if self.title:
            base += f": {self.title}"
        return base


class GalleryItem(TimeStampedModel):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=120, blank=True)
    image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="gallery_items"
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return self.title


class Story(PublishableModel, SeoFields):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True)
    body = models.TextField(blank=True)
    date_label = models.CharField(max_length=120, blank=True)
    location_label = models.CharField(max_length=180, blank=True)
    read_time = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=120, blank=True)
    featured_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="story_images"
    )
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "-publish_at"]

    def __str__(self) -> str:
        return self.title


class ImpactVideo(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_description = models.TextField(blank=True)
    thumbnail = models.ImageField(
        upload_to="impact-videos/thumbnails/%Y/%m/",
        blank=True,
        help_text=(
            "Optional for YouTube videos because the YouTube thumbnail is loaded "
            "automatically. Recommended for uploaded MP4 videos."
        ),
    )
    youtube_url = models.URLField(
        max_length=500,
        blank=True,
        help_text="Primary option. Paste a YouTube watch, Shorts, live, or youtu.be link.",
    )
    video_file = models.FileField(
        upload_to="impact-videos/videos/%Y/%m/",
        blank=True,
        help_text="Optional direct MP4, WebM, MOV, or M4V upload (maximum 100 MB).",
    )
    category = models.CharField(max_length=120, blank=True)
    published_on = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "-published_on", "-created_at"]
        verbose_name = "Impact Video"
        verbose_name_plural = "Impact Videos"

    def clean(self):
        super().clean()
        errors = {}
        has_youtube = bool((self.youtube_url or "").strip())
        has_upload = bool(self.video_file)

        if has_youtube == has_upload:
            message = "Choose exactly one video source: a YouTube link or a direct video upload."
            errors["youtube_url"] = message
            errors["video_file"] = message

        if has_youtube and not extract_youtube_video_id(self.youtube_url):
            errors["youtube_url"] = (
                "Enter a valid public YouTube watch, Shorts, live, embed, or youtu.be link."
            )

        if has_upload:
            file_name = (self.video_file.name or "").lower()
            if not file_name.endswith((".mp4", ".webm", ".mov", ".m4v")):
                errors["video_file"] = "Upload an MP4, WebM, MOV, or M4V video file."
            try:
                file_size = self.video_file.size
            except (AttributeError, OSError, ValueError):
                file_size = 0
            if file_size > 100 * 1024 * 1024:
                errors["video_file"] = (
                    "Direct video uploads must be 100 MB or smaller. "
                    "Use YouTube for larger videos."
                )

        if has_upload and not self.thumbnail:
            errors["thumbnail"] = "Add a thumbnail for a directly uploaded video."

        if errors:
            raise ValidationError(errors)

    @property
    def youtube_video_id(self) -> str:
        return extract_youtube_video_id(self.youtube_url)

    def __str__(self) -> str:
        return self.title


class Award(TimeStampedModel):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=120, blank=True)
    presenter = models.CharField(max_length=255, blank=True)
    year = models.CharField(max_length=20, blank=True)
    summary = models.TextField(blank=True)
    image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="award_images"
    )
    detail_images = models.ManyToManyField(
        MediaAsset, blank=True, related_name="award_detail_images"
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_upcoming = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return self.title


class PodcastEpisode(PublishableModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    summary = models.TextField(blank=True)
    description = models.TextField(blank=True)
    duration_label = models.CharField(max_length=50, blank=True)
    host = models.CharField(max_length=255, blank=True)
    cover_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="podcast_cover_images"
    )
    audio_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "-publish_at"]

    def __str__(self) -> str:
        return self.title


class UpcomingEvent(TimeStampedModel):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    date_label = models.CharField(max_length=120, blank=True)
    location_label = models.CharField(max_length=180, blank=True)
    poster_image = models.ForeignKey(
        MediaAsset, null=True, blank=True, on_delete=models.SET_NULL, related_name="upcoming_event_posters"
    )
    cta_text = models.CharField(max_length=100, blank=True)
    cta_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return self.title


class SiteSettings(TimeStampedModel):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)

    default_meta_title = models.CharField(max_length=255, blank=True)
    default_meta_description = models.TextField(blank=True)
    google_analytics_id = models.CharField(max_length=50, blank=True)
    google_search_console_verification = models.CharField(max_length=255, blank=True)
    robots_txt = models.TextField(
        blank=True,
        default="User-agent: *\nDisallow:\n\nSitemap: /sitemap.xml\n",
    )

    def save(self, *args, **kwargs):
        self.pk = 1
        return super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self) -> str:
        return "Site Settings"


class Visitor(models.Model):
    visitor_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    first_seen_at = models.DateTimeField(default=timezone.now)
    last_seen_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return str(self.visitor_id)


class PageView(models.Model):
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name="pageviews")
    path = models.CharField(max_length=255)
    full_path = models.CharField(max_length=1024, blank=True)
    referer = models.CharField(max_length=1024, blank=True)
    user_agent = models.CharField(max_length=1024, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["-created_at"])]

    def __str__(self) -> str:
        return f"{self.path} ({self.created_at:%Y-%m-%d %H:%M})"
    
class StoryItem(models.Model):
    title = models.CharField(max_length=255)
    image = models.ForeignKey(MediaAsset, on_delete=models.CASCADE)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
