# Generated by Django 3.2.8 on 2021-10-23 00:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0012_alter_server_admins'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='wiki_slug',
            field=models.TextField(null=True),
        ),
    ]