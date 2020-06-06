import React, { useState, useEffect, useRef } from 'react';
import { Switch, Route, Redirect, Link, useHistory } from "react-router-dom";
import { handleErrorResponse } from '../../functions';
import { PageTitle, SelectOptions_Procedimiento } from '../bits';
import { getPageHistory } from '../HandleCache';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_procedure";


const Procedimiento = props => {
  // Receive {data.procedimiento?}
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
        props.redirectTo('/nav/atencion/detalle', {cita: props.cita});
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  function handleSubmit(){
    console.log(props);
    return;
    saveProcedure(
      props.cita.atencion,
      document.getElementById('procedimiento').value,
      document.getElementById('observaciones').value,
    );
  }
  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname, {cita: props.cita});
  }

  return (
  <>
    <PageTitle title={"Procedimiento"} />
    <ProcedimientoForm data={props.procedimiento} sucursal_pk={props.sucursal_pk} />
    <br/>
    <div className="d-flex">
      <button className="btn btn-light" onClick={() => handleSubmit()}>
        Agregar
      </button>

      <button className="btn btn-primary ml-auto" onClick={() => getBack()}>
        Regresar
      </button>
    </div>
  </>
  )
}
const ProcedimientoForm = props => {
  // Receive {procedimiento}
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
  function handlePeriodChange(el){
    document.getElementById("period").disabled = el.value=="1" ? true:false
  }

  useEffect(() => {
    getProcedures(props.sucursal_pk);
  }, []);

  return !procedures
    ? "loading"
    : (
      <div>
        <div className="col-sm">
          <label className="form-label" htmlFor="programado">Programado: </label>
          <select id="procedimiento" className="custom-select form-control custom-select-lg">
            <SelectOptions_Procedimiento procedimientos={procedures} />
          </select>
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="observaciones">Observaciones</label>
          <textarea className="form-control" id="observaciones" rows="5"></textarea>
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="dues">N° de cuotas</label>
          <input type="number" className="form-control" id="dues" defaultValue="1"
            min="1" max="36" onChange={(e) => handlePeriodChange(e.target)} />
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="period">Periodo de pago</label>
          <select id="period" disabled className="custom-select form-control custom-select-lg">
            <option value="1">1 mes</option>
          </select>
        </div>
      </div>
    )
}

export default Procedimiento;
