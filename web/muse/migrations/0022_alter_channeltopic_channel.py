# Generated by Django 3.2.8 on 2021-12-27 20:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0021_remove_server_prefix'),
    ]

    operations = [
        migrations.AlterField(
            model_name='channeltopic',
            name='channel',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='muse.channel'),
        ),
    ]