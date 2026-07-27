from __future__ import annotations
import re
import uuid

from foundation.models import GalleryItem
from django.conf import settings
from django.db import IntegrityError
from django.core.mail import EmailMessage
from django.http import Http404, HttpResponse
from django.db.models import Count, Max, Q, Sum
from django.utils import timezone
from rest_framework import generics, parsers, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .serializers import StoryItemSerializer
from .models import StoryItem 
from .razorpay_client import (
    RazorpayClient,
    RazorpayCredentials,
    RazorpayError,
    verify_payment_signature,
    verify_subscription_signature,
)

from foundation.models import (
    Article,
    AwardNomination,
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
    PageSection,
    PodcastEpisode,
    Award,
    Project,
    Subscriber,
    Tag,
    TeamMember,
    Testimonial,
    UpcomingEvent,
)


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


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ["id", "title", "alt_text", "media_type", "url", "created_at"]

    def get_url(self, obj):
        if not getattr(obj, "file", None) and not obj.file_blob:
            return ""
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


class ProjectSerializer(serializers.ModelSerializer):
    featured_image = MediaAssetSerializer(read_only=True)
    og_image = MediaAssetSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "partner_organization",
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
        fields = ["id", "name", "designation", "organization", "quote", "photo", "media", "created_at"]


class TeamMemberSerializer(serializers.ModelSerializer):
    photo = MediaAssetSerializer(read_only=True)
    state_label = serializers.CharField(source="get_state_display", read_only=True)

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "state",
            "state_label",
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
        request = self.context.get("request")
        if obj.image:
            return obj.image.public_url(request)
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

        if asset.file_blob:
            response = HttpResponse(
                asset.file_blob,
                content_type=asset.content_type or "application/octet-stream",
            )
            filename = asset.file_name or f"media-{asset.pk}"
            response["Content-Disposition"] = f'inline; filename="{filename}"'
            return response

        if asset.file:
            try:
                return Response({"url": request.build_absolute_uri(asset.file.url)})
            except Exception as exc:
                raise Http404("Media file not found.") from exc

        raise Http404("Media file not found.")


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
        event = self.get_queryset().filter(is_active=True, sort_order=0).first()
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


