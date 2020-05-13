import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse } from '../../functions';
import { SelectOptions_Procedimiento } from '../bits';
import { getPageHistory } from '../HandleCache';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_procedure";


const Procedimiento = props => {
  return (
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
        <i className="subheader-icon fal fa-chart-area"></i> Procedimiento
      </h1>
    </div>

    <AddProcedure cita={props.data.cita} sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
  </>
  )
}

const AddProcedure = props => {
  const [procedures, setProcedures] = useState(false);

  function getProcedures(_sucursal_pk){
    // Add procedure to cita's attention
    let filter = `filtro={"sucursal":"${_sucursal_pk}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`maestro/procedimiento/precio/`;
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
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok
        setProcedures(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  function saveProcedure(_atencion, _procedure_pk, _observaciones){
    // Add procedure to cita's attention
    let url = process.env.REACT_APP_PROJECT_API+`atencion/detalle/`;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          'Content-Type': 'application/json'  // JSON type
        },
        body: JSON.stringify({
          atencion: String(_atencion),
          procedimiento: String(_procedure_pk),
          observaciones: String(_observaciones),
        })  // Data
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok
        // Redirect to attention
        props.redirectTo('/nav/atencion/', {cita: props.cita});
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  function handleSubmit(){
    saveProcedure(
      props.cita.atencion,
      document.getElementById('procedimiento').value,
      document.getElementById('observaciones').value,
    );
  }
  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname, {cita: props.cita});
  }

  useEffect(() => {
    getProcedures(props.sucursal_pk);
  }, []);

  return !procedures
    ? "loading"
    : (
      <div className="form-group col-md-12">
        <div className="col-sm">
          <label className="form-label" htmlFor="programado">Programado: </label>
          <select id="procedimiento" className="custom-select form-control custom-select-lg">
            <SelectOptions_Procedimiento procedimientos={procedures} />
          </select>
        </div>

        <div className="col-sm" style={{height: "160px"}}>
          <label className="form-label" htmlFor="observaciones">Observaciones</label>
          <textarea className="form-control" id="observaciones" rows="5"></textarea>
        </div>

        <div className="col-sm d-flex">
          <button className="btn btn-light" onClick={() => handleSubmit()}>
            Agregar
          </button>

          <button className="btn btn-primary ml-auto" onClick={() => getBack()}>
            Regresar
          </button>
        </div>
      </div>
    );
}

export default Procedimiento;
