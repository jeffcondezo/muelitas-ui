import React, { useState, useEffect, useContext } from 'react'
import { useParams } from "react-router-dom"
import {
  simpleGet,
  getDataByPK,
  simplePostData,
} from '../../functions'
import { PageTitle } from '../bits'
import { NavigationContext } from '../Navigation'
import Loader from '../loader/Loader'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"


const Procedimiento = () => {
  const {current_sucursal} = useContext(NavigationContext)
  let {action, proc_pk} = useParams()
  const [da, setDA] = useState(false)
  const [cita, setCita] = useState(false)

  const getData = () => {
    if(action=="editar") getDA(proc_pk)
    else if(action=="agregar") getCita(proc_pk)
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
    let data = {
      pxs: document.getElementById('procedimiento').value,
      observaciones: document.getElementById('observaciones').value,
      precio: document.getElementById('cost').value,
      dues: document.getElementById('dues').value,
      pay_today: document.getElementById('pay_today').checked,
      payment_period: document.getElementById('payment_period').value,
    }

    // API function
    if(cita){
      // New Procedimiento
      data.atencion = cita.atencion
      simplePostData(`atencion/detalle/`, data, "POST")
      .then(getBack)
    }else if(da){
      // Update Procedimiento
      simplePostData(`atencion/detalle/${da.pk}/`, data, "PATCH")
      .then(getBack)
    }
  }
  const getBack = () => window.history.back()

  useEffect(() => {
    getData()
  }, [])

  return !da && !cita
  ? <Loader scale={2} />
  : (
  <>
    <PageTitle title={"Procedimiento"} />
    <ProcedimientoForm procedure={da} current_sucursal={current_sucursal} />
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
const ProcedimientoForm = ({procedure, current_sucursal}) => {
  const [pxss, setPXS] = useState(false)

  const getProcedures = _sucursal_pk => simpleGet(`maestro/procedimiento/sucursal/?filtro={"active":"1"}`).then(setPXS)
  function handlePeriodChange(el){
    if(el.value=="0" || !el.value){
      document.getElementById("dues").value = "0"
      document.getElementById("payment_period").value = "0"
      document.getElementById("payment_period").disabled = true
      document.getElementById("payment_period").options[0].disabled = false
      document.getElementById("pay_today").checked = false
      document.getElementById("pay_today").disabled = true
    }else{
      if(document.getElementById("payment_period").value=="0") document.getElementById("payment_period").value = "1"
      document.getElementById("payment_period").disabled = false
      document.getElementById("payment_period").options[0].disabled = true
      document.getElementById("pay_today").checked = false
      document.getElementById("pay_today").disabled = false
    }
  }
  function handleProcedureChange(el){
    let _pxs = pxss.find(i => i.pk == el.value)
    if(!_pxs) return

    // Update coste
    window.document.getElementById('cost').value = _pxs.precio
  }

  useEffect(() => {
    getProcedures(current_sucursal)
  }, [])
  useEffect(() => {
    if(!pxss || pxss.length==0) return

    if(procedure){
      document.getElementById("payment_period").value = procedure.payment_period
      document.getElementById("payment_period").disabled = procedure.payment_period==0
      document.getElementById("pay_today").disabled = true
    }else{
      document.getElementById("payment_period").value = "0"
      document.getElementById("payment_period").disabled = true
      document.getElementById("pay_today").checked = false
      document.getElementById("pay_today").disabled = true
    }

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
        // Set select2 for procedimiento
        window.$("#procedimiento").select2().on('select2:select', ev => handleProcedureChange(ev.params.data.element))
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      // Set select2 for procedimiento
      window.$("#procedimiento").select2().on('select2:select', ev => handleProcedureChange(ev.params.data.element))
    }
  }, [pxss])

  return !pxss
    ? <Loader scale={2} />
    : pxss.length==0
    ? "No hay procedimientos encontrados"
    : (
      <div>
        <div className="col-sm" style={{marginBottom: "10px"}}>
          <label className="form-label" htmlFor="programado">Procedimiento: </label>
          <select className="custom-select form-control custom-select-lg"
            id="procedimiento" defaultValue={procedure?procedure.pxs:pxss[0].pk}
          >
            {pxss.map(pxs => (
                <option key={pxs.pk} value={pxs.pk}>
                  {pxs.nombre.toUpperCase()}
                </option>
              ))}
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
              min="0" defaultValue={procedure?procedure.precio_base:pxss[0].precio} />
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

export default Procedimiento