class ProjectViewSet(PublicPublishedOnlyMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all().order_by("-publish_at")
    serializer_class = ProjectSerializer
    filterset_fields = ["slug"]


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.filter(is_approved=True, is_hidden=False).order_by("-created_at")
    serializer_class = TestimonialSerializer


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.filter(is_active=True).select_related("photo").order_by("state", "sort_order", "name")
    serializer_class = TeamMemberSerializer
    filterset_fields = ["state", "is_active"]


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
        return Response(data)


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["name", "email", "phone", "company", "subject", "message"]


class ContactSubmissionCreateAPIView(generics.CreateAPIView):
    serializer_class = ContactSubmissionSerializer

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


class AwardNominationCreateAPIView(generics.CreateAPIView):
    serializer_class = AwardNominationSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

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
    amount = serializers.IntegerField(min_value=100)
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
    atg_requested = serializers.BooleanField(required=False, default=False)
    pan_number = serializers.CharField(max_length=10, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_currency(self, value):
        if value.upper() != "INR":
            raise serializers.ValidationError("Only INR donations are supported right now.")
        return value.upper()

    def validate(self, attrs):
        pan_number = (attrs.get("pan_number") or "").upper().strip()
        attrs["pan_number"] = pan_number
        if attrs.get("atg_requested") and not pan_number:
            raise serializers.ValidationError({"pan_number": "PAN card number is required for ATG donations."})
        if pan_number and not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan_number):
            raise serializers.ValidationError({"pan_number": "Enter a valid PAN card number."})
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


class DonationCheckoutAPIView(generics.GenericAPIView):
    serializer_class = DonationCheckoutSerializer

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
            project_slug=data.get("project_slug", ""),
            project_title=data.get("project_title", ""),
            donation_category=data.get("donation_category", ""),
            atg_requested=data.get("atg_requested", False),
            pan_number=data.get("pan_number", ""),
            message=data.get("message") or "",
            receipt=f"don_{uuid.uuid4().hex[:18]}",
            notes={
                "source": "website",
                "payment_mode": data.get("payment_mode", ""),
                "donation_category": data.get("donation_category", ""),
                "atg_requested": data.get("atg_requested", False),
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
                "atg_requested": donation.atg_requested,
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
                f"ATG Requested: {'Yes' if donation.atg_requested else 'No'}",
                f"PAN: {donation.pan_number if donation.atg_requested else '-'}",
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
                "atg_requested": str(donation.atg_requested),
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
            order_id = data.get("razorpay_order_id") or donation.razorpay_order_id
            if not order_id:
                raise ValidationError("Missing order id.")
            is_valid = verify_payment_signature(
                settings.RAZORPAY_KEY_SECRET,
                order_id,
                payment_id,
                signature,
            )
            if not is_valid:
                donation.status = Donation.Status.FAILED
                donation.save(update_fields=["status", "updated_at"])
                create_donation_log(
                    donation,
                    DonationPaymentLog.EventType.FAILED,
                    "Payment signature verification failed.",
                    {"razorpay_payment_id": payment_id, "razorpay_order_id": order_id},
                )
                raise ValidationError("Payment signature verification failed.")

            donation.razorpay_order_id = order_id
            donation.status = Donation.Status.PAID
        else:
            subscription_id = data.get("razorpay_subscription_id") or donation.razorpay_subscription_id
            if not subscription_id:
                raise ValidationError("Missing subscription id.")
            is_valid = verify_subscription_signature(
                settings.RAZORPAY_KEY_SECRET,
                payment_id,
                subscription_id,
                signature,
            )
            if not is_valid:
                donation.status = Donation.Status.FAILED
                donation.save(update_fields=["status", "updated_at"])
                create_donation_log(
                    donation,
                    DonationPaymentLog.EventType.FAILED,
                    "Subscription signature verification failed.",
                    {"razorpay_payment_id": payment_id, "razorpay_subscription_id": subscription_id},
                )
                raise ValidationError("Subscription signature verification failed.")

            donation.razorpay_subscription_id = subscription_id
            donation.status = Donation.Status.SUBSCRIPTION_AUTHORIZED

        donation.razorpay_payment_id = payment_id
        donation.razorpay_signature = signature
        donation.verified_at = timezone.now()
        donation.save(
            update_fields=[
                "razorpay_order_id",
                "razorpay_subscription_id",
                "razorpay_payment_id",
                "razorpay_signature",
                "verified_at",
                "status",
                "updated_at",
            ]
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
                "detail": "Payment verified successfully.",
                "status": donation.status,
                "donation_id": donation.id,
            }
        )
class DonationFundingSummaryAPIView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        paid_statuses = [
            Donation.Status.PAID,
            Donation.Status.SUBSCRIPTION_AUTHORIZED,
        ]

        totals = (
            Donation.objects.filter(
                status__in=paid_statuses,
                project_slug__gt="",
            )
            .values("project_slug")
            .annotate(
                project_title=Max("project_title"),
                raised=Sum("amount"),
                donors=Count("id"),
                one_time_raised=Sum(
                    "amount",
                    filter=Q(donation_type=Donation.DonationType.ONE_TIME),
                ),
                monthly_raised=Sum(
                    "amount",
                    filter=Q(donation_type=Donation.DonationType.MONTHLY),
                ),
            )
            .order_by("project_title", "project_slug")
        )

        projects = [
            {
                "project_slug": row["project_slug"],
                "project_title": row["project_title"] or row["project_slug"],
                "raised": row["raised"] or 0,
                "donors": row["donors"] or 0,
                "one_time_raised": row["one_time_raised"] or 0,
                "monthly_raised": row["monthly_raised"] or 0,
            }
            for row in totals
        ]

        return Response(
            {
                "projects": projects,
                "total_raised": sum(project["raised"] for project in projects),
                "total_donors": sum(project["donors"] for project in projects),
                "updated_at": timezone.now().isoformat(),
            }
        )
class StoryItemViewSet(ModelViewSet):
    queryset = StoryItem.objects.filter(is_active=True).order_by("sort_order")
    serializer_class = StoryItemSerializer
