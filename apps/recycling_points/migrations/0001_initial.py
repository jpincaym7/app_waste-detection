# Generated by Django 4.2.17 on 2024-12-19 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RecyclingPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
                ('address', models.CharField(max_length=255, verbose_name='address')),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9, verbose_name='latitude')),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9, verbose_name='longitude')),
                ('is_active', models.BooleanField(default=True, verbose_name='is active')),
                ('opening_hours', models.JSONField(default=dict, verbose_name='opening hours')),
                ('contact_info', models.JSONField(default=dict, verbose_name='contact info')),
            ],
            options={
                'verbose_name': 'recycling point',
                'verbose_name_plural': 'recycling points',
            },
        ),
    ]
