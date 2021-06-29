import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom"
import {
  simpleGet,
  simplePostData,
  addRequestValidation,
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
} from '../../functions'
import { ListSavedMedicine } from '../prescripcion/Prescripcion'
import {
  Icon,
  PageTitle,
  RegularModalCentered
} from '../bits'
import MassiveNotification from './MassiveNotification'
import NewEditPatient from './NewEditPatient'
import CuestionarioPaciente from './CuestionarioPaciente'
import ArchivosPaciente from './GDriveFiles'
import Loader from '../loader/Loader'
import { NavigationContext } from '../Navigation'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"
const html_format_id = 'html_format_id'
const html_instant_notification_id = 'html_instant_notification_id'
const html_atender_modal_id = 'html_atender_modal_id'
const html_cuestionario_modal_id = 'html_cuestionario_modal_id'
export const tipo_documento = {
  1: "DNI",
  2: "CARNET DE EXTRANJERIA",
  3: "PASAPORTE",
}


const Admision = () => (
  <div>
    <PageTitle />

    <Switch>
      <Route exact path="/nav/admision">
        <AdmisionHome />
      </Route>
      <Route exact path="/nav/admision/editar/:patient">
        <NewEditPatient />
      </Route>
      <Route exact path="/nav/admision/mensaje">
        <MassiveNotification />
      </Route>
      <Route exact path="/nav/admision/:patient/detalle">
        <AdmisionDetail />
      </Route>
      <Route exact path="/nav/admision/:patient/archivos">
        <ArchivosPaciente />
      </Route>
      <Route exact path="/nav/admision/:patient/cuestionario/:cuestionario_pk">
        <CuestionarioPaciente />
      </Route>

      <Route>
        <Redirect to="/nav/admision" />
      </Route>
    </Switch>
  </div>
)

