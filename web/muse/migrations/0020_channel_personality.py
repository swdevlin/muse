# Generated by Django 3.2.8 on 2021-12-27 16:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0019_auto_20211227_1004'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='personality',
            field=models.IntegerField(choices=[(1, 'Traveller'), (2, 'Eclipse Phase'), (3, 'Call of Cthulhu')], null=True),
        ),
    ]