from django.shortcuts import render, redirect
from django.core import serializers
import json
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


async def tasks_json_handler(request):
    if request.user.is_authenticated:
        message = None

        if request.method == 'GET':
            tasks = (request.user.task_set.filter(is_hidden=False)
                     .order_by("holdToTask")
                     )
            if len(tasks) == 0:
                return JsonResponse({'error': 'No data found'}, status=404)

            # fields = ("id", "task_set", "description", "holdToTask")
            tasks_json = serializers.serialize("json", tasks,)
            # tasks_json = json.dumps(tasks,default=lambda o:o.__dict__)
            return HttpResponse(tasks_json, content_type="application/json")

        if request.method == 'POST':
            try:
                json_data = json.loads(request.body)# todo: process data
                to_change_task_pk = json_data['pk']
                to_change_task = Task.objects.get(pk=to_change_task_pk)
            except Task.DoesNotExist:
                return JsonResponse("cannot save a task", status=404)
            except Exception as e:
                __log_error(e)
                return JsonResponse("cannot read json request", status=400)

            if to_change_task.owner_id == request.user.id:

                new_is_completed = json_data.get('is_completed', None)
                new_description = json_data.get('description', None)
                new_hang_to_task_pk = json_data.get('holdToTask', None)

                if new_is_completed is True:
                    to_change_task.is_completed = True
                    __set_cascade_is_completed(to_change_task)
                if new_description is not None:
                    to_change_task.description = new_description
                if new_hang_to_task_pk is not None:
                    try:
                        new_hang_to_task = Task.objects.get(id=new_hang_to_task_pk)
                        if new_hang_to_task.owner_id == request.user.id:
                            to_change_task.holdToTask_id = new_hang_to_task.id
                        else:
                            message = "task does not belong to you"
                    except Task.DoesNotExist:
                        message = "task does not exist"

                to_change_task.save()
                json_data = {
                    "pk": to_change_task.pk,
                    "message": message,
                    "fields": {
                        "new_description": to_change_task.description,
                        "holdToTask": to_change_task.holdToTask_id,
                        'is_completed': to_change_task.is_completed,
                    }
                }
                return JsonResponse(json_data, safe=False)
    else:
        return JsonResponse("You're not logged")



def tasks(request):

    if request.user.is_authenticated:
        return render(request, "reminder/tasks.html")
    else:
        return HttpResponseRedirect(reverse("login:login"))


def get_new_task(request, header_id=0):
    if request.user.is_authenticated:
        try:
            if header_id != 0:
                hold_to_task = Task.objects.get(id=header_id)
                if hold_to_task.owner_id != request.user.id:
                    return JsonResponse({"error": "task does not exist, (owner)"}, status=404)

        except Task.DoesNotExist:
            return JsonResponse({"error": "task does not exist, at all"}, status=404)

        new_task = Task.objects.create(holdToTask_id=header_id, owner_id=request.user.id)
        new_task_json = serializers.serialize("json", [new_task,],)
        return HttpResponse(new_task_json, content_type="application/json")  # todo: problem with hang_to = 0

    return redirect("login:login")

async def __set_cascade_is_completed():
    print("__set_cascade_is_completed")
    # todo: finish

def __log_error(error):
    print(error)