// General
const AdmisionHome = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)

  return (
    <div className="row">
      <div className="col-lg-9">
        <div style={{marginBottom: "25px"}}>
          <SearchPatient current_sucursal={current_sucursal} redirectTo={redirectTo} />
        </div>
      </div>
      <div className="col-lg-3">
        <div className="panel">
          <LinksHome redirectTo={redirectTo} />
        </div>
        <div className="panel">
          <LastAttendedPatients current_sucursal={current_sucursal} redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
const SearchPatient = ({current_sucursal, redirectTo}) => {
  const patients_ref = useRef([])
  const [patients, setPatients] = useState(false)
  const [datatable, setDatatable] = useState(false)
  const [loading, setLoader] = useState(true)

  // const getAllPatients = _sucursal_pk => simpleGet(`atencion/paciente/sucursal/`).then(pxs => setPatients(pxs.map(i => i.paciente_data)))
  const getAllPatients = _sucursal_pk => {
    // Function to build lot filter
    let filtro_batch = (_lot_length, _lot_number) => `?filtro={"lot":true,"lot_length":${_lot_length},"lot_number":${_lot_number}}`
    // Lot params
    let lot_length = 75
    // Init lot request
    batchRequest(`atencion/paciente/sucursal/`, filtro_batch, lot_length, 1, patients)
    .catch(() => console.log("data batch loaded"))
    .finally(() => setLoader(false))
  }
  const batchRequest = (_ep, _filtro_fn, _lot_length, _next_lot_number, _res) => {
    // Max number of requests
    if(_next_lot_number==20) return Promise.reject(null)
    return Promise.resolve(
      // Request next lot of queries
      simpleGet(_ep+_filtro_fn(_lot_length, _next_lot_number))
      // Save new lot reponse
      .then(res => handleLoteResponseState(res) || res)
      // Debug log
      .then(r => (__debug__ && console.log("batchRequest r"+_next_lot_number, r.length) || r))
      // Handle nested function
      .then(r => r.length==_lot_length
        ? batchRequest(_ep, _filtro_fn, _lot_length, _next_lot_number+1, r)
        : Promise.reject()
      )
    )
  }
  const handleLoteResponseState = _res => {
    /* This function is called to store and preserve state's value
    * batch responses can't be assigned to state right away bc state is asynchronous
    */
    patients_ref.current = patients_ref.current.concat( _res.map(r => r.paciente_data) )
    setPatients(patients_ref.current)
  }

  useEffect(() => {
    // Add DataTable rel docs
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script")
      dt_script.async = false
      dt_script.id = "dt_script"
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js"
      dt_script.onload = () => {
        // Run at first execution
        getAllPatients(current_sucursal)
      }
      document.body.appendChild(dt_script)
    }else{
      getAllPatients(current_sucursal)
    }
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link")
      dt_style.rel = "stylesheet"
      dt_style.id = "dt_style"
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css"
      document.head.appendChild(dt_style)
    }
  }, [])
  // When patients are setted
  useEffect(() => {
    if(!patients) return  // Abort if it's false

    // Destroy previous DT if exists
    let search_input_val = ""
    /* search_input_val
    * Store user's search value
    * in low conection or delayed requests enviroments,
    * user may start writing a search input before data have been fully loaded
    * new data lot being added to current DT's data will cause search input to stop working
    * so, we will be storing previous search input value, setting it into the new DT instance and focus search input
    */
    if(datatable){
      search_input_val = window.$('.dataTables_filter input').val()
      window.$('#search-patient').DataTable().clear().destroy()
    }
    // Gen Datatable
    let _tmp = window.$('#search-patient').DataTable({
      data: patients,
      columns: [
        {title: "Nombre", data: null},
        {title: "Apellidos", data: null},
        {title: "DNI", data: null},
        {title: "", data: null},
      ],
      columnDefs: [{
        // Nombre
        targets: 0,
        render: (_, __, rowData) => (
          cFL(rowData.nombre_principal)+
          (rowData.nombre_secundario?" "+cFL(rowData.nombre_secundario):"")
        ),
      }, {
        // Apellidos
        targets: 1,
        render: (_, __, rowData) => (
          cFL(rowData.ape_paterno)+" "+
          cFL(rowData.ape_materno)
        ),
      }, {
        // DNI
        targets: 2,
        render: (_, __, rowData) =>
          `<span class="${!rowData.dni && `badge badge-secondary badge-pill`}"
          title=${tipo_documento[rowData.tipo_documento]}>
            ${rowData.dni || rowData.dni_otro}
          </span>`
      }, {
        // Button
        targets: -1,
        orderable: false,
        width: "1px",
        defaultContent: "<button class='select-patient btn btn-light btn-pills waves-effect'>Seleccionar</button>",
        createdCell: (cell, _, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            redirectTo(`/nav/admision/${rowData.pk}/detalle`)
          }
        }
      }],
      pageLength: 10,
      search: {
        search: search_input_val
      },
      lengthMenu: [[10, 20, 30], [10, 20, 30]],
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay pacientes registrados",
        sInfo:           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        sInfoEmpty:      "Mostrando registros del 0 al 0 de un total de 0 registros",
        sInfoFiltered:   "(filtrado de un total de _MAX_ registros)",
        sInfoPostFix:    "",
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
    // Focus input to allow user continuous writing
    window.$('.dataTables_filter input').focus()

    setDatatable(_tmp)  // Save DT in state
  }, [patients])

  return !patients
    ? "loading"
    : (
      <div className="datatable-container col-12">
        {loading && <Loader scale={2} />}
        <table id="search-patient" style={{width: "100%"}}></table>
      </div>
    )
}
const LastAttendedPatients = ({current_sucursal, redirectTo}) => {
  const [lastPatients, setLastPatients] = useState(false)
  const max_items = 5

  const getLastAttendedPatients = (_sucursal_pk, ndays=3) => {
    // Get lastest attended patients within the last four days
    let _day = new Date()
    _day.setDate(_day.getDate()-ndays)
    _day = _day.toDateInputValue()

    simpleGet(`atencion/cita/?filtro={"sucursal":"${_sucursal_pk}", "estado":"5", "fecha_desde":"${_day}", "sort":"true"}`)
    .then(
      response_obj => {
        let _fake_obj = []
        let _tmp1 = []
        response_obj.map(cita => {  // Select only different patients
          if(_tmp1.includes(cita.paciente_data.pk)) return  // Abort
          else _tmp1.push(cita.paciente_data.pk)  // Save patient's pk

          _fake_obj.push(cita.paciente_data)  // Save patient's data
        })

        setLastPatients(_fake_obj)
      }
    )
  }

  useEffect(() => {
    getLastAttendedPatients(current_sucursal)
  }, [])

  return !lastPatients
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
        <div className="card-header">
          <div className="card-title">
            Pacientes atendidos en los últimos días
          </div>
        </div>
        <div id="pat-list" className={lastPatients.length==0?"card-body":""}>
          {lastPatients.length==0
            ? "No hay pacientes atendidos ultimamente"
            : lastPatients.map((pat, inx) => ( inx>max_items-1?"":
              <div key={"pat-"+pat.pk}>
                <li className="list-group-item d-flex" id={pat.pk}
                  onClick={()=>{redirectTo(`/nav/admision/${pat.pk}/detalle`)}}
                  data-toggle="collapse" data-target={"#pat-desc-"+pat.pk}
                  aria-expanded="true" aria-controls={"pat-desc-"+pat.pk}
                  style={{cursor: "pointer", borderBottom: "0"}}>
                    <span
                      style={{fontSize: "1.2em"}}>
                        {cFL(pat.nombre_principal)
                          +" "+(pat.nombre_secundario?" "+cFL(pat.nombre_secundario):"")
                          +" "+cFL(pat.ape_paterno)
                          +" "+cFL(pat.ape_materno)
                        }
                    </span>
                </li>
              </div>
            ))}
        </div>
      </div>
    )
}
const LinksHome = ({redirectTo}) => (
  <div className="card col-12" style={{padding: "0px"}}>
    <div className="card-header">
      <div className="card-title">
        Acciones
      </div>
    </div>
    <div className="card-body">
      <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
        <Icon type="new-patient" onClick={() => redirectTo("/nav/admision/editar/0")} />
        <span style={{fontSize: "0.9rem"}}>Nuevo</span>
      </div>
      <div className="col-4" style={{display: "inline-block", textAlign: "center"}}>
        <Icon type="letter" onClick={() => redirectTo("/nav/admision/mensaje")} />
        <span style={{fontSize: "0.9rem"}}>Mensajes masivos</span>
      </div>
    </div>
  </div>
)

