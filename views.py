from django.shortcuts import render, redirect
from django.core import serializers

# Create your views here.
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views.decorators.cache import never_cache
from .models import *
HOLDER_FOR_TASK_ID = 0



@never_cache
def in_progress(request, name):
    #todo "in progress view"
    print("in progress")
"""
def sort_tasks(tasks):
    query_set = tasks
    sorted_tasks = []
    for task in tasks.extra().filter(holdToTask=HOLDER_FOR_TASK_ID):
        res = task_with_all_subtask(task)


    return sorted_tasks

def task_with_all_subtask(task, list=None):

    if list is None:
        list = [task]
    else:
        list.append(task)

    set = task.task_set.all()
    if set.exists():
        for subtask in set:
            list = subtask + task_with_all_subtask(subtask, list)

    return [task]

"""


def tasks_list(request):
    if request.user.is_authenticated:

        tasks = (request.user.task_set.filter(is_hidden=False)
                 .order_by("holdToTask")
                 )
        if len(tasks) == 0:
            return JsonResponse({'error': 'No data found'}, status=404)

        # fields = ("id", "task_set", "description", "holdToTask")
        tasks_json = serializers.serialize("json", tasks,

                                           #fields=fields,
                                           )
        # tasks_json = json.dumps(tasks,default=lambda o:o.__dict__)
        return HttpResponse(tasks_json, content_type="application/json")
        #return JsonResponse(tasks_json, safe=False)
    else:
        return JsonResponse("You're not logged")


@never_cache  # todo: delite on release
def tasks(request):

    if request.user.is_authenticated:
        return render(request, "reminder/tasks.html")
    else:
        return HttpResponseRedirect(reverse("login:login"))


def get_new_task(request, header_id=0):
    if request.user.is_authenticated:
        try:
            if header_id != 0:
                hold_to_task = Task.objects.get(id=header_id,is_hidden=True)
                if hold_to_task.owner_id != request.user.id:

                    return JsonResponse({"error": "task does not exist"}, status=404)
        except Task.DoesNotExist:
            return JsonResponse({"error": "task does not exist"}, status=404)

        new_task = Task.objects.create(holdToTask_id=header_id, owner_id=request.user.id)
        new_task_json = serializers.serialize("json", [new_task,],)
        return HttpResponse(new_task_json, content_type="application/json")

    return redirect("login:login")


