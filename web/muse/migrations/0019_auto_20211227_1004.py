# Generated by Django 3.2.8 on 2021-12-27 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0018_auto_20211227_0945'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='topic',
            name='parent_lookup',
        ),
        migrations.RemoveIndex(
            model_name='topic',
            name='topic_key',
        ),
        migrations.AddField(
            model_name='topic',
            name='personality',
            field=models.IntegerField(choices=[(1, 'Traveller'), (2, 'Eclipse Phase'), (3, 'Call of Cthulhu')], default=2),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='topic',
            unique_together={('personality', 'key')},
        ),
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['personality', 'parent'], include=('title',), name='parent_lookup'),
        ),
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['personality', 'key'], name='topic_key'),
        ),
        migrations.RemoveField(
            model_name='topic',
            name='server',
        ),
    ]