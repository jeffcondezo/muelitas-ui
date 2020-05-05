export function handleErrorResponse(type){
  if(type==='server'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-server')){
      console.error("DOM 'alert-server' NOT FOUND");
      return;
    }

    document.getElementById('alert-server').style.display = "block"
    document.getElementById('alert-server').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-server'))
        document.getElementById('alert-server').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-server'))
      document.getElementById('alert-server').style.display = "none"
    }, 2700)
  }else if(type==='permission'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-permission')){
      console.error("DOM 'alert-permission' NOT FOUND");
      return;
    }

    document.getElementById('alert-permission').style.display = "block"
    document.getElementById('alert-permission').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-permission'))
        document.getElementById('alert-permission').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-permission'))
        document.getElementById('alert-permission').style.display = "none"
    }, 2700)
  }else if(type==='login'){
    // Check if element exist in DOM
    if(!document.getElementById('alert-login')){
      console.error("DOM 'alert-login' NOT FOUND");
      return;
    }

    document.getElementById('alert-login').style.display = "block"
    document.getElementById('alert-login').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-login'))
        document.getElementById('alert-login').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-login'))
        document.getElementById('alert-login').style.display = "none"
    }, 2700)
  }
}
export function capitalizeFirstLetter(word, restLowerCase=true){
  return word[0].toUpperCase()
    + (restLowerCase
      ? word.slice(1, word.length).toLowerCase()
      : word.slice(1, word.length)
    );
}
