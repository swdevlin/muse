# Generated by Django 3.2.8 on 2021-10-23 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0013_topic_wiki_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='server',
            name='wiki_url',
            field=models.URLField(null=True),
        ),
    ]
