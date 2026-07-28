from io import BytesIO

from django.test import TestCase
from django.urls import reverse
from PIL import Image

from foundation.models import Homepage, MediaAsset


def make_jpeg(width=640, height=960):
    output = BytesIO()
    Image.new("RGB", (width, height), "#e39a3c").save(
        output,
        format="JPEG",
        quality=90,
    )
    return output.getvalue()


class MediaAssetDeliveryTests(TestCase):
    def setUp(self):
        self.asset = MediaAsset.objects.create(
            file="",
            file_name="portrait.jpg",
            content_type="image/jpeg",
            file_blob=make_jpeg(),
            media_type=MediaAsset.MediaType.IMAGE,
            alt_text="Portrait",
        )

    def test_width_variant_is_webp_cacheable_and_revalidates(self):
        url = reverse("mediaasset-file", kwargs={"pk": self.asset.pk})
        response = self.client.get(url, {"w": "96", "q": "70", "v": "1"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/webp")
        self.assertIn("immutable", response["Cache-Control"])
        with Image.open(BytesIO(response.content)) as image:
            self.assertLessEqual(image.width, 96)
            self.assertEqual(image.format, "WEBP")

        revalidated = self.client.get(
            url,
            {"w": "96", "q": "70", "v": "1"},
            HTTP_IF_NONE_MATCH=response["ETag"],
        )
        self.assertEqual(revalidated.status_code, 304)

    def test_homepage_hero_endpoint_returns_optimized_image(self):
        homepage = Homepage.get_solo()
        homepage.hero_slider_images.add(self.asset)

        response = self.client.get(reverse("homepage-hero-image"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/webp")
        self.assertIn("stale-while-revalidate", response["Cache-Control"])

    def test_homepage_payload_exposes_preload_and_versioned_media_url(self):
        homepage = Homepage.get_solo()
        homepage.hero_slider_images.add(self.asset)

        response = self.client.get(reverse("homepage"))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["hero_preload_url"].endswith(reverse("homepage-hero-image")))
        image_url = response.data["hero_slider_images"][0]["url"]
        self.assertIn(reverse("mediaasset-file", kwargs={"pk": self.asset.pk}), image_url)
        self.assertIn("?v=", image_url)
        self.assertIn("stale-while-revalidate", response["Cache-Control"])
