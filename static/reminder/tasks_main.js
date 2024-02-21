const NULL_HOLD_TO_ID=0

function iteration_display_tasks(tasks, holder = null){
    if (holder === null){
        holder = document.getElementById("tasks-form")
    }

    for (let x in tasks){
        task_div = create_task_div(x)
        holder.appendChild(task_div)
        if (x.task_set.all === null){

        }
        else{
          iteration_display_tasks(x.task_set.all, task_div)
        }
    }
}
const JSON_URL = window.location.href + "tasks/"

async function getTasks( data = {}){
    let response = fetch(JSON_URL)
        .then((response) => {
        return response.json();//JSON.parse(response)
    }).then((tasks)=> {
            display_tasks(tasks)
    })

    //return response.json()
}

async function display_tasks(tasks=null){

    if (tasks===null){
        try{
            tasks = getTasks();
            //create_task_div(tasks)
        }catch (error){
            console.log(error)
        }
    }else{
        tasks.forEach(function (task){
        create_task_div(task)
        })
    }

}

function create_empty_task(id, hang_to = null){

    const task_div = document.createElement("div")

    div.id = "task" + id
    div.className="task"
    let complete_checkbox=document.createElement("div")
    complete_checkbox.setAttribute("class", "is_complete-checkbox-false")
    complete_checkbox.setAttribute("name", "task"+id+"_checkbox")
    complete_checkbox.setAttribute("onclick", "clickOnComplete_checkbox(this)")
    complete_checkbox.style.display = "inline"

    let task_text = document.createElement("span")
    task_text.setAttribute("class","task-text")
    task_text.setAttribute("id","task"+id+"_textfield")

    let options_button = document.createElement("button")

    if (hang_to===null) {
        hang_to = document.getElementById("task" + NULL_HOLD_TO_ID)
    }else if(!hang_to.checked){
        throw TypeError("wrong type of hang_to; It have to be Html Element;")
    }
    task_div.appendChild(complete_checkbox)
    task_div.appendChild(task_text)
    task_div.appendChild(options_button)

    hang_to.appendChild(task_div)

    return task_div
}


function create_task_div(task){
    let hang_to = document.getElementById("task"+task.fields.holdToTask)
    if (!hang_to.checked)
    {
        hang_to = create_empty_task( id=task.holdToTask)
    }
    hang_to.className="task-holder"

    let task_div = create_empty_task(task.pk, hang_to)
    fill_task_div(task_div,task.fields)

    hang_to.appendChild(div)

}
function fill_task_div(task_div, task_fields){
    let is_complete_button= task_div.getElementsByClassName("is_complete")[0]
    if (task_fields.is_completed){
        is_complete_button.className= "is_complete-checkbox-true"
    }else{
        is_complete_button.className= "is_complete-checkbox-false"
    }
    let textElement= task_div.getElementsByClassName("task-text")
    textElement.textContent=task_fields.description
}
function task_checked(element){
    //get current state of task, that POST the new contra value
    let new_is_completed = !(element.className === "is_complete-checkbox-true");
    try{
        let task_id =  parseInt(element.id.split("_")[0])
        fetch(window.location.href + "tasks/",{
            method:"POST",
            body: JSON.stringify({
                task_id: task_id,
                is_completed:!new_is_completed
            })
        })
            .then((response)=> response.json())

    }catch (error){
        //error behavior
    }
    finally {
        if (new_is_completed){
            element.className = "is_complete-checkbox-true"
            element.style.display = "none"
        }else{
            element.className = "is_complete-checkbox-false"
            element.style.display = "block"
        }

    }
}