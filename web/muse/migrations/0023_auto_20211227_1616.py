# Generated by Django 3.2.8 on 2021-12-27 21:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0022_alter_channeltopic_channel'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='campaignjobslog',
            name='server',
        ),
        migrations.AddField(
            model_name='campaignjobslog',
            name='channel',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='muse.channel'),
            preserve_default=False,
        ),
    ]
