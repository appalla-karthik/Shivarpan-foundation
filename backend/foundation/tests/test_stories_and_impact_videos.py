from __future__ import annotations

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from foundation.models import ContentStatus, ImpactVideo, Story
from foundation.video_utils import extract_youtube_video_id


class YouTubeUrlTests(TestCase):
    def test_supported_youtube_urls_extract_video_id(self):
        video_id = "dQw4w9WgXcQ"
        urls = [
            f"https://www.youtube.com/watch?v={video_id}",
            f"https://youtu.be/{video_id}",
            f"https://www.youtube.com/shorts/{video_id}",
            f"https://www.youtube.com/embed/{video_id}",
            f"https://www.youtube.com/live/{video_id}",
        ]

        for url in urls:
            with self.subTest(url=url):
                self.assertEqual(extract_youtube_video_id(url), video_id)

    def test_non_youtube_host_is_rejected(self):
        self.assertEqual(
            extract_youtube_video_id(
                "https://example.com/watch?v=dQw4w9WgXcQ"
            ),
            "",
        )


class StoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.published_story = Story.objects.create(
            title="A published field dispatch",
            slug="published-field-dispatch",
            excerpt="A verified story from the field.",
            body="<p>Complete story body.</p>",
            date_label="28 July 2026",
            location_label="Ahmedabad",
            read_time="4 min read",
            category="Community",
            is_featured=True,
            status=ContentStatus.PUBLISHED,
            publish_at=timezone.now(),
        )
        Story.objects.create(
            title="Draft dispatch",
            slug="draft-dispatch",
            body="<p>Private draft.</p>",
            status=ContentStatus.DRAFT,
            publish_at=timezone.now(),
        )

    def test_story_list_only_returns_published_stories(self):
        response = self.client.get("/api/stories/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["slug"], self.published_story.slug)
        self.assertTrue(response.data[0]["has_body"])

    def test_story_can_be_loaded_by_slug(self):
        response = self.client.get(
            f"/api/stories/by-slug/{self.published_story.slug}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["body"], "<p>Complete story body.</p>")

    def test_draft_story_cannot_be_loaded_by_slug(self):
        response = self.client.get("/api/stories/by-slug/draft-dispatch/")

        self.assertEqual(response.status_code, 404)


class ImpactVideoTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_video_requires_exactly_one_source(self):
        no_source = ImpactVideo(title="No source", slug="no-source")
        with self.assertRaises(ValidationError):
            no_source.full_clean()

        invalid_youtube = ImpactVideo(
            title="Invalid YouTube source",
            slug="invalid-youtube-source",
            youtube_url="https://example.com/not-youtube",
        )
        with self.assertRaises(ValidationError):
            invalid_youtube.full_clean()

    def test_direct_upload_requires_thumbnail(self):
        direct_upload = ImpactVideo(
            title="Direct upload",
            slug="direct-upload",
            video_file=SimpleUploadedFile(
                "impact-film.mp4",
                b"small-test-video",
                content_type="video/mp4",
            ),
        )

        with self.assertRaises(ValidationError) as raised:
            direct_upload.full_clean()

        self.assertIn("thumbnail", raised.exception.message_dict)

    def test_youtube_thumbnail_and_privacy_embed_are_exposed(self):
        video = ImpactVideo(
            title="Community field film",
            slug="community-field-film",
            short_description="A short impact film.",
            youtube_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category="Community",
            published_on=timezone.localdate(),
            is_featured=True,
            is_active=True,
        )
        video.full_clean()
        video.save()

        response = self.client.get("/api/impact-videos/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        payload = response.data[0]
        self.assertEqual(payload["source_type"], "youtube")
        self.assertEqual(payload["youtube_video_id"], "dQw4w9WgXcQ")
        self.assertEqual(
            payload["effective_thumbnail_url"],
            "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        )
        self.assertEqual(
            payload["youtube_embed_url"],
            "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
        )

    def test_inactive_videos_are_not_public(self):
        ImpactVideo.objects.create(
            title="Hidden film",
            slug="hidden-film",
            youtube_url="https://youtu.be/dQw4w9WgXcQ",
            is_active=False,
        )

        response = self.client.get("/api/impact-videos/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
