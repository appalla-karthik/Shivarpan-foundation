from __future__ import annotations

import tempfile

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, TestCase, override_settings
from rest_framework.test import APIClient

from core.admin_site import admin_site
from foundation.admin import TestimonialAdmin, TestimonialAdminForm
from foundation.models import MediaAsset, Testimonial


class TestimonialMediaTests(TestCase):
    def setUp(self):
        self.media_directory = tempfile.TemporaryDirectory()
        self.media_override = override_settings(
            MEDIA_ROOT=self.media_directory.name
        )
        self.media_override.enable()

    def tearDown(self):
        self.media_override.disable()
        self.media_directory.cleanup()

    def test_admin_direct_video_upload_creates_testimonial_media(self):
        form = TestimonialAdminForm(
            data={
                "name": "Video Reviewer",
                "designation": "Volunteer",
                "organization": "Community",
                "quote": "A genuine video review.",
                "rating": 4,
                "is_approved": True,
                "is_hidden": False,
            },
            files={
                "review_upload": SimpleUploadedFile(
                    "review.mp4",
                    b"small-test-video",
                    content_type="video/mp4",
                )
            },
        )

        self.assertTrue(form.is_valid(), form.errors)
        testimonial = form.save(commit=False)
        testimonial_admin = TestimonialAdmin(Testimonial, admin_site)
        testimonial_admin.save_model(
            RequestFactory().post("/admin/"),
            testimonial,
            form,
            change=False,
        )

        testimonial.refresh_from_db()
        self.assertIsNotNone(testimonial.media)
        self.assertEqual(
            testimonial.media.media_type,
            MediaAsset.MediaType.VIDEO,
        )
        self.assertEqual(testimonial.media.category, "Testimonials")

    def test_public_api_exposes_approved_video_review(self):
        video_asset = MediaAsset.objects.create(
            title="Review video",
            file=SimpleUploadedFile(
                "review.webm",
                b"small-test-video",
                content_type="video/webm",
            ),
        )
        Testimonial.objects.create(
            name="Approved Reviewer",
            quote="The work created a meaningful impact.",
            rating=3,
            media=video_asset,
            is_approved=True,
        )

        response = APIClient().get("/api/testimonials/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["media"]["media_type"], "video")
        self.assertTrue(response.data[0]["media"]["url"].endswith(".webm"))
        self.assertEqual(response.data[0]["rating"], 3)

    def test_rating_must_be_between_one_and_five(self):
        testimonial = Testimonial(
            name="Invalid Rating",
            quote="Invalid rating review.",
            rating=6,
        )

        with self.assertRaises(ValidationError) as raised:
            testimonial.full_clean()

        self.assertIn("rating", raised.exception.message_dict)

    def test_non_image_or_video_media_is_rejected(self):
        document_asset = MediaAsset.objects.create(
            title="Not review media",
            file=SimpleUploadedFile(
                "review.pdf",
                b"%PDF-test",
                content_type="application/pdf",
            ),
        )
        testimonial = Testimonial(
            name="Invalid Reviewer",
            quote="Invalid media",
            media=document_asset,
        )

        with self.assertRaises(ValidationError) as raised:
            testimonial.full_clean()

        self.assertIn("media", raised.exception.message_dict)
