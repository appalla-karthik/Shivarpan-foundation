from __future__ import annotations
from io import BytesIO
import json
import mimetypes
import re
import uuid

from foundation.models import GalleryItem
from PIL import Image, ImageOps
from django.conf import settings
from django.core.cache import cache
from django.core.files.images import get_image_dimensions
from django.db import IntegrityError, transaction
from django.core.mail import EmailMessage
from django.http import Http404, HttpResponse
from django.db.models import BigIntegerField, Count, F, Max, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.urls import reverse
from django.utils import timezone
from django.utils.html import strip_tags
from rest_framework import generics, parsers, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .serializers import StoryItemSerializer
from .models import StoryItem 
from .razorpay_client import (
    RazorpayClient,
    RazorpayCredentials,
    RazorpayError,
    verify_payment_signature,
    verify_subscription_signature,
    verify_webhook_signature,
)

from foundation.models import (
    Article,
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
    PageSection,
    PodcastEpisode,
    Award,
    Project,
    Subscriber,
    Story,
    Tag,
    TeamMember,
    Testimonial,
    UpcomingEvent,
    PageView,
    Visitor,
)
from .video_utils import youtube_embed_url, youtube_thumbnail_url


def notify_admin(subject: str, lines: list[str], reply_to: str = "", attachments: list | None = None) -> None:
    try:
        message = EmailMessage(
            subject=subject,
            body="\n".join(lines),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "info@shivarpanfoundation.org")],
            reply_to=[reply_to] if reply_to else None,
        )
        for uploaded in attachments or []:
            uploaded.seek(0)
            message.attach(uploaded.name, uploaded.read(), getattr(uploaded, "content_type", None) or "application/octet-stream")
        message.send(fail_silently=True)
    except Exception:
        pass


def mask_pan(value: str) -> str:
    normalized = (value or "").strip().upper()
    if len(normalized) < 4:
        return "-"
    return f"******{normalized[-4:]}"


def _is_image_asset(asset: MediaAsset) -> bool:
    filename = (asset.file_name or getattr(asset.file, "name", "") or "").lower()
    return (
        asset.media_type == MediaAsset.MediaType.IMAGE
        or (asset.content_type or "").lower().startswith("image/")
        or filename.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))
    )


def _media_asset_source(asset: MediaAsset) -> tuple[bytes, str, str]:
    filename = asset.file_name or f"media-{asset.pk}"
    content_type = (
        asset.content_type
        or mimetypes.guess_type(filename)[0]
        or "application/octet-stream"
    )

    if asset.file_blob:
        return bytes(asset.file_blob), content_type, filename

    if asset.file:
        try:
            asset.file.open("rb")
            return asset.file.read(), content_type, filename
        except (FileNotFoundError, OSError, ValueError) as exc:
            raise Http404("Media file not found.") from exc
        finally:
            try:
                asset.file.close()
            except Exception:
                pass

    raise Http404("Media file not found.")


def _media_asset_response(
    request,
    asset: MediaAsset,
    *,
    width: int | None = None,
    quality: int = 78,
    immutable: bool = False,
) -> HttpResponse:
    version = int(asset.updated_at.timestamp()) if asset.updated_at else 0
    etag = f'"media-{asset.pk}-{version}-{width or 0}-{quality}"'
    filename = asset.file_name or f"media-{asset.pk}"

    if request.headers.get("If-None-Match") == etag:
        response = HttpResponse(status=304)
    elif width and _is_image_asset(asset):
        cache_key = f"media-variant:{asset.pk}:{version}:{width}:{quality}"
        optimized = cache.get(cache_key)
        if optimized is None:
            source, content_type, filename = _media_asset_source(asset)
            try:
                with Image.open(BytesIO(source)) as original:
                    image = ImageOps.exif_transpose(original)
                    image.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
                    if image.mode not in ("RGB", "RGBA"):
                        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
                    output = BytesIO()
                    image.save(output, format="WEBP", quality=quality, method=6)
                    optimized = output.getvalue()
                    cache.set(cache_key, optimized, timeout=86400)
            except (OSError, ValueError):
                response = HttpResponse(source, content_type=content_type)
            else:
                response = HttpResponse(optimized, content_type="image/webp")
        else:
            response = HttpResponse(optimized, content_type="image/webp")

        if response["Content-Type"] == "image/webp":
            filename = f"{filename.rsplit('.', 1)[0]}.webp"
    else:
        source, content_type, filename = _media_asset_source(asset)
        response = HttpResponse(source, content_type=content_type)

    response["ETag"] = etag
    response["Cache-Control"] = (
        "public, max-age=31536000, immutable"
        if immutable
        else "public, max-age=604800, stale-while-revalidate=86400"
    )
    response["Content-Disposition"] = f'inline; filename="{filename.replace(chr(34), "")}"'
    response["X-Content-Type-Options"] = "nosniff"
    return response


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ["id", "title", "alt_text", "media_type", "url", "created_at"]

    def get_url(self, obj):
        if not getattr(obj, "file", None) and not obj.file_blob:
            return ""
        if _is_image_asset(obj):
            path = reverse("mediaasset-file", kwargs={"pk": obj.pk})
            version = int(obj.updated_at.timestamp()) if obj.updated_at else 0
            path = f"{path}?v={version}"
            request = self.context.get("request")
            return request.build_absolute_uri(path) if request else path
        return obj.public_url(self.context.get("request"))


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["name", "slug"]


class PageSerializer(serializers.ModelSerializer):
    cover_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)
    sections = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = [
            "id",
            "title",
            "slug",
            "body",
            "embed_html",
            "publish_at",
            "cover_image",
            "sections",
            "seo_title",
            "seo_description",
            "canonical_url",
            "og_title",
            "og_description",
            "og_image",
            "created_at",
            "updated_at",
        ]

    def get_sections(self, obj):
        sections = obj.sections.filter(is_enabled=True).select_related("image").order_by("sort_order", "id")
        return PageSectionSerializer(sections, many=True, context=self.context).data


