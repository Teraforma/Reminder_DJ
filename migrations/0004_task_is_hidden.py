# Generated by Django 5.0.1 on 2024-02-13 09:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reminder', '0003_remove_task_owner_task_owner'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='is_hidden',
            field=models.BooleanField(default=False),
        ),
    ]
