export function postCacheData(data){
  if(typeof data != "object") return;  // Only accept object types
  // Save current page data (url, history.length)

  // Walk data param and add each individually with setItem
  // (data can't merge it all with Object.assign 'cuz localStorage is read only)
  for(let a in data) window.localStorage.setItem(a, data[a])

  return true;
}
export function getCacheData(key){
  if(!window.localStorage.hasOwnProperty(key)) return false;  // If there is no data

  // Return data from key
  let data = window.localStorage.getItem(key);
  // Return json parsed data
  return JSON.parse(data)
}
// Crypt
export const encryptData = data => {
  if(typeof data != "string" && typeof data != "number"){
    if(process.env.REACT_APP_DEBUG=="true") console.error("ERROR, data is not string in functions.js function encryptData");
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
