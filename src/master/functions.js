export function handleErrorResponse(type, ...data){
  let _id = false;
  if(type==='server'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-server')){
      console.error("DOM 'alert-server' NOT FOUND");
      return;
    }

    _id = 'alert-server';
  }else if(type==='permission'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-permission')){
      console.error("DOM 'alert-permission' NOT FOUND");
      return;
    }

    _id = 'alert-permission';
  }else if(type==='login'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-login')){
      console.error("DOM 'alert-login' NOT FOUND");
      return;
    }

    _id = 'alert-login';
  }else if(type==='custom'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-custom')){
      console.error("DOM 'alert-login' NOT FOUND");
      return;
    }

    _id = 'alert-custom';
    if(data.length!=2) return;
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
  }, 2500, _id)
  setTimeout(function(id){
    if(document.getElementById(id))
      document.getElementById(id).style.display = "none"
  }, 2700, _id)
}
export function capitalizeFirstLetter(word, restLowerCase=true){
  return word[0].toUpperCase()
    + (restLowerCase
      ? word.slice(1, word.length).toLowerCase()
      : word.slice(1, word.length)
    );
}
