import React, { useState, useEffect, useRef } from 'react';
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simplePostData,
  getDataByPK
} from '../../functions';
import { getPageHistory } from '../HandleCache';
import { PageTitle } from '../bits';
import { PatientForm } from '../admision/Admision';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_cobranza";


const Cobranza = props => {
  // Receive {data.patient, sucursal_pk, redirectTo}
  // This page will not be saved in cache nor data nor history
  const [selected_attention_detail, setSelectedAD] = useState([]);
  const [refresh, setRefresh] = useState(false);

  return (
  <>
    <PageTitle title={"Cobrar"} />

    <div className="row">
      <div className="col-lg-7">
        <PaymentForm
          redirectTo={props.redirectTo}
          setRefresh={setRefresh}
          attention_pk={props.data.attention_pk}
          selected={selected_attention_detail}
          sucursal_pk={props.sucursal_pk}
          patient={props.data.patient} />
      </div>
      <div className="col-lg-5">
        <div style={{marginTop: "30px", marginLeft: "20px"}}>
          <PatientDebtsTable
            selected={selected_attention_detail}
            select={setSelectedAD}
            refresh={refresh}
            setRefresh={setRefresh}
            patient={props.data.patient}/>
        </div>
      </div>
    </div>
  </>
  )
}
const PaymentForm = props => {
  // Receive {patient, selected, sucursal_pk, setRefresh}
  const [type, setType] = useState(1);  // Efectivo && Credito
  const [clienttype, setClientType] = useState(1);  // Natural && Empresa && Sin FE
  const [client, setClient] = useState(-1);  // Current Client (default:paciente redirected)
  const [knownclient, setNC] = useState(true);  // Paciente es Cliente

  useEffect(() => {
    if(clienttype==1){
      document.getElementById("client-dni").value = props.patient.dni;
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
      setNC(false)
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
        document.getElementById('client-razon-social').value = values&&values.razon_social?values.razon_social:"";
    }
  }
  // Form submit function
  const handleSubmit = () => {
    // Check selected attention detail
    if(props.selected.length==0){
      handleErrorResponse("custom", "Error", "Debe seleccionar los elementos a cobrar en el panel de la derecha")
      return;
    }

    // Client exists
    if(knownclient)
      if(client) savePayment(client)
      else handleSubmit_ClientRegular()  // Regular
    else  // New client
      if(clienttype==1) handleSubmit_ClientRegular()  // Regular
      else if(clienttype==2) handleSubmit_ClientEmpresa()  // Enterprise
      else if(clienttype==3) saveNoPayment()  // No FE
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
      if(!/^\d+$/.test(_tmp.value)){
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
      if(!/^\d+$/.test(_tmp.value)){
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

    // Set data format
    let data = {
      // detallecuentacorriente: 0,  // selected dcc's pk
      monto: 0,
      origen_pago: "1",
    }
    // Send payment
    props.selected.reduce(
      (promise_chain, item) => promise_chain.then(() => simplePostData(
        'finanzas/cuentacorriente/pago/create/',
        {detallecuentacorriente: item, ...data}
      )), Promise.resolve()
    )
    .then(res => handleErrorResponse("custom", "Exito", "Se ha realizado el pago correctamente", "info"))
    .finally(res => props.setRefresh(true))
    .catch(er => console.log("ERROR", er))
  }
  const saveNoPayment = () => {
    // Pago sin FE
    props.selected.reduce(
      (promise_chain, pk) => promise_chain.then(() => simplePostData(
        'finanzas/cuentacorriente/pago/nofe/',
        {pk: pk}
      )), Promise.resolve()
    )
    .then(res => handleErrorResponse("custom", "Exito", "Se ha realizado el pago correctamente", "info"))
    .finally(res => props.setRefresh(true))
    .catch(er => console.log("ERROR", er))
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
        <label className={"btn btn-outline-info waves-effect waves-themed "+(clienttype===3?'active':'')} onClick={()=>setClientType(3)}>
          <input type="radio" name="odontogram_type" /> Sin FE
        </label>
      </div>

      <div style={{paddingTop: "20px"}}>
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
          ) : clienttype==2
          ? (
            <div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-ruc">RUC: </label>
                <input type="text" id="client-ruc" className="form-control"
                  maxLength="11" onChange={(e)=>inputChange_RUC(e.target.value)} />
              </div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-razon-social">Razón Social: </label>
                <input type="text" id="client-razon-social" className="form-control" disabled={knownclient && clienttype==2} />
              </div>
              <div className="col-sm" style={{paddingBottom: "5px"}}>
                <label className="form-label" htmlFor="client-address">Dirección: </label>
                <input type="text" id="client-address" className="form-control" disabled={knownclient && clienttype==2} />
              </div>
            </div>
          ) : ""
        }

        {clienttype!=3
          ? (
            <div className="col-sm" style={{paddingBottom: "5px"}}>
              <label className="form-label" htmlFor="client-phone">Número de contacto: </label>
              <input type="text" id="client-phone" className="form-control" maxLength="9" disabled={knownclient} />
            </div>
          )
          : <div className="card-body"><h5>Emitir comprobante manualmente</h5></div>
        }
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
const PatientDebtsTable = props => {
  // Receive {patient, selected, select, refresh, setRefresh}
  const [dccs, setDebts] = useState(false);

  const getCuentaCorrienteDebts = () => {
    // Get patient's not paid dccs
    let filter = `filtro={"cliente_dni":"${props.patient.dni}", "estado_pago_not":"3"}`;
    let url = process.env.REACT_APP_PROJECT_API+`finanzas/cuentacorriente/detalle/`;
    url = url + '?' + filter;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(setDebts,
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  const checkbox_addToSelectedOnes = dcc_pk => {
    if(props.selected.includes(dcc_pk)) props.select(props.selected.filter(v=>v!=dcc_pk))
    else props.select([...props.selected, dcc_pk])
  }

  useEffect(() => {
    getCuentaCorrienteDebts(props.attention_pk)
  }, []);

  if(props.refresh){
    // refresh values
    props.select([]);
    props.setRefresh(false);
    getCuentaCorrienteDebts()
  }

  return !dccs
    ? "loading"
    : (
      <table style={{fontSize: "1.2em"}}>
        <thead>
          <tr>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
            </td>
          </tr>
          {dccs.map(dcc => (
            <tr key={dcc.pk}>
              <td className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input"
                  id={"pay-"+dcc.pk} checked={props.selected.includes(dcc.pk)}
                  onChange={(e)=>checkbox_addToSelectedOnes(dcc.pk)} />
                <label className="custom-control-label" htmlFor={"pay-"+dcc.pk}>{cFL(dcc.procedimiento)}</label>
              </td>
              <td style={{paddingLeft: "10px"}}> <code>{dcc.deuda}</code> de <code>{dcc.precio}</code> </td>
              <td>
                <span className={"badge badge-warning badge-pill"}>Debe</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td style={{paddingTop: "10px"}}></td></tr>
          <tr>
            <td>
              <label htmlFor="pay-all">Total: </label>
            </td>
            <td style={{paddingLeft: "10px"}}> <code>{dccs.reduce((t,i)=>(t+i.deuda), 0)}</code> </td>
          </tr>
        </tfoot>
      </table>
    )
}


export default Cobranza;
