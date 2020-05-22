// This is a system architecture paper
//  here standar code style is specified

/* Request to API
* Standar Fetch and Promise flux
*/
const StandarFetchAndPromise(){
  // Description of endpoint and fetch purpose
  /* Send all values as string */
  let filter = `filtro={"filter_name":"filter_value"}`;
  // let filter = `filtro={"filter_name":"${var_name}"}`;  // We could use ${} too
  let url = process.env.REACT_APP_PROJECT_API+`module/endpoint/`;
  url = url + '?' + filter;
  // Generate promise
  let result = new Promise((resolve, reject) => {
    // Fetch data to api
    let request = fetch(url, {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('access_token'),  // Token
        'Content-Type': 'application/json'  // JSON type
      },
      body: JSON.stringify(request_data)  // Data
    });
    // Once we get response we either return json data or error
    request.then(response => {
      if(response.ok){
        resolve(response.json())
      }else{
        // Handle permission error
        /**/

        reject(response.statusText)
      }
    }, () => handleErrorResponse('server'));  // Print server error
  });
  result.then(
    response_obj => {  // In case it's ok
      console.log(response_obj);
      /* Here goes 'ur code */
    },
    error => {  // In case of error
      console.log("WRONG!", error);
    }
  );
} /* FIN --- Request to API */
/* Chain function to save object
* Return promise to be chained in saveAll function
*/
const saveObjectToAPI = _obj => {
  // Return Promise object
  return fetch(
      // Make request
      process.env.REACT_APP_PROJECT_API+`module/endpoint/`,
      {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          'Content-Type': 'application/json'  // JSON type
        },
        body: JSON.stringify(_obj)  // Data
      }
    ).then(
      // Response handling
      response => (
        response.ok
        // Handle error response
        ? response.json()  // Continue with json data
        : response.status==403
        ? handleErrorResponse('permission')
        : Promise.reject()  // Reject to execute next then's error function
      ),
      error => handleErrorResponse('server')
    ).then(
      // Handle individual response object
      response_obj => props.addMedicineToList(response_obj),
      error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
    );
}
const saveAll = (_obj_list) => {
  _obj_list.reduce(
    (promise_chain, item) => promise_chain.then(saveObjectToAPI(item)),
    Promise.resolve()
  ).then(
    response_obj => {
      console.log("FINALIZADO");
      /* Here goes your code */
    },
    error => {
      console.log(error);
    }
  );
}
