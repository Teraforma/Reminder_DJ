const NULL_HOLD_TO_ID=0;
const JSON_URL = window.location.href + "tasks/" //wtf is that and why does conso
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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function post_task_and_subtask_completed(pk){

    if (isNaN(Number(pk))){
        return false
    }


    let result = await fetch(JSON_URL, {
        method:"POST",
        body: JSON.stringify({
            "is_completed": true,
            "pk": pk
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "X-CSRFToken": getCookie("csrftoken")
        }
    }).then(
        (response)=> response.json()
    ).then(
        (data) => { return data }
    )
    // todo: finish
}

async function getNewTask(hang_to_pk =NULL_HOLD_TO_ID){
    let url = JSON_URL+"new/"+hang_to_pk+"/"
    let new_task = await fetch(url)
        .then(response=>{

            return response.json()
        })

    if (new_task["error"] === undefined
        && new_task[0]["pk"] !==undefined
        && new_task[0]["fields"] !== undefined
        && new_task[0]["fields"]["holdToTask"] !== undefined
        ){
        let task = new_task[0]
        if ( task.fields.holdToTask == hang_to_pk){
            return task
        }
        else{
            display_error_to_user("wrong task created?")
            return null
        }
    }
    return null


}

async function display_tasks(tasks=null){

    if (tasks===null){
        try{
             tasks = await getTasks();

        }catch (error){
            display_error_to_user(error)
        }
    }

    tasks.forEach(function (task){
        render_task_as_div(task)
    })
}

function set_environment(){
    set_add_button()
}
function set_add_button(){
    const add_new_task_button_id = "add-task_0"
    let element = document.getElementById(add_new_task_button_id)
    element.addEventListener("click", mouse_click_add_subtask )
}
function create_empty_task(pk, hang_to = null){//TODO: a way to store "holdToTask_id"

    const task_div = document.createElement("div")
    task_div.addEventListener("mouseover", mouse_on_task_div)
    task_div.addEventListener("mouseout", mouse_leave_task_div)
    task_div.id = TASK_DIV_ID + pk
    task_div.className=TASK_DIV_CLASSNAME

    let complete_checkbox=document.createElement("flex")// todo: it does not exist for some reason
    complete_checkbox.setAttribute("id", TASK_DIV_ID+pk+TASK_IS_COMPLETED_CHECKBOX_ID)
    complete_checkbox.setAttribute("class", TASK_CHECKBOX_CLASSNAME + " false")
    complete_checkbox.addEventListener("mouseenter", mouse_over_task_checkbox)
    complete_checkbox.addEventListener("mouseleave", mouse_leave_task_checkbox)
    complete_checkbox.addEventListener("click",  click_on_task_checkbox)

    let task_text = document.createElement("flex")
    task_text.setAttribute("class",TASK_TEXT_CLASSNAME)
    task_text.setAttribute("id",TASK_DIV_ID+pk+TASK_TEXT_ID)
    task_text.addEventListener("click", task_text_change_handler)

    let options_button = document.createElement("button")
    options_button.setAttribute("class", BUTTON_CLASSNAME)
    options_button.setAttribute("id", TASK_DIV_ID + pk+"_button")
    options_button.addEventListener("click", mouse_click_add_subtask, )
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
    task_wrapper.setAttribute("id", TASK_HANGER_ID + pk)
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
        await update_task_text( data_to_task_json(div));
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
        display_error_to_user(error)
        return JSON.stringify({"error":error})
    }

}

async function update_task_text(json_task){
    try{
        let response = await fetch(JSON_URL, {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: json_task,
        }).then((responseData)=> {console.log(responseData)})
            .catch((error)=>{ display_error_to_user(error)})

    }catch (error){
        display_error_to_user(error)
    }

    //if (response)
    // todo: finish post response handler

}


async function click_on_task_checkbox(){

    let task_pk =  get_task_pk_from_element_id(this.id)

    let task_hanger_div =  document.getElementById( TASK_HANGER_ID + task_pk )
    checked_sub_div_animation(task_hanger_div)

    task_hanger_div.style.maxHeight = task_hanger_div.clientHeight
    task_hanger_div.setAttribute("class", FADE_OUT_CLASSNAME)

    post_task_and_subtask_completed(task_pk)
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

async function mouse_click_add_subtask(){
    let hold_to_pk = get_task_pk_from_element_id(this.id)
    await create_new_task(hold_to_pk)
}

async function create_new_task(hang_to_pk = NULL_HOLD_TO_ID){

    try{
        let task = await getNewTask(hang_to_pk)
        if (task !== null){
            render_task_as_div(task)
        }else{
            display_error_to_user("Cannot create a task task due to server response")
        }
    }catch (error){
        log_error(error)
    }
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

function display_error_to_user(error){
    console.log(error)
}
function log_error(error){
    console.log(error)
}

function get_task_pk_from_element_id(id){
    return (id.split("_"))[1]
}
