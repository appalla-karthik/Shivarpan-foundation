from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("foundation", "0018_donation_project_project_funding_target_amount_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="donation",
            old_name="atg_requested",
            new_name="eighty_g_requested",
        ),
        migrations.AlterField(
            model_name="donation",
            name="eighty_g_requested",
            field=models.BooleanField(
                default=False,
                verbose_name="80G certificate requested",
            ),
        ),
    ]