// By patient
const AdmisionDetail = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  const _params_ = useParams()
  const [patient, setPatient] = useState(false)

  const getPatientByID = _id => getDataByPK('atencion/paciente/admision/pk', _id).then(setPatient)

  useEffect(() => {
    getPatientByID(_params_.patient)
  }, [])
  useEffect(() => () => {
    window.$('#'+html_format_id).modal('hide')
    window.$('#'+html_instant_notification_id).modal('hide')
    window.$('#'+html_atender_modal_id).modal('hide')
    window.$('#'+html_cuestionario_modal_id).modal('hide')
  }, [])

  return !patient
    ? "loading"
    : (
      <div className="row">
        <div className="col-lg-6">
          <div className="panel">
            <div className="card col-12" style={{padding: "0px"}}>
              <div className="card-header">
                <div className="card-title">
                  Paciente
                </div>
              </div>
              <PatientDataList patient={patient} />
              <PatientExtraDataList patient={patient} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="panel">
            <LinksDetail
              patient={patient}
              redirectTo={redirectTo} />
          </div>
          <div className="panel">
            <PatientPrescription
              patient={patient}
              redirectTo={redirectTo} />
          </div>
        </div>
        <ModalFormatos patient_pk={patient.pk} current_sucursal={current_sucursal} />
        <InstantNotification patient_pk={patient.pk} current_sucursal={current_sucursal} />
        <AtenderPaciente patient_pk={patient.pk} current_sucursal={current_sucursal} redirectTo={redirectTo} />
        <ListCuestionario patient_pk={patient.pk} redirectTo={redirectTo} />
      </div>
    )
}
export const PatientDataList = ({patient}) => (
  <div className="card-body">
    <h5>Nombres: <span style={{color:"black"}}>{cFL(patient.nombre_principal)+
      (patient.nombre_secundario?" "+
      cFL(patient.nombre_secundario):"")}</span>
    </h5>
    <h5>Apellidos: <span style={{color:"black"}}>{cFL(patient.ape_paterno)+" "+
      cFL(patient.ape_materno)}</span>
    </h5>

    <h5>{tipo_documento[patient.tipo_documento]}: <span style={{color:"black"}}>{patient.dni?patient.dni:patient.dni_otro}</span></h5>

    <h5>Genero: <span style={{color:"black"}}>{patient.sexo=="1"?"Masculino":"Femenino"}</span></h5>
    {!patient.fecha_nacimiento ? ""
      : <h5>Fecha de nacimiento: <span style={{color:"black"}}>{patient.fecha_nacimiento}</span></h5>
    }
    {!patient.celular ? ""
      : <h5>Número de contacto: <span style={{color:"black"}}>{patient.celular}</span></h5>
    }
    {!patient.direccion ? ""
      : <h5>Dirección: <span style={{color:"black"}}>{patient.direccion}</span></h5>
    }
    {!patient.procedencia ? ""
      : <h5>Procedencia: <span style={{color:"black"}}>{patient.procedencia}</span></h5>
    }
    {!patient.residencia ? ""
      : <h5>Residencia: <span style={{color:"black"}}>{patient.residencia}</span></h5>
    }
  </div>
)
const PatientExtraDataList = ({patient}) => {
  let ant = patient.antecedentes
  let extra = patient.camposextra.length == 0 ? false : patient.camposextra.filter(e => e.mostrar_en_admision)
  const printBlack = val => <span style={{color:"black"}}>{val}</span>
  const printExBlack = ex => <h5 key={"extra-field-"+ex.pk}>{ex.texto}: {printBlack(ex.respuesta || ex.respuesta_descripcion)}</h5>

  return (
    <div className="card-body">
      <hr style={{borderBottomWidth: "2px", borderBottomStyle: "solid", marginTop: "-30px"}}/> {/* Separator */}
      <h5>Alergias: {printBlack(ant.alergias)}</h5>
      <h5>Medicamentos: {printBlack(ant.medicamentos)}</h5>
      <h5>Operaciones: {printBlack(ant.operaciones)}</h5>

      {ant.diabetes && <h5>Diabetes: SI</h5>}
      {ant.enf_cardiovascular && <h5>Enfermedad Cardiovascular: SI</h5>}
      {ant.hemorragia && <h5>Hemorragia: SI</h5>}
      {ant.hepatitis && <h5>Hepatitis: SI</h5>}

      {extra && extra.map(printExBlack)}
    </div>
  )
}
const PatientPrescription = ({patient}) => {
  const [prescription_list, setPrescriptionList] = useState(false)

  const removeMedicineFromList = _medc_pk => {
    // Remove medicine by index in array
    let _tmp = prescription_list.filter(i => i.pk!=_medc_pk)

    setPrescriptionList(_tmp)
  }
  const getPrescriptionMedicine = _patient_pk => simpleGet(`atencion/prescripcion/?filtro={"paciente":"${_patient_pk}"}`).then(setPrescriptionList)

  useEffect(() => {
    getPrescriptionMedicine(patient.pk)
  }, [])

  return !prescription_list
    ? "loading"
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Prescripciones actuales del paciente
          </div>
        </div>
        <ListSavedMedicine
            removeMedicineFromList={removeMedicineFromList}
            medicine_list={prescription_list} />
      </div>
    )
}
const LinksDetail = ({patient, redirectTo}) => {
  // WARNING: This component strongly depends on it's props
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        {/* editar */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="edit-patient"
            onClick={() => redirectTo(`/nav/admision/editar/${patient.pk}`)} />
          <span style={{fontSize: "0.9rem"}}>Editar</span>
        </div>
        {/* cita */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="add" onClick={() => redirectTo('/nav/cita/', {patient: patient})} />
          <span style={{fontSize: "0.9rem"}}>Crear Cita</span>
        </div>
        {/* odontograma */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="odontogram" onClick={() => redirectTo(`/nav/odontograma/${patient.pk}/evolucion/`)} />
          <span style={{fontSize: "0.9rem"}}>Odont.</span>
        </div>
        {/* cobrar */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="finance"
            onClick={() => redirectTo(`/nav/cobranza/${patient.pk}/detalle`)} />
          <span style={{fontSize: "0.9rem"}}>Cobrar</span>
        </div>
        {/* Separador*/} <div style={{width:"100%", height:"20px"}}></div>
        {/* historia */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="clinic-history"
            onClick={() => redirectTo(`/nav/historiaclinica/${patient.pk}/`)} />
          <span style={{fontSize: "0.9rem"}}>Historia</span>
        </div>
        {/* pdt */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="plandetrabajo"
            onClick={() => redirectTo(`/nav/plandetrabajo/${patient.pk}/`)} />
          <span style={{fontSize: "0.9rem"}}>Plan de trabajo</span>
        </div>
        {/* atender */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="add" onClick={() => window.$('#'+html_atender_modal_id).modal('show')} />
          <span style={{fontSize: "0.9rem"}}>Atender</span>
        </div>
        {/* archivos */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="files" onClick={() => redirectTo(`/nav/admision/${patient.pk}/archivos`)} />
          <span style={{fontSize: "0.9rem"}}>Archivos</span>
        </div>
        {/* Separador*/} <div style={{width:"100%", height:"20px"}}></div>
        {/* Historial de pagos */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="finance" onClick={() => redirectTo(`/nav/cobranza/${patient.pk}/pagos`)} />
          <span style={{fontSize: "0.9rem"}}>Historial de pagos</span>
        </div>
        {/* Formatos */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="pdf" onClick={() => window.$('#'+html_format_id).modal('show')} />
          <span style={{fontSize: "0.9rem"}}>Formatos</span>
        </div>
        {/* Notificacion instantanea */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="letter" onClick={() => window.$('#'+html_instant_notification_id).modal('show')} />
          <span style={{fontSize: "0.9rem"}}>Mensaje</span>
        </div>
        {/* CUestionarios */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="list" onClick={() => window.$('#'+html_cuestionario_modal_id).modal('show')} />
          <span style={{fontSize: "0.9rem"}}>Cuestionario</span>
        </div>
      </div>
    </div>
  )
}
// Formatos
const ModalFormatos = ({patient_pk, current_sucursal}) => {
  let formats = [
    {
      text: "Cuidados de la ortodoncia",
      link: `atencion/viewdoc/1/${current_sucursal}/${patient_pk}/`,
      sucursal: [2, 3, 4],
    }, {
      text: "Certificado de atencion",
      link: `atencion/viewdoc/101/${current_sucursal}/${patient_pk}/`,
      sucursal: [2, 3],
    }, {
      text: "Formato de Historia",
      link: `atencion/viewdoc/historia/${current_sucursal}/${patient_pk}/`,
      sucursal: [2, 4],
    }, {
      text: "Dirección de Paciente",
      link: `atencion/viewdoc/103/${current_sucursal}/${patient_pk}/`,
      sucursal: [2, 3, 4],
    },
  ]
  const redirectToFormat = endpoint => window.open(process.env.REACT_APP_PROJECT_API+endpoint, '_blank')

  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+html_format_id).modal("hide")
  }, [])

  return (
    <RegularModalCentered
      _id={html_format_id}
      _title={"Generar formato"}
      _body={
        <div>
          {formats.map(f => (f.sucursal.indexOf(current_sucursal) != -1) && (
            <button className="btn btn-primary" style={{display: "block"}}
            onClick={() => redirectToFormat(f.link)}>
              {f.text}
            </button>
          ))}
        </div>
      } />
  )
}
// Send Instant Notification
const InstantNotification = ({patient_pk, current_sucursal}) => {
  let [checkbox_now, setCheckboxNow] = useState(true)
  // Current sucursal
  const ctx_nv = useContext(NavigationContext)
  let cur_suc = ctx_nv.sucursales.find(s => s.pk==ctx_nv.current_sucursal)
  let signature = `- ${cur_suc.empresa_data.razon_social.toUpperCase()}`
  // Current datetime
  let _dt = new Date()
  let datetime_now = _dt.toDateInputValue()+'T'+_dt.getHours()+":"+String(_dt.getMinutes()).padStart(2, "0")

  const saveInstantNotification = () => {
    if(__debug__) console.log("InstantNotification saveInstantNotification");

    let data = {
      message: window.document.getElementById('in-msg').value.trim(),
      now: window.document.getElementById('in-now').checked,
      fecha: window.document.getElementById('in-fecha').value.split('T')[0],
      hora: window.document.getElementById('in-fecha').value.split('T')[1],
    }

    // Verificar valores
    if(data.message.length==0){
      alert("El mensaje no puede estar vacio")
      return
    }else if(/[áéíóúÁÉÍÓÚñÑ]/.test(data.message)){
      alert("El mensaje no puede contener tildes o ñ")
      return
    }
    // Add signature
    data.message += '\n'+signature

    console.log("data", data)
    // Enviar data al API
    simplePostData(`atencion/notification/instant/paciente/${patient_pk}/sucursal/${current_sucursal}/`, data)
    .then(r => console.log("r", r))
    .then(
      () => handleErrorResponse("custom", "Enviado", "El mensaje fue enviado exitosamente", "info")
    )
    .then(() => window.$('#'+html_instant_notification_id).modal('hide'))
  }

  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+html_format_id).modal("hide")
  }, [])

  return (
    <RegularModalCentered
      _id={html_instant_notification_id}
      _title={"Enviar mensaje al paciente"}
      _body={
        <div>
          <div className="form-group">
            <label className="form-label" htmlFor="input-descripcion">Mensaje</label>
            <textarea className="form-control"
            placeholder="Mensaje aqui" id="in-msg" rows="3" maxLength={140-signature.length}
            style={{borderBottom: "none", resize: "none", borderRadius: "0"}}></textarea>
            <span className="form-control" style={{
              display: "block", borderTop: "none", borderRadius: "0",
            }}>{signature}</span>
            <span className="help-block">
              {140-signature.length} caracteres maximo, solo letras y numeros permitidos (no tildes, ñ o simbolos)
            </span>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="input-fecha">Cuándo enviar?</label>
            <div style={{display: "flex", alignItems: "center"}}>
              <div className="custom-control custom-checkbox custom-control-inline">
                <input type="checkbox" className="custom-control-input" id="in-now" defaultChecked onChange={e => setCheckboxNow(e.target.checked)} />
                <label className="custom-control-label" htmlFor="in-now">Ahora</label>
              </div>
              <input type="datetime-local" id="in-fecha" className="form-control col-3" disabled={checkbox_now}
              defaultValue={datetime_now} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveInstantNotification}>Enviar mensaje</button>
        </div>
      } />
  )
}
const AtenderPaciente = ({patient_pk, current_sucursal, redirectTo}) => {
  let [latest_citas, setLatestCitaInfo] = useState(false)
  let [personal, setPersonal] = useState(false)

  const getLatestCitasInfo = (pac_pk, _sucursal_pk) => {
    if(__debug__) console.log("AtenderPaciente getUnfinishedANP")
    simplePostData(`atencion/noprogramado/unfinished/`, {paciente_pk: pac_pk, sucursal_pk: _sucursal_pk})
    .then(res => setLatestCitaInfo(res.citas))
  }
  const getPersonal = () => simpleGet(`maestro/empresa/personal/?filtro={"atencion":"true"}`).then(setPersonal)
  const submitAtender = () => {
    let personal_pk = window.document.getElementById('last_cita_personal').value
    simplePostData(`atencion/noprogramado/create/`, {paciente: patient_pk, sucursal: current_sucursal, personal: personal_pk})
    .then( c => redirectTo(`/nav/atencion/${c.pk}/detalle`))
  }
  const goPastAttention = () => {
    let cita_pk = window.document.getElementById('last_cita').value
    redirectTo(`/nav/atencion/${cita_pk}/detalle`)
  }

  useEffect(() => {
    if(__debug__) console.log("AtenderPaciente useEffect")

    getLatestCitasInfo(patient_pk, current_sucursal)
    getPersonal()
  }, [])

  return (
    <RegularModalCentered
      _id={html_atender_modal_id}
      _title={"Atender Paciente"}
      _body={
        <div>
          <div className="form-group">
            <label className="form-label" htmlFor="last_cita">Atenciones del día de hoy: </label>
            {!latest_citas
              ? <Loader scale={2} />
              : latest_citas.length == 0
                ? <h5 style={{color: "purple"}}>No se encontraron atenciones</h5>
                : (
                  <div className="row">
                    <div className="col-8">
                      <select className="custom-select form-control" id="last_cita">
                        {latest_citas.map(c =>
                          <option key={c.pk} value={c.pk}>{c.hora.slice(0, 5)} - {c.personal.fullname.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="col-2">
                      <button className="btn btn-primary" onClick={goPastAttention}>Ir</button>
                    </div>
                  </div>
                )
            }
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="last_cita_personal">Crear atención sin cita: </label>
            <div className="row">
              <div className="col-8">
                {!personal
                  ? <Loader scale={2} />
                  : (
                    <select className="custom-select form-control" id="last_cita_personal">
                      {personal.map(p => <option key={p.pk} value={p.pk}>{p.fullname.toUpperCase()}</option>)}
                    </select>
                  )}
              </div>
              <div className="col-2">
                <button className="btn btn-primary" onClick={submitAtender}>Crear</button>
              </div>
            </div>
          </div>
        </div>
      } />
  )
}
const ListCuestionario = ({patient_pk, redirectTo}) => {
  const [cuestionarios, setCuestionarios] = useState(false)

  const getCuestionarios = () => simpleGet(`atencion/cuestionario/?filtro={"activo":"1"}`).then(setCuestionarios)

  useEffect(() => {
    getCuestionarios()
  }, [])

  return (
    <RegularModalCentered
      _id={html_cuestionario_modal_id}
      _title={"Cuestionarios activos"}
      _body={
        <div className="form-group col-md-12">
          <table><tbody>
          {cuestionarios && cuestionarios.length == 0 && (
            <tr>No hay cuestionarios disponibles, puedes crear uno <a href="/nav/admin/cuestionario">aquí</a></tr>
          )}
          {cuestionarios && cuestionarios.map(c => (
            <tr key={"cuestionario-tr-"+c.pk}>
              <td>
                <button className="btn btn-primary"
                onClick={() => redirectTo(`/nav/admision/${patient_pk}/cuestionario/${c.pk}/`)}>{c.titulo}</button>
              </td>
            </tr>
          ))}
          </tbody></table>
        </div>
      } />
  )
}


export default Admision

/*
* Add cita (optional|maybe later)
*/