class ArticleSerializer(serializers.ModelSerializer):
    featured_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)
    social_share_image = MediaAssetSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "author_name",
            "publish_at",
            "featured_image",
            "is_featured",
            "categories",
            "tags",
            "seo_title",
            "seo_description",
            "canonical_url",
            "og_title",
            "og_description",
            "og_image",
            "social_share_title",
            "social_share_description",
            "social_share_image",
            "created_at",
            "updated_at",
        ]


class StorySerializer(serializers.ModelSerializer):
    featured_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)
    has_body = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "has_body",
            "date_label",
            "location_label",
            "read_time",
            "category",
            "featured_image",
            "is_featured",
            "sort_order",
            "publish_at",
            "seo_title",
            "seo_description",
            "canonical_url",
            "og_title",
            "og_description",
            "og_image",
            "created_at",
            "updated_at",
        ]

    def get_has_body(self, obj):
        text_content = strip_tags(obj.body or "").replace("\xa0", " ").strip()
        return bool(text_content)


class ImpactVideoSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()
    source_type = serializers.SerializerMethodField()
    youtube_video_id = serializers.CharField(read_only=True)
    youtube_thumbnail_url = serializers.SerializerMethodField()
    youtube_embed_url = serializers.SerializerMethodField()
    effective_thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ImpactVideo
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "thumbnail",
            "youtube_url",
            "video_file",
            "source_type",
            "youtube_video_id",
            "youtube_thumbnail_url",
            "youtube_embed_url",
            "effective_thumbnail_url",
            "category",
            "published_on",
            "is_featured",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_source_type(self, obj):
        return "youtube" if obj.youtube_video_id else "upload"

    def get_thumbnail(self, obj):
        if not obj.thumbnail:
            return None
        try:
            url = obj.thumbnail.url
        except (ValueError, OSError):
            return None
        return {
            "title": obj.title,
            "alt_text": f"{obj.title} video thumbnail",
            "media_type": "image",
            "url": url,
        }

    def get_video_file(self, obj):
        if not obj.video_file:
            return None
        try:
            url = obj.video_file.url
        except (ValueError, OSError):
            return None
        return {
            "title": obj.title,
            "alt_text": "",
            "media_type": "video",
            "url": url,
        }

    def get_youtube_thumbnail_url(self, obj):
        return youtube_thumbnail_url(obj.youtube_video_id)

    def get_youtube_embed_url(self, obj):
        return youtube_embed_url(obj.youtube_video_id)

    def get_effective_thumbnail_url(self, obj):
        if obj.thumbnail:
            try:
                return obj.thumbnail.url
            except (ValueError, OSError):
                pass
        return youtube_thumbnail_url(obj.youtube_video_id)


class ProjectSerializer(serializers.ModelSerializer):
    featured_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)
    actual_online_raised_amount = serializers.IntegerField(read_only=True)
    public_raised_amount = serializers.IntegerField(read_only=True)
    funding_remaining_amount = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "partner_organization",
            "funding_target_amount",
            "actual_online_raised_amount",
            "public_raised_amount",
            "funding_remaining_amount",
            "impact_numbers",
            "publish_at",
            "featured_image",
            "seo_title",
            "seo_description",
            "canonical_url",
            "og_title",
            "og_description",
            "og_image",
            "created_at",
            "updated_at",
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    photo = MediaAssetSerializer(read_only=True)
    media = MediaAssetSerializer(read_only=True)

    class Meta:
        model = Testimonial
        fields = [
            "id",
            "name",
            "designation",
            "organization",
            "quote",
            "rating",
            "photo",
            "media",
            "created_at",
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    photo = MediaAssetSerializer(read_only=True)
    state = serializers.CharField(source="state.slug", read_only=True)
    state_label = serializers.CharField(source="state.name", read_only=True)
    state_summary = serializers.CharField(source="state.summary", read_only=True)
    state_sort_order = serializers.IntegerField(
        source="state.sort_order",
        read_only=True,
    )

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "state",
            "state_label",
            "state_summary",
            "state_sort_order",
            "name",
            "position",
            "photo",
            "note",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]


class AwardSerializer(serializers.ModelSerializer):
    image = MediaAssetSerializer(read_only=True)
    detail_images = MediaAssetSerializer(read_only=True, many=True)

    class Meta:
        model = Award
        fields = [
            "id",
            "title",
            "category",
            "presenter",
            "year",
            "summary",
            "image",
            "detail_images",
            "sort_order",
            "is_upcoming",
            "is_active",
            "created_at",
            "updated_at",
        ]

# 🔥 GALLERY API ADD KAR
class GalleryItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = ["id", "title", "category", "image"]

    def get_image(self, obj):
        if obj.image:
            return MediaAssetSerializer(obj.image, context=self.context).data["url"]
        return None


class GalleryItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryItem.objects.filter(is_active=True).order_by("sort_order")
    serializer_class = GalleryItemSerializer

class MagazineIssueSerializer(serializers.ModelSerializer):
    cover_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = MagazineIssue
        fields = ["id", "title", "slug", "description", "publish_at", "cover_image", "is_featured", "og_image"]


class MagazineStorySerializer(serializers.ModelSerializer):
    issue = MagazineIssueSerializer(read_only=True)
    featured_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = MagazineStory
        fields = [
            "id",
            "issue",
            "title",
            "slug",
            "excerpt",
            "body",
            "author_name",
            "publish_at",
            "featured_image",
            "highlight_on_homepage",
            "sort_order",
            "og_image",
        ]


class HomepageSectionSerializer(serializers.ModelSerializer):
    image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = HomepageSection
        fields = [
            "id",
            "section_type",
            "title",
            "body",
            "image",
            "embed_html",
            "button_text",
            "button_url",
            "sort_order",
            "is_enabled",
            "extra",
            "created_at",
            "updated_at",
        ]


class PageSectionSerializer(serializers.ModelSerializer):
    image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = PageSection
        fields = [
            "id",
            "section_type",
            "title",
            "body",
            "image",
            "embed_html",
            "button_text",
            "button_url",
            "sort_order",
            "is_enabled",
            "extra",
            "created_at",
            "updated_at",
        ]


class UpcomingEventSerializer(serializers.ModelSerializer):
    poster_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = UpcomingEvent
        fields = [
            "id",
            "title",
            "subtitle",
            "description",
            "date_label",
            "location_label",
            "poster_image",
            "cta_text",
            "cta_url",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]

class PodcastEpisodeSerializer(serializers.ModelSerializer):
    cover_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = PodcastEpisode
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "duration_label",
            "host",
            "cover_image",
            "audio_url",
            "publish_at",
            "is_featured",
            "sort_order",
            "created_at",
            "updated_at",
        ]


class PublicPublishedOnlyMixin:
    def get_queryset(self):
        return super().get_queryset().published()


class MediaAssetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MediaAsset.objects.order_by("-created_at")
    serializer_class = MediaAssetSerializer
    filterset_fields = ["media_type"]


class MediaAssetFileAPIView(generics.GenericAPIView):
    queryset = MediaAsset.objects.all()

    def get(self, request, pk: int):
        asset = self.get_queryset().filter(pk=pk).first()
        if not asset:
            raise Http404("Media asset not found.")

        requested_width = request.query_params.get("w")
        requested_quality = request.query_params.get("q")
        try:
            width = min(1920, max(32, int(requested_width))) if requested_width else None
            quality = min(90, max(40, int(requested_quality or 78)))
        except (TypeError, ValueError) as exc:
            raise ValidationError("Invalid image width or quality.") from exc

        return _media_asset_response(
            request,
            asset,
            width=width,
            quality=quality,
            immutable=bool(request.query_params.get("v")),
        )


class HomepageHeroImageAPIView(generics.GenericAPIView):
    def get(self, request):
        homepage = Homepage.get_solo()
        first_slide = homepage.hero_slider_images.filter(
            media_type=MediaAsset.MediaType.IMAGE
        ).first()
        asset = first_slide or homepage.hero_background_image
        if not asset or asset.media_type != MediaAsset.MediaType.IMAGE:
            raise Http404("Homepage hero image not found.")

        return _media_asset_response(
            request,
            asset,
            width=1280,
            quality=72,
            immutable=False,
        )


class PageViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Page.objects.all().order_by("-publish_at").prefetch_related("sections__image")
    serializer_class = PageSerializer
    filterset_fields = ["slug"]

    @action(detail=False, methods=["get"], url_path=r"by-slug/(?P<slug>[-a-zA-Z0-9_]+)")
    def by_slug(self, request, slug=None):
        obj = self.get_queryset().filter(slug=slug).first()
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        return Response(self.get_serializer(obj).data)


class UpcomingEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UpcomingEvent.objects.all().order_by("sort_order", "-created_at")
    serializer_class = UpcomingEventSerializer
    filterset_fields = ["is_active"]

    @action(detail=False, methods=["get"], url_path="active")
    def active(self, request):
        event = self.get_queryset().filter(is_active=True).first()
        if not event:
            return Response({})
        return Response(self.get_serializer(event).data)

class PodcastEpisodeViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = PodcastEpisode.objects.all().order_by("sort_order", "-publish_at")
    serializer_class = PodcastEpisodeSerializer
    filterset_fields = ["slug", "is_featured"]


class ArticleViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.all().order_by("-publish_at")
    serializer_class = ArticleSerializer
    filterset_fields = ["slug", "is_featured"]

    @action(detail=False, methods=["get"], url_path=r"by-slug/(?P<slug>[-a-zA-Z0-9_]+)")
    def by_slug(self, request, slug=None):
        obj = self.get_queryset().filter(slug=slug).first()
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        return Response(self.get_serializer(obj).data)


class StoryViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        Story.objects.select_related("featured_image", "og_image")
        .all()
        .order_by("sort_order", "-publish_at")
    )
    serializer_class = StorySerializer
    filterset_fields = ["slug", "is_featured", "category"]

    @action(detail=False, methods=["get"], url_path=r"by-slug/(?P<slug>[-a-zA-Z0-9_]+)")
    def by_slug(self, request, slug=None):
        obj = self.get_queryset().filter(slug=slug).first()
        if not obj:
            return Response({"detail": "Not found."}, status=404)
        return Response(self.get_serializer(obj).data)


class ImpactVideoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        ImpactVideo.objects.filter(is_active=True)
        .filter(Q(youtube_url__gt="") | Q(video_file__gt=""))
        .order_by("sort_order", "-published_on", "-created_at")
    )
    serializer_class = ImpactVideoSerializer
    filterset_fields = ["slug", "is_featured", "category"]


class ProjectViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        Project.objects.annotate(
            actual_online_paise=Coalesce(
                Sum(
                    F("transactions__amount_paise")
                    - F("transactions__refunded_amount_paise")
                ),
                Value(0),
                output_field=BigIntegerField(),
            )
        )
        .select_related("featured_image", "og_image")
        .order_by("-publish_at")
    )
    serializer_class = ProjectSerializer
    filterset_fields = ["slug"]


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Testimonial.objects.filter(is_approved=True, is_hidden=False)
        .select_related("photo", "media")
        .order_by("-created_at")
    )
    serializer_class = TestimonialSerializer


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        TeamMember.objects.filter(is_active=True, state__is_active=True)
        .select_related("state", "photo")
        .order_by("state__sort_order", "state__name", "sort_order", "name")
    )
    serializer_class = TeamMemberSerializer
    filterset_fields = ["state__slug", "is_active"]


class AwardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Award.objects.filter(is_active=True).order_by("sort_order", "-created_at")
    serializer_class = AwardSerializer


class MagazineIssueViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = MagazineIssue.objects.all().order_by("-publish_at")
    serializer_class = MagazineIssueSerializer
    filterset_fields = ["slug", "is_featured"]


class MagazineStoryViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = MagazineStory.objects.select_related("issue").all().order_by("sort_order", "-publish_at")
    serializer_class = MagazineStorySerializer
    filterset_fields = ["slug", "issue"]


class HomepageAPIView(generics.GenericAPIView):
    def get(self, request):
        homepage = Homepage.get_solo()
        sections_qs = homepage.sections.filter(is_enabled=True).select_related("image").order_by(
            "sort_order", "id"
        )
        data = {
            "hero_title": homepage.hero_title,
            "hero_subtitle": homepage.hero_subtitle,
            "hero_background_image": MediaAssetSerializer(
                homepage.hero_background_image, context={"request": request}
            ).data
            if homepage.hero_background_image
            else None,
            "hero_slider_images": MediaAssetSerializer(
                homepage.hero_slider_images.all(), many=True, context={"request": request}
            ).data,
            "hero_preload_url": request.build_absolute_uri(reverse("homepage-hero-image")),
            "hero_cta_text": homepage.hero_cta_text,
            "hero_cta_url": homepage.hero_cta_url,
            "featured_article": ArticleSerializer(homepage.featured_article, context={"request": request}).data
            if homepage.featured_article
            else None,
            "featured_page": PageSerializer(homepage.featured_page, context={"request": request}).data
            if homepage.featured_page
            else None,
            "partner_logos": MediaAssetSerializer(
                homepage.partner_logos.all(), many=True, context={"request": request}
            ).data,
            "show_testimonials": homepage.show_testimonials,
            "sections": HomepageSectionSerializer(sections_qs, many=True, context={"request": request}).data,
        }
        response = Response(data)
        response["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
        return response


class ContactSubmissionSerializer(serializers.ModelSerializer):
    message = serializers.CharField(max_length=5000)

    class Meta:
        model = ContactSubmission
        fields = ["name", "email", "phone", "company", "subject", "message"]


class PageViewCreateSerializer(serializers.Serializer):
    path = serializers.CharField(max_length=255)
    full_path = serializers.CharField(
        max_length=1024,
        required=False,
        allow_blank=True,
    )

    def validate_path(self, value):
        value = value.strip()
        if not value.startswith("/") or value.startswith("//"):
            raise serializers.ValidationError("Enter a valid site path.")
        return value


class PageViewCreateAPIView(generics.GenericAPIView):
    serializer_class = PageViewCreateSerializer
    throttle_scope = "analytics"
    COOKIE_NAME = "sf_vid"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_visitor_id = request.COOKIES.get(self.COOKIE_NAME, "")
        try:
            visitor_id = uuid.UUID(raw_visitor_id)
        except (ValueError, TypeError, AttributeError):
            visitor_id = uuid.uuid4()

        now = timezone.now()
        visitor, _ = Visitor.objects.get_or_create(
            visitor_id=visitor_id,
            defaults={"first_seen_at": now, "last_seen_at": now},
        )
        Visitor.objects.filter(pk=visitor.pk).update(last_seen_at=now)
        PageView.objects.create(
            visitor=visitor,
            path=serializer.validated_data["path"],
            full_path=serializer.validated_data.get("full_path", "")[:1024],
            referer=(request.META.get("HTTP_REFERER") or "")[:1024],
            user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:1024],
        )

        response = Response({"detail": "Page view recorded."}, status=201)
        response.set_cookie(
            self.COOKIE_NAME,
            str(visitor_id),
            max_age=60 * 60 * 24 * 365 * 2,
            samesite="Lax",
            secure=not settings.DEBUG,
            httponly=True,
        )
        return response


class ContactSubmissionCreateAPIView(generics.CreateAPIView):
    serializer_class = ContactSubmissionSerializer
    throttle_scope = "contact"

    def perform_create(self, serializer):
        submission = serializer.save()
        notify_admin(
            "New website contact message",
            [
                f"Name: {submission.name}",
                f"Email: {submission.email}",
                f"Phone: {submission.phone}",
                f"Company: {submission.company}",
                f"Subject: {submission.subject}",
                "",
                submission.message,
            ],
            reply_to=submission.email,
        )


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ["email", "name", "source"]


class SubscriberCreateAPIView(generics.CreateAPIView):
    serializer_class = SubscriberSerializer
    throttle_scope = "newsletter"

    def perform_create(self, serializer):
        try:
            subscriber = serializer.save()
        except IntegrityError:
            Subscriber.objects.filter(email=serializer.validated_data["email"]).update(
                name=serializer.validated_data.get("name", ""),
                source=serializer.validated_data.get("source", ""),
            )
            subscriber = Subscriber.objects.filter(email=serializer.validated_data["email"]).first()
        if subscriber:
            notify_admin(
                "New newsletter subscriber",
                [
                    f"Email: {subscriber.email}",
                    f"Name: {subscriber.name}",
                    f"Source: {subscriber.source}",
                ],
                reply_to=subscriber.email,
            )


class AwardNominationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardNomination
        fields = [
            "id",
            "nominee_full_name",
            "mobile_number",
            "email",
            "company_name",
            "award_show",
            "nominee_profile_photo",
            "company_full_address",
            "created_at",
        ]

    def validate_nominee_profile_photo(self, uploaded):
        if not uploaded:
            return uploaded

        max_bytes = 5 * 1024 * 1024
        if uploaded.size > max_bytes:
            raise serializers.ValidationError(
                "Profile photo must be 5 MB or smaller."
            )

        allowed_content_types = {"image/jpeg", "image/png", "image/webp"}
        if getattr(uploaded, "content_type", "") not in allowed_content_types:
            raise serializers.ValidationError(
                "Upload a JPEG, PNG, or WebP image."
            )

        try:
            width, height = get_image_dimensions(uploaded)
            uploaded.seek(0)
        except Exception as exc:
            raise serializers.ValidationError(
                "The uploaded file is not a valid image."
            ) from exc

        if not width or not height:
            raise serializers.ValidationError(
                "The uploaded file is not a valid image."
            )
        if width * height > 25_000_000:
            raise serializers.ValidationError(
                "Image dimensions are too large."
            )
        return uploaded


class AwardNominationCreateAPIView(generics.CreateAPIView):
    serializer_class = AwardNominationSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    throttle_scope = "award_nomination"

    def perform_create(self, serializer):
        nomination = serializer.save()
        award_title = nomination.award_show.title if nomination.award_show else "Not selected"
        attachments = [nomination.nominee_profile_photo] if nomination.nominee_profile_photo else []
        notify_admin(
            "New award nomination",
            [
                f"Nominee Full Name: {nomination.nominee_full_name}",
                f"Mobile Number: {nomination.mobile_number}",
                f"Email: {nomination.email}",
                f"Company Name: {nomination.company_name}",
                f"Award Show: {award_title}",
                "",
                "Company Full Address:",
                nomination.company_full_address,
            ],
            reply_to=nomination.email,
            attachments=attachments,
        )


class DonationCheckoutSerializer(serializers.Serializer):
    donation_type = serializers.ChoiceField(choices=Donation.DonationType.choices)
    amount = serializers.IntegerField(
        min_value=100,
        max_value=settings.RAZORPAY_MAX_DONATION_AMOUNT,
    )
    currency = serializers.CharField(default="INR")
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32)
    project_slug = serializers.SlugField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    project_title = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    payment_mode = serializers.CharField(max_length=50, required=False, allow_blank=True)
    donation_category = serializers.CharField(max_length=80, required=False, allow_blank=True)
    eighty_g_requested = serializers.BooleanField(required=False)
    atg_requested = serializers.BooleanField(
        required=False,
        write_only=True,
        help_text="Deprecated compatibility alias for eighty_g_requested.",
    )
    pan_number = serializers.CharField(max_length=10, required=False, allow_blank=True)
    message = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    def validate_currency(self, value):
        if value.upper() != "INR":
            raise serializers.ValidationError("Only INR donations are supported right now.")
        return value.upper()

    def validate(self, attrs):
        legacy_80g_value = attrs.pop("atg_requested", False)
        attrs["eighty_g_requested"] = attrs.get(
            "eighty_g_requested",
            legacy_80g_value,
        )
        pan_number = (attrs.get("pan_number") or "").upper().strip()
        attrs["pan_number"] = pan_number
        if attrs.get("eighty_g_requested") and not pan_number:
            raise serializers.ValidationError(
                {"pan_number": "PAN card number is required for an 80G certificate."}
            )
        if pan_number and not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan_number):
            raise serializers.ValidationError({"pan_number": "Enter a valid PAN card number."})

        project_slug = (attrs.get("project_slug") or "").strip()
        if project_slug:
            project = Project.objects.published().filter(slug=project_slug).first()
            if not project:
                raise serializers.ValidationError(
                    {"project_slug": "This project is not available for donations."}
                )
            attrs["project"] = project
            attrs["project_slug"] = project.slug
            attrs["project_title"] = project.title
        else:
            attrs["project"] = None
            attrs["project_title"] = ""
        return attrs


class DonationVerifySerializer(serializers.Serializer):
    donation_id = serializers.IntegerField()
    donation_type = serializers.ChoiceField(choices=Donation.DonationType.choices)
    razorpay_payment_id = serializers.CharField(max_length=80)
    razorpay_signature = serializers.CharField(max_length=255)
    razorpay_order_id = serializers.CharField(max_length=80, required=False, allow_blank=True)
    razorpay_subscription_id = serializers.CharField(max_length=80, required=False, allow_blank=True)


def get_razorpay_client() -> RazorpayClient:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ValidationError("Razorpay is not configured on the server.")
    return RazorpayClient(
        RazorpayCredentials(
            key_id=settings.RAZORPAY_KEY_ID,
            key_secret=settings.RAZORPAY_KEY_SECRET,
        )
    )


def create_donation_log(
    donation: Donation,
    event_type: str,
    message: str,
    payload: dict | None = None,
):
    DonationPaymentLog.objects.create(
        donation=donation,
        event_type=event_type,
        status_snapshot=donation.status,
        message=message,
        payload=payload or {},
    )


def record_captured_transaction(
    donation: Donation,
    payment_id: str,
    amount_paise: int,
    *,
    source: str,
    payload: dict | None = None,
) -> DonationTransaction:
    if not payment_id:
        raise ValidationError("Missing Razorpay payment id.")
    if amount_paise <= 0:
        raise ValidationError("Invalid captured payment amount.")

    with transaction.atomic():
        transaction_record, created = DonationTransaction.objects.get_or_create(
            razorpay_payment_id=payment_id,
            defaults={
                "donation": donation,
                "project": donation.project,
                "amount_paise": amount_paise,
                "currency": donation.currency,
                "status": DonationTransaction.Status.CAPTURED,
                "source": source,
                "payload": payload or {},
            },
        )
        if not created:
            changed_fields = []
            if transaction_record.donation_id != donation.id:
                raise ValidationError(
                    "This Razorpay payment is already linked to another donation."
                )
            if transaction_record.project_id != donation.project_id:
                raise ValidationError(
                    "This payment is already assigned to another project."
                )
            if not transaction_record.payload and payload:
                transaction_record.payload = payload
                changed_fields.append("payload")
            if changed_fields:
                changed_fields.append("updated_at")
                transaction_record.save(update_fields=changed_fields)
        return transaction_record


