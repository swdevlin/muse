# Generated by Django 3.2.8 on 2021-10-16 23:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='discorduser',
            name='access_token',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='avatar',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='discriminator',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='expires',
            field=models.DateTimeField(blank=True, null=True, verbose_name='access_token_expiry'),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='joined_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='joined_at'),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='last_authenticated',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last_authenticated'),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='locale',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='name',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='refresh_token',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='server_permissions',
            field=models.JSONField(default=dict, null=True),
        ),
        migrations.AddField(
            model_name='discorduser',
            name='verified',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='discorduser',
            name='username',
            field=models.CharField(max_length=254, unique=True),
        ),
    ]
