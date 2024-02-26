const NULL_HOLD_TO_ID=0


const JSON_URL = window.location.href + "tasks/"
const task_is_completed_checkbox_name = "complete-checkbox";
const TASK_CLASSNAME = "task holder"
const TASK_HEADER_CLASSNAME = "task" + " header"
async function getTasks( ){
    return fetch(JSON_URL)
        .then((response) => {
            return response.json();//JSON.parse(response)
        })
}

async function display_tasks(tasks=null){

    if (tasks===null){
        try{
             tasks = await getTasks();

        }catch (error){
            display_error(error)
        }
    }

    tasks.forEach(function (task){
        create_task_div(task)
    })
}



function create_empty_task(id, hang_to = null){//TODO: a way to store "holdToTask_id"

    const task_div = document.createElement("div")
//TODO: all "task_" should be made as const variable or even better, through out
    task_div.id = "task_" + id
    task_div.className=TASK_CLASSNAME
    let complete_checkbox=document.createElement("div")// todo: it does not exist for some reason
    complete_checkbox.setAttribute("id", "task_"+id+"_checkbox")
    complete_checkbox.setAttribute("class", task_is_completed_checkbox_name + " false")
    complete_checkbox.addEventListener("click", async()=> task_checked())


    let task_text = document.createElement("div")
    task_text.setAttribute("class","task-text")
    task_text.setAttribute("id","task_"+id+"_textfield")
    task_text.addEventListener("dblclick", task_text_doubleclick_handler)

    let options_button = document.createElement("button")
    options_button.setAttribute("class", "task-button")
    //options_button.appendChild(document.createTextNode("more"))

    if (hang_to===null) {
        hang_to = document.getElementById("task_" + NULL_HOLD_TO_ID)
    }else if(!(hang_to instanceof Element)){
        throw TypeError("wrong type of hang_to; It have to be Html Element;")
    }
    task_div.appendChild(complete_checkbox)
    task_div.appendChild(task_text)
    task_div.appendChild(options_button)

    hang_to.appendChild(task_div)

    return task_div
}


function create_task_div(task){
    let hang_to = document.getElementById("task_"+task.fields.holdToTask)//todo: task0 not found WHAT?
    if (hang_to===null)
    {
        hang_to = create_empty_task(task.fields.holdToTask)
    }
    hang_to.className= TASK_HEADER_CLASSNAME

    let task_div = create_empty_task(task.pk, hang_to)
    fill_task_div(task_div,task.fields)

    hang_to.appendChild(task_div)

}
function fill_task_div(task_div, task_fields){
    let is_complete_button= document.getElementById(task_div.id+"_checkbox")

    if (task_fields.is_completed){
        is_complete_button.className= task_is_completed_checkbox_name+" true"
    }else{
        is_complete_button.className= task_is_completed_checkbox_name+" false"
    }
    let textElement= document.getElementById (task_div.id+"_textfield")
    textElement.textContent=task_fields.description
}
async function task_checked(){
    //get current state of task, that POST the new contra value //TODO: consider changing this code to POST everything
    let new_is_completed = (this.className === task_is_completed_checkbox_name+" false");
    if (new_is_completed){
            this.className = task_is_completed_checkbox_name+" true"
            //this.style.display = "none"//todo: hide task , not a checkbox
        }else{
            this.className = task_is_completed_checkbox_name+" false"
            //this.style.display = "block"
        }
    try{
        await updateTask(data_to_task_json(this))

    }catch (error){
        //error behavior
    }
    finally {
        //todo: hide task somehow

    }
}

function task_text_doubleclick_handler(){
    let div = this
    const currentText = this.textContent;

    const input = document.createElement("input")
    input.type = "text"
    input.className=div.className
    input.value=currentText

    this.innerHTML=" ";
    this.appendChild(input);
    input.focus();



    input.addEventListener("blur", async()=>{
        div.textContent = input.value
        await updateTask( data_to_task_json(div));
        }
    )

}

function data_to_task_json(div){
    try{
        let task_div_id = ((div.id).slice("_"))[0] + "_" + (div.id).slice("_")[1]
        let task_div = document.getElementById(task_div_id)
        let new_task_json= {
            "id":(task_div.id).slice("_")[1],
            "description":task_div.getElementsByClassName("task text")[0].textContent,
            "is_completed":document.getElementById(task_div.id+"_checkbox").className === task_is_completed_checkbox_name+" true"
            //"holdToTask":,

        }

        return JSON.stringify(new_task_json)
    }catch (error){
        display_error(error)
        return JSON.stringify({"error":error})
    }

}

async function updateTask(json_task){
    try{
        var response = await fetch(JSON_URL, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: json_task,
        }).then((responseData)=> {console.log(responseData)})
            .catch((error)=>{ display_error(error)})

    }catch (error){
        display_error(error)
    }

    //if (response) //todo: finish post response handler

}

function display_error(error){
    console.log(error)
}