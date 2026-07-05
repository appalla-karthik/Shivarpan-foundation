from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0012_teammember"),
    ]

    operations = [
        migrations.AddField(
            model_name="donation",
            name="project_slug",
            field=models.SlugField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="donation",
            name="project_title",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
