import React, { useState, useEffect } from 'react'
import {
  simpleGet,
  simplePostData,
  addRequestValidation,
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
} from '../../functions'


const MensajeMasivo = ({sucursal_pk, redirectTo}) => {
  const [patients, setPatients] = useState(false)
  const [filter, setFilter] = useState({})

  const getAllPatients = _sucursal_pk => {
    // Filter
    // Request
    simpleGet(`atencion/paciente/sucursal/${_sucursal_pk}/`)
    .then(res => setPatients(res.map(pxs => pxs.paciente)))
  }

  useEffect(() => {
    getAllPatients(sucursal_pk)
  }, [])
  useEffect(() => {
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
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      // Set select2 to patients
      window.$("#patients").select2()
    }
  }, [patients])

  return !patients
  ? "loading"
  : (
    <div>
      <div className="" style={{marginBottom: "10px"}}>
        <label className="form-label" htmlFor="programado">Pacientes: </label>
        <select className="custom-select form-control custom-select-lg" id="patients" multiple>
          {patients.map(p => <option key={p.pk} value={p.procedimiento}>{p.fullname.toUpperCase()}</option>)}
        </select>
      </div>
      {/* Filters */}
      <div className="form-group">
        <label className="form-label" htmlFor="phone">Edad: </label>
        <div>
          <input type="number" id="edad-max" className="form-control col-3" maxLength="2" min="1" />
          <input type="number" id="edad-min" className="form-control col-3" maxLength="2" min="99" />
        </div>
      </div>
      {/* Sexo */}
      <div className="form-group">
        <label className="form-label" htmlFor="sexo">Sexo: </label>
        <select id="sexo" className="custom-select form-control">
          <option value="1">Masculino</option>
          <option value="2">Femenino</option>
        </select>
      </div>

    </div>
  )
}

export default MensajeMasivo
