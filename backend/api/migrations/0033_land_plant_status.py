# Generated by Django 5.2 on 2025-06-04 21:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_remove_land_plant_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='land',
            name='plant_status',
            field=models.CharField(default='Healthy', max_length=50),
        ),
    ]
