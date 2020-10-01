// Generics
export function handleErrorResponse(type, ...data){
  let _id = false;
  let scape_time = 5000;  // Milliseconds
  if(type=='server'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-server')){
      console.error("DOM 'alert-server' NOT FOUND");
      return;
    }

    _id = 'alert-server';
  }else if(type=='permission'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-permission')){
      console.error("DOM 'alert-permission' NOT FOUND");
      return;
    }

    _id = 'alert-permission';
  }else if(type=='login'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-login')){
      console.error("DOM 'alert-login' NOT FOUND");
      return;
    }

    _id = 'alert-login';
  }else if(type=='custom'){
    // Check if element exist in DOM
    let div_alert_custom = document.getElementById("alert-custom");
    if(!div_alert_custom){
      console.error("DOM 'alert-custom' NOT FOUND");
      return;
    }

    _id = 'alert-custom';
    if(data.length<2) return;

    // Custom customization
    if(data[2]){
      div_alert_custom.className
      = div_alert_custom.classList.value.replace("bg-warning", "bg-"+data[2]);
    }else if(div_alert_custom.className.indexOf("warning")==-1){
      div_alert_custom.className
      = div_alert_custom.classList.add("bg-warning-700");
    }

    // Set message to alert box
    document.querySelector('#alert-custom #alert-headline').textContent = data[0];
    document.querySelector('#alert-custom #alert-text').textContent = data[1];
  }


  if(!_id) return;  // If type wasn't found

  document.getElementById(_id).style.display = "block"
  document.getElementById(_id).classList.remove("fade")
  setTimeout(function(id){
    if(document.getElementById(id))
      document.getElementById(id).classList.add("fade")
  }, scape_time, _id)
  setTimeout(function(id){
    if(document.getElementById(id))
      document.getElementById(id).style.display = "none"
  }, scape_time+200, _id)
}
export function capitalizeFirstLetter(word, restLowerCase=true){
  return word[0].toUpperCase()
    + (restLowerCase
      ? word.slice(1, word.length).toLowerCase()
      : word.slice(1, word.length)
    );
}
export function isArray(_ar){
  return typeof _ar == "object" & _ar.hasOwnProperty("length")
}
export function getUrlSearchAsObj(json=true){
  let search_text = window.location.search
  if(search_text.length <= 1) return false  // Verify there are params

  // Delete the first '?'
  search_text = search_text.split("")
  search_text.shift()
  search_text = search_text.join("")

  // Get each param
  let obj = {}
  // a=123&b=asd
  search_text.split("&").map(i => {
    // a=123
    let break_pos = i.indexOf("=")
    obj[i.slice(0, break_pos)] = json
      ? JSON.parse(i.slice(break_pos+1, i.length+1))
      : i.slice(break_pos+1, i.length+1)
  })

  return obj
}
export async function getDataByPK(end_point, _pk){
  // Get patient data by id
  return fetch(
    process.env.REACT_APP_PROJECT_API+end_point+`/${_pk}/`,
    {
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
      },
    }
  ).then(
    response => {
      return response.ok
      ? response.json()
      : Promise.reject(response.text());
    },
    () => handleErrorResponse('server')
  ).then(
    response_obj => response_obj,
    () => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
  );
}
export async function simpleGet(end_point){
  return fetch(
    process.env.REACT_APP_PROJECT_API+end_point,
    {
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
      },
    }
  ).then(
    response => (
      response.ok
      ? response.json()
      : response.status==403
      ? handleErrorResponse('permission')
      : response.status==500
      ? handleErrorResponse('server')
      : Promise.reject()
    ),
    () => handleErrorResponse('server')
  );
}
export async function simplePostData(end_point, data, method="POST"){
  method = method.toUpperCase()
  if(method != "POST" && method != "PUT"){
    console.error("simplePostData only supports methods POST and PUT");
  }

  return fetch(
    process.env.REACT_APP_PROJECT_API+end_point,
    {
      method: method,
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
        'Content-Type': 'application/json'  // JSON type
      },
      body: JSON.stringify(data)  // Data
    },
  ).then(
    response => (
      response.ok
      ? response.json()
      : response.status==403
      ? handleErrorResponse('permission')
      : response.status==500
      ? handleErrorResponse('server')
      : Promise.reject()
    ),
    () => handleErrorResponse('server')
  );
}
export async function simpleDelete(end_point){
  return fetch(
    process.env.REACT_APP_PROJECT_API+end_point,
    {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
        'Content-Type': 'application/json'  // JSON type
      },
    }
  ).then(
    response => (
      response.ok
      ? response
      : response.status==403
      ? handleErrorResponse('permission')
      : response.status==500
      ? handleErrorResponse('server')
      : Promise.reject()
    ),
    () => handleErrorResponse('server')
  );
}
// Specific
export function getPatientFullName(patient){
  return (
    capitalizeFirstLetter(patient.nombre_principal)+
    (patient.nombre_secundario?" "+capitalizeFirstLetter(patient.nombre_secundario):"")+" "+
    capitalizeFirstLetter(patient.ape_paterno, false)+" "+capitalizeFirstLetter(patient.ape_materno, false)
  )
}
