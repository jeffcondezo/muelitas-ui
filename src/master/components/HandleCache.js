export function UNSAFE_cache_postState(name, data){
  window.localStorage.setItem(name, JSON.stringify(data));  // Add data to cache
  return true;
}
export function UNSAFE_cache_getState(name){
  if(!window.localStorage.hasOwnProperty(name)) return false;  // If there is no data

  let data = window.localStorage.getItem(name);  // Get data from cache
  return JSON.parse(data);
}
export function savePageHistory(data_pk={}){
  // Save current page data (url, history.length)
  window.localStorage.setItem('prev_page', JSON.stringify({
    prev_pathname: window.location.pathname,  // Current page pathname
    prev_length: window.history.length,  // Current history length
    data: data_pk,  // Current page data's pk
  }));
  return true;
}
export function getPageHistory(){
  if(!window.localStorage.hasOwnProperty('prev_page')) return false;  // If there is no data

  // Return previous page url
  let data = window.localStorage.getItem('prev_page');
  return JSON.parse(data);
}
export function getCacheData(){
  if(!window.localStorage.hasOwnProperty('prev_page')) return false;  // If there is no data

  // Return previous page data's pk
  let data = window.localStorage.getItem('prev_page');
  return JSON.parse(data).data;
}

function cryptData(){  // Missing declaration && implementation
  return false;
}
