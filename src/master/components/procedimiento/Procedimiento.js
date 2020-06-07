import React, { useState, useEffect, useRef } from 'react';
import { Switch, Route, Redirect, Link, useHistory } from "react-router-dom";
import { handleErrorResponse, getDataByPK, simplePostData } from '../../functions';
import { PageTitle, SelectOptions_Procedimiento } from '../bits';
import { getPageHistory } from '../HandleCache';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_procedure";


const Procedimiento = props => {
  // Receive {data.procedimiento?}

  function handleSubmit(){
    let data = {}
    data.procedimiento = document.getElementById('procedimiento').value;
    data.observaciones = document.getElementById('observaciones').value;
    data.dues = document.getElementById('dues').value;
    data.payment_period = document.getElementById('payment_period').value;

    // API function
    (() => {
      if(props.data.cita){
        // New Procedimiento
        data.atencion = props.data.cita.atencion
        return simplePostData(`atencion/detalle/`, data, "POST")
      }else if(props.data.procedimiento){
        // Update Procedimiento
        return simplePostData(`atencion/detalle/${props.data.procedimiento}/`, data, "PATCH")
      }
      return Promise.reject();
    })().then(
      res => {
        console.log(res);
        // Redirect to attention
        props.redirectTo('/nav/atencion/detalle', {cita: props.cita});
      },
      er => console.log("ERROR", er)
    )
  }
  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname, {cita: props.cita});
  }

  return (
  <>
    <PageTitle title={"Procedimiento"} />
    <ProcedimientoForm procedimiento={props.data.procedimiento} sucursal_pk={props.sucursal_pk} />
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
  // Receive {procedure}
  const [procedures, setProcedures] = useState(false);
  const [procedure, setProcedure] = useState(false);

  function getProcedureDataToUpdate(){
    getDataByPK(`atencion/detalle`, props.procedimiento)
    .then(setProcedure,
      er => console.log(er)
    )
  }
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
    document.getElementById("payment_period").disabled = el.value=="1" ? true:false
  }

  useEffect(() => {
    getProcedures(props.sucursal_pk);
    // Get procedure to edit
    if(props.procedimiento)
      getProcedureDataToUpdate();
  }, []);
  useEffect(() => {
    if(!procedure) return;

    document.getElementById('payment_period').value = procedure.payment_period;
  }, [procedure]);

  return !procedures
    ? "loading"
    : (
      <div>
        <div className="col-sm">
          <label className="form-label" htmlFor="programado">Programado: </label>
          <select className="custom-select form-control custom-select-lg"
            id="procedimiento" defaultValue={procedure?procedure.procedimiento:""} >
            <SelectOptions_Procedimiento procedimientos={procedures} />
          </select>
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="observaciones">Observaciones</label>
          <textarea className="form-control" id="observaciones" rows="5" defaultValue={procedure?procedure.observaciones:""} ></textarea>
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="dues">N° de cuotas</label>
          <input type="number" className="form-control custom-select-lg" id="dues" defaultValue="1"
            min="1" max="36" onChange={(e) => handlePeriodChange(e.target)}
            defaultValue={procedure?procedure.dues:""} />
        </div>
        <br/>
        <div className="col-sm">
          <label className="form-label" htmlFor="payment_period">Periodo de pago</label>
          <select className="custom-select form-control custom-select-lg"
            disabled={procedure&&procedure.dues==1} id="payment_period">
              <option value="1">1 mes</option>
              <option value="2">2 meses</option>
              <option value="3">3 meses</option>
              <option value="4">4 meses</option>
              <option value="6">6 meses</option>
          </select>
        </div>
      </div>
    )
}

export default Procedimiento;
