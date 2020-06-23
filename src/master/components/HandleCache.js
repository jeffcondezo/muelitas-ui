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
// Crypt
export const encryptData = data => {
  if(typeof data != "string" && typeof data != "number"){
    if(process.env.REACT_APP_DEBUG) console.error("ERROR, data is not string in functions.js function encryptData");
    return ""  // Default to handle error
  }
  data = String(data)

  // key's length according to data
  let key = "$57#$#56321a5grxlr8a";
  let new_key = key
  while(new_key.length < data.length) new_key += key
  key = new_key
  // encrypt
  return data.split("")  // Slit to array
  .map( (x, inx) => x.charCodeAt(0) ^ key.charCodeAt(inx) )  // XOR operation
  .map(y => String.fromCharCode(y))  // To character
  .join("")  // Join array
}
export const decryptData = code => {
  // key's length according to code
  let key = "$57#$#56321a5grxlr8a";
  let new_key = key
  while(new_key.length < code.length) new_key += key
  key = new_key
  // decrypt
  return code.split("")  // Slit to array
  .map( (x, inx) => x.charCodeAt(0) ^ key.charCodeAt(inx) )  // XOR operation
  .map(y => String.fromCharCode(y))  // To character
  .join("")  // Join array
}
