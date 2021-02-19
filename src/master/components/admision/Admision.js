import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom";
import {
  simpleGet,
  simplePostData,
  addRequestValidation,
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
} from '../../functions';
import { ListSavedMedicine } from '../prescripcion/Prescripcion';
import {
  Icon,
  ModalLoading,
  RegularModalCentered
} from '../bits';
import { FileIcon, defaultStyles } from 'react-file-icon'
import MassiveNotification from './MassiveNotification';
import { NavigationContext } from '../Navigation';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const html_format_id = 'html_format_id'
const html_instant_notification_id = 'html_instant_notification_id'


const Admision = () => (
  <div>
    <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
      <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal</span>.
    </div>

    <Switch>
      <Route exact path="/nav/admision">
        <AdmisionHome />
      </Route>
      <Route exact path="/nav/admision/nuevo">
        <RegisterPatient />
      </Route>
      <Route exact path="/nav/admision/mensaje">
        <MassiveNotification />
      </Route>
      <Route exact path="/nav/admision/:patient/detalle">
        <AdmisionDetail />
      </Route>
      <Route exact path="/nav/admision/:patient/editar">
        <EditPatient />
      </Route>
      <Route exact path="/nav/admision/:patient/archivos">
        <ArchivosPaciente />
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
      <div className="col-lg-8">
        <div style={{marginBottom: "25px"}}>
          <SearchPatient current_sucursal={current_sucursal} redirectTo={redirectTo} />
        </div>
      </div>
      <div className="col-lg-4">
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
  const [patients, setPatients] = useState([])
  const [datatable, setDatatable] = useState(false)

  const getAllPatients = _sucursal_pk => {
    // Function to build lot filter
    let filtro_lote = (_lot_length, _lot_number) => `?filtro={"lot":true,"lot_length":${_lot_length},"lot_number":${_lot_number}}`
    // Lot params
    let lot_length = 50
    // Init lot request
    loteRequest(`atencion/paciente/sucursal/${_sucursal_pk}/`, filtro_lote, lot_length, 1, patients)
  }
  const loteRequest = (_ep, _filtro_fn, _lot_length, _next_lot_number, _res) => {
    // Max number of requests
    if(_next_lot_number==10) return Promise.reject(null)
    return Promise.resolve(
      // Request next lot of queries
      simpleGet(_ep+_filtro_fn(_lot_length, _next_lot_number))
      // Save new lot reponse
      .then(res => handleLoteResponseState(res) || res)
      // Debug log
      .then(r => (__debug__ && console.log("loteRequest r"+_next_lot_number, r.length) || r))
      // Handle nested function
      .then(r => r.length==_lot_length
        ? loteRequest(_ep, _filtro_fn, _lot_length, _next_lot_number+1, r)
        : Promise.reject(null)
      )
    )
  }
  const handleLoteResponseState = _res => {
    /* This function is called to store and preserve state's value
    * lote responses can't be assigned to state right away bc state is asynchronous
    */
    patients_ref.current = patients_ref.current.concat( _res.map(r => r.paciente) )
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
    if(!patients || patients.length == 0) return  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#search-patient').DataTable().clear().destroy()
    // Gen Datatable
    let _tmp = window.$('#search-patient').DataTable({
      data: patients,
      columns: [
        {title: "Nombre", data: null},
        {title: "Apellidos", data: null},
        {title: "DNI", data: 'dni'},
        {title: "", data: null},
      ],
      columnDefs: [{
        // Button
        targets: -1,
        orderable: false,
        width: "1px",
        defaultContent: "<button class='select-patient btn btn-light btn-pills waves-effect'>Seleccionar</button>",
        createdCell: (cell, data, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            redirectTo(`/nav/admision/${rowData.pk}/detalle`)
          }
        }
      }, {
        // Nombre
        targets: 0,
        render: (data, type, row) => (
          cFL(row.nombre_principal)+
          (row.nombre_secundario?" "+cFL(row.nombre_secundario):"")
        ),
      }, {
        // Apellidos
        targets: 1,
        render: (data, type, row) => (
          cFL(row.ape_paterno)+" "+
          cFL(row.ape_materno)
        ),
      }],
      pageLength: 8,
      lengthMenu: [[8, 15, 25], [8, 15, 25]],
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

    setDatatable(_tmp)  // Save DT in state
  }, [patients])

  return patients.length == 0
    ? "loading"
    : (
      <div className="datatable-container col-12">
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
        <Icon type="new-patient" onClick={() => redirectTo("/nav/admision/nuevo")} />
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

  const getPatientByID = _id => getDataByPK('atencion/paciente', _id).then(setPatient)

  useEffect(() => {
    getPatientByID(_params_.patient)
  }, [])

  return !patient
    ? "loading"
    : (
      <div className="row">
        <div className="col-lg-6">
          <div style={{marginBottom: "25px"}}>
            <PatientData patient={patient} />
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
      </div>
    )
}
const PatientData = ({patient}) => (
  <div className="card col-12" style={{padding: "0px"}}>
    <div className="card-header">
      <div className="card-title">
        Paciente
      </div>
    </div>
    <PatientDataList patient={patient} />
  </div>
)
export const PatientDataList = ({patient}) => (
  <div className="card-body">
    <h5>Nombres: <span style={{color:"black"}}>{cFL(patient.nombre_principal)+
      (patient.nombre_secundario?" "+
      cFL(patient.nombre_secundario):"")}</span>
    </h5>
    <h5>Apellidos: <span style={{color:"black"}}>{cFL(patient.ape_paterno)+" "+
      cFL(patient.ape_materno)}</span>
    </h5>
    <h5>DNI: <span style={{color:"black"}}>{patient.dni}</span></h5>
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
            onClick={() => redirectTo(`/nav/admision/${patient.pk}/editar`)} />
          <span style={{fontSize: "0.9rem"}}>Editar</span>
        </div>
        {/* cita */}
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="add" onClick={() => redirectTo('/nav/cita/', {patient_dni: patient.dni})} />
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
          <Icon type="add" onClick={() => redirectTo(`/nav/atencion/${patient.pk}/atender`)} />
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
      </div>
    </div>
  )
}
// Extra
const EditPatient = () => {
  const _params_ = useParams()
  const [patient, updatePatientData] = useState(false)
  const [antecedente, setAntecedente] = useState(false)

  const saveEdit = () => {
    let _data = validatePatientForm()
    console.log("_data", _data)
    if(!_data) return

    simplePostData(`atencion/paciente/${patient.pk}/`, _data, "PUT")
    .then(
      response_obj => {
        updatePatientData(response_obj)
        saveEditAntecedents()
        handleErrorResponse('custom', "Exito", "Se han guardado los cambios exitosamente", 'info')
      },
      error => console.log("WRONG!", error)
    )
  }
  const createPatientAntecedents = _patient_pk => {
    if(__debug__) console.log("createPatientAntecedents")
    // Antecedent doesn't exist
    simplePostData(`atencion/paciente/antecedentes/`, {paciente: _patient_pk})
    .then(
      res => {
        if(__debug__) console.log("createPatientAntecedents res")
        setAntecedente(res)
      }
    )
  }
  const saveEditAntecedents = () => {
    let _data = validatePatientAntecedentsForm()
    _data.paciente = patient.pk
    if(!_data) return

    simplePostData(`atencion/paciente/antecedentes/${antecedente.pk}/`, _data, "PUT")
    .then(
      response_obj => {
        setAntecedente(response_obj)
        handleErrorResponse('custom', "Exito", "Se han guardado los cambios exitosamente", 'info')
      },
      error => console.log("WRONG!", error)
    )
  }
  const getBack = () => {
    window.history.back()
  }

  useEffect(() => {
    // Get patient by id
    getDataByPK('atencion/paciente', _params_.patient)
    .then(
      res => {
        if(!res) getBack()
        updatePatientData(res)
      }
    )
  }, [])
  useEffect(() => {
    if(!patient) return

    // Get patients antecedent
    simpleGet(`atencion/paciente/antecedentes/?filtro={"paciente":"${_params_.patient}"}`)
    .then(
      res => {
        // Antecedents doesn't exist
        if(res.hasOwnProperty("length") && res.length == 0) createPatientAntecedents(patient.pk)
        else setAntecedente(res[0])  // Antecedent exist
      }
    )
  }, [patient])

  return !patient
    ? "loading"
    : (
      <div>
        <PatientForm patient={patient} />
        <PatientAntecedentsForm antecedente={antecedente} />

        {/* Form buttons */}
        <div className="form-group d-flex">
          <button className="btn btn-primary" onClick={saveEdit}>
            Guardar
          </button>

          <button className="btn btn-light ml-auto" onClick={getBack}>
            Regresar
          </button>
        </div>
      </div>
    )
}
const RegisterPatient = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  let [patient_pk, setPatientPK] = useState(-1)
  if(!current_sucursal) console.error("FATAL ERROR, current_sucursal PROPERTY NOT SPECIFIED")

  const savePatient = () => {
    if(patient_pk!=-1){
      // Create PacienteXSucursal register
      createPacienteXSucursal(patient_pk)
      return
    }
    let _data = validatePatientForm()
    if(__debug__) console.log("savePatient _data", _data)
    if(!_data) return

    simplePostData(`atencion/paciente/`, _data)
    .then(
      paciente => {
        if(__debug__) console.log("RegisterPatient savePatient", paciente)
        Promise.resolve()
        // Save patient's antecedents
        .then( () => savePatientAntecedents(paciente.pk) )
        // Create PacienteXSucursal register
        .then( () => createPacienteXSucursal(paciente.pk) )
      },
      error => {
        console.log("WRONG!", error)
      }
    )
  }
  const createPacienteXSucursal = pac_pk => {
    simplePostData(`atencion/paciente/sucursal/`, {paciente: pac_pk, sucursal: current_sucursal})
    .then(r => redirectTo(`/nav/admision/${pac_pk}/detalle`))
  }
  const savePatientAntecedents = pac_pk => {
    let _data = validatePatientAntecedentsForm()
    _data.paciente = pac_pk
    if(__debug__) console.log("savePatientAntecedents _data", _data)
    if(!_data) return

    simplePostData(`atencion/paciente/antecedentes/`, _data)
    .then(
      response_obj => {
        if(__debug__) console.log("RegisterPatient savePatientAntecedents", response_obj)
        // Redirect to AdmisionDetail
        redirectTo(`/nav/admision/${pac_pk}/detalle`)
      },
      error => {
        console.log("WRONG!", error)
      }
    )
  }
  const getBack = () => {
    window.history.back()
  }

  return (
    <div>
      <PatientForm setpatientpk={setPatientPK} />
      <PatientAntecedentsForm />

      <div style={{paddingTop: "25px"}}></div>  {/* Separador */}

      {/* Form buttons */}
      <div className="form-group d-flex">
        <button className="btn btn-primary" onClick={savePatient}>
          Guardar
        </button>

        <button className="btn btn-light ml-auto" onClick={getBack}>
          Regresar
        </button>
      </div>
    </div>
  )
}
const PatientForm = ({patient, setpatientpk}) => {
  const formatInputDate = date => {
    /* This only works with specific formats
    * date: "20/05/2000"
    * return: "2000-05-20"
    */
    return date.split("/").reverse().join("-")
  }
  const _getPatiente = dni => {
    if(!patient) getPatiente(dni, setpatientpk)
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

  return (
    <div className="form-group col-md-12">  {/* Form */}
      <div className="form-group">
        <label className="form-label" htmlFor="dni">DNI: </label>
        <input type="text" id="dni" className="form-control" maxLength="8"
        defaultValue={patient&&patient.dni||""} disabled={patient}
        onChange={e => _getPatiente(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" defaultValue={patient&&patient.nombre_principal||""} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" defaultValue={patient&&patient.nombre_secundario||""} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="ape-p">Apellido parterno: </label>
        <input type="text" id="ape-p" className="form-control" defaultValue={patient&&patient.ape_paterno||""} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" defaultValue={patient&&patient.ape_materno||""} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="sexo">Sexo: </label>
        <select id="sexo" className="custom-select form-control" defaultValue={patient&&patient.sexo||"1"}>
          <option value="1">Masculino</option>
          <option value="2">Femenino</option>
        </select>
      </div>
      <div className="row">
        <div className="col form-group">
          <label className="form-label" htmlFor="born-date">Fecha de nacimiento: </label>
          <input type="date" id="born-date" className="form-control" defaultValue={patient&&formatInputDate(patient.fecha_nacimiento)||""} />
        </div>
        <div className="col-3 custom-control custom-checkbox custom-control-inline" style={{alignItems: "center"}}>
          <input type="checkbox" className="custom-control-input" id="permiso_sms" defaultChecked={patient&&patient.permiso_sms} />
          <label className="custom-control-label" htmlFor="permiso_sms">Permitir envio de mensajes</label>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">Celular: </label>
        <input type="text" id="phone" className="form-control" maxLength="9" defaultValue={patient&&patient.celular||""} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="address">Dirección: </label>
        <input type="text" id="address" className="form-control" defaultValue={patient&&patient.direccion||""} />
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
    }
  }, [antecedente])

  return (
    <div className="form-group col-md-12">  {/* Form */}
      <h3>Antecedentes</h3>
      <div className="form-group">
        <label className="form-label" htmlFor="diabetes">Diabetes? </label>
        <select id="diabetes" className="custom-select form-control">
          <option value="0">No</option>
          <option value="1">Si</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="hepatitis">Hepatitis? </label>
        <select id="hepatitis" className="custom-select form-control">
          <option value="0">No</option>
          <option value="1">Si</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="hemorragia">Hemorragia? </label>
        <select id="hemorragia" className="custom-select form-control">
          <option value="0">No</option>
          <option value="1">Si</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="enf_cardiovascular">Enfermedad cardiovascular? </label>
        <select id="enf_cardiovascular" className="custom-select form-control">
          <option value="0">No</option>
          <option value="1">Si</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="alergias">Alergias</label>
        <textarea className="form-control" id="alergias" rows="2" defaultValue={antecedente?antecedente.alergias:""} ></textarea>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="operaciones">Operaciones</label>
        <textarea className="form-control" id="operaciones" rows="2" defaultValue={antecedente?antecedente.operaciones:""} ></textarea>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="medicamentos">Medicamentos</label>
        <textarea className="form-control" id="medicamentos" rows="2" defaultValue={antecedente?antecedente.medicamentos:""} ></textarea>
      </div>

    </div>
  )
}
function validatePatientForm(){
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

  _tmp1 = document.getElementById("dni")
  if(!_tmp1){
    handleErrorResponse("custom", "Error", "DNI no especificado", 'warning')
    return false
  }
  if(_tmp1.value.trim().length!=8){
    handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos", 'warning')
    return false
  }
  if(isNaN(parseInt(_tmp1.value.trim()))){
    handleErrorResponse("custom", "Error", "El DNI debe contener solo números", 'warning')
    return false
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

  // Address no not need validation
  // Provenance no not need validation
  // Residence no not need validation

  let _tmp = {
    nombre_principal: document.getElementById('name-pric').value,
    nombre_secundario: document.getElementById('name-sec').value,
    ape_paterno: document.getElementById('ape-p').value,
    ape_materno: document.getElementById('ape-m').value,
    dni: document.getElementById('dni').value,
    sexo: document.getElementById('sexo').value,
    permiso_sms: document.getElementById('permiso_sms').checked,
  }
  // Add non-required fields
  if(document.getElementById('born-date').value)
    _tmp.fecha_nacimiento = document.getElementById('born-date').value
  if(document.getElementById('phone').value)
    _tmp.celular = document.getElementById('phone').value
  if(document.getElementById('address').value)
    _tmp.direccion = document.getElementById('address').value
  /*
  if(document.getElementById('select_provenance').value)
    _tmp.procedencia = document.getElementById('select_provenance').value;
  if(document.getElementById('select_residence').value)
    _tmp.residencia = document.getElementById('select_residence').value;
  */

  return _tmp
}
function validatePatientAntecedentsForm(){
  let values = {
    diabetes: document.getElementById('diabetes').value,
    hepatitis: document.getElementById('hepatitis').value,
    hemorragia: document.getElementById('hemorragia').value,
    enf_cardiovascular: document.getElementById('enf_cardiovascular').value,
    alergias: document.getElementById('alergias').value,
    operaciones: document.getElementById('operaciones').value,
    medicamentos: document.getElementById('medicamentos').value,
  }
  return values
}
// Archivos del paciente
const ArchivosPaciente = () => {
  const _params_ = useParams()
  const fileupload_modal_id = "gadrive_upload"
  const fileloadingdelete_modal_id = "gadrive_loadingdelete"
  const [files, setFiles] = useState(false);

  // Google drive API functions
  const getPatientFiles = pac_pk => {
    if(!pac_pk) pac_pk = _params_.patient
    // Get patient by id}
    simpleGet(`atencion/paciente/${pac_pk}/files/`)
    .then(
      res => {
        console.log("res", res);
        // if(!res) getBack()
        setFiles(res)
      }
    )
  }
  const deleteFile = file_id => {
    /* Show modal */
    showLoadingDeleteModal()

    simplePostData(`atencion/paciente/${_params_.patient}/files/delete/`, {file_id: file_id})
    .then(() => getPatientFiles())
    .then(hideLoadingDeleteModal)
  }
  // Modals
  const showLoadingDeleteModal = () => window.$('#'+fileloadingdelete_modal_id).modal("show")
  const hideLoadingDeleteModal = () => window.$('#'+fileloadingdelete_modal_id).modal("hide")

  // Run at first render
  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+fileupload_modal_id).modal("hide")
    window.$('#'+fileloadingdelete_modal_id).modal("hide")
  }, [])
  // Files
  useEffect(() => {
    if(!files) getPatientFiles(_params_.patient)

  }, [files])

  const css = {
    table: {
      width: "100%",
      tableLayout: "fixed",
      fontSize: "1.1em"
    },
    icon_container: {
      width: "7%",
      textAlign: "center",
    },
    icon: {
      textAlign: "center",
    },
  }

  return !files
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Archivos
          </div>
        </div>
        <div className="card-body">
          {/* table files */}
          <table style={css.table}>
            <thead style={{fontWeight: "bold"}}>
              <tr>
                <td style={{width: "55%"}}>Nombre</td>
                <td style={{width: "15%"}}>Fecha</td>
                {/*
                <td style={css.icon_container}>Atencion</td>
                */}
                <td style={css.icon_container}>Ver</td>
                <td style={css.icon_container}>Descargar</td>
                <td style={css.icon_container}>Eliminar</td>
              </tr>
            </thead>
            <tbody>
              {files.length>0
                ? files.map(file => {
                  let last_dot_index = file.nombre_archivo.split("").lastIndexOf(".")
                  let ext = file.nombre_archivo.slice(last_dot_index+1, file.nombre_archivo.length)
                  let name = file.descripcion ? file.descripcion : file.nombre_archivo.slice(0, last_dot_index)

                  return (
                    <tr key={"file_list_"+file.pk}>
                      <td>
                        {name}
                      </td>
                      <td>
                        <pre>{file.fecha}</pre>
                      </td>
                      <td style={css.icon}>
                        <a href={file.webViewLink} target="_blank" style={{
                          display: "inline-block",
                          width: "32px",
                        }}>
                          <FileIcon extension={ext} color="#F8F5E1" {...defaultStyles[ext]} />
                        </a>
                      </td>
                      <td style={css.icon}>
                        <a href={file.webContentLink} target="_blank" style={{
                          display: "inline-block",
                          width: "40px",
                          textAlign: "center",
                        }} className="fa-2x">
                          <i className="fal fa-download"></i>
                        </a>
                      </td>
                      <td style={css.icon}>
                        <div style={{
                            textAlign: "center",
                            fontSize: "2em",
                            cursor: "pointer",
                          }}
                          onClick={()=>deleteFile(file.file_id)}
                        >
                          <i className="fal fa-trash-alt"></i>
                        </div>
                      </td>
                    </tr>
                  )
                })
                : (<tr><td>No hay archivos añadidos</td></tr>)
              }
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" data-toggle="modal" data-target={'#'+fileupload_modal_id}>Subir archivo</button>
          <button className="btn btn-secondary" style={{marginLeft: "10px"}} onClick={()=>window.history.back()}>Regresar</button>
        </div>

        <ModalFileUpload
          modal_id={fileupload_modal_id}
          patient_pk={_params_.patient}
          refresFiles={() => setFiles(false)} />
        <ModalLoading
          _id={fileloadingdelete_modal_id}
          _title={"Cargando.."}
          _body_text={"Por favor espere unos segundos mientras se elimina el archivo"} />
      </div>
    )
}
export const ModalFileUpload = ({modal_id, patient_pk, refresFiles, atencion_pk}) => {
  const gadriveloadingupload_modal_id = "gadrive_loadingupload"
  const [selectedFile, setSelectedFile] = useState(false)

  const uploadFile = () => {
    let input_file = window.document.getElementById('input-file')
    if(input_file.files.length == 0) return

    let file = input_file.files[0]
    let data = new FormData()
    data.append("file", file)
    let input_descripcion = window.document.getElementById('input-descripcion').value
    data.append("descripcion", input_descripcion)
    let input_fecha = window.document.getElementById('input-fecha').value
    data.append("fecha", input_fecha)
    if(atencion_pk) data.append("atencion", atencion_pk)

    window.$('#'+modal_id).modal("hide")  // Hide file upload modal
    showLoadingUploadModal()  // Show loading file upload modal

    return addRequestValidation(
        fetch(
          process.env.REACT_APP_PROJECT_API+`atencion/paciente/${patient_pk}/files/`,
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem('access_token'),  // Token
            },
            body: data,
          },
        )
      )
      .then(refresFiles)
      .then(hideLoadingUploadModal)
  }
  const inputFileChange = ev => setSelectedFile(ev.target.files.length!=0)
  const showLoadingUploadModal = () => window.$('#'+gadriveloadingupload_modal_id).modal("show")
  const hideLoadingUploadModal = () => window.$('#'+gadriveloadingupload_modal_id).modal("hide")

  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+gadriveloadingupload_modal_id).modal("hide")
  }, [])

  return (
    <div>
      <RegularModalCentered
        _id={modal_id}
        _title={"Subir archivo"}
        _body={
          <div>
            <div className="form-group">
              <input type="file" id="input-file" onChange={inputFileChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-descripcion">Descripcion del archivo</label>
              <input type="text" id="input-descripcion" className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-fecha">Fecha</label>
              <input type="date" id="input-fecha" className="form-control" defaultValue={(new Date().toDateInputValue())} />
            </div>
            <button className="btn btn-primary" disabled={!selectedFile} onClick={uploadFile}>Subir archivo</button>
          </div>
        } />

      <ModalLoading
        _id={gadriveloadingupload_modal_id}
        _title={"Cargando.."}
        _body_text={"Por favor espere unos segundos mientras se guarda el archivo"} />
    </div>
  )
}
// Formatos
const ModalFormatos = ({patient_pk, current_sucursal}) => {
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
          <button className="btn btn-primary" onClick={() => window.open(process.env.REACT_APP_PROJECT_API+`atencion/viewdoc/1/${current_sucursal}/${patient_pk}/`, '_blank')}>
            Cuidados de la ortodoncia
          </button>
          <button className="btn btn-primary" onClick={() => window.open(process.env.REACT_APP_PROJECT_API+`atencion/viewdoc/101/${current_sucursal}/${patient_pk}/`, '_blank')}>
            Certificado de atencion
          </button>
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
  let signature = `- ${cur_suc.empresa_data.nombre_comercial.toUpperCase()}`
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
const getPatiente = (dni, setpatientpk) => {
  if(dni.length!=8){
    // Eliminar datos
    document.getElementById("name-pric").value = "";
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
    // Reset patient pk
    setpatientpk(-1)
    return
  }

  // Generate promise
  simpleGet(`atencion/paciente/?filtro={"dni":"${dni}"}`)
  .then(_res => {
    if(!(_res && _res.length > 0)) return
    let res = _res[0]
    if(__debug__) console.log("res", res);
    // Get formated born_date
    let _fecha_nacimiento = res.fecha_nacimiento.split("/").reverse().join("-")

    // Set paciente data
    document.getElementById("name-pric").value = res.nombre_principal
    document.getElementById("name-sec").value = res.nombre_secundario
    document.getElementById("ape-p").value = res.ape_paterno
    document.getElementById("ape-m").value = res.ape_materno
    document.getElementById("phone").value = res.celular
    document.getElementById("sexo").value = res.sexo
    document.getElementById("born-date").value = _fecha_nacimiento
    document.getElementById("permiso_sms").checked = res.permiso_sms
    document.getElementById("address").value = res.direccion
    // Set patient pk
    setpatientpk(res.pk)

    // Get patients antecedent
    simpleGet(`atencion/paciente/antecedentes/?filtro={"paciente":"${res.pk}"}`)
    .then(_res => {
      console.log("_res", _res);
      // Antecedents doesn't exist
      if(_res.hasOwnProperty("length") && _res.length == 0) return
      let res = _res[0]
      // Set antecedents values
      document.getElementById("diabetes").value = Number(res.diabetes)
      document.getElementById("hepatitis").value = Number(res.hepatitis)
      document.getElementById("hemorragia").value = Number(res.hemorragia)
      document.getElementById("enf_cardiovascular").value = Number(res.enf_cardiovascular)
      document.getElementById("alergias").value = res.alergias
      document.getElementById("operaciones").value = res.operaciones
      document.getElementById("medicamentos").value = res.medicamentos
    })
  })
  .then(() => simpleGet(`atencion/reniec/${dni}/`))
  .then(res => {
    if(__debug__) console.log("res", res);
    // Handle errors
    if(res.hasOwnProperty('error')) return
    else handleErrorResponse('custom', "", "Se ha encontrado información relacionada al dni en el servicio de reniec", 'info')
    // Set paciente data
    document.getElementById("name-pric").value = res.nombres.slice(0, res.nombres.indexOf(' '))
    document.getElementById("name-sec").value = res.nombres.slice(res.nombres.indexOf(' ')+1, res.nombres.length)
    document.getElementById("ape-p").value = res.apellido_paterno
    document.getElementById("ape-m").value = res.apellido_materno
    document.getElementById("name-pric").disabled = true
    document.getElementById("name-sec").disabled = true
    document.getElementById("ape-p").disabled = true
    document.getElementById("ape-m").disabled = true
  })
}


export default Admision;

/*
* Add cita (optional|maybe later)
*/
