from django.db import models
from django.contrib.auth.models import User
# Create your models here.
import datetime
from django.contrib import admin
from django.utils import timezone


class Task(models.Model):
    description = models.CharField(max_length=250, default="Title")
    date_created = models.DateTimeField(verbose_name="creation date", default=timezone.now)
    is_completed = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    holdToTask = models.ForeignKey("self", on_delete=models.CASCADE, default=0)

    def __str__(self):

        return self.description


class Theme(models.Model):
    name = models.CharField(max_length=40)
    description = models.CharField(max_length=100)
    groups = models.ManyToManyField(to=Task)


class Link(models.Model):
    name = models.CharField(max_length=100)
    link = models.CharField()
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)


class SocialNetwork(models.Model):
    name = models.CharField()
    # maybe add a link


class ContactData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    social_username = models.CharField(max_length=100)
    social_network = models.ForeignKey(SocialNetwork, on_delete=models.PROTECT)


class Remind(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    contact_data = models.ForeignKey(ContactData, on_delete=models.CASCADE)
    remind_date = models.DateTimeField(default=timezone.now)
    # support of enum https://docs.djangoproject.com/en/5.0/ref/models/fields/
