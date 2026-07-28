import django.db.models.deletion
from django.db import migrations, models
from django.utils.text import slugify


DEFAULT_STATES = {
    "andhra_pradesh": {
        "name": "Andhra Pradesh",
        "summary": "Digital support and regional coordination for foundation outreach.",
        "sort_order": 10,
    },
    "west_bengal": {
        "name": "West Bengal",
        "summary": "State-level volunteer network and community support coordination.",
        "sort_order": 20,
    },
    "uttar_pradesh": {
        "name": "Uttar Pradesh",
        "summary": "Regional outreach support for programs, events, and field connections.",
        "sort_order": 30,
    },
}


def create_states_and_link_members(apps, schema_editor):
    TeamMember = apps.get_model("foundation", "TeamMember")
    TeamState = apps.get_model("foundation", "TeamState")

    state_values = TeamMember.objects.values_list("state", flat=True).distinct()
    for index, raw_state in enumerate(state_values, start=1):
        state_slug = slugify(raw_state or "") or f"state-{index}"
        defaults = DEFAULT_STATES.get(
            raw_state,
            {
                "name": (raw_state or "State").replace("_", " ").replace("-", " ").title(),
                "summary": "State-wise team coordination and local outreach support.",
                "sort_order": 100 + index,
            },
        )
        state, _ = TeamState.objects.get_or_create(
            slug=state_slug,
            defaults={
                "name": defaults["name"],
                "summary": defaults["summary"],
                "sort_order": defaults["sort_order"],
                "is_active": True,
            },
        )
        TeamMember.objects.filter(state=raw_state).update(state_ref=state)


def restore_member_state_values(apps, schema_editor):
    TeamMember = apps.get_model("foundation", "TeamMember")
    TeamState = apps.get_model("foundation", "TeamState")

    for state in TeamState.objects.all():
        TeamMember.objects.filter(state_ref_id=state.pk).update(state=state.slug)


class Migration(migrations.Migration):
    dependencies = [
        ("foundation", "0021_testimonial_rating"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeamState",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120, unique=True)),
                (
                    "slug",
                    models.SlugField(
                        blank=True,
                        help_text=(
                            "Stable public identifier. It is generated from the state name."
                        ),
                        max_length=140,
                        unique=True,
                    ),
                ),
                (
                    "summary",
                    models.CharField(
                        blank=True,
                        help_text=(
                            "Short public description shown above this state's team members."
                        ),
                        max_length=300,
                    ),
                ),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["sort_order", "name"],
            },
        ),
        migrations.AddField(
            model_name="teammember",
            name="state_ref",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="members",
                to="foundation.teamstate",
            ),
        ),
        migrations.RunPython(
            create_states_and_link_members,
            restore_member_state_values,
        ),
        migrations.RemoveField(
            model_name="teammember",
            name="state",
        ),
        migrations.RenameField(
            model_name="teammember",
            old_name="state_ref",
            new_name="state",
        ),
        migrations.AlterField(
            model_name="teammember",
            name="state",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="members",
                to="foundation.teamstate",
            ),
        ),
        migrations.AlterModelOptions(
            name="teammember",
            options={
                "ordering": [
                    "state__sort_order",
                    "state__name",
                    "sort_order",
                    "name",
                ],
            },
        ),
    ]