class DonationCheckoutAPIView(generics.GenericAPIView):
    serializer_class = DonationCheckoutSerializer
    throttle_scope = "donation_checkout"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        donation = Donation.objects.create(
            donor_name=data["name"],
            donor_email=data["email"],
            donor_phone=data["phone"],
            amount=data["amount"],
            currency=data["currency"],
            donation_type=data["donation_type"],
            payment_mode_preference=data.get("payment_mode", ""),
            project=data.get("project"),
            project_slug=data.get("project_slug", ""),
            project_title=data.get("project_title", ""),
            donation_category=data.get("donation_category", ""),
            eighty_g_requested=data.get("eighty_g_requested", False),
            pan_number=data.get("pan_number", ""),
            message=data.get("message") or "",
            receipt=f"don_{uuid.uuid4().hex[:18]}",
            notes={
                "source": "website",
                "payment_mode": data.get("payment_mode", ""),
                "donation_category": data.get("donation_category", ""),
                "eighty_g_requested": data.get("eighty_g_requested", False),
                "project_slug": data.get("project_slug", ""),
                "project_title": data.get("project_title", ""),
            },
        )
        create_donation_log(
            donation,
            DonationPaymentLog.EventType.CREATED,
            "Donation record created.",
            {
                "amount": donation.amount,
                "currency": donation.currency,
                "donation_type": donation.donation_type,
                "payment_mode_preference": donation.payment_mode_preference,
                "donation_category": donation.donation_category,
                "eighty_g_requested": donation.eighty_g_requested,
                "project_slug": donation.project_slug,
                "project_title": donation.project_title,
            },
        )
        notify_admin(
            "New donation checkout started",
            [
                f"Name: {donation.donor_name}",
                f"Email: {donation.donor_email}",
                f"Phone: {donation.donor_phone}",
                f"Amount: Rs {donation.amount}",
                f"Donation Type: {donation.donation_type}",
                f"Category: {donation.donation_category or 'General'}",
                f"80G Certificate Requested: {'Yes' if donation.eighty_g_requested else 'No'}",
                f"PAN: {mask_pan(donation.pan_number) if donation.eighty_g_requested else '-'}",
                "",
                donation.message,
            ],
            reply_to=donation.donor_email,
        )

        try:
            client = get_razorpay_client()
            amount_paise = donation.amount * 100
            common_notes = {
                "donation_id": str(donation.id),
                "donor_name": donation.donor_name,
                "donor_email": donation.donor_email,
                "donation_type": donation.donation_type,
                "donation_category": donation.donation_category,
                "eighty_g_requested": str(donation.eighty_g_requested),
                "project_slug": donation.project_slug,
                "project_title": donation.project_title,
            }
            create_donation_log(
                donation,
                DonationPaymentLog.EventType.CHECKOUT_REQUESTED,
                "Razorpay checkout creation requested.",
                common_notes,
            )

            if donation.donation_type == Donation.DonationType.ONE_TIME:
                order = client.create_order(
                    {
                        "amount": amount_paise,
                        "currency": donation.currency,
                        "receipt": donation.receipt,
                        "notes": common_notes,
                    }
                )
                donation.razorpay_order_id = order.get("id", "")
                donation.razorpay_status = order.get("status", "")
                donation.status = Donation.Status.CHECKOUT_CREATED
                donation.save(update_fields=["razorpay_order_id", "razorpay_status", "status", "updated_at"])
                create_donation_log(
                    donation,
                    DonationPaymentLog.EventType.ORDER_CREATED,
                    "Razorpay order created.",
                    order,
                )

                return Response(
                    {
                        "checkout_type": "one_time",
                        "donation_id": donation.id,
                        "project_slug": donation.project_slug,
                        "project_title": donation.project_title,
                        "key": settings.RAZORPAY_KEY_ID,
                        "amount": amount_paise,
                        "currency": donation.currency,
                        "order_id": donation.razorpay_order_id,
                        "name": settings.RAZORPAY_DONATION_BRAND,
                        "description": "One-time donation",
                        "prefill": {
                            "name": donation.donor_name,
                            "email": donation.donor_email,
                            "contact": donation.donor_phone,
                        },
                    }
                )

            plan = client.create_plan(
                {
                    "period": "monthly",
                    "interval": 1,
                    "item": {
                        "name": f"Monthly Donation - Rs {donation.amount}",
                        "amount": amount_paise,
                        "currency": donation.currency,
                        "description": f"Recurring monthly donation by {donation.donor_name}",
                    },
                    "notes": common_notes,
                }
            )
            create_donation_log(
                donation,
                DonationPaymentLog.EventType.PLAN_CREATED,
                "Razorpay monthly plan created.",
                plan,
            )
            subscription = client.create_subscription(
                {
                    "plan_id": plan.get("id"),
                    "customer_notify": 1,
                    "quantity": 1,
                    "total_count": 120,
                    "notes": common_notes,
                }
            )
            donation.razorpay_plan_id = plan.get("id", "")
            donation.razorpay_subscription_id = subscription.get("id", "")
            donation.razorpay_status = subscription.get("status", "")
            donation.status = Donation.Status.CHECKOUT_CREATED
            donation.save(
                update_fields=[
                    "razorpay_plan_id",
                    "razorpay_subscription_id",
                    "razorpay_status",
                    "status",
                    "updated_at",
                ]
            )
            create_donation_log(
                donation,
                DonationPaymentLog.EventType.SUBSCRIPTION_CREATED,
                "Razorpay subscription created.",
                subscription,
            )

            return Response(
                {
                    "checkout_type": "monthly",
                    "donation_id": donation.id,
                    "project_slug": donation.project_slug,
                    "project_title": donation.project_title,
                    "key": settings.RAZORPAY_KEY_ID,
                    "amount": amount_paise,
                    "currency": donation.currency,
                    "subscription_id": donation.razorpay_subscription_id,
                    "name": settings.RAZORPAY_DONATION_BRAND,
                    "description": "Monthly auto-debit donation",
                    "prefill": {
                        "name": donation.donor_name,
                        "email": donation.donor_email,
                        "contact": donation.donor_phone,
                    },
                }
            )
        except (RazorpayError, ValidationError) as exc:
            donation.status = Donation.Status.FAILED
            donation.notes = {**donation.notes, "error": str(exc)}
            donation.save(update_fields=["status", "notes", "updated_at"])
            create_donation_log(
                donation,
                DonationPaymentLog.EventType.FAILED,
                "Checkout creation failed.",
                {"error": str(exc)},
            )
            if isinstance(exc, ValidationError):
                raise
            raise ValidationError(str(exc))


