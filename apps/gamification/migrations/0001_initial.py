# Generated by Django 4.2.17 on 2024-12-19 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Badge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='name')),
                ('description', models.TextField(verbose_name='description')),
                ('icon', models.ImageField(upload_to='badges/', verbose_name='icon')),
                ('points_required', models.PositiveIntegerField(verbose_name='points required')),
                ('category', models.CharField(max_length=50, verbose_name='category')),
            ],
            options={
                'verbose_name': 'badge',
                'verbose_name_plural': 'badges',
                'ordering': ['points_required'],
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.PositiveIntegerField(default=0, verbose_name='points')),
                ('level', models.PositiveIntegerField(default=1, verbose_name='level')),
                ('total_detections', models.PositiveIntegerField(default=0, verbose_name='total detections')),
                ('badges', models.JSONField(default=list, verbose_name='badges')),
                ('preferences', models.JSONField(default=dict, verbose_name='preferences')),
            ],
            options={
                'verbose_name': 'user profile',
                'verbose_name_plural': 'user profiles',
            },
        ),
    ]
