import React, { useState, useEffect, useContext } from 'react'
import {
  simpleGet,
  simplePostData,
  handleErrorResponse,
  getDataByPK,
} from '../../functions'
import {
  useParams,
} from "react-router-dom"
import { NavigationContext } from '../Navigation'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"

const NewEditPatient = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  const _params_ = useParams()  // patient_pk in url
  const [patient, setPatient] = useState(false)
  const [extrafields, setEF] = useState(false)
  /* Flux
  * New:
    * If patient not in DB -> regular create -> redirect admision
    * If patient in DB -> edit -> pxs -> redirect admision
  * Edit: save changes -> pxs -> redirect admision
  */

  const getInitialData = () => {
    simpleGet('atencion/admision/extra').then(setEF)  // Get extra fields from sucursal
    if(_params_.patient == '0') return  // Nuevo
    // Get patient by id if patient is setted in url
    getDataByPK('atencion/paciente/admision/pk', _params_.patient).then(setPatient)
  }
  const saveData = () => {
    if(__debug__) console.log("NewEditPatient saveData");  // ';' mandatory

    (patient ? saveEdit : savePatient)()
    // Create PacienteXSucursal register
    .then(pac_pk => createPacienteXSucursal(pac_pk))
    .then(pxs => redirectTo(`/nav/admision/${pxs.paciente}/detalle`))
    .then(() => handleErrorResponse('custom', "Exito", "Se han guardado los cambios exitosamente", 'info'))
    .catch(res => {
      if(__debug__) console.log("res", res)
      if(!res) return

      res.json().then(er => {
        if(__debug__) console.log("er", er)
        if(er.hasOwnProperty('dni'))
          handleErrorResponse('custom', "Error", "El DNI ya existe", 'warning')
        if(er.hasOwnProperty('non_field_errors'))
          handleErrorResponse('custom', "Error", er.non_field_errors.join(", "), 'warning')
      })
    })
  }
  // New
  const savePatient = () => {
    let _data = validatePatientForm()
    if(__debug__) console.log("NewEditPatient savePatient")
    if(!_data) return Promise.reject()

    return simplePostData(`atencion/paciente/`, _data)
      .then(pac => updatePatientOtherData(pac.pk))
  }
  // Edit
  const saveEdit = () => {
    let _data = validatePatientForm()
    if(__debug__) console.log("NewEditPatient saveEdit")
    if(!_data) return Promise.reject()

    return simplePostData(`atencion/paciente/${patient.pk}/`, _data, "PUT")
      .then(pac => updatePatientOtherData(pac.pk))
  }
  // Extra
  const validatePatientForm = () => {
    // Values validation
    let _tmp1
    _tmp1 = document.getElementById("name-pric")
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Nombre principal no especificado", 'warning')
      return false
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras", 'warning')
      return false
    }

    _tmp1 = document.getElementById("name-sec")
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Nombre secundario no especificado", 'warning')
      return false
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras", 'warning')
      return false
    }

    _tmp1 = document.getElementById("ape-p")
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido paterno no especificado", 'warning')
      return false
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido paterno no puede estar vacio", 'warning')
      return false
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras", 'warning')
      return false
    }

    _tmp1 = document.getElementById("ape-m")
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido materno no especificado", 'warning')
      return false
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido materno no puede estar vacio", 'warning')
      return false
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras", 'warning')
      return false
    }

    // Validate dni considering dni_tipo
    let el_dni = document.getElementById('dni')
    if(window.document.getElementById("dni_tipo").value == '1'){
      // DNI
      if(el_dni.value.trim().length!=8){
        handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos", 'warning')
        return false
      }
      if(isNaN(parseInt(el_dni.value.trim()))){
        handleErrorResponse("custom", "Error", "El DNI debe contener solo números", 'warning')
        return false
      }
    }else{
      // DNI_OTRO
      if(el_dni.value.trim().length<4){
        handleErrorResponse("custom", "Error", "El documento debe tener al menos 4 digitos", 'warning')
        return false
      }
    }

    _tmp1 = document.getElementById("born-date")
    if(_tmp1){
      if(_tmp1.value>=(new Date().toDateInputValue)){
        handleErrorResponse("custom", "Error", "La fecha de nacimiento no debe ser posterior al día de hoy", 'warning')
        return false
      }
    }

    _tmp1 = document.getElementById("phone")
    if(_tmp1 && !!_tmp1.value){
      if(_tmp1.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos", 'warning')
        return false
      }
      if(isNaN(parseInt(_tmp1.value))){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos", 'warning')
        return false
      }
    }

    _tmp1 = document.getElementById("email")
    if(_tmp1 && _tmp1.value.length!=0){
      if(!_tmp1.checkValidity()){
        handleErrorResponse("custom", "Error", "Introduzca un correo electronico correcto", 'warning')
        return false
      }
    }

    // Address no not need validation
    // Provenance no not need validation
    // Residence no not need validation

    let _tmp = {
      nombre_principal: document.getElementById('name-pric').value,
      nombre_secundario: document.getElementById('name-sec').value,
      ape_paterno: document.getElementById('ape-p').value,
      ape_materno: document.getElementById('ape-m').value,
      sexo: document.getElementById('sexo').value,
      permiso_sms: document.getElementById('permiso_sms').checked,
    }
    // DNI or DNI_OTRO
    let b_dni_otro = window.document.getElementById("dni_tipo").value != '1'  // Indicador
    _tmp.dni = b_dni_otro ? null : el_dni.value
    _tmp.dni_otro = b_dni_otro ? el_dni.value : null
    _tmp.tipo_documento = window.document.getElementById("dni_tipo").value

    // Add non-required fields
    if(document.getElementById('born-date').value)
      _tmp.fecha_nacimiento = document.getElementById('born-date').value
    if(document.getElementById('phone').value)
      _tmp.celular = document.getElementById('phone').value
    if(document.getElementById('address').value)
      _tmp.direccion = document.getElementById('address').value
    if(document.getElementById('email').value)
      _tmp.correo = document.getElementById('email').value

    return _tmp
  }
  const validatePatientAntecedentsForm = () => {
    return {
      diabetes: document.getElementById('diabetes').value,
      hepatitis: document.getElementById('hepatitis').value,
      hemorragia: document.getElementById('hemorragia').value,
      enf_cardiovascular: document.getElementById('enf_cardiovascular').value,
      alergias: document.getElementById('alergias').value,
      operaciones: document.getElementById('operaciones').value,
      medicamentos: document.getElementById('medicamentos').value,
    }
  }
  const getExtraFieldsData = () => {
    return extrafields.reduce((ar, ce) => {
      let val = window.document.getElementById('extra-field-'+ce.pk).value
      if(val && val.length!=0) ar.push([ce.pk, val])
      return ar
    }, []) || {}
  }
  const updatePatientOtherData = pac_pk => {
    // By default Patient's antecedent is created, so we only need to update not create
    let _data = {
      antecedentes: validatePatientAntecedentsForm(),
      extra: getExtraFieldsData()
    }
    if(!_data) return Promise.reject(null)
    _data.paciente = pac_pk

    return simplePostData(`atencion/paciente/${pac_pk}/extra/`, _data)
  }
  const getBack = () => window.history.back()
  const createPacienteXSucursal = pac_pk => simplePostData(`atencion/paciente/sucursal/`, {paciente: pac_pk, sucursal: current_sucursal})

  useEffect(() => {
    getInitialData()
  }, [])

  return (
    <div>
      <PatientForm patient={patient} setPatient={setPatient} />
      <PatientAntecedentsForm antecedente={patient&&patient.antecedentes} />
      {/* EXTRA FIELDS */}
      <ExtraFieldsForm camposextra={patient.camposextra || extrafields} />

      <div style={{paddingTop: "25px"}}></div>  {/* Separador */}

      {/* Form buttons */}
      <div className="form-group d-flex">
        <button className="btn btn-primary" onClick={saveData}>
          Guardar
        </button>

        <button className="btn btn-light ml-auto" onClick={getBack}>
          Regresar
        </button>
      </div>
    </div>
  )
}