class DonationVerifyAPIView(generics.GenericAPIView):
    serializer_class = DonationVerifySerializer
    throttle_scope = "donation_verify"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        donation = Donation.objects.filter(id=data["donation_id"]).first()
        if not donation:
            raise ValidationError("Donation session not found.")

        if data["donation_type"] != donation.donation_type:
            raise ValidationError("Donation type mismatch.")

        signature = data["razorpay_signature"]
        payment_id = data["razorpay_payment_id"]
        create_donation_log(
            donation,
            DonationPaymentLog.EventType.VERIFY_REQUESTED,
            "Payment verification requested.",
            {
                "donation_type": data["donation_type"],
                "razorpay_payment_id": payment_id,
                "razorpay_order_id": data.get("razorpay_order_id", ""),
                "razorpay_subscription_id": data.get("razorpay_subscription_id", ""),
            },
        )

        if donation.donation_type == Donation.DonationType.ONE_TIME:
            supplied_order_id = data.get("razorpay_order_id") or ""
            order_id = donation.razorpay_order_id
            if not order_id:
                raise ValidationError("Missing order id.")
            if supplied_order_id and supplied_order_id != order_id:
                raise ValidationError("Razorpay order does not match this donation.")
            is_valid = verify_payment_signature(
                settings.RAZORPAY_KEY_SECRET,
                order_id,
                payment_id,
                signature,
            )
            if not is_valid:
                create_donation_log(
                    donation,
                    DonationPaymentLog.EventType.FAILED,
                    "Payment signature verification failed.",
                    {"razorpay_payment_id": payment_id, "razorpay_order_id": order_id},
                )
                raise ValidationError("Payment signature verification failed.")

            donation.razorpay_order_id = order_id
        else:
            supplied_subscription_id = data.get("razorpay_subscription_id") or ""
            subscription_id = donation.razorpay_subscription_id
            if not subscription_id:
                raise ValidationError("Missing subscription id.")
            if (
                supplied_subscription_id
                and supplied_subscription_id != subscription_id
            ):
                raise ValidationError(
                    "Razorpay subscription does not match this donation."
                )
            is_valid = verify_subscription_signature(
                settings.RAZORPAY_KEY_SECRET,
                payment_id,
                subscription_id,
                signature,
            )
            if not is_valid:
                create_donation_log(
                    donation,
                    DonationPaymentLog.EventType.FAILED,
                    "Subscription signature verification failed.",
                    {"razorpay_payment_id": payment_id, "razorpay_subscription_id": subscription_id},
                )
                raise ValidationError("Subscription signature verification failed.")

            donation.razorpay_subscription_id = subscription_id
            donation.status = Donation.Status.SUBSCRIPTION_AUTHORIZED

        try:
            payment = get_razorpay_client().fetch_payment(payment_id)
        except RazorpayError as exc:
            # The checkout signature is valid, but a temporary API failure is not
            # proof that money was captured. Preserve the verification details and
            # let the signed webhook finish the accounting safely.
            donation.razorpay_payment_id = payment_id
            donation.razorpay_signature = signature
            donation.razorpay_status = "verification_pending"
            donation.verified_at = timezone.now()
            donation.save(
                update_fields=[
                    "razorpay_order_id",
                    "razorpay_subscription_id",
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "razorpay_status",
                    "verified_at",
                    "status",
                    "updated_at",
                ]
            )
            create_donation_log(
                donation,
                DonationPaymentLog.EventType.VERIFIED,
                "Checkout signature verified; capture confirmation is pending.",
                {"razorpay_payment_id": payment_id, "error": str(exc)},
            )
            return Response(
                {
                    "detail": "Payment received; capture confirmation is pending.",
                    "status": donation.status,
                    "donation_id": donation.id,
                },
                status=202,
            )

        expected_amount_paise = int(donation.amount * 100)
        if int(payment.get("amount") or 0) != expected_amount_paise:
            raise ValidationError("Razorpay payment amount does not match this donation.")
        if payment.get("currency") != donation.currency:
            raise ValidationError("Razorpay payment currency does not match this donation.")
        if (
            donation.donation_type == Donation.DonationType.ONE_TIME
            and payment.get("order_id") != donation.razorpay_order_id
        ):
            raise ValidationError("Razorpay payment order does not match this donation.")
        if (
            donation.donation_type == Donation.DonationType.MONTHLY
            and payment.get("subscription_id") != donation.razorpay_subscription_id
        ):
            raise ValidationError("Razorpay payment subscription does not match this donation.")

        is_captured = (
            payment.get("status") == "captured" or payment.get("captured") is True
        )
        donation.razorpay_payment_id = payment_id
        donation.razorpay_signature = signature
        donation.razorpay_status = payment.get("status", "")
        donation.verified_at = timezone.now()
        if (
            donation.donation_type == Donation.DonationType.ONE_TIME
            and is_captured
        ):
            donation.status = Donation.Status.PAID
        with transaction.atomic():
            donation.save(
                update_fields=[
                    "razorpay_order_id",
                    "razorpay_subscription_id",
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "razorpay_status",
                    "verified_at",
                    "status",
                    "updated_at",
                ]
            )
            if is_captured:
                record_captured_transaction(
                    donation,
                    payment_id,
                    expected_amount_paise,
                    source="checkout_verify",
                    payload=payment,
                )
        create_donation_log(
            donation,
            DonationPaymentLog.EventType.VERIFIED,
            "Payment verified successfully.",
            {
                "razorpay_payment_id": donation.razorpay_payment_id,
                "razorpay_order_id": donation.razorpay_order_id,
                "razorpay_subscription_id": donation.razorpay_subscription_id,
                "status": donation.status,
            },
        )
        return Response(
            {
                "detail": (
                    "Payment verified successfully."
                    if is_captured
                    else "Payment verified; capture confirmation is pending."
                ),
                "status": donation.status,
                "donation_id": donation.id,
            },
            status=200 if is_captured else 202,
        )


