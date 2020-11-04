import React, { useState, useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import {
  indexOfInObjectArray,
  handleErrorResponse,
  getDataByPK,
  simplePostData
} from '../../functions';
import { PageTitle, SelectOptions_Procedimiento } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Procedimiento = props => {
  let __params__ = useParams()
  const [da, setDA] = useState(false);
  const [cita, setCita] = useState(false);

  const getData = () => {
    if(__params__.action=="editar") getDA(__params__.pk)
    else if(__params__.action=="agregar") getCita(__params__.pk)
    else window.history.back()
  }
  const getDA = da_pk => {
    getDataByPK('atencion/detalle', da_pk)
    .then(setDA)
  }
  const getCita = cita_pk => {
    getDataByPK('atencion/cita', cita_pk)
    .then(setCita)
  }
  function handleSubmit(){
    let data = {}
    data.procedimiento = document.getElementById('procedimiento').value;
    data.observaciones = document.getElementById('observaciones').value;
    data.precio = document.getElementById('cost').value;
    data.dues = document.getElementById('dues').value;
    data.pay_today = document.getElementById('pay_today').checked;
    data.payment_period = document.getElementById('payment_period').value;

    // API function
    (() => {
      if(cita){
        // New Procedimiento
        data.atencion = cita.atencion
        return simplePostData(`atencion/detalle/`, data, "POST")
      }else if(da){
        // Update Procedimiento
        return simplePostData(`atencion/detalle/${da.pk}/`, data, "PATCH")
      }
      return Promise.reject();
    })().then(
      () => getBack(),
      er => console.log("ERROR", er)
    )
  }
  const getBack = () => {
    window.history.back()
  }

  useEffect(() => {
    getData()
  }, [])

  return !da && !cita
  ? "loading"
  : (
  <>
    <PageTitle title={"Procedimiento"} />
    <ProcedimientoForm procedimiento={da} sucursal_pk={props.sucursal_pk} />
    <br/>
    <div className="d-flex">
      <button className="btn btn-light" onClick={() => handleSubmit()}>
        {da?"Guardar":"Agregar"}
      </button>

      <button className="btn btn-primary ml-auto" onClick={() => getBack()}>
        Regresar
      </button>
    </div>
  </>
  )
}
const ProcedimientoForm = props => {
  // Receive {procedimiento?}
  const [procedures, setProcedures] = useState(false);
  let procedure = props.procedimiento

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
    if(el.value=="0" || !el.value){
      document.getElementById("dues").value = "0";
      document.getElementById("payment_period").value = "0";
      document.getElementById("payment_period").disabled = true;
      document.getElementById("payment_period").options[0].disabled = false;
      document.getElementById("pay_today").checked = false;
      document.getElementById("pay_today").disabled = true;
    }else{
      if(document.getElementById("payment_period").value=="0") document.getElementById("payment_period").value = "1";
      document.getElementById("payment_period").disabled = false;
      document.getElementById("payment_period").options[0].disabled = true;
      document.getElementById("pay_today").checked = false;
      document.getElementById("pay_today").disabled = false;
    }
  }
  function handleProcedureChange(el){
    let inx = indexOfInObjectArray(procedures, 'procedimiento', el.value)
    if(inx==-1) return

    // Update coste
    window.document.getElementById('cost').value = procedures[inx].precio
  }

  useEffect(() => {
    getProcedures(props.sucursal_pk);
  }, []);
  useEffect(() => {
    if(!procedures) return;

    if(procedure){
      document.getElementById("payment_period").value = procedure.payment_period;
      document.getElementById("payment_period").disabled = procedure.payment_period==0;
      document.getElementById("pay_today").disabled = true;
    }else{
      document.getElementById("payment_period").value = "0";
      document.getElementById("payment_period").disabled = true;
      document.getElementById("pay_today").checked = false;
      document.getElementById("pay_today").disabled = true;
    }
  }, [procedures]);

  console.log("procedure", procedure);
  return !procedures
    ? "loading"
    : (
      <div>
        <div className="col-sm" style={{marginBottom: "10px"}}>
          <label className="form-label" htmlFor="programado">Programado: </label>
          <select className="custom-select form-control custom-select-lg"
            id="procedimiento" defaultValue={procedure?procedure.procedimiento:procedures[0].procedimiento}
            onChange={e => handleProcedureChange(e.target)} >
            <SelectOptions_Procedimiento procedimientos={procedures} />
          </select>
        </div>
        <div className="col-sm" style={{marginBottom: "10px"}}>
          <label className="form-label" htmlFor="observaciones">Observaciones</label>
          <textarea className="form-control" id="observaciones" rows="5" defaultValue={procedure?procedure.observaciones:""} ></textarea>
        </div>
        <div className="row col-sm">
          <div className="col-md-6" style={{marginBottom: "10px"}}>
            <label className="form-label" htmlFor="cost">Coste</label>
            <input type="number" className="form-control custom-select-lg" id="cost"
              min="0" defaultValue={procedure?procedure.precio_base:procedures[0].precio} />
          </div>
          <div className="col-md-6" style={{marginBottom: "10px"}}>
            <label className="form-label" htmlFor="dues">N° de cuotas</label>
            <input type="number" className="form-control custom-select-lg" id="dues"
              min="0" max="36" onChange={(e) => handlePeriodChange(e.target)}
              defaultValue={procedure?procedure.dues:"0"} />
          </div>
        </div>
        <div className="col-sm" style={{marginBottom: "10px"}}>
          <label className="form-label" htmlFor="payment_period">Periodo de pago</label>
          <select className="custom-select form-control custom-select-lg" id="payment_period">
            <option value="0">Sin cuotas</option>
            <option value="1">1 mes</option>
            <option value="2">2 meses</option>
            <option value="3">3 meses</option>
            <option value="4">4 meses</option>
            <option value="6">6 meses</option>
          </select>
        </div>
        <div className="col-sm">
          <div className="custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="pay_today" />
            <label className="custom-control-label" htmlFor="pay_today">Primer pago hoy? </label>
          </div>
        </div>
      </div>
    )
}

export default Procedimiento;
