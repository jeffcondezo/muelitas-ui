import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  simpleGet,
  simplePostData,
  addRequestValidation,
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
} from '../../functions'
import { NavigationContext } from '../Navigation';

const __debug__ = process.env.REACT_APP_DEBUG


const MassiveNotification = ({sucursal_pk}) => {
  const [patients, setPatients] = useState(false)
  let [checkbox_now, setCheckboxNow] = useState(true)
  const age_options = useRef([]).current
  // Current sucursal
  const ctx_nv = useContext(NavigationContext)
  let cur_suc = ctx_nv.sucursales.find(s => s.pk==ctx_nv.current_sucursal)
  let signature = `- ${cur_suc.empresa_data.nombre_comercial.toUpperCase()}`
  // Current datetime
  let _dt = new Date()
  let datetime_now = _dt.toDateInputValue()+'T'+_dt.getHours()+":"+String(_dt.getMinutes()).padStart(2, "0")
  const mn_style = {
    inline: {display: "inline-block"},
    block: {display: "block"},
    marginRight: {marginRight: "10px"},
  }

  const getAllPatients = () => {
    let _sucursal_pk = sucursal_pk
    // Filter
    let _filter = `?filtro={"p_notificacion": true`
    if(patients){
      let _tmp = null
      /*
      _tmp = window.document.getElementById('mn-date-from').value
      if(_tmp!="") _filter += `,"p_date_from":"${_tmp}"`
      _tmp = window.document.getElementById('mn-date-to').value
      if(_tmp!="") _filter += `,"p_date_to":"${_tmp}"`
      */
      _tmp = window.document.getElementById('mn-sexo').value
      if(_tmp!="0") _filter += `,"p_sexo":${_tmp}`
      _tmp = window.document.getElementById('mn-age-min').value
      if(_tmp!="0") _filter += `,"p_age_min":${_tmp}`
      _tmp = window.document.getElementById('mn-age-max').value
      if(_tmp!="0") _filter += `,"p_age_max":${_tmp}`
    }
    _filter += `}`
    // Request
    simpleGet(`atencion/paciente/sucursal/${_sucursal_pk}/`+_filter)
    .then(res => setPatients(res.map(pxs => pxs.paciente)))
  }
  const saveMassiveNotification = () => {
    if(__debug__) console.log("MassiveNotification saveMassiveNotification");

    let data = {
      message: window.document.getElementById('mn-msg').value.trim(),
      now: window.document.getElementById('mn-now').checked,
      fecha: window.document.getElementById('mn-fecha').value.split('T')[0],
      hora: window.document.getElementById('mn-fecha').value.split('T')[1],
      patients: patients.map(p => p.pk)
    }
    // Add signature
    data.message += '\n'+signature

    // Verificar valores
    if(data.message.length==0){
      alert("El mensaje no puede estar vacio")
      return
    }else if(/[áéíóúÁÉÍÓÚñÑ]/.test(data.message)){
      handleErrorResponse("custom", "Error", "El mensaje no puede contener tildes o ñ", "warning")
      return
    }

    console.log("data", data)
    // Enviar data al API
    simplePostData(`atencion/notification/massive/sucursal/${sucursal_pk}/`, data)
    .then(
      () => handleErrorResponse("custom", "Enviado", "El mensaje fue enviado exitosamente", "info")
    )
  }
  const selectAll = () => {
    // Select all options inside select2
    window.$("#patients > option").prop("selected", true);
    window.$("#patients").trigger("change");
  }

  useEffect(() => {
    getAllPatients()

    age_options.push(<option value="0">-</option>)  // Default option
    for(let i=1; i<100; i++) age_options.push(<option value={i}>{i}</option>)  // Regular 1-99 options
  }, [])
  useEffect(() => {
    if(!patients || patients.length == 0) return

    // Select2 for personal choose in Cita
    // CSS
    if(!document.getElementById('select2_link')){
      const select2_link = document.createElement("link")
      select2_link.rel = "stylesheet"
      select2_link.id = "select2_link"
      select2_link.media = "screen, print"
      select2_link.href = "/css/formplugins/select2/select2.bundle.css"
      document.head.appendChild(select2_link)
    }
    // JS
    if(!document.getElementById('select2_script')){
      const select2_script = document.createElement("script")
      select2_script.async = false
      select2_script.id = "select2_script"
      select2_script.onload = ()=>{
        // Set select2 to patients
        window.$("#patients").select2()
        selectAll()
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      // Set select2 to patients
      window.$("#patients").select2()
      selectAll()
    }
  }, [patients])

  return !patients
  ? "loading"
  : (
    <div>
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal</span>.
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="programado">Pacientes: </label>
        <select className="custom-select form-control" id="patients" multiple>
          {patients.map(p => <option key={p.pk} value={p.procedimiento}>{p.fullname.toUpperCase()}</option>)}
        </select>
        <b>{patients.length} pacientes seleccionados</b>
      </div>
      {/* Filters */}
      <div className="row">

        <div className="col-6">
          {/* Cita */}
          {/*
          <div className="col-12 form-group" style={mn_style.inline}>
            <label className="form-label" style={mn_style.block}>Con cita programada entre: </label>
            <input type="date" id="mn-date-from" className="form-control col-4"
            style={Object.assign(mn_style.marginRight, mn_style.inline)} onChange={getAllPatients} />
            <input type="date" id="mn-date-to" className="form-control col-4" style={mn_style.inline} onChange={getAllPatients} />
          </div>
          */}
          {/* Edad */}
          <div className="col-6 form-group" style={mn_style.inline}>
            <label className="form-label" style={mn_style.marginRight}>Edad entre: </label>
            <select id="mn-age-min" className="custom-select form-control col-4" onChange={getAllPatients}>
              {age_options}
            </select>
            <select id="mn-age-max" className="custom-select form-control col-4" onChange={getAllPatients}>
              {age_options}
            </select>
          </div>
          {/* Sexo */}
          <div className="col-6 form-group" style={mn_style.inline}>
            <label className="form-label" htmlFor="sexo" style={mn_style.marginRight}>Sexo: </label>
            <select id="mn-sexo" className="custom-select form-control col-8" onChange={getAllPatients}>
              <option value="0">Ambos</option>
              <option value="1">Masculino</option>
              <option value="2">Femenino</option>
            </select>
          </div>
        </div>

      </div>

      {/* Mensaje */}
      <div className="form-group">
        <label className="form-label" htmlFor="input-descripcion">Mensaje</label>
        <textarea className="form-control"
        placeholder="Mensaje aqui" id="mn-msg" rows="3" maxLength={140-signature.length}
        style={{borderBottom: "none", resize: "none", borderRadius: "0"}}></textarea>
        <span className="form-control" style={{
          display: "block", borderTop: "none", borderRadius: "0",
        }}>{signature}</span>
        <span className="help-block">
          {140-signature.length} caracteres maximo, solo letras y numeros permitidos (no tildes, ñ o simbolos)
        </span>
      </div>
      {/* Fecha programada */}
      <div className="form-group">
        <label className="form-label" htmlFor="input-fecha">Cuándo enviar?</label>
        <div style={{display: "flex", alignItems: "center"}}>
          <div className="custom-control custom-checkbox custom-control-inline">
            <input type="checkbox" className="custom-control-input" id="mn-now" defaultChecked onChange={e => setCheckboxNow(e.target.checked)} />
            <label className="custom-control-label" htmlFor="mn-now">Ahora</label>
          </div>
          <input type="datetime-local" id="mn-fecha" className="form-control col-3" disabled={checkbox_now}
          defaultValue={datetime_now} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={saveMassiveNotification}>Enviar mensajes</button>
    </div>
  )
}

export default MassiveNotification
