from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from foundation.api import GalleryItemViewSet
from foundation.api import StoryItemViewSet

from foundation.api import (
    ArticleViewSet,
    AwardViewSet,
    ContactSubmissionCreateAPIView,
    DonationCheckoutAPIView,
    DonationVerifyAPIView,
    HomepageAPIView,
    MagazineIssueViewSet,
    MagazineStoryViewSet,
    MediaAssetFileAPIView,
    MediaAssetViewSet,
    PageViewSet,
    PodcastEpisodeViewSet,
    ProjectViewSet,
    SubscriberCreateAPIView,
    TeamMemberViewSet,
    TestimonialViewSet,
    UpcomingEventViewSet,
)


router = DefaultRouter()
router.register(r"pages", PageViewSet, basename="page")
router.register(r"gallery", GalleryItemViewSet, basename="gallery")
router.register(r"articles", ArticleViewSet, basename="article")
router.register(r"media", MediaAssetViewSet, basename="media")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"awards", AwardViewSet, basename="award")
router.register(r"testimonials", TestimonialViewSet, basename="testimonial")
router.register(r"team-members", TeamMemberViewSet, basename="team-member")
router.register(r"podcast/episodes", PodcastEpisodeViewSet, basename="podcast-episode")
router.register(r"magazine/issues", MagazineIssueViewSet, basename="magazine-issue")
router.register(r"magazine/stories", MagazineStoryViewSet, basename="magazine-story")
router.register(r"upcoming-events", UpcomingEventViewSet, basename="upcoming-event")
router.register(r"story-items", StoryItemViewSet, basename="story-item")

urlpatterns = [
    path("", include(router.urls)),
    path("media-assets/<int:pk>/file/", MediaAssetFileAPIView.as_view(), name="mediaasset-file"),
    path("homepage/", HomepageAPIView.as_view(), name="homepage"),
    path("contact/", ContactSubmissionCreateAPIView.as_view(), name="contact-submit"),
    path("newsletter/subscribe/", SubscriberCreateAPIView.as_view(), name="newsletter-subscribe"),
    path("donations/checkout/", DonationCheckoutAPIView.as_view(), name="donation-checkout"),
    path("donations/verify/", DonationVerifyAPIView.as_view(), name="donation-verify"),
]
