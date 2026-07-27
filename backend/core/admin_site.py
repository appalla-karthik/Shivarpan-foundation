from __future__ import annotations

from django.contrib.admin.sites import AdminSite
from django.db.models import BigIntegerField, Count, F, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from foundation.models import (
    Article,
    ContactSubmission,
    Donation,
    DonationTransaction,
    Page,
    PageView,
    Project,
    SiteSettings,
    Visitor,
)

class FoundationAdminSite(AdminSite):
    site_header = "Shivarpan Foundation Admin"
    site_title = "Shivarpan Admin"
    index_title = "Dashboard"

    def each_context(self, request):
        context = super().each_context(request)
        context["site_settings"] = SiteSettings.get_solo()
        return context

    def index(self, request, extra_context=None):
        now = timezone.now()
        extra_context = extra_context or {}

        extra_context["kpi_visitors_total"] = Visitor.objects.count()
        extra_context["kpi_pageviews_total"] = PageView.objects.count()
        extra_context["kpi_pages_total"] = Page.objects.published().count()
        extra_context["kpi_articles_total"] = Article.objects.published().count()
        total_donations = DonationTransaction.objects.aggregate(
            total_paise=Coalesce(
                Sum(F("amount_paise") - F("refunded_amount_paise")),
                Value(0),
                output_field=BigIntegerField(),
            ),
            payments=Count("id"),
            donors=Count("donation__donor_email", distinct=True),
        )

        campaign_rows = list(
            Project.objects.annotate(
                raised_paise=Coalesce(
                    Sum(
                        F("transactions__amount_paise")
                        - F("transactions__refunded_amount_paise")
                    ),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                donors=Count("transactions__donation", distinct=True),
                one_time_raised_paise=Coalesce(
                    Sum(
                        F("transactions__amount_paise")
                        - F("transactions__refunded_amount_paise"),
                        filter=Q(
                            transactions__donation__donation_type=Donation.DonationType.ONE_TIME
                        ),
                    ),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
                monthly_raised_paise=Coalesce(
                    Sum(
                        F("transactions__amount_paise")
                        - F("transactions__refunded_amount_paise"),
                        filter=Q(
                            transactions__donation__donation_type=Donation.DonationType.MONTHLY
                        ),
                    ),
                    Value(0),
                    output_field=BigIntegerField(),
                ),
            )
            .filter(raised_paise__gt=0)
            .annotate(
                project_title=F("title"),
                project_slug=F("slug"),
            )
            .values(
                "project_title",
                "project_slug",
                "raised_paise",
                "donors",
                "one_time_raised_paise",
                "monthly_raised_paise",
            )
            .order_by("-raised_paise", "project_title")
        )

        total_campaign_raised = sum(
            (row["raised_paise"] or 0) / 100 for row in campaign_rows
        )

        pie_colors = [
            "#1f5f7a",
            "#f59e0b",
            "#10b981",
            "#3b82f6",
            "#8b5cf6",
            "#ef4444",
            "#14b8a6",
            "#64748b",
        ]

        running_percent = 0
        campaign_breakdown = []

        for index, row in enumerate(campaign_rows):
            raised = (row["raised_paise"] or 0) / 100
            percent = (
                round((raised / total_campaign_raised) * 100, 1)
                if total_campaign_raised
                else 0
            )

            campaign_breakdown.append(
                {
                    **row,
                    "raised": raised,
                    "donors": row["donors"] or 0,
                    "one_time_raised": (row["one_time_raised_paise"] or 0) / 100,
                    "monthly_raised": (row["monthly_raised_paise"] or 0) / 100,
                    "percent": percent,
                    "offset": running_percent,
                    "color": pie_colors[index % len(pie_colors)],
                }
            )
            running_percent += percent

        extra_context["kpi_donations_total"] = (
            total_donations["total_paise"] or 0
        ) / 100
        extra_context["kpi_donors_total"] = total_donations["donors"] or 0
        extra_context["kpi_payments_total"] = total_donations["payments"] or 0
        extra_context["campaign_breakdown"] = campaign_breakdown
        extra_context["campaign_total_raised"] = total_campaign_raised
        extra_context["recent_donations"] = Donation.objects.order_by("-created_at")[:10]
        extra_context["recent_pageviews"] = (
            PageView.objects.select_related("visitor").order_by("-created_at")[:10]
        )
        extra_context["recent_contacts"] = ContactSubmission.objects.order_by("-created_at")[:10]
        extra_context["contacts_new_count"] = ContactSubmission.objects.filter(
            status=ContactSubmission.Status.NEW
        ).count()

        extra_context["now"] = now
        return super().index(request, extra_context=extra_context)


admin_site = FoundationAdminSite(name="foundation_admin")

# Ensure all model registrations go to this site
from foundation import admin as foundation_admin  # noqa: E402,F401

