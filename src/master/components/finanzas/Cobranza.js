import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse } from '../../functions';
import { getPageHistory } from '../HandleCache';
import { PageTitle } from '../bits';
import { DebtsTable } from '../atencion/Atencion';
import { PatientForm } from '../admision/Admision';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_cobranza";


const Cobranza = props => {
  // Receive {data.atencion, data.patient, sucursal_pk, redirectTo}
  // This page will not be saved in cache nor data nor history

  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname);
  }
  const handleSubmit = () => {
    console.log("submit");
  }

  return (
  <>
    <PageTitle title={"Prescripción"} />

    <div className="row">
      <div className="col-lg-8">
        <PaymentForm
          patient={props.data.patient} />
      </div>
      <div className="col-lg-4">
        <div style={{marginTop: "30px", marginLeft: "20px"}}>
          <DebtsTable
            attention_pk={props.data.atencion}/>
        </div>
      </div>
    </div>
  </>
  )
}
const PaymentForm = props => {
  // Receive {patient}
  const [type, setType] = useState(1);
  const [clienttype, setClientType] = useState(1);
  const [newCustomerForm, setNCF] = useState(false);

  useEffect(() => {
    if(clienttype==1 && document.getElementById("client-dni")){
      document.getElementById("client-dni").value = props.patient.dni;
    }
  }, [clienttype]);

  const inputChange_DNI = (val) => {
    if(val != props.patient.dni) setNCF(true)
    else setNCF(false)
  }
  const handleSubmit = () => {
    let data =
    clienttype==1
    ? handleSubmit_Regular()
    : clienttype==2
    ? handleSubmit_Empresa()
    : false;

    if(data==false) return;
    savePayment(data);
  }
  const handleSubmit_Empresa = () => {
  }
  const handleSubmit_Regular = () => {
    // Values validation
    let _tmp1;
    _tmp1 = document.getElementById("name-pric");
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Nombre principal no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("name-sec");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Nombre secundario no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("ape-p");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido paterno no especificado");
      return;
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido paterno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("ape-m");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido materno no especificado");
      return;
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido materno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("dni");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "DNI no especificado");
      return;
    }
    if(_tmp1.value.trim().length!=8){
      handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos");
      return;
    }
    if(isNaN(parseInt(_tmp1.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números");
      return;
    }

    let _tmp = {
      nombre_principal: document.getElementById('name-pric').value,
      nombre_secundario: document.getElementById('name-sec').value,
      ape_paterno: document.getElementById('ape-p').value,
      ape_materno: document.getElementById('ape-m').value,
      dni: document.getElementById('dni').value,
    }
  }
  const savePayment = () => {
    console.log("savePayment");
  }

  return (
    <div>
      <div className="btn-group btn-group-toggle" data-toggle="buttons">
        <label className={"btn btn-outline-info waves-effect waves-themed "+(type===1?'active':'')} onClick={()=>setType(1)}>
          <input type="radio" name="odontogram_type" defaultChecked /> Efectivo
        </label>
        <label className={"btn btn-outline-info waves-effect waves-themed "+(type===2?'active':'')} onClick={()=>setType(2)}>
          <input type="radio" name="odontogram_type" /> Credito
        </label>
      </div>
      <div style={{marginLeft: "20px"}} className="btn-group btn-group-toggle" data-toggle="buttons">
        <label className={"btn btn-outline-info waves-effect waves-themed "+(clienttype===1?'active':'')} onClick={()=>setClientType(1)}>
          <input type="radio" name="odontogram_type" defaultChecked /> Boleta
        </label>
        <label className={"btn btn-outline-info waves-effect waves-themed "+(clienttype===2?'active':'')} onClick={()=>setClientType(2)}>
          <input type="radio" name="odontogram_type" /> Factura
        </label>
      </div>

      <div style={{paddingTop: "20px"}}>
        {type==2 && <CreditType /> || ""}

        {clienttype==1
          ? (
            <div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-dni">DNI: </label>
                <input type="text" id="client-dni" className="form-control" maxLength="8" onChange={(e)=>inputChange_DNI(e.target.value)} />
              </div>
              {newCustomerForm ? <NewCustomerForm /> : ""}
            </div>
          ) : (
            <div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-ruc">RUC: </label>
                <input type="text" id="client-ruc" className="form-control" maxLength="11" />
              </div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-razon-social">Razón Social: </label>
                <input type="text" id="client-razon-social" className="form-control" />
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
const NewCustomerForm = props => {
  return (
    <div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-p">Apellido parterno: </label>
        <input type="text" id="ape-p" className="form-control" />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="dni">DNI: </label>
        <input type="text" id="dni" className="form-control" maxLength="8" />
      </div>
    </div>
  )
}
const CreditType = props => {
  return (
    "C"
  )
}
const ConfirmationModal = props => {
  return (
    "ConfirmationModal"
  )
}

export default Cobranza;

/*
* Cobro (costs list, payment form (switch between efective/credit))
*/