class DonationWebhookAPIView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        raw_body = request.body
        signature = request.headers.get("X-Razorpay-Signature", "")
        if not verify_webhook_signature(
            settings.RAZORPAY_WEBHOOK_SECRET,
            raw_body,
            signature,
        ):
            return Response({"detail": "Invalid webhook signature."}, status=400)

        try:
            event_payload = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return Response({"detail": "Invalid webhook payload."}, status=400)

        event_name = event_payload.get("event", "")
        payment = (
            event_payload.get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )
        payment_id = payment.get("id", "")

        if event_name in {"payment.captured", "subscription.charged"}:
            notes = payment.get("notes") or {}
            donation = None
            donation_id = notes.get("donation_id")
            if str(donation_id).isdigit():
                donation = Donation.objects.filter(pk=int(donation_id)).first()
            if not donation and payment.get("subscription_id"):
                donation = Donation.objects.filter(
                    razorpay_subscription_id=payment["subscription_id"]
                ).first()
            if not donation and payment.get("order_id"):
                donation = Donation.objects.filter(
                    razorpay_order_id=payment["order_id"]
                ).first()

            if not donation:
                # A non-2xx response asks Razorpay to retry rather than silently
                # discarding a valid event that arrived before local mapping.
                return Response(
                    {"detail": "Donation mapping not found; retry required."},
                    status=503,
                )

            amount_paise = int(payment.get("amount") or donation.amount * 100)
            if amount_paise <= 0:
                return Response({"detail": "Invalid payment amount."}, status=400)
            if (payment.get("currency") or donation.currency) != donation.currency:
                return Response({"detail": "Payment currency mismatch."}, status=400)
            record_captured_transaction(
                donation,
                payment_id,
                amount_paise,
                source="razorpay_webhook",
                payload=payment,
            )
            if donation.donation_type == Donation.DonationType.ONE_TIME:
                donation.status = Donation.Status.PAID
            else:
                donation.status = Donation.Status.SUBSCRIPTION_AUTHORIZED
            donation.razorpay_payment_id = payment_id or donation.razorpay_payment_id
            donation.razorpay_status = payment.get("status", "captured")
            donation.verified_at = donation.verified_at or timezone.now()
            donation.save(
                update_fields=[
                    "status",
                    "razorpay_payment_id",
                    "razorpay_status",
                    "verified_at",
                    "updated_at",
                ]
            )
            return Response({"detail": "Payment recorded."})

        if event_name == "payment.refunded" and payment_id:
            transaction_record = DonationTransaction.objects.filter(
                razorpay_payment_id=payment_id
            ).first()
            if not transaction_record:
                return Response(
                    {"detail": "Payment transaction not found; retry required."},
                    status=503,
                )
            refunded_paise = min(
                int(payment.get("amount_refunded") or transaction_record.amount_paise),
                transaction_record.amount_paise,
            )
            transaction_record.refunded_amount_paise = refunded_paise
            transaction_record.status = (
                DonationTransaction.Status.REFUNDED
                if refunded_paise >= transaction_record.amount_paise
                else DonationTransaction.Status.PARTIALLY_REFUNDED
            )
            transaction_record.payload = payment
            transaction_record.save(
                update_fields=[
                    "refunded_amount_paise",
                    "status",
                    "payload",
                    "updated_at",
                ]
            )
            return Response({"detail": "Refund recorded."})

        return Response({"detail": "Event ignored."})


class DonationFundingSummaryAPIView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        project_rows = (
            Project.objects.published()
            .annotate(
                actual_online_paise=Coalesce(
                    Sum(
                        F("transactions__amount_paise")
                        - F("transactions__refunded_amount_paise")
                    ),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                donors=Count("transactions__donation", distinct=True),
            )
            .order_by("title", "slug")
        )

        projects = []
        for project in project_rows:
            projects.append(
                {
                    "project_slug": project.slug,
                    "project_title": project.title,
                    "target": project.funding_target_amount,
                    "manual_raised": project.manual_raised_amount,
                    "actual_online_raised": project.actual_online_raised_amount,
                    "raised": project.public_raised_amount,
                    "remaining": project.funding_remaining_amount,
                    "donors": project.donors or 0,
                }
            )

        return Response(
            {
                "projects": projects,
                "total_raised": sum(project["raised"] for project in projects),
                "total_actual_online_raised": sum(
                    project["actual_online_raised"] for project in projects
                ),
                "total_donors": sum(project["donors"] for project in projects),
                "updated_at": timezone.now().isoformat(),
            }
        )
class StoryItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StoryItem.objects.filter(is_active=True).order_by("sort_order")
    serializer_class = StoryItemSerializer
