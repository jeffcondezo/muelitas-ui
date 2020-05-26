export function handleErrorResponse(type, ...data){
  let _id = false;
  let scape_time = 2700;  // Milliseconds
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
export function getDataByPK(end_point, _pk){
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
    error => handleErrorResponse('server')
  ).then(
    response_obj => response_obj,
    error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
  );
}
export function simplePostData(end_point, data){
  return fetch(
    process.env.REACT_APP_PROJECT_API+end_point,
    {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
        'Content-Type': 'application/json'  // JSON type
      },
      body: JSON.stringify(data)  // Data
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
    error => handleErrorResponse('server')
  );
}
