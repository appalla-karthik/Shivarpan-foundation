from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0009_mediaasset_blob_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="homepage",
            name="hero_slider_images",
            field=models.ManyToManyField(
                blank=True,
                help_text="Select multiple images for the homepage hero background slider.",
                related_name="homepage_hero_slider_sets",
                to="foundation.mediaasset",
            ),
        ),
    ]
