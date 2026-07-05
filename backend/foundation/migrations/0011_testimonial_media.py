from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0010_homepage_hero_slider_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="testimonial",
            name="media",
            field=models.ForeignKey(
                blank=True,
                help_text="Upload/select a testimonial photo or video. If empty, photo is used as fallback.",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="testimonial_media",
                to="foundation.mediaasset",
            ),
        ),
    ]
