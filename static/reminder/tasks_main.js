const NULL_HOLD_TO_ID=0
const JSON_URL = window.location.href + "tasks/"
const TASK_IS_COMPLETED_CHECKBOX_ID = "_checkbox"
const TASK_CHECKBOX_CLASSNAME = "complete-checkbox";
const TASK_DIV_ID = "task_"
const TASK_DIV_CLASSNAME = "task-container"
const TASK_HANGER_CLASSNAME = "task-holder"
const TASK_HANGER_ID = "task-holder_"
const TASK_PLACEHOLDER_TEXT = "Title"
const BUTTON_CLASSNAME = "task-button"
const FADE_OUT_CLASSNAME  = " fade-out"
const TASK_TEXT_ID = "_textfield"
const TASK_TEXT_CLASSNAME = "task-text"
const TASK_TEXT_COMPLETE_CLASSNAME = " strike-through-text"

async function getTasks( ){
     return fetch(JSON_URL)
        .then((response) => {
            return  response.json();//JSON.parse(response)
        })
}
async function getNewTask(hang_to_pk =NULL_HOLD_TO_ID){
    return fetch(JSON_URL+"new/"+hang_to_pk+"/")
        .then(response=>{
            return response.json()
        })


}
async function post_task_and_subtask_completed( pk, is_checked){
    //await post_task_is_checked(is_checked, pk)// todo: finish
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
        render_task_as_div(task)
    })
}

function create_empty_task(id, hang_to = null){//TODO: a way to store "holdToTask_id"

    const task_div = document.createElement("div")
    task_div.addEventListener("mouseover", mouse_on_task_div)
    task_div.addEventListener("mouseout", mouse_leave_task_div)
    task_div.id = TASK_DIV_ID + id
    task_div.className=TASK_DIV_CLASSNAME

    let complete_checkbox=document.createElement("flex")// todo: it does not exist for some reason
    complete_checkbox.setAttribute("id", TASK_DIV_ID+id+TASK_IS_COMPLETED_CHECKBOX_ID)
    complete_checkbox.setAttribute("class", TASK_CHECKBOX_CLASSNAME + " false")
    complete_checkbox.addEventListener("mouseenter", mouse_over_task_checkbox)
    complete_checkbox.addEventListener("mouseleave", mouse_leave_task_checkbox)
    complete_checkbox.addEventListener("click", click_on_task_checkbox)

    let task_text = document.createElement("flex")
    task_text.setAttribute("class",TASK_TEXT_CLASSNAME)
    task_text.setAttribute("id",TASK_DIV_ID+id+TASK_TEXT_ID)
    task_text.addEventListener("click", task_text_change_handler)

    let options_button = document.createElement("button")
    options_button.setAttribute("class", BUTTON_CLASSNAME)
    //options_button.appendChild(document.createTextNode(""))

    let wrapper_checkbox = document.createElement("span")
    wrapper_checkbox.appendChild(complete_checkbox)
    wrapper_checkbox.setAttribute("class", "wrapper-checkbox")

    let button_wrapper = document.createElement("span")
    button_wrapper.appendChild(options_button)
    button_wrapper.setAttribute("class", "wrapper-button")

    let wrapper_after_checkbox = document.createElement("span")
    wrapper_after_checkbox.appendChild(task_text)
    wrapper_after_checkbox.appendChild(button_wrapper)
    wrapper_after_checkbox.setAttribute("class", "wrapper-after-checkbox")

    task_div.appendChild(wrapper_checkbox)
    task_div.appendChild(wrapper_after_checkbox)

    let task_wrapper = document.createElement("div")
    task_wrapper.setAttribute("id", TASK_HANGER_ID + id)
    task_wrapper.setAttribute("class", TASK_HANGER_CLASSNAME)

    task_wrapper.appendChild(task_div)

    if (hang_to===null) {
        hang_to = document.getElementById(TASK_HANGER_ID + NULL_HOLD_TO_ID)
    }else if(!(hang_to instanceof Element)){
        throw TypeError("wrong type of hang_to; It have to be Html Element;")
    }
    hang_to.setAttribute("class", TASK_HANGER_CLASSNAME+" hold-true")
    hang_to.appendChild(task_wrapper)
    return task_wrapper
}

