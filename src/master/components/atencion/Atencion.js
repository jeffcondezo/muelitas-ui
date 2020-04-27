import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UNSAFE_cache_postState,
  UNSAFE_cache_getState,
  savePageHistory,
} from '../HandleCache';

function Atencion(props){
  const cita = useRef(props.data.cita?props.data.cita:null);

  function getDetalleAtencion(){
    if(!cita) return;
    /* Promise as a component
    * We don't use Promise and Fetch as components 'cuz we need to customize a lot of its properties
    * that'd result in a function with much parameters than it'd less verbose
    */
    // Get plan trabajo
    // let filter = `filtro={"atencion":"${cita.atencion_id}"}`;
    let filter = `filtro={"atencion":"${1}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/detalle/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        console.log(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  getDetalleAtencion();

  useEffect(() => {
    savePageHistory();  // Save page history

    return () => {
      console.log("UNMOUNTING");
      alert("UNMOUNT");
    }
  }, []);

  return(
  <>
    {/* ALERTS */}
    <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
        <strong>Error</strong> No se ha podido establecer conexión con el servidor.
    </div>
    <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
        <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
    </div>

    {/* HEADER */}
    <div className="subheader">
      <h1 className="subheader-title">
        <i className="subheader-icon fal fa-chart-area"></i> Atencion
      </h1>
    </div>

  </>
  )
}

export default Atencion;
