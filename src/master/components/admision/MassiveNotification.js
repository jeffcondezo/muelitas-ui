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
import { PageTitle } from '../bits';

const __debug__ = process.env.REACT_APP_DEBUG == "true"


const MassiveNotification = () => {
  const [patients, setPatients] = useState(false)
  let [checkbox_now, setCheckboxNow] = useState(true)
  const age_options = useRef([]).current
  const show_patients = useRef(false)
  // Current sucursal
  const {current_sucursal, sucursales} = useContext(NavigationContext)
  let cur_suc = sucursales.find(s => s.pk==current_sucursal)
  let signature = `- ${cur_suc.empresa_data.razon_social.toUpperCase()}`
  // Current datetime
  let _dt = new Date()
  let datetime_now = _dt.toDateInputValue()+'T'+_dt.getHours()+":"+String(_dt.getMinutes()).padStart(2, "0")
  const mn_style = {
    inline: {display: "inline-block"},
    block: {display: "block"},
    marginRight: {marginRight: "10px"},
  }

  const getAllPatients = _sucursal_pk => {
    simpleGet(`atencion/paciente/sucursal/?filtro={"p_notificacion": true}`)
    .then(res => setPatients(res.map(pxs => pxs.paciente_data)))
  }
  const filterPatients = () => {
    let _sucursal_pk = current_sucursal
    // Filter
    let _filter = ``
    let _tmp = null
    _tmp = window.document.getElementById('mn-date-from').value
    if(_tmp!="") _filter += `,"p_date_from":"${_tmp}"`
    _tmp = window.document.getElementById('mn-date-to').value
    if(_tmp!="") _filter += `,"p_date_to":"${_tmp}"`
    _tmp = window.document.getElementById('mn-sexo').value
    if(_tmp!="0") _filter += `,"p_sexo":${_tmp}`
    _tmp = window.document.getElementById('mn-age-min').value
    if(_tmp!="0") _filter += `,"p_age_min":${_tmp}`
    _tmp = window.document.getElementById('mn-age-max').value
    if(_tmp!="0") _filter += `,"p_age_max":${_tmp}`

    // If no filter was set
    if(_filter==``){
      selectAllPatientOptions(false)
      return
    }

    // Request
    simpleGet(`atencion/paciente/sucursal/?filtro={"p_notificacion": true${_filter}}`)
    .then(pxss => selectFilteredPatients(pxss.map(pxs => pxs.paciente.pk)))
  }
  const saveMassiveNotification = () => {
    if(__debug__) console.log("MassiveNotification saveMassiveNotification");

    let _patients = window.$('#patients').select2('data').map(p => p.id)
    if(_patients.length==0){
      alert("Debe seleccionar al menos un paciente")
      return
    }

    let data = {
      message: window.document.getElementById('mn-msg').value.trim(),
      now: window.document.getElementById('mn-now').checked,
      fecha: window.document.getElementById('mn-fecha').value.split('T')[0],
      hora: window.document.getElementById('mn-fecha').value.split('T')[1],
      patients: _patients
    }

    // Verificar valores
    if(data.message.length==0){
      alert("El mensaje no puede estar vacio")
      return
    }else if(/[áéíóúÁÉÍÓÚñÑ]/.test(data.message)){
      handleErrorResponse("custom", "Error", "El mensaje no puede contener tildes o ñ", "warning")
      return
    }
    // Add signature
    data.message += '\n'+signature

    console.log("data", data)
    // Enviar data al API
    simplePostData(`atencion/notification/massive/sucursal/${current_sucursal}/`, data)
    .then(
      () => handleErrorResponse("custom", "Enviado", "El mensaje fue enviado exitosamente", "info")
    )
  }
  const selectAllPatientOptions = _on => {
    // Select all options inside select2
    window.$("#patients > option").prop("selected", !!_on);
    window.$("#patients").trigger("change");
  }
  const selectFilteredPatients = ar_pac => {
    if(__debug__) console.log("MassiveNotification selectFilteredPatients", ar_pac)
    selectAllPatientOptions(false)
    let ops = window.$('#patients').find("option")
    ops = [...ops]
    // Filter option of patient that has been filtered in api and select them
    ops = ops.filter(op => ar_pac.indexOf(Number(op.value))!=-1)
    ops.map(op => op.selected = true)
    // Change view
    if(ops.length>=12) changeViewPacientes(false)
    else changeViewPacientes(true)
    // Trigger change to show new select2 selected values
    window.$('#patients').trigger("change")
  }
  const changeViewPacientes = _on => {
    window.document.getElementsByClassName('select2-container')[0].style.display = _on?"block":"none"
    window.document.getElementById('patients-show-button').innerText = !_on?"Mostrar":"Ocultar"
    show_patients.current = _on
  }
  const updateSelectedCounter = () => {
    window.document.getElementById('selected_counter').innerText = window.$("#patients").select2('data').length
  }

  useEffect(() => {
    getAllPatients(current_sucursal)

    age_options.push(<option key="opt-number-default" value="0">-</option>)  // Default option
    for(let i=1; i<100; i++) age_options.push(<option key={"opt-number-"+i} value={i}>{i}</option>)  // Regular 1-99 options
  }, [])
  useEffect(() => {
    if(!patients) return

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
        window.$("#patients").select2().on('change.select2', ()=>updateSelectedCounter())
        changeViewPacientes(true)
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      // Set select2 to patients
      window.$("#patients").select2().on('change.select2', ()=>updateSelectedCounter())
      changeViewPacientes(true)
    }
  }, [patients])

  return !patients
  ? "loading"
  : (
    <div>
      <PageTitle title={"Mensajes masivos"} />

      <div className="form-group">
        <label className="form-label" htmlFor="programado">Pacientes: </label>
        <i id="patients-show-button" onClick={() => changeViewPacientes(!show_patients.current)} style={{paddingLeft: "10px", textDecoration: "underline", userSelect: "none"}}></i>
        <br />
        <select className="custom-select form-control" id="patients" multiple style={{display: "none"}}>
          {patients.map(p => <option key={p.pk} value={p.pk}>{p.fullname.toUpperCase()}</option>)}
        </select>
        <b><span id="selected_counter">0</span> pacientes seleccionados</b>
      </div>
      {/* Filters */}
      <h4>Filtros</h4>
      <div className="row">
        <div className="col-12">
          {/* Edad */}
          <div className="col-2 form-group" style={mn_style.inline}>
            <label className="form-label" style={mn_style.block}>Edad entre: </label>
            <select id="mn-age-min" className="custom-select form-control col-6" onChange={filterPatients}>
              {age_options}
            </select>
            <select id="mn-age-max" className="custom-select form-control col-6" onChange={filterPatients}>
              {age_options}
            </select>
          </div>
          {/* Sexo */}
          <div className="col-2 form-group" style={mn_style.inline}>
            <label className="form-label" htmlFor="sexo" style={mn_style.block}>Sexo: </label>
            <select id="mn-sexo" className="custom-select form-control col-12" onChange={filterPatients}>
              <option value="0">Ambos</option>
              <option value="1">Masculino</option>
              <option value="2">Femenino</option>
            </select>
          </div>
          {/* Cita */}
          <div className="col-4 form-group" style={mn_style.inline}>
            <label className="form-label" style={mn_style.block}>Con cita programada entre: </label>
            <input type="date" id="mn-date-from" className="form-control col-6"
            style={mn_style.inline} onChange={filterPatients} />
            <input type="date" id="mn-date-to" className="form-control col-6" style={mn_style.inline} onChange={filterPatients} />
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
