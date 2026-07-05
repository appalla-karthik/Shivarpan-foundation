from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0011_testimonial_media"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeamMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("andhra_pradesh", "Andhra Pradesh"),
                            ("west_bengal", "West Bengal"),
                            ("uttar_pradesh", "Uttar Pradesh"),
                        ],
                        max_length=80,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("position", models.CharField(max_length=255)),
                ("note", models.TextField(blank=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "photo",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="team_member_photos",
                        to="foundation.mediaasset",
                    ),
                ),
            ],
            options={
                "ordering": ["state", "sort_order", "name"],
            },
        ),
    ]