function render_task_as_div(task){
    let hang_to = document.getElementById(TASK_HANGER_ID+task.fields.holdToTask)
    if (hang_to===null)
    {
        hang_to = create_empty_task(task.fields.holdToTask)
    }


    let task_div = create_empty_task(task.pk, hang_to)
    fill_task_div(task.pk,task.fields)

    hang_to.appendChild(task_div)

}
function fill_task_div(id, task_fields){
    let task_div=document.getElementById(TASK_DIV_ID+id)
    let is_complete_button= document.getElementById(task_div.id+TASK_IS_COMPLETED_CHECKBOX_ID)

    if (task_fields.is_completed){
        is_complete_button.className= TASK_CHECKBOX_CLASSNAME+" true"
    }else{
        is_complete_button.className= TASK_CHECKBOX_CLASSNAME+" false"
    }
    let textElement= document.getElementById (task_div.id+TASK_TEXT_ID)
    textElement.textContent=task_fields.description
}

function task_text_change_handler(){
    let div = this
    const currentText = this.textContent;

    const input = document.createElement("input")
    input.type = "text"
    input.className=div.className
    input.value=currentText
    input.setAttribute("placeholder", TASK_PLACEHOLDER_TEXT)

    this.innerHTML=" ";
    this.appendChild(input);
    input.focus();

    input.addEventListener("blur", async()=>{
        let is_empty = true
        for (let char in input.value){
            if (char !== " "){
                is_empty=false
            }
        }

        if (is_empty){
            div.textContent= TASK_PLACEHOLDER_TEXT
        }else{
            div.textContent = input.value
        }
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
            "is_completed":document.getElementById(task_div.id+TASK_IS_COMPLETED_CHECKBOX_ID).className === TASK_CHECKBOX_CLASSNAME+" true"
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
        let response = await fetch(JSON_URL, {
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


async function click_on_task_checkbox(){
    let task_pk =  get_task_pk_from_element_id(this.id)
    post_task_and_subtask_completed( task_pk, true)

    let task_hanger_div =  document.getElementById( TASK_HANGER_ID + task_pk )
    checked_sub_div_animation(task_hanger_div)

    task_hanger_div.setAttribute("class", FADE_OUT_CLASSNAME)

}

function checked_sub_div_animation(hanger_div){

    let text_boxes = hanger_div.getElementsByClassName(TASK_TEXT_CLASSNAME)
    for (let text_box of text_boxes){
        text_strike_through(text_box)
    }

    let checkboxes = hanger_div.getElementsByClassName(TASK_CHECKBOX_CLASSNAME)
    for (let checkbox of checkboxes){
        check_checkbox(checkbox)
    }
}

function text_strike_through(text_box){
    text_box.setAttribute("class", TASK_TEXT_CLASSNAME + TASK_TEXT_COMPLETE_CLASSNAME)
}
function check_checkbox(checkbox){
    checkbox.removeEventListener("mouseleave", mouse_leave_task_checkbox)
    checkbox.setAttribute("class", TASK_CHECKBOX_CLASSNAME + " true")
}




function mouse_over_task_checkbox(){
    this.setAttribute("class", TASK_CHECKBOX_CLASSNAME + " true")
}
function mouse_leave_task_checkbox(){
    this.setAttribute("class", TASK_CHECKBOX_CLASSNAME + " false")
}
function mouse_on_task_div(){
    let buttons = this.getElementsByClassName(BUTTON_CLASSNAME)
    for (let button of buttons){
        button.style.visibility = "visible"
    }
}
function mouse_leave_task_div(){
    let buttons = this.getElementsByClassName(BUTTON_CLASSNAME)
    for (let button of buttons){
        button.style.visibility = "hidden"
    }
}

function display_error(error){
    console.log(error)
}

function get_task_pk_from_element_id(id){
    return (id.split("_"))[1]
}
