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
  // Helper
  UpdateContext,
  UpdateComponentHelper,
} from '../../functions'
import { PageTitle } from '../bits'
import HistorialPagos from './HistorialPagos'
import { NavigationContext } from '../Navigation'
import { xhtmlDecode } from '../admision/Admision'


// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Cobranza = () => (
  <Switch>
    <Route exact path='/nav/cobranza/list/'>
      <DebtXPatientTable />
    </Route>
    <Route path='/nav/cobranza/:patient/detalle'>
      <UpdateComponentHelper>
        <CobranzaDetail />
      </UpdateComponentHelper>
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

const CobranzaDetail = () => {
  const {current_sucursal} = useContext(NavigationContext)
  let __params__ = useParams()
  const [selected_attention_detail, setSelectedAD] = useState([])
  const [patient, setPatient] = useState(false)
  // update_dcclist will re-execute this component so dcc_list is recalculated with its new .monto value
  const [update_dcclist, updateDCCList] = useState(false)
  let dcc_list = selected_attention_detail.map(i => {return {dcc: (i.pk||null), monto: i.monto}})

  const getPatientByID = _id => getDataByPK('atencion/paciente', _id).then(setPatient)
  const updatedcclist = () => updateDCCList(!update_dcclist)

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
            dcc_list={dcc_list}
            current_sucursal={current_sucursal}
            patient={patient} />
        </div>
        <div className="col-lg-8">
          <div style={{marginTop: "30px", marginLeft: "20px"}}>
            <PatientDebtsTable
              selected={selected_attention_detail}
              select={setSelectedAD}
              updateDCCList={updatedcclist}
              patient={patient} />
          </div>
        </div>
      </div>
    </>
    )
}
export const PaymentForm = ({patient, current_sucursal, dcc_list, footer_fn=false}) => {
  // dcc_list = [{dcc: (i.dcc||null), monto: i.precio}]

  let production_nofe_default = false  // Sucursal have perms to use FE
  const update_ctx = useContext(UpdateContext)
  const [clienttype, setClientType] = useState(production_nofe_default?3:1)  // BOLETA || FACTURA || SIN CLIENTE
  const [ubigeos, setUbigeos] = useState(false)
  const [client, setClient] = useState(false)
  let html_btn_group_toggle_class = "btn btn-outline-info waves-effect waves-themed"

  // Initial
  const getUbigeos = () => simpleGet('maestro/ubigeo').then(setUbigeos)
  const getCliente = () => {
    simpleGet(`finanzas/cliente/?filtro={"dni":"${patient.dni}"}`)
    .then(i => i.length!=0 ? setClient(i[0]) : fillFromPatient())
  }
  // Extras
  const fillFromPatient = () => {
    /* Initial fill of data when clienttype = 1
    * Fill tipo_documento = DNI
    * Fill dni = patient.dni
    * Fill fullname = patient.fullname
    */
    if(clienttype != 1) return

    window.document.getElementById('client-data-1').value = "1"  // DNI
    window.document.getElementById('client-data-2').value = patient.dni
    window.document.getElementById('fullname').value = patient.fullname.toUpperCase()
  }
  const fillFromClient = () => {
    if(clienttype != 1 || !client) return

    window.document.getElementById('client-data-1').value = client.tipo=='3'?'1':'2'
    window.document.getElementById('client-data-2').value = client.tipo!='3'?client.ruc:client.ruc?client.ruc:client.dni
    window.document.getElementById('fullname').value = client.tipo!='3'?client.razon_social:(getDataFromCloud(client.dni?client.dni:client.ruc)||"")
    window.document.getElementById('form-ubigeo').value = client.ubigeo
    window.document.getElementById('form-direccion').value = client.direccion
  }
  const getBack = () => window.history.back()
  const inputChange = ev => {
    let val = ev.target.value.trim()
    getDataFromCloud(val)
  }
  const getDataFromCloud = val => {
    // Two flux {1:BOLETA || 2:FACTURA}
    if(clienttype==1){
      // BOLETA
      let tipo = window.document.getElementById('client-data-1').value
      // Validar longitud de val
      if(val.length != (tipo=="1"?8:11)){
        window.document.getElementById('fullname').value = ""
        return
      }

      if(tipo=="1"){
        simpleGet(`atencion/reniec/${val}/`)
        .then(p => {
          if(clienttype != 1) return
          window.document.getElementById('fullname').value = xhtmlDecode(p.nombres+" "+p.apellido_paterno+" "+p.apellido_materno)
          handleErrorResponse('paymentform', "", "Datos del dni obtenidos de la reniec", 'info')
        })
      }else{
        simpleGet(`atencion/sunat/${val}/`)
        .then(p => {
          if(clienttype != 1) return
          // Validar respuesta
          if(p.success){
            window.document.getElementById('fullname').value = p.data.nombre_o_razon_social
            window.document.getElementById('form-direccion').value = p.data.direccion
            let _opt = window.document.querySelector(`option[data-ubigeo='${p.data.ubigeo[2]}']`)
            window.$('#form-ubigeo').val(_opt.value).trigger('change')
            handleErrorResponse('paymentform', "", "Datos del ruc obtenidos de la sunat", 'info')
          }else handleErrorResponse('paymentform', "", "El RUC no existe", 'danger')
        })
      }
    }else if(clienttype==2){
      // FACTURA
      // Validar longitud de val
      if(val.length != 11){
        window.document.getElementById('client-data-2').value = ""
        return
      }
      // Consultar servicio de sunat
      simpleGet(`atencion/sunat/${val}/`)
      .then(p => {
        if(clienttype != 2) return
        // Validar respuesta
        if(p.success){
          window.document.getElementById('client-data-2').value = p.data.nombre_o_razon_social
          window.document.getElementById('form-direccion').value = p.data.direccion
          let _opt = window.document.querySelector(`option[data-ubigeo='${p.data.ubigeo[2]}']`)
          window.$('#form-ubigeo').val(_opt.value).trigger('change')
          handleErrorResponse('paymentform', "", "Se ha encontrado información relacionada al ruc en el servicio de sunat", 'info')
        }else handleErrorResponse('paymentform', "", "El RUC no existe", 'danger')
      })
    }
  }
  // Save payment
  const getClient = () => {
    let client = {
      ubigeo: window.document.getElementById('form-ubigeo').value,
      direccion: window.document.getElementById('form-direccion').value,
    }
    // Validate
    if(clienttype==2 && client.direccion.trim().length<3){
      handleErrorResponse("paymentform", "Error", "La direccion es obligatoria al emitir facturas", "warning")
      return null
    }
    if(client.direccion.trim().length==0) client.direccion = null

    if(clienttype==2){
      client.ruc = window.document.getElementById('client-data-1').value
      client.razon_social = window.document.getElementById('client-data-2').value
      client.dni = null
      // Validate
      if(client.ruc.length!=11){
        handleErrorResponse("paymentform", "Error", "El ruc debe tener 11 digitos", "warning")
        return null
      }
    }else if(clienttype==1){
      let _tipo = window.document.getElementById('client-data-1').value
      if(_tipo=='1'){
        // DNI
        client.ruc = null
        client.razon_social = window.document.getElementById('fullname').value
        client.dni = window.document.getElementById('client-data-2').value
        // Validate
        if(client.dni.length!=8){
          handleErrorResponse("paymentform", "Error", "El dni debe tener 8 digitos", "warning")
          return null
        }
      }else if(_tipo=='2'){
        // RUC
        client.ruc = window.document.getElementById('client-data-2').value
        client.razon_social = window.document.getElementById('fullname').value
        client.dni = null
        // Validate
        if(client.ruc.length!=11){
          handleErrorResponse("paymentform", "Error", "El ruc debe tener 11 digitos", "warning")
          return null
        }
      }

    }

    return client
  }
  const handleSubmit = () => {
    let _client = getClient()
    if(!_client) return
    // Validate dcc_list data doesn't have monto 0
    if(dcc_list.some(i => i.monto == 0)){
      handleErrorResponse("paymentform", "Error", "No se puede pagar 0 soles", "warning")
      return
    }
    sendData(dcc_list, _client)
  }
  const sendData = (_dcc_list, _client) => {
    simplePostData('finanzas/pago/create/', {
      paciente: patient.pk,
      cliente: _client,
      sucursal: current_sucursal,
      tipo_pago: clienttype,
      monto_pagado: _dcc_list.reduce((sum, i) => (sum+i.monto), 0),
      dcc_list: _dcc_list,
    })
    // Call EP to show comprobante in screen
    .then(res => res && window.open(process.env.REACT_APP_PROJECT_API+`fe/comprobante/view/${res.comprobante}/`, "_blank"))
    .then(() => handleErrorResponse("paymentform", "Exito", "Se ha realizado el pago correctamente", "info"))
    .then(() => update_ctx.update(true))
    .catch(er => console.log("ERROR", er))
  }

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
        window.$("#form-ubigeo").select2({dropdownParent: window.$("#form-ubigeo").parent()})
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      window.$("#form-ubigeo").select2({dropdownParent: window.$("#form-ubigeo").parent()})
    }

    getUbigeos()
    getCliente()
  }, [])
  useEffect(() => {
    if(__debug__) console.log("useEffect client", client)

    if(clienttype==1) fillFromClient()
  }, [client])
  useEffect(() => {
    if(__debug__) console.log("useEffect clienttype", clienttype)

    if(clienttype==1) fillFromPatient()
  }, [clienttype])

  return (
    <div>
      <div id="alert-paymentform" className="alert bg-warning-700 fade" role="alert" style={{display: "none"}}>
        <strong id="alert-paymentform-headline">Error!</strong> <span id="alert-paymentform-text">Algo salió mal</span>.
      </div>

      <div style={{marginLeft: "20px"}} className="btn-group btn-group-toggle" data-toggle="buttons">
        {production_nofe_default?""
          : (
          <>
            <label className={html_btn_group_toggle_class+(clienttype==1?' active':'')} onClick={()=>setClientType(1)}>
              <input type="radio" name="client_type" defaultChecked /> Boleta
            </label>
            <label className={html_btn_group_toggle_class+(clienttype==2?' active':'')} onClick={()=>setClientType(2)}>
              <input type="radio" name="client_type" /> Factura
            </label>
          </>
          )
        }
        <label className={html_btn_group_toggle_class+(clienttype==3?' active':'')} onClick={()=>setClientType(3)}>
          <input type="radio" name="client_type" /> Sin FE
        </label>
      </div>

      <div style={{paddingTop: "20px"}}>
        {clienttype==1 && <FormPayMethod1 inputChange={inputChange} />}
        {clienttype==2 && <FormPayMethod2 inputChange={inputChange} />}
        {clienttype==3 && <FormPayMethod3 />}
        <FormPayLocation hidden={clienttype!=3} ubigeos={ubigeos} />
      </div>

      {footer_fn
        ? footer_fn(getClient, clienttype)
        : (
        <div className="col-sm d-flex" style={{paddingTop: "30px"}}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Procesar
          </button>
          <button className="btn btn-light ml-auto" onClick={getBack}>
            Regresar
          </button>
        </div>
      )}
    </div>
  )
}
const FormPayMethod1 = ({inputChange}) => {
  const [client_doc, setClienteDoc] = useState(1)
  // client_doc is related to client-data-1 select::option (1: dni, 2: ruc)
  const handleChangeClienteDocumento = ev => setClienteDoc(ev.target.value)

  useEffect(() => {
    window.document.getElementById('client-data-2').value = ""
    window.document.getElementById('fullname').value = ""
  }, [client_doc])

  return (
    <div>
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="client-data-1">Documento: </label>
        <select id="client-data-1" className="custom-select form-control"
        defaultValue={client_doc} onChange={handleChangeClienteDocumento}>
          <option value="1">DNI</option>
          <option value="2">RUC</option>
        </select>
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="client-data-2">{client_doc==1?"DNI":"RUC"}: </label>
        <input type="text" id="client-data-2" className="form-control"
        maxLength={client_doc==1?8:11} onChange={inputChange} />
      </div>
      <div className="col-sm">
        <input type="text" id="fullname" className="form-control" disabled={true} />
      </div>
    </div>
  )
}
const FormPayMethod2 = ({inputChange}) => (
  <div>
    <div className="col-sm" style={{paddingBottom: "5px"}}>
      <label className="form-label" htmlFor="client-data-1">RUC: </label>
      <input type="text" id="client-data-1" className="form-control"
      maxLength="11" onChange={inputChange} />
    </div>
    <div className="col-sm" style={{paddingBottom: "5px"}}>
      <label className="form-label" htmlFor="client-data-2">Razón Social: </label>
      <input type="text" id="client-data-2" className="form-control" disabled={true} />
    </div>
  </div>
)
const FormPayMethod3 = () => (
  <div className="card-body">
    <h5>Emitir comprobante manualmente</h5>
  </div>
)
const FormPayLocation = ({hidden, ubigeos}) => (
  <div style={{display: hidden?"block":"none"}}>
    <div className="col-sm">
      <label className="form-label" htmlFor="form-ubigeo">Residencia: </label>
      <select id="form-ubigeo" className="custom-select form-control custom-select-lg">
        {ubigeos && ubigeos.map(u =>
          <option key={"select_ubigeo_"+u.pk} value={u.pk} data-ubigeo={u.ubigeo}>
            {u.provincia} - {u.distrito}
          </option>
        )}
      </select>
    </div>
    <div className="col-sm" style={{paddingBottom: "5px"}}>
      <label className="form-label" htmlFor="form-direccion">Dirección: </label>
      <input type="text" id="form-direccion" className="form-control" />
    </div>
  </div>
)
const PatientDebtsTable = ({patient, selected, select, updateDCCList}) => {
  const update_ctx = useContext(UpdateContext)
  const [dccs, setDebts] = useState(false)
  const [total_to_pay, setTTP] = useState(0)

  const getCuentaCorrienteDebts = () => {
    // Get patient's not paid dccs
    simpleGet(`finanzas/cuentacorriente/detalle/?filtro={"paciente":"${patient.pk}", "estado_pago_not":"3"}`)
    .then(
      res => {
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
    updateDCCList()
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
    getCuentaCorrienteDebts()
  }, [])
  useEffect(() => {
    if(__debug__) console.log("PatientDebtsTable useEffect update_ctx.status")
    if(!update_ctx.status) return

    // update values
    select([])
    update_ctx.update(false)
    getCuentaCorrienteDebts()
  } , [update_ctx.status])
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
