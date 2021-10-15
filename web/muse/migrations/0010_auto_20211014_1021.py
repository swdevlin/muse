# Generated by Django 3.2.8 on 2021-10-14 14:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('muse', '0009_auto_20211014_0842'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='topic',
            name='parent_lookup',
        ),
        migrations.AddField(
            model_name='topic',
            name='key',
            field=models.TextField(default='abc'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='topic',
            unique_together={('server', 'key')},
        ),
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['server', 'parent'], include=('title',), name='parent_lookup'),
        ),
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['server', 'key'], name='topic_key'),
        ),
    ]