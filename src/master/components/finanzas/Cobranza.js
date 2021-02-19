import React, { useState, useEffect, useContext } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useParams,  // Get parameter from url
} from "react-router-dom"  // https://reacttraining.com/react-router/web/api/
import {
  handleErrorResponse,
  existInObjectArray,
  capitalizeFirstLetter as cFL,
  simpleGet,
  simplePostData,
  getDataByPK,
} from '../../functions'
import { PageTitle } from '../bits'
import HistorialPagos from './HistorialPagos'
import { NavigationContext } from '../Navigation'


// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Cobranza = () => (
  <Switch>
    <Route exact path='/nav/cobranza/list/'>
      <DebtXPatientTable />
    </Route>
    <Route path='/nav/cobranza/:patient/detalle'>
      <CobranzaDetail />
    </Route>
    <Route path='/nav/cobranza/:patient/pagos'>
      <HistorialPagos />
    </Route>

    <Route>
      <Redirect to="/nav/cobranza/list/" />
    </Route>
  </Switch>
)

const DebtXPatientTable = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  const [patientxdebt, setPxD] = useState(false)
  const [datatable, setDatatable] = useState(false)

  const getPxD = _sucursal_pk => simpleGet(`atencion/paciente/deuda/${_sucursal_pk}/`).then(setPxD)

  useEffect(() => {
    // Add DataTable rel docs
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script")
      dt_script.async = false
      dt_script.id = "dt_script"
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js"
      dt_script.onload = () => getPxD(current_sucursal)
      document.body.appendChild(dt_script)
    }else getPxD(current_sucursal)
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link")
      dt_style.rel = "stylesheet"
      dt_style.id = "dt_style"
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css"
      document.head.appendChild(dt_style)
    }
  }, [])
  // When resource variable is setted
  useEffect(() => {
    if(!patientxdebt) return  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#patientxdebt-table').DataTable().clear().destroy()
    // Gen Datatable
    let _tmp = window.$('#patientxdebt-table').DataTable({
      data: patientxdebt,
      columns: [
        {title: "Nombre", data: null},
        {title: "Deuda", data: null},
        {title: "Estado", data: null},
        {title: "", data: null},
      ],
      columnDefs: [{
        // Nombre completo
        targets: 0,
        render: (data, type, row) => (
          cFL(row.paciente.nombre_principal)+
          (row.paciente.nombre_secundario?" "+cFL(row.paciente.nombre_secundario):"")+" "+
          cFL(row.paciente.ape_paterno)+" "+
          cFL(row.paciente.ape_materno)
        ),
      }, {
        // Deuda
        targets: 1,
        defaultContent: "<code style='font-size: 1em'>0</code>",
        createdCell: (cell, data) => {
          cell.children[0].innerText = "S/. "+data.total_deuda
        },
      }, {
        // Fecha pago
        targets: -2,
        orderable: false,
        defaultContent: "<span class='badge'></span>",
        createdCell: (cell, data) => {
          let classname = "badge-"+(data.pago_estado<0?"danger":data.pago_estado>0?"info":"warning")
          let text = data.pago_estado<0?"Vencido":data.pago_estado>0?"Proximo":"Hoy"
          cell.children[0].classList.add(classname)
          cell.children[0].innerText = text
        }
      }, {
        // Cobrar
        targets: -1,
        orderable: false,
        defaultContent: "<button class='select-patient btn btn-light btn-pills waves-effect'>Cobrar</button>",
        createdCell: (cell, data) => {
          cell.children[0].onclick = () => {
            redirectTo(`/nav/cobranza/${data.paciente.pk}/detalle`, {patient: data.paciente})
          }
        }
      }],
      pageLength: 8,  // Default page length
      lengthMenu: [[8, 15, 25], [8, 15, 25]],  // Show n registers select option
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay deudas",
        sInfo:           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        sInfoEmpty:      "Mostrando registros del 0 al 0 de un total de 0 registros",
        sInfoFiltered:   "(filtrado de un total de _MAX_ registros)",
        sInfoPostFix:    "",
        // "sSearch":         "Buscar:",
        sUrl:            "",
        sInfoThousands:  ",",
        sLoadingRecords: "Cargando...",
        oPaginate: {
          sFirst:    "Primero",
          sLast:     "Último",
          sNext:     "Siguiente",
          sPrevious: "Anterior"
        },
        oAria: {
          sSortAscending:  ": Activar para ordenar la columna de manera ascendente",
          sSortDescending: ": Activar para ordenar la columna de manera descendente"
        },
        buttons: {
          copy: "Copiar",
          colvis: "Visibilidad"
        }
      },
    })

    setDatatable(_tmp)  // Save DT in state
  }, [patientxdebt])

  return (
    <>
    <PageTitle title={"Lista de deudas"} />
    {!patientxdebt
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="patientxdebt-table" style={{width: "100%"}}></table>
      </div>
    )
    }
    </>
  )
}

