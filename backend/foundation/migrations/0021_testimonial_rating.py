from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0020_impactvideo"),
    ]

    operations = [
        migrations.AddField(
            model_name="testimonial",
            name="rating",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, "1 star"),
                    (2, "2 stars"),
                    (3, "3 stars"),
                    (4, "4 stars"),
                    (5, "5 stars"),
                ],
                default=5,
                help_text="Select the exact star rating given by this reviewer.",
            ),
        ),
    ]
