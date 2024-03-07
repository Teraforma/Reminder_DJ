from . import views
from django.urls import path

app_name = "reminder"
urlpatterns = [
    path("", views.tasks, name="tasks"),
    path("<str:name>/inprogress/", views.in_progress, name="todo"),
    path("tasks/", views.tasks_list, name="users_task"),
    path("tasks/new/<int:header_id>/", views.get_new_task, name="new_task"),
]
