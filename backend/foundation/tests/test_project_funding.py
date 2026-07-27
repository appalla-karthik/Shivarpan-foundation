import hashlib
import hmac
import json
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.viewsets import ReadOnlyModelViewSet

from foundation.admin import DonationAdmin, ProjectAdminForm
from foundation.api import (
    DonationCheckoutSerializer,
    StoryItemViewSet,
    record_captured_transaction,
)
from foundation.models import (
    ContentStatus,
    Donation,
    DonationTransaction,
    PageView,
    Project,
)


class ProjectFundingTests(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title="Ambulance Support",
            slug="ambulance-support",
            status=ContentStatus.PUBLISHED,
            publish_at=timezone.now(),
            funding_target_amount=1_300_000,
        )
        self.donation = Donation.objects.create(
            donor_name="Test Donor",
            donor_email="donor@example.com",
            donor_phone="9999999999",
            amount=10_000,
            project=self.project,
            project_slug=self.project.slug,
            project_title=self.project.title,
            status=Donation.Status.PAID,
            receipt="test-receipt",
        )

    def test_admin_sets_exact_public_total_then_transaction_increments_it(self):
        record_captured_transaction(
            self.donation,
            "pay_initial",
            1_000_000,
            source="test",
        )

        form = ProjectAdminForm(
            instance=self.project,
            data={
                "title": self.project.title,
                "slug": self.project.slug,
                "summary": "",
                "description": "",
                "partner_organization": "",
                "funding_target_amount": 1_300_000,
                "current_public_raised_amount": 300_000,
                "impact_numbers": "{}",
                "status": ContentStatus.PUBLISHED,
                "publish_at": self.project.publish_at.strftime("%Y-%m-%d %H:%M:%S"),
                "seo_title": "",
                "seo_description": "",
                "canonical_url": "",
                "og_title": "",
                "og_description": "",
            },
        )
        self.assertTrue(form.is_valid(), form.errors)
        form.save()

        self.project.refresh_from_db()
        self.assertEqual(self.project.actual_online_raised_amount, 10_000)
        self.assertEqual(self.project.manual_raised_amount, 290_000)
        self.assertEqual(self.project.public_raised_amount, 300_000)

        second_donation = Donation.objects.create(
            donor_name="Next Donor",
            donor_email="next@example.com",
            donor_phone="8888888888",
            amount=2_500,
            project=self.project,
            project_slug=self.project.slug,
            project_title=self.project.title,
            status=Donation.Status.PAID,
            receipt="next-receipt",
        )
        record_captured_transaction(
            second_donation,
            "pay_next",
            250_000,
            source="test",
        )

        self.assertEqual(self.project.actual_online_raised_amount, 12_500)
        self.assertEqual(self.project.public_raised_amount, 302_500)
        self.assertEqual(self.project.funding_remaining_amount, 997_500)

    def test_project_api_exposes_calculated_funding_values(self):
        self.project.manual_raised_amount = 200_000
        self.project.save(update_fields=["manual_raised_amount"])
        record_captured_transaction(
            self.donation,
            "pay_api",
            1_000_000,
            source="test",
        )

        response = APIClient().get("/api/projects/")

        self.assertEqual(response.status_code, 200)
        project_data = response.json()[0]
        self.assertEqual(project_data["funding_target_amount"], 1_300_000)
        self.assertEqual(project_data["actual_online_raised_amount"], 10_000)
        self.assertEqual(project_data["public_raised_amount"], 210_000)
        self.assertEqual(project_data["funding_remaining_amount"], 1_090_000)

    def test_80g_request_uses_correct_field_and_accepts_legacy_alias(self):
        base_payload = {
            "donation_type": Donation.DonationType.ONE_TIME,
            "amount": 1_000,
            "currency": "INR",
            "name": "80G Donor",
            "email": "80g@example.com",
            "phone": "9999999999",
            "pan_number": "ABCDE1234F",
        }

        current_serializer = DonationCheckoutSerializer(
            data={**base_payload, "eighty_g_requested": True}
        )
        legacy_serializer = DonationCheckoutSerializer(
            data={**base_payload, "atg_requested": True}
        )

        self.assertTrue(current_serializer.is_valid(), current_serializer.errors)
        self.assertTrue(legacy_serializer.is_valid(), legacy_serializer.errors)
        self.assertTrue(current_serializer.validated_data["eighty_g_requested"])
        self.assertTrue(legacy_serializer.validated_data["eighty_g_requested"])
        self.assertNotIn("atg_requested", legacy_serializer.validated_data)

    def test_donation_amount_has_server_side_maximum(self):
        serializer = DonationCheckoutSerializer(
            data={
                "donation_type": Donation.DonationType.ONE_TIME,
                "amount": 500_001,
                "currency": "INR",
                "name": "Large Donor",
                "email": "large@example.com",
                "phone": "9999999999",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("amount", serializer.errors)

    def test_public_story_api_is_read_only(self):
        self.assertTrue(issubclass(StoryItemViewSet, ReadOnlyModelViewSet))

    def test_payment_signature_failure_does_not_change_donation_status(self):
        self.donation.status = Donation.Status.CHECKOUT_CREATED
        self.donation.razorpay_order_id = "order_protected"
        self.donation.save(update_fields=["status", "razorpay_order_id", "updated_at"])

        response = APIClient().post(
            "/api/donations/verify/",
            {
                "donation_id": self.donation.id,
                "donation_type": Donation.DonationType.ONE_TIME,
                "razorpay_payment_id": "pay_invalid",
                "razorpay_order_id": "order_protected",
                "razorpay_signature": "invalid-signature",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.donation.refresh_from_db()
        self.assertEqual(self.donation.status, Donation.Status.CHECKOUT_CREATED)
        self.assertFalse(
            DonationTransaction.objects.filter(
                razorpay_payment_id="pay_invalid"
            ).exists()
        )

    @override_settings(DEBUG=False)
    def test_spa_page_view_endpoint_records_secure_visitor_cookie(self):
        response = APIClient().post(
            "/api/analytics/page-view/",
            {"path": "/recent-projects", "full_path": "/recent-projects?project=test"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PageView.objects.count(), 1)
        self.assertEqual(PageView.objects.get().path, "/recent-projects")
        self.assertTrue(response.cookies["sf_vid"]["secure"])

    @override_settings(
        RAZORPAY_KEY_ID="rzp_test_key",
        RAZORPAY_KEY_SECRET="rzp_test_secret",
    )
    @patch("foundation.api.get_razorpay_client")
    def test_checkout_links_80g_donation_to_selected_project(self, get_client):
        razorpay_client = Mock()
        razorpay_client.create_order.return_value = {
            "id": "order_project_test",
            "status": "created",
        }
        get_client.return_value = razorpay_client

        response = APIClient().post(
            "/api/donations/checkout/",
            {
                "donation_type": Donation.DonationType.ONE_TIME,
                "amount": 2_500,
                "currency": "INR",
                "name": "Project Donor",
                "email": "project-donor@example.com",
                "phone": "9999999999",
                "project_slug": self.project.slug,
                "project_title": "Untrusted client title",
                "eighty_g_requested": True,
                "pan_number": "ABCDE1234F",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        checkout_donation = Donation.objects.get(pk=response.data["donation_id"])
        self.assertEqual(checkout_donation.project_id, self.project.id)
        self.assertEqual(checkout_donation.project_slug, self.project.slug)
        self.assertEqual(checkout_donation.project_title, self.project.title)
        self.assertTrue(checkout_donation.eighty_g_requested)
        self.assertEqual(response.data["project_title"], self.project.title)

    @override_settings(RAZORPAY_KEY_SECRET="rzp_test_secret")
    def test_verification_rejects_order_from_another_donation(self):
        other_donation = Donation.objects.create(
            donor_name="Other Donor",
            donor_email="other@example.com",
            donor_phone="7777777777",
            amount=10_000,
            project=self.project,
            project_slug=self.project.slug,
            project_title=self.project.title,
            status=Donation.Status.CHECKOUT_CREATED,
            receipt="other-receipt",
            razorpay_order_id="order_other",
        )
        payment_id = "pay_replay_attempt"
        foreign_order_id = "order_foreign"
        signature = hmac.new(
            b"rzp_test_secret",
            f"{foreign_order_id}|{payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        response = APIClient().post(
            "/api/donations/verify/",
            {
                "donation_id": other_donation.id,
                "donation_type": Donation.DonationType.ONE_TIME,
                "razorpay_payment_id": payment_id,
                "razorpay_order_id": foreign_order_id,
                "razorpay_signature": signature,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        other_donation.refresh_from_db()
        self.assertEqual(other_donation.status, Donation.Status.CHECKOUT_CREATED)
        self.assertFalse(
            DonationTransaction.objects.filter(
                razorpay_payment_id=payment_id
            ).exists()
        )

    @override_settings(
        RAZORPAY_KEY_ID="rzp_test_key",
        RAZORPAY_KEY_SECRET="rzp_test_secret",
    )
    @patch("foundation.api.get_razorpay_client")
    def test_verification_records_only_razorpay_confirmed_capture(
        self,
        mocked_get_client,
    ):
        donation = Donation.objects.create(
            donor_name="Verified Donor",
            donor_email="verified@example.com",
            donor_phone="8888888888",
            amount=2_500,
            project=self.project,
            project_slug=self.project.slug,
            project_title=self.project.title,
            status=Donation.Status.CHECKOUT_CREATED,
            receipt="verified-receipt",
            razorpay_order_id="order_verified",
        )
        payment_id = "pay_verified"
        signature = hmac.new(
            b"rzp_test_secret",
            f"order_verified|{payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        mocked_get_client.return_value.fetch_payment.return_value = {
            "id": payment_id,
            "order_id": "order_verified",
            "amount": 250_000,
            "currency": "INR",
            "status": "captured",
            "captured": True,
        }

        response = APIClient().post(
            "/api/donations/verify/",
            {
                "donation_id": donation.id,
                "donation_type": Donation.DonationType.ONE_TIME,
                "razorpay_payment_id": payment_id,
                "razorpay_order_id": "order_verified",
                "razorpay_signature": signature,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        donation.refresh_from_db()
        self.assertEqual(donation.status, Donation.Status.PAID)
        self.assertEqual(donation.razorpay_status, "captured")
        self.assertEqual(
            DonationTransaction.objects.get(
                razorpay_payment_id=payment_id
            ).amount_paise,
            250_000,
        )

    @override_settings(
        RAZORPAY_KEY_ID="rzp_test_key",
        RAZORPAY_KEY_SECRET="rzp_test_secret",
    )
    @patch("foundation.api.get_razorpay_client")
    def test_verification_rejects_amount_mismatch(
        self,
        mocked_get_client,
    ):
        donation = Donation.objects.create(
            donor_name="Mismatch Donor",
            donor_email="mismatch@example.com",
            donor_phone="6666666666",
            amount=2_500,
            project=self.project,
            project_slug=self.project.slug,
            project_title=self.project.title,
            status=Donation.Status.CHECKOUT_CREATED,
            receipt="mismatch-receipt",
            razorpay_order_id="order_mismatch",
        )
        payment_id = "pay_mismatch"
        signature = hmac.new(
            b"rzp_test_secret",
            f"order_mismatch|{payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        mocked_get_client.return_value.fetch_payment.return_value = {
            "id": payment_id,
            "order_id": "order_mismatch",
            "amount": 100,
            "currency": "INR",
            "status": "captured",
            "captured": True,
        }

        response = APIClient().post(
            "/api/donations/verify/",
            {
                "donation_id": donation.id,
                "donation_type": Donation.DonationType.ONE_TIME,
                "razorpay_payment_id": payment_id,
                "razorpay_order_id": "order_mismatch",
                "razorpay_signature": signature,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        donation.refresh_from_db()
        self.assertEqual(donation.status, Donation.Status.CHECKOUT_CREATED)
        self.assertFalse(
            DonationTransaction.objects.filter(
                razorpay_payment_id=payment_id
            ).exists()
        )

    @override_settings(
        STORAGES={
            "default": {
                "BACKEND": "django.core.files.storage.FileSystemStorage",
            },
            "staticfiles": {
                "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            },
        }
    )
    def test_admin_dashboard_and_project_funding_control_load(self):
        admin_user = get_user_model().objects.create_superuser(
            username="funding-admin",
            email="funding-admin@example.com",
            password="test-password",
        )
        self.client.force_login(admin_user)

        dashboard_response = self.client.get("/admin/")
        project_response = self.client.get(
            f"/admin/foundation/project/{self.project.pk}/change/"
        )

        self.assertEqual(dashboard_response.status_code, 200)
        self.assertContains(dashboard_response, "Actual Campaign Collection")
        self.assertEqual(project_response.status_code, 200)
        self.assertContains(project_response, "Set current public raised amount")
        self.assertContains(project_response, "Actual verified online collection")
        self.assertIn("amount", DonationAdmin.readonly_fields)
        self.assertIn("project", DonationAdmin.readonly_fields)
        self.assertIn("razorpay_status", DonationAdmin.readonly_fields)

    @override_settings(RAZORPAY_WEBHOOK_SECRET="webhook-test-secret")
    def test_webhook_is_idempotent_and_refund_reduces_actual_total(self):
        client = APIClient()
        capture_payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook",
                        "amount": 1_000_000,
                        "currency": "INR",
                        "status": "captured",
                        "notes": {"donation_id": str(self.donation.id)},
                    }
                }
            },
        }

        first_response = self._post_webhook(client, capture_payload)
        second_response = self._post_webhook(client, capture_payload)

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(
            DonationTransaction.objects.filter(
                razorpay_payment_id="pay_webhook"
            ).count(),
            1,
        )
        self.assertEqual(self.project.actual_online_raised_amount, 10_000)

        refund_payload = {
            "event": "payment.refunded",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook",
                        "amount": 1_000_000,
                        "amount_refunded": 400_000,
                        "status": "partially_refunded",
                    }
                }
            },
        }
        refund_response = self._post_webhook(client, refund_payload)

        self.assertEqual(refund_response.status_code, 200)
        self.assertEqual(self.project.actual_online_raised_amount, 6_000)

    @override_settings(RAZORPAY_WEBHOOK_SECRET="webhook-test-secret")
    def test_unmatched_valid_webhook_requests_retry(self):
        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_unmatched",
                        "amount": 10_000,
                        "currency": "INR",
                        "status": "captured",
                        "notes": {"donation_id": "999999"},
                    }
                }
            },
        }

        response = self._post_webhook(APIClient(), payload)
        self.assertEqual(response.status_code, 503)

    @override_settings(RAZORPAY_WEBHOOK_SECRET="webhook-test-secret")
    def test_refund_without_capture_requests_retry(self):
        payload = {
            "event": "payment.refunded",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_missing_capture",
                        "amount": 10_000,
                        "amount_refunded": 10_000,
                        "currency": "INR",
                    }
                }
            },
        }

        response = self._post_webhook(APIClient(), payload)
        self.assertEqual(response.status_code, 503)

    @staticmethod
    def _post_webhook(client, payload):
        raw_body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        signature = hmac.new(
            b"webhook-test-secret",
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        return client.post(
            "/api/donations/webhook/",
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
        )
