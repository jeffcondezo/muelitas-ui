import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse, simplePostData } from '../../functions';
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

  return (
  <>
    <PageTitle title={"Cobrar"} />

    <div className="row">
      <div className="col-lg-8">
        <PaymentForm
          redirectTo={props.redirectTo}
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
  const [client, setClient] = useState(-1);
  const [knownclient, setNC] = useState(true);

  useEffect(() => {
    if(clienttype==1){
      document.getElementById("client-dni").value = props.patient.dni;
      setNC(true);
      setValues(props.patient);
    }else{
      setValues(false);
      if(document.getElementById('client-ruc'))
        document.getElementById('client-ruc').value = "";
    }
  }, [clienttype]);
  useEffect(() => {
    if(client==-1) getClient('dni', props.patient.dni);
    if(client==false){
      setValues(props.patient)
      return;
    }

    setNC(true)
    setValues(client);  // Set values
  }, [client]);
  useEffect(() => {
    if(knownclient) return;

    setValues(false);
  }, [knownclient]);

  // Extras
  const getBack = () => props.redirectTo(getPageHistory().prev_pathname);
  const inputChange_DNI = (val) => {
    if(val.trim().length==8) getClient('dni', val)
    else setNC(false);
  }
  const inputChange_RUC = (val) => {
    if(val.trim().length==11) getClient('ruc', val)
    else setNC(false)
  }
  const getClient = (type, val) => {
    fetch(
      process.env.REACT_APP_PROJECT_API+`finanzas/cliente/?filtro={"${type}":"${val}"}`,
      {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      }
    ).then(
      response => (
        response.ok
        ? response.json()
        : response.status==403
        ? handleErrorResponse('permission')
        : Promise.reject()
      ),
      error => handleErrorResponse('server')
    ).then(
      response_obj => {setClient(response_obj.length!=0?response_obj[0]:false)},
      error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
    );
  }
  const setValues = (values) => {
    if(clienttype==1){
      if(document.getElementById('name-pric'))
        document.getElementById('name-pric').value = values?values.nombre_principal:"";
      if(document.getElementById('name-sec'))
        document.getElementById('name-sec').value = values?values.nombre_secundario:"";
      if(document.getElementById('ape-p'))
        document.getElementById('ape-p').value = values?values.ape_paterno:"";
      if(document.getElementById('ape-m'))
        document.getElementById('ape-m').value = values?values.ape_materno:"";
    }else{
      if(document.getElementById('client-razon-social'))
        document.getElementById('client-razon-social').value = values?values.razon_social:"";
    }
  }
  // Form submit function
  const handleSubmit = () => {
    // Client exists
    if(knownclient)
      if(client) savePayment(client)
      else handleSubmit_ClientRegular()  // Regular
    else  // New client
      if(clienttype==1) handleSubmit_ClientRegular()  // Regular
      else if(clienttype==2) handleSubmit_ClientEmpresa()  // Enterprise
  }
  // Save form as client
  const handleSubmit_ClientEmpresa = () => {
    // Validate
    let _tmp;
    _tmp = document.getElementById("client-ruc");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Ha ocurrido un error, por favor actualice la pagina");
      return;
    }
    if(_tmp.value.trim().length!=11){
      handleErrorResponse("custom", "Error", "El ruc debe tener 11 digitos");
      return;
    }
    if(isNaN(parseInt(_tmp.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números");
      return;
    }

    _tmp = document.getElementById("client-razon-social");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Ha ocurrido un error, por favor actualice la pagina");
      return;
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Debe especificar la razón social de la empresa");
      return;
    }

    _tmp = document.getElementById("client-phone");
    if(_tmp && !!_tmp.value){
      if(_tmp.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos");
        return;
      }
      if(isNaN(parseInt(_tmp.value))){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos");
        return;
      }
    }


    let _tmp1 = {
      razon_social: document.getElementById("client-razon-social").value,
      ruc_: document.getElementById("client-ruc").value,  // Artifice to get_or_create
    }
    if(document.getElementById("client-phone").value.length!=0)
      _tmp1.celular = document.getElementById("client-phone").value;

    getOrCreateNewClient(_tmp1)
  }
  const handleSubmit_ClientRegular = () => {
    // Validate
    let _tmp;
    _tmp = document.getElementById("name-pric");
    if(!_tmp || _tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Nombre principal no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp = document.getElementById("name-sec");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Nombre secundario no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp = document.getElementById("ape-p");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Apellido paterno no especificado");
      return;
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido paterno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp = document.getElementById("ape-m");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Apellido materno no especificado");
      return;
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido materno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp = document.getElementById("client-dni");
    if(!_tmp){
      handleErrorResponse("custom", "Error", "DNI no especificado");
      return;
    }
    if(_tmp.value.trim().length!=8){
      handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos");
      return;
    }
    if(isNaN(parseInt(_tmp.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números");
      return;
    }

    _tmp = document.getElementById("client-phone");
    if(_tmp && !!_tmp.value){
      if(_tmp.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos");
        return;
      }
      if(isNaN(parseInt(_tmp.value))){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos");
        return;
      }
    }


    let _tmp1 = {
      nombre_principal: document.getElementById('name-pric').value,
      nombre_secundario: document.getElementById('name-sec').value,
      ape_paterno: document.getElementById('ape-p').value,
      ape_materno: document.getElementById('ape-m').value,
      dni_: document.getElementById('client-dni').value,  // Artifice to get_or_create
    }
    if(document.getElementById("client-phone").value.length!=0)
      _tmp1.celular = document.getElementById("client-phone").value;

    getOrCreateNewClient(_tmp1)
  }
  // Get/Create client from API
  const getOrCreatePaciente = (_patient_pk) => {
    simplePostData(`finanzas/cliente/paciente/${_patient_pk}/`, {})
    .then(
      response_obj => setClient(response_obj),
      error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
    );
  }
  const getOrCreateNewClient = (data) => {
    simplePostData(`finanzas/cliente/`, data)
    .then(
      response_obj => savePayment(response_obj),
      error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
    );
  }

  // Save payment
  const savePayment = (_client) => {
    setClient(_client)
    console.log("savePayment", _client);
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
                <input type="text" id="client-dni" className="form-control"
                  maxLength="8" onChange={(e)=>inputChange_DNI(e.target.value)} />
              </div>
              <NewCustomerForm disabled={knownclient} />
            </div>
          ) : (
            <div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-ruc">RUC: </label>
                <input type="text" id="client-ruc" className="form-control"
                  maxLength="11" onChange={(e)=>inputChange_RUC(e.target.value)} />
              </div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-razon-social">Razón Social: </label>
                <input type="text" id="client-razon-social" className="form-control" disabled={knownclient} />
              </div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-address">Dirección: </label>
                <input type="text" id="client-address" className="form-control" disabled={knownclient} />
              </div>
            </div>
          )
        }

        <div className="col-sm" style={{paddingBottom: "5px"}}>
          <label className="form-label" htmlFor="client-phone">Número de contacto: </label>
          <input type="text" id="client-phone" className="form-control" maxLength="9" disabled={knownclient} />
        </div>
      </div>

      <div className="col-sm d-flex" style={{paddingTop: "30px"}}>
        <button className="btn btn-primary" onClick={() => handleSubmit()}>
          Guardar
        </button>

        <button className="btn btn-light ml-auto" onClick={() => getBack()}>
          Regresar
        </button>
      </div>
    </div>
  )
}
const NewCustomerForm = props => {
  return (
    <div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" disabled={!!props.disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" disabled={!!props.disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-p">Apellido paterno: </label>
        <input type="text" id="ape-p" className="form-control" disabled={!!props.disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" disabled={!!props.disabled} />
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
* Show CuentaCorriente debts
* Open CuentaCorriente
* Handle credit payment
*/