let production_nofe_default = true
const CobranzaDetail = () => {
  const {current_sucursal} = useContext(NavigationContext)
  let __params__ = useParams()
  const [selected_attention_detail, setSelectedAD] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [patient, setPatient] = useState(false)

  const getPatientByID = _id => getDataByPK('atencion/paciente', _id).then(setPatient)

  useEffect(() => {
    // Get patient from url'pk
    getPatientByID(__params__.patient)
  }, [])

  return !patient
    ? "loading"
    : (
    <>
      <PageTitle title={"Cobrar"} />

      <div className="row">
        <div className="col-lg-4">
          <PaymentForm
            setRefresh={setRefresh}
            selected={selected_attention_detail}
            current_sucursal={current_sucursal}
            patient={patient} />
        </div>
        <div className="col-lg-8">
          <div style={{marginTop: "30px", marginLeft: "20px"}}>
            <PatientDebtsTable
              selected={selected_attention_detail}
              select={setSelectedAD}
              refresh={refresh}
              setRefresh={setRefresh}
              patient={patient}/>
          </div>
        </div>
      </div>
    </>
    )
}
const PaymentForm = ({patient, current_sucursal, selected, setRefresh}) => {
  // Receive {patient, selected, current_sucursal, setRefresh}
  const [clienttype, setClientType] = useState(production_nofe_default?3:1)  // Natural && Empresa && Sin FE
  const [client, setClient] = useState(-1)  // Current Client (default:paciente redirected)
  const [knownclient, setNC] = useState(!production_nofe_default)  // Paciente es Cliente

  useEffect(() => {
    if(__debug__) console.log("useEffect clienttype", clienttype)
    if(clienttype==1){
      document.getElementById("client-dni").value = patient.dni
      setValues(patient)
      setNC(true)  // Client is known 'cuz we're setting the patient client
    }else{
      setValues(false)
      if(document.getElementById('client-ruc'))
        document.getElementById('client-ruc').value = ""
    }
  }, [clienttype])
  useEffect(() => {
    if(__debug__) console.log("useEffect client", client)
    if(clienttype==3) return
    if(client==-1) getClient('dni', patient.dni)
    if(client==false){
      setValues(patient)
      setNC(false)
      return
    }

    setNC(true)
    setValues(client)  // Set values
  }, [client])
  useEffect(() => {
    if(__debug__) console.log("useEffect knownclient", knownclient)
    if(knownclient) return

    setValues(false)
  }, [knownclient])

  // Extras
  const getBack = () => window.history.back()
  const inputChange_DNI = (val) => {
    if(val.trim().length==8) getClient('dni', val)
    else setNC(false)
  }
  const inputChange_RUC = (val) => {
    if(val.trim().length==11) getClient('ruc', val)
    else setNC(false)
  }
  const getClient = (type, val) => {
    simpleGet(`finanzas/cliente/?filtro={"${type}":"${val}"}`)
    .then(res => setClient(res.length!=0 ? res[0] : false))
  }
  const setValues = (values) => {
    if(clienttype==1){
      if(document.getElementById('name-pric'))
        document.getElementById('name-pric').value = values?values.nombre_principal:""
      if(document.getElementById('name-sec'))
        document.getElementById('name-sec').value = values?values.nombre_secundario:""
      if(document.getElementById('ape-p'))
        document.getElementById('ape-p').value = values?values.ape_paterno:""
      if(document.getElementById('ape-m'))
        document.getElementById('ape-m').value = values?values.ape_materno:""
    }else{
      if(document.getElementById('client-razon-social'))
        document.getElementById('client-razon-social').value = values&&values.razon_social?values.razon_social:""
      if(document.getElementById('client-phone'))
        document.getElementById('client-phone').value = values&&values.celular?values.celular:""
    }
  }
  // Form submit function
  const handleSubmit = () => {
    // Check selected attention detail
    if(selected.length==0){
      handleErrorResponse("custom", "Error", "Debe seleccionar los elementos a cobrar en el panel de la derecha", 'warning')
      return
    }

    // Client exists
    if(__debug__) console.log("handleSubmit", knownclient, client, clienttype)
    if(knownclient)
      if(client) savePayment(client)
      else handleSubmit_ClientRegular()  // Regular
    else  // New client
      if(clienttype==1) handleSubmit_ClientRegular()  // Regular
      else if(clienttype==2) handleSubmit_ClientEmpresa()  // Enterprise
      else if(clienttype==3) savePayment()  // No FE
  }
  // Save form as client
  const handleSubmit_ClientEmpresa = () => {
    console.log("Empresa")
    // Validate
    let _tmp
    _tmp = document.getElementById("client-ruc")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Ha ocurrido un error, por favor actualice la pagina", 'warning')
      return
    }
    if(_tmp.value.trim().length!=11){
      handleErrorResponse("custom", "Error", "El ruc debe tener 11 digitos", 'warning')
      return
    }
    if(isNaN(parseInt(_tmp.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números", 'warning')
      return
    }

    _tmp = document.getElementById("client-razon-social")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Ha ocurrido un error, por favor actualice la pagina", 'warning')
      return
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Debe especificar la razón social de la empresa", 'warning')
      return
    }

    _tmp = document.getElementById("client-phone")
    if(_tmp && !!_tmp.value){
      if(_tmp.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos", 'warning')
        return
      }
      if(!/^\d+$/.test(_tmp.value)){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos", 'warning')
        return
      }
    }


    let _tmp1 = {
      razon_social: document.getElementById("client-razon-social").value,
      ruc_: document.getElementById("client-ruc").value,  // Artifice to get_or_create
    }
    if(document.getElementById("client-phone").value.length!=0)
      _tmp1.celular = document.getElementById("client-phone").value

    getOrCreateNewClient(_tmp1)
  }
  const handleSubmit_ClientRegular = () => {
    // Validate
    let _tmp
    _tmp = document.getElementById("name-pric")
    if(!_tmp || _tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Nombre principal no especificado", 'warning')
      return
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras", 'warning')
      return
    }

    _tmp = document.getElementById("name-sec")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Nombre secundario no especificado", 'warning')
      return
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras", 'warning')
      return
    }

    _tmp = document.getElementById("ape-p")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Apellido paterno no especificado", 'warning')
      return
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido paterno no puede estar vacio", 'warning')
      return
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras", 'warning')
      return
    }

    _tmp = document.getElementById("ape-m")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "Apellido materno no especificado", 'warning')
      return
    }
    if(_tmp.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido materno no puede estar vacio", 'warning')
      return
    }
    if(!isNaN(parseInt(_tmp.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras", 'warning')
      return
    }

    _tmp = document.getElementById("client-dni")
    if(!_tmp){
      handleErrorResponse("custom", "Error", "DNI no especificado", 'warning')
      return
    }
    if(_tmp.value.trim().length!=8){
      handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos", 'warning')
      return
    }
    if(isNaN(parseInt(_tmp.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números", 'warning')
      return
    }

    _tmp = document.getElementById("client-phone")
    if(_tmp && !!_tmp.value){
      if(_tmp.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos", 'warning')
        return
      }
      if(!/^\d+$/.test(_tmp.value)){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos", 'warning')
        return
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
      _tmp1.celular = document.getElementById("client-phone").value

    getOrCreateNewClient(_tmp1)
  }
  // Get/Create client from API
  const getOrCreateNewClient = (data) => {
    simplePostData(`finanzas/cliente/`, data)
    .then(
      response_obj => savePayment(response_obj),
      () => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado", 'warning')
    )
  }

  // Save payment
  const savePayment = (_client) => {
    // BUG: LEFT TO OPTIMIZE AND CHECK BEHAVIOUR
    if(__debug__) console.log("savePayment")
    if(__debug__) console.log("selected", selected)
    // setClient(_client)

    // Send payment
    selected.reduce(
      (promise_chain, dcc) => promise_chain.then(() => simplePostData(
        'finanzas/cuentacorriente/pago/create/',
        {
          detallecuentacorriente: dcc.pk,
          monto: dcc.monto?dcc.monto:dcc.deuda,
        }
      )), Promise.resolve()
    )
    .then(() => handleErrorResponse("custom", "Exito", "Se ha realizado el pago correctamente", "info"))
    .then(() => setRefresh(true))
    .then(() => {
      if(clienttype==3) return Promise.reject("No FE")
      return simplePostData('finanzas/comprobante/', {
        tipo: clienttype,
        sucursal: current_sucursal,
        dcc_list: String(selected),
        cliente: _client.pk,  // Use parameter instead of client object 'cuz the state change may not be done before reaching this point
      })
    })
    .then(
      res => window.open(process.env.REACT_APP_PROJECT_API+`finanzas/empresa/${current_sucursal}/pdf/${res.pk}/`, "_blank"),
      er => console.log("ERROR", er)
    )
    .catch(er => console.log("ERROR", er))
  }


  return (
    <div>
      <div style={{marginLeft: "20px"}} className="btn-group btn-group-toggle" data-toggle="buttons">
        {production_nofe_default?""
          : (
          <>
            <label className={"btn btn-outline-info waves-effect waves-themed "+(clienttype===1?'active':'')} onClick={()=>setClientType(1)}>
              <input type="radio" name="odontogram_type" defaultChecked /> Boleta
            </label>
            <label className={"btn btn-outline-info waves-effect waves-themed "+(clienttype===2?'active':'')} onClick={()=>setClientType(2)}>
              <input type="radio" name="odontogram_type" /> Factura
            </label>
          </>
          )
        }
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
const NewCustomerForm = ({disabled}) => {
  return (
    <div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" disabled={!!disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" disabled={!!disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-p">Apellido paterno: </label>
        <input type="text" id="ape-p" className="form-control" disabled={!!disabled} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" disabled={!!disabled} />
      </div>
    </div>
  )
}
const PatientDebtsTable = ({patient, selected, select, refresh, setRefresh}) => {
  // Receive {patient, selected, select, refresh, setRefresh}
  const [dccs, setDebts] = useState(false)
  const [total_to_pay, setTTP] = useState(0)

  const getCuentaCorrienteDebts = () => {
    // Get patient's not paid dccs
    simpleGet(`finanzas/cuentacorriente/detalle/?filtro={"cliente_dni":"${patient.dni}", "estado_pago_not":"3"}`)
    .then(
      res => {
        if(__debug__) console.log("getCuentaCorrienteDebts res", res)
        setDebts(res)  // Save response as debts

        for(let r in res){
          // Fix leftover value in input may be higher than current deb
          window.document.getElementById('pay-amount-'+res[r].pk).value = "0"
          // Set new propertie 'monto' to 0
          res[r].monto = 0
        }
      },
      error => {
        console.log("WRONG!", error)
      }
    )
  }
  const checkbox_addToSelectedOnes = dcc => {
    if(existInObjectArray(selected, dcc, 'pk')){
      select(selected.filter(obj=>obj.pk!=dcc.pk))
      window.document.getElementById('pay-amount-'+dcc.pk).value = 0
      dcc.monto = 0
    }else{
      select([...selected, dcc])
      // Set default payment amount to dcc.deuda
      window.document.getElementById('pay-amount-'+dcc.pk).value = dcc.deuda
      dcc.monto = dcc.deuda
    }
    // Don't call calcNewTTP cuz select() update a state asynchronously
  }
  const onPayAmountChange = (input_el, dcc) => {
    console.log("onPayAmountChange", input_el.value, input_el.min, input_el.max)
    // Pay amount out of range
    if(input_el.value == ""){
      input_el.value = input_el.min
      return
    }
    if(Number(input_el.value) < Number(input_el.min)){
      input_el.value = input_el.min
      return
    }
    if(Number(input_el.value) > Number(input_el.max)){
      input_el.value = input_el.max
      return
    }
    // Set pay amount in dcc object
    dcc.monto = Number(input_el.value)

    calcNewTTP()  // Call this function cuz it's flat code (not update selected state)
  }
  const calcNewTTP = () => {
    if(__debug__) console.log("calcNewTTP")
    setTTP(selected.reduce((t,i)=>t+i.monto, 0))
  }

  // CSS
  const style = {
    pad_left: {paddingLeft: "10px"},
    th_row: {border: "4px solid #0000"}
  }

  useEffect(() => {
    if(__debug__) console.log("PatientDebtsTable useEffect")
    getCuentaCorrienteDebts()
  }, [])
  useEffect(() => {
    if(__debug__) console.log("PatientDebtsTable useEffect refresh")
    if(!refresh) return

    // refresh values
    select([])
    setRefresh(false)
    getCuentaCorrienteDebts()
  } , [refresh])
  useEffect(() => {
    if(__debug__) console.log("PatientDebtsTable useEffect selected")

    calcNewTTP()
  }, [selected])

  return !dccs
    ? "loading"
    : (
      <table style={{fontSize: "1.2em"}}>
        <thead>
          <tr style={style.th_row}>
            <td>Detalle</td>
            <td style={style.pad_left}>Deuda</td>
            <td style={style.pad_left}>Fecha limite</td>
            <td style={style.pad_left}>Monto a pagar</td>
          </tr>
        </thead>
        <tbody>
          {dccs.map(dcc => (
            <tr key={dcc.pk}>
              <td className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input"
                  id={"pay-"+dcc.pk} checked={existInObjectArray(selected, dcc, 'pk')}
                  onChange={()=>checkbox_addToSelectedOnes(dcc)} />
                <label className="custom-control-label" htmlFor={"pay-"+dcc.pk}>{cFL(dcc.detalle)}</label>
              </td>
              <td style={style.pad_left}> <code>{dcc.deuda}</code> </td>
              <td style={style.pad_left}>
                <span className={"badge badge-"
                  +(dcc.is_over==1?"danger":dcc.is_over==0?"warning":"info")
                  +" badge-pill"}>{dcc.fecha_limite ? dcc.fecha_limite.split("-").reverse().join("-") : "no indicado"}</span>
              </td>
              <td style={style.pad_left}>
                <input
                  type="number" id={"pay-amount-"+dcc.pk} className="form-control form-control-sm"
                  disabled={!existInObjectArray(selected, dcc, 'pk')} min="0" max={dcc.deuda}
                  onChange={ev => onPayAmountChange(ev.target, dcc)}
                />
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
            <td style={style.pad_left}> <code>{dccs.reduce((t,i)=>(t+i.deuda), 0)}</code> </td>
            <td></td>
            <td style={style.pad_left}> <code>{total_to_pay}</code> </td>
          </tr>
        </tfoot>
      </table>
    )
}


export default Cobranza