const PatientForm = ({patient, setPatient=(()=>{})}) => {
  const [dni_otro, setOtroDNI] = useState(false)
  // dni_otro indicates if tipo_documento equals '1'(dni) to make easier validations and re-renders

  const formatInputDate = date => {
    /* This only works with specific formats
    * date: "20/05/2000"
    * return: "2000-05-20"
    */
    return date.split("/").reverse().join("-")
  }
  const _getPatiente = el => {
    let dni = el.value
    if(Number(dni) === NaN){
      // Prevent characters other than numbers
      el.value = dni.substr(0, dni.length-1)
      return
    }

    // Ask reniec's api for patient data only if tipo_documento is '1' (dni)
    if(!dni_otro) getPatiente(dni, setPatient)
  }
  const otroDNI = ev => {
    setOtroDNI(ev.target.value != "1")

    if(patient){
      // If patient is setted
      if(ev.target.value == patient.tipo_documento){
        // If tipo_documento is same as patient's
        // Fill data from patient
        window.document.getElementById('dni').value = patient.tipo_documento != "1" ? patient.dni_otro : patient.dni
      }else window.document.getElementById('dni').value = ""
    }else{
      // New paciente
      // Reset values
      if(ev.target.value == '1') getPatiente("")
    }
  }

  useEffect(() => {
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
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }
  }, [])
  useEffect(() => {
    if(!patient) return

    // Update values
    setOtroDNI(patient.tipo_documento != '1')
    window.document.getElementById('dni').value = patient.dni || patient.dni_otro || ""
    window.document.getElementById('dni_tipo').value = patient.tipo_documento
    window.document.getElementById('name-pric').value = patient.nombre_principal
    window.document.getElementById('name-sec').value = patient.nombre_secundario
    window.document.getElementById('ape-p').value = patient.ape_paterno
    window.document.getElementById('ape-m').value = patient.ape_materno
    window.document.getElementById('born-date').value = patient.fecha_nacimiento && formatInputDate(patient.fecha_nacimiento) || ""
    window.document.getElementById('sexo').value = patient.sexo || "1"
    window.document.getElementById('phone').value = patient.celular
    window.document.getElementById('permiso_sms').checked = patient.permiso_sms
    window.document.getElementById('address').value = patient.direccion
    window.document.getElementById('email').value = patient.correo
    if(patient.fullname_validado){
      window.document.getElementById("name-pric").disabled = true
      window.document.getElementById("name-sec").disabled = true
      window.document.getElementById("ape-p").disabled = true
      window.document.getElementById("ape-m").disabled = true
    }
  }, [patient])

  return (
    <div className="form-group col-md-12">  {/* Form */}
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="dni">Número de documento: </label>
        <input type="text" id="dni" className="form-control" maxLength={dni_otro?"30":"8"}
        onChange={e => _getPatiente(e.target)} />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="dni_tipo">Tipo documento: </label>
        <select id="dni_tipo" className="custom-select form-control" onChange={otroDNI}>
          <option value="1">DNI</option>
          <option value="2">CARNET DE EXTRANJERIA</option>
          <option value="3">PASAPORTE</option>
          <option value="0">OTRO</option>
        </select>
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="ape-p">Apellido paterno: </label>
        <input type="text" id="ape-p" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="born-date">Fecha de nacimiento: </label>
        <input type="date" id="born-date" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="sexo">Sexo: </label>
        <select id="sexo" className="custom-select form-control">
          <option value="1">Masculino</option>
          <option value="2">Femenino</option>
        </select>
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="phone">Celular: </label>
        <input type="text" id="phone" className="form-control" maxLength="9" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <div className="custom-control custom-checkbox custom-control-inline" style={{alignItems: "center"}}>
          <input type="checkbox" className="custom-control-input" id="permiso_sms" />
          <label className="custom-control-label" htmlFor="permiso_sms">Permitir envio de mensajes</label>
        </div>
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="address">Dirección: </label>
        <input type="text" id="address" className="form-control" />
      </div>
      <div className="form-group col-md-6" style={{display:'inline-block'}}>
        <label className="form-label" htmlFor="email">Correo electronico: </label>
        <input type="email" id="email" className="form-control" />
      </div>
    </div>
  )
}
const PatientAntecedentsForm = ({antecedente}) => {
  useEffect(() => {
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
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }
  }, [])
  useEffect(() => {
    if(!antecedente) return
    if(antecedente){
      // Set default values
      window.document.getElementById('diabetes').value = Number(antecedente.diabetes)
      window.document.getElementById('hepatitis').value = Number(antecedente.hepatitis)
      window.document.getElementById('hemorragia').value = Number(antecedente.hemorragia)
      window.document.getElementById('enf_cardiovascular').value = Number(antecedente.enf_cardiovascular)
      window.document.getElementById('alergias').value = antecedente.alergias
      window.document.getElementById('operaciones').value = antecedente.operaciones
      window.document.getElementById('medicamentos').value = antecedente.medicamentos
    }
  }, [antecedente])

  return (

    <div className="form-group col-md-12">
      <div style={{display: "flex", cursor: "pointer"}}
      data-toggle="collapse" data-target="#accordion-content-antecedentes" aria-expanded="false">
        <span className="mr-2">
          <span className="collapsed-reveal">
            <i className="fal fa-minus fs-xl" style={{verticalAlign: "bottom"}}></i>
          </span>
          <span className="collapsed-hidden">
            <i className="fal fa-plus fs-xl" style={{verticalAlign: "bottom"}}></i>
          </span>
        </span>
        <h3><b>Antecedentes</b></h3>
      </div>
      <div className="collapse" id="accordion-content-antecedentes">
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="diabetes">Diabetes? </label>
          <select id="diabetes" className="custom-select form-control">
            <option value="0">No</option>
            <option value="1">Si</option>
          </select>
        </div>
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="hepatitis">Hepatitis? </label>
          <select id="hepatitis" className="custom-select form-control">
            <option value="0">No</option>
            <option value="1">Si</option>
          </select>
        </div>
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="hemorragia">Hemorragia? </label>
          <select id="hemorragia" className="custom-select form-control">
            <option value="0">No</option>
            <option value="1">Si</option>
          </select>
        </div>
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="enf_cardiovascular">Enfermedad cardiovascular? </label>
          <select id="enf_cardiovascular" className="custom-select form-control">
            <option value="0">No</option>
            <option value="1">Si</option>
          </select>
        </div>

        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="alergias">Alergias</label>
          <textarea className="form-control" id="alergias" rows="2"></textarea>
        </div>
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="operaciones">Operaciones</label>
          <textarea className="form-control" id="operaciones" rows="2"></textarea>
        </div>
        <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <label className="form-label" htmlFor="medicamentos">Medicamentos</label>
          <textarea className="form-control" id="medicamentos" rows="2"></textarea>
        </div>
      </div>
    </div>
  )
}
const ExtraFieldsForm = ({camposextra}) => {
  useEffect(() => {
    if(!camposextra || camposextra.length == 0) return
    // Fill inputs from camposextra
    camposextra.filter(i => i.respuesta).map(ce => {
      window.document.getElementById('extra-field-'+ce.pk).value = ce.respuesta || ce.respuesta_descripcion
    })
  }, [camposextra])

  return (camposextra && camposextra.length != 0)
  ? (
    <div className="form-group col-md-12">
      <div style={{display: "flex", cursor: "pointer"}}
      data-toggle="collapse" data-target="#accordion-content-extrafields" aria-expanded="false">
        <span className="mr-2">
          <span className="collapsed-reveal">
            <i className="fal fa-minus fs-xl" style={{verticalAlign: "bottom"}}></i>
          </span>
          <span className="collapsed-hidden">
            <i className="fal fa-plus fs-xl" style={{verticalAlign: "bottom"}}></i>
          </span>
        </span>
        <h3><b>Extras</b></h3>
      </div>
      <div className="collapse" id="accordion-content-extrafields">
      {camposextra.map(ce => (
        <div key={"container-extra-field-"+ce.pk} className="form-group col-md-6" style={{
          display:'inline-block',
          verticalAlign: 'top'
        }}>
          <label className="form-label" htmlFor={"extra-field-"+ce.pk}>{ce.texto}</label>
          {ce.tipo_campo == 1 && (<input type="text" id={"extra-field-"+ce.pk} className="form-control" />)}
          {ce.tipo_campo == 2 && (<textarea className="form-control" id={"extra-field-"+ce.pk} rows="2"></textarea>)}
        </div>
      ))}
      </div>
    </div>
  ) : ""
}
// Auxiliar
const getPatiente = (dni, setPatient) => {
  if(dni.length!=8){
    // Eliminar datos
    document.getElementById("name-pric").value = ""
    document.getElementById("name-sec").value = "";
    document.getElementById("ape-p").value = "";
    document.getElementById("ape-m").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("sexo").value = "1"  // Default: Male
    document.getElementById("born-date").value = ""
    document.getElementById("permiso_sms").checked = true
    document.getElementById("address").value = ""
    // Set antecedents values
    document.getElementById("diabetes").value = "0"
    document.getElementById("hepatitis").value = "0"
    document.getElementById("hemorragia").value = "0"
    document.getElementById("enf_cardiovascular").value = "0"
    document.getElementById("alergias").value = ""
    document.getElementById("operaciones").value = ""
    document.getElementById("medicamentos").value = ""
    // Enable inputs
    document.getElementById("name-pric").disabled = false
    document.getElementById("name-sec").disabled = false
    document.getElementById("ape-p").disabled = false
    document.getElementById("ape-m").disabled = false
    setPatient(false)
    return
  }

  // Get patient by id
  getDataByPK('atencion/paciente/admision/dni', dni)
  .then(setPatient)
  .catch(res => {
    console.log("catch res", res)
    // Si no se encontro al paciente en Muelitas
    if(res.status == 404){
      // Consultar reniec
      return personaFromReniec(dni)
      .then(res => {
        if(__debug__) console.log("personaFromReniec res", res);
        // Handle errors
        if(res.hasOwnProperty('error')) return
        else handleErrorResponse('custom', "", "Se ha encontrado información relacionada al dni en el servicio de reniec", 'info')
        // Fill data from reniec
        let primer_nombre = res.nombres.split(" ")[0]
        document.getElementById("name-pric").value = xhtmlDecode(primer_nombre)
        document.getElementById("name-sec").value = xhtmlDecode( res.nombres.replace(primer_nombre, "").trim() )
        document.getElementById("ape-p").value = xhtmlDecode(res.apellido_paterno)
        document.getElementById("ape-m").value = xhtmlDecode(res.apellido_materno)
        document.getElementById("name-pric").disabled = true
        document.getElementById("name-sec").disabled = true
        document.getElementById("ape-p").disabled = true
        document.getElementById("ape-m").disabled = true
      })
    }
  })
  .then(i => console.log("bypass getPatiente i:", i) && false || i)
}
export const xhtmlDecode = _text => {
  let xhtml_codes = [
    {code: '&ntilde;', value: 'ñ'},
    {code: '&Ntilde;', value: 'Ñ'},
    {code: '&aacute;', value: 'á'},
    {code: '&eacute;', value: 'é'},
    {code: '&iacute;', value: 'í'},
    {code: '&oacute;', value: 'ó'},
    {code: '&uacute;', value: 'ú'},
    {code: '&Aacute;', value: 'Á'},
    {code: '&Eacute;', value: 'É'},
    {code: '&Iacute;', value: 'Í'},
    {code: '&Oacute;', value: 'Ó'},
    {code: '&Uacute;', value: 'Ú'},
  ]
  let text = _text

  xhtml_codes.map(v => text = text.replace(v.code, v.value))

  return text
}
export const personaFromReniec = _dni => simpleGet(`atencion/reniec/${_dni}/`)

export default NewEditPatient
