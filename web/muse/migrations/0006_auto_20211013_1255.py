# Generated by Django 3.2.8 on 2021-10-13 16:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0005_auto_20211013_1125'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='custom',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='topic',
            name='modified',
            field=models.BooleanField(default=False),
        ),
    ]