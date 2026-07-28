from django.db.models.deletion import ProtectedError
from django.test import TestCase
from rest_framework.test import APIClient

from core.admin_site import admin_site
from foundation.admin import TeamMemberAdmin
from foundation.models import TeamMember, TeamState


class TeamStateTests(TestCase):
    def test_state_is_admin_managed_and_selected_by_team_members(self):
        state = TeamState.objects.create(
            name="Gujarat",
            summary="Local outreach and community program coordination.",
            sort_order=5,
        )
        member = TeamMember.objects.create(
            state=state,
            name="Ananya Mehta",
            position="State Coordinator",
        )

        self.assertEqual(state.slug, "gujarat")
        self.assertEqual(member.state, state)
        self.assertTrue(admin_site.is_registered(TeamState))
        self.assertIn("state", TeamMemberAdmin.autocomplete_fields)

    def test_team_member_api_exposes_dynamic_state_content_and_order(self):
        later_state = TeamState.objects.create(
            name="Maharashtra",
            summary="Maharashtra outreach.",
            sort_order=20,
        )
        first_state = TeamState.objects.create(
            name="Gujarat",
            summary="Gujarat outreach.",
            sort_order=10,
        )
        TeamMember.objects.create(
            state=later_state,
            name="Later Member",
            position="Volunteer",
        )
        TeamMember.objects.create(
            state=first_state,
            name="First Member",
            position="Coordinator",
        )

        response = APIClient().get("/api/team-members/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["state"] for item in response.data], ["gujarat", "maharashtra"])
        self.assertEqual(response.data[0]["state_label"], "Gujarat")
        self.assertEqual(response.data[0]["state_summary"], "Gujarat outreach.")
        self.assertEqual(response.data[0]["state_sort_order"], 10)

    def test_inactive_states_are_not_exposed_publicly(self):
        state = TeamState.objects.create(name="Hidden State", is_active=False)
        TeamMember.objects.create(
            state=state,
            name="Hidden Member",
            position="Volunteer",
        )

        response = APIClient().get("/api/team-members/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_state_with_members_cannot_be_deleted(self):
        state = TeamState.objects.create(name="Protected State")
        TeamMember.objects.create(
            state=state,
            name="Protected Member",
            position="Volunteer",
        )

        with self.assertRaises(ProtectedError):
            state.delete()
