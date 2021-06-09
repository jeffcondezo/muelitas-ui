import React, { useState, useEffect, useRef, useContext } from 'react'
import { Switch, Route, Redirect, useParams } from "react-router-dom"
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
  simplePostData,
  simpleGet,
  simpleDelete,
  addRequestValidation
} from '../../functions'
import {
  Icon,
  ModalLoading,
  ModalCancel,
  RegularModalCentered
} from '../bits'
import { FileIcon, defaultStyles } from 'react-file-icon'
import { tipo_documento } from '../admision/Admision'
import { ModalFileUpload } from '../admision/GDriveFiles'
import { NavigationContext } from '../Navigation'
import Loader from '../loader/Loader'


// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"
const html_da_observaciones_id = 'html_da_observaciones_id'


const Atencion = () => (
  <Switch>
    <Route exact path="/nav/atencion">
      <AttentionList />
    </Route>
    <Route exact path="/nav/atencion/:cita_pk/detalle">
      <AttentionDetail />
    </Route>
    <Route>
      <Redirect to="/nav/atencion" />
    </Route>
  </Switch>
)

const AttentionList = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  const [latest_attentions, setAttentions] = useState(false)
  const [datatable, setDatatable] = useState(false)
  const searchDate = useRef(false)

  function getLatestAttentions(_date=false, _last_n=15, _sucursal_pk=current_sucursal){
    // Get today's finished citas
    if(!_date) _date = (new Date().toDateInputValue())
    else searchDate.current = _date

    simpleGet(`atencion/cita/?filtro={"sucursal":"${_sucursal_pk}", "fecha": "${_date}"}`)
    .then(res => {
      // Remove duplicated attention
      let _tmp = res
      let _tmp1 = []  // Store attention's id
      if(_tmp.length>0){
        _tmp = res.filter(i => {
          if(_tmp1.includes(i.atencion)){  // If attention already in _tmp1
            return false  // Remove
          }
          _tmp1.push(i.atencion)  // Save attention in _tmp1 array
          return true
        })
      }

      setAttentions(_tmp)
    })
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
        getLatestAttentions()
      }
      document.body.appendChild(dt_script)
    }else{
      getLatestAttentions()
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
  // When latest_attentions are setted
  useEffect(() => {
    if(!latest_attentions) return  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#last-attentions').DataTable().clear().destroy()
    // Gen Datatable
    let _tmp = window.$('#last-attentions').DataTable({
      data: latest_attentions,
      columns: [
        {title: "Fecha", data: 'fecha'},
        {title: "Hora", data: null},
        {title: "Paciente", data: null},
        {title: "Programado", data: 'programado'},
        {title: "", data: null},
      ],
      columnDefs: [{
        // Button
        targets: -1,
        orderable: false,
        width: "1px",
        defaultContent: "<button class='select-attention btn btn-light btn-pills waves-effect'>Seleccionar</button>",
        createdCell: (cell, _, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            redirectTo(`/nav/atencion/${rowData.pk}/detalle`, {cita: rowData})
          }
        }
      }, {
        // Paciente
        targets: 2,
        render: (_, __, row) => (
          row.paciente_data.ape_paterno.toUpperCase()+", "+
          cFL(row.paciente_data.nombre_principal)+" - "+
          row.paciente_data.dni
        ),
      }, {
        // Hora
        targets: 1,
        render: (_, __, row) => (row.hora.slice(0, 5)+" - "+row.hora_fin.slice(0, 5)),
      }],
      pageLength: 10,
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay atenciones registradas para la fecha seleccionada",
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
  }, [latest_attentions])
  // Run after datatable is setted
  useEffect(() => {
    if(!datatable) return

    // Change search type && set default value today
    let _input = document.querySelector('#last-attentions_filter input[type=search]')
    _input.type = "date"
    _input.value = searchDate.current ? searchDate.current : (new Date().toDateInputValue())
    _input.onchange = (e) => getLatestAttentions(e.target.value)
  }, [datatable])

  return (
    !latest_attentions
    ? "loading"
    : (
      <div>
        <div className="datatable-container col-12">
          <table id="last-attentions" style={{width: "100%"}}></table>
        </div>
      </div>
    )
  )
}

const AttentionDetail = () => {
  const {redirectTo} = useContext(NavigationContext)
  const [cita, setCita] = useState(false)
  const {cita_pk} = useParams()
  const [consents, setConsents] = useState([])

  const getCita = _cita_pk => getDataByPK('atencion/cita', _cita_pk).then(setCita)
  const getConsents = () => getDataByPK('atencion/consentimiento/atencion', cita.atencion).then(setConsents)
  const fakeFinishCita = () => {
    let fake_cita = Object.assign({}, cita)
    fake_cita.estado = 5
    setCita(fake_cita)
  }

  useEffect(() => {
    getCita(cita_pk)
  }, [])
  useEffect(() => {
    if(!cita) return

    getConsents()
  }, [cita])

  return !cita
    ? "loading"
    : (
      <div className="row">
        <div className="col-lg-6" style={{display: "inline-block"}}>
          <div className="panel">
            <CitaData cita={cita} />
          </div>
          <div className="panel">
            <AttentionProcedures cita={cita} />
          </div>
          <div className="panel">
            <PatientAttentionHistory cita_pk={cita.pk} patient_pk={cita.paciente_data.pk} />
          </div>
        </div>
        <div className="col-lg-6" style={{display: "inline-block"}}>
          <div className="panel">
            <Links
              cita={cita}
              fakeFinishCita={fakeFinishCita}
              redirectTo={redirectTo} />
          </div>
          <div className="panel">
            <ArchivosPaciente
              atencion_pk={cita.atencion}
              patient_pk={cita.paciente_data.pk} />
          </div>
          {consents.length>0 && (
            <div className="panel">
              <InformedConsent cita={cita} consents={consents} getConsents={getConsents} />
            </div>
          )}
        </div>
      </div>
    )
}
const CitaData = ({cita}) => {
  const {redirectTo} = useContext(NavigationContext)
  const redirectToPatient = () => redirectTo(`/nav/admision/${cita.paciente_data.pk}/detalle`)

  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Cita
        </div>
      </div>
      <div className="card-body">
        <h6>
          <b>Paciente: </b>
          <span onClick={redirectToPatient} style={{cursor: "pointer", color: "blue"}} >
            {cita.paciente_data.fullname}
          </span>
        </h6>
        <h6>
          <b>{tipo_documento[cita.paciente_data.tipo_documento]}: </b>
          <code>{cita.paciente_data.dni?cita.paciente_data.dni:cita.paciente_data.dni_otro}</code>
        </h6>
        <h6>
          <b>Programado: </b>
          {cFL(cita.programado)}
        </h6>
        <h6>
          <b>Fecha y hora: </b>
          {cita.fecha.split('-').reverse().join('/')} <code>{cita.hora.slice(0, 5)} - {cita.hora_fin.slice(0, 5)}</code>
        </h6>
        {cita.personal
          ? (
            <h6>
              <b>Personal de atención: </b>
              {cFL(cita.personal.ape_paterno)+" "+cFL(cita.personal.ape_materno)
                +", "+cFL(cita.personal.nombre_principal)+
                (cita.personal.nombre_secundario?" "+cFL(cita.personal.nombre_secundario):"")}
            </h6>
          ) : ""
        }
        <h6>
          <b>Estado: </b>
          {cita.estado==1
            ? "Cita"
            : cita.estado==4
            ? "Paciente no se presento"
            : cita.estado==5
            ? "Atendido"
            : "Cancelado"}
        </h6>
      </div>
    </div>
  )
}
const PatientAttentionHistory = ({cita_pk, patient_pk}) => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  const [attention_list, setAttentionList] = useState(false)

  const getAttentionHistory = _patient_pk => {
    simpleGet(`atencion/cita/?filtro={"sucursal":"${current_sucursal}", "estado":"5", "paciente":"${_patient_pk}", "last":"5"}`)
    .then(res => {
      // Remove current attention from attention history
      let _tmp = res
      if(_tmp.length>0) _tmp = res.filter(i => i.pk!=cita_pk)

      setAttentionList(_tmp)
    })
  }

  // Run at first render
  useEffect(() => {
    getAttentionHistory(patient_pk)
  }, [])

  return !attention_list
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Ultimas atenciones
          </div>
        </div>
        <div className="card-body">
          {attention_list.length > 0
            ? attention_list.map((i) => (
              <div key={"inc_list_"+i.pk}>
                <span>{i.fecha} <b>{i.programado}</b></span>
              </div>
            ))
            : "No se encontraron otras atenciones"}
        </div>
        <div className="card-footer">
          Para más información revise el apartado de atenciones de paciente en&nbsp;
          <span style={{cursor: "pointer"}}
          onClick={() => redirectTo(`/nav/admision/${patient_pk}/detalle`)}>
            <b>Admision</b>
          </span>
        </div>
      </div>
    )
}
const ArchivosPaciente = ({atencion_pk, patient_pk}) => {
  const fileupload_modal_id = "gadrive_upload"
  const fileloadingdelete_modal_id = "gadrive_loadingdelete"
  const [files, setFiles] = useState(false)

  // Google drive API functions
  const getPatientFiles = () => {
    if(__debug__) console.log("ArchivosPaciente getPatientFiles")
    // Get patient by id}
    simpleGet(`atencion/${atencion_pk}/files/`)
    .then(
      res => {
        console.log("res", res)
        if(res) setFiles(res)
      }
    )
  }
  const deleteFile = file_id => {
    /* Show modal */
    showLoadingDeleteModal()

    simplePostData(`atencion/paciente/${patient_pk}/files/delete/`, {file_id: file_id})
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
    if(!files) getPatientFiles()

  }, [files])


  return !files
    ? (<div className="card"><div className="card-body"><Loader scale={2} /></div></div>)
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Archivos
          </div>
        </div>
        <div className="card-body">
          {/* files */}
          {files.length>0 ? files.map(f => (
            <div key={"file_list_"+f.pk} style={{
              margin: "15px 0",
            }}>
              <GDriveFile file={f} deleteFile={deleteFile} />
            </div>
          )) : "No hay archivos añadidos"}
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" data-toggle="modal" data-target={'#'+fileupload_modal_id}>Subir archivo</button>
        </div>

        <ModalFileUpload
          modal_id={fileupload_modal_id}
          patient_pk={patient_pk}
          atencion_pk={atencion_pk}
          refreshFiles={() => setFiles(false)} />
        <ModalLoading
          _id={fileloadingdelete_modal_id}
          _title={"Cargando.."}
          _body_text={"Por favor espere unos segundos mientras se elimina el archivo"} />
      </div>
    )
}
const AttentionProcedures = ({cita}) => {
  const {redirectTo} = useContext(NavigationContext)
  const [das, setDA] = useState(false)
  const [selected_da, selectDa] = useState(false)
  const delete_proc_pk = useRef(-1)

  const getProcedures = _atencion => simpleGet(`atencion/detalle/?filtro={"atencion":"${_atencion}"}`).then(setDA)
  const modalConfirmDelete = (_pk, ev) => {
    ev.stopPropagation()
    window.$('#modal_delete_procedure').modal('show')
    delete_proc_pk.current = _pk
  }
  const deleteProcedure = () => {
    window.$('#modal_delete_procedure').modal('hide')  // Hide modal
    if(delete_proc_pk.current==-1) return

    simpleDelete(`atencion/detalle/${delete_proc_pk.current}/`)
    .then(() => {
      // Delete item from DOM
      document.getElementById("da-"+delete_proc_pk.current).remove()
      // Reset delete_proc_pk val
      delete_proc_pk.current = -1
    })
  }
  const showDAObservation = _da => {
    if(selected_da == _da) window.$('#'+html_da_observaciones_id).modal("show")
    else selectDa(_da)
  }
  const editProcedure = _proc_pk => redirectTo(`/nav/procedimiento/${_proc_pk}/editar/`)

  useEffect(() => {
    getProcedures(cita.atencion)
  }, [])
  useEffect(() => {
    if(!selected_da) return

    window.$('#'+html_da_observaciones_id).modal("show")
  }, [selected_da])

  return (
    <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
      <div className="card-header">
        <div className="card-title">
          Procedimientos realizados
        </div>
      </div>
      <div id="proc-list" className={das.length==0?"card-body":""} style={{minHeight: "48px", position: "relative"}}>
        {!das
          ? <Loader scale={2} />
          : das.length == 0
          ? "No se ha relizado ningún procedimiento"
          : das.map(da => (
            <div key={"da-"+da.pk} id={"da-"+da.pk}>
              <li className="list-group-item d-flex" id={"da-title-"+da.pk}
              onClick={ (!da.observaciones || da.observaciones.length==0) ? () => showDAObservation(da) : () => {} }
              data-toggle="collapse" data-target={"#da-desc-"+da.pk} aria-expanded="true"  // collapse behaviour
              style={{borderBottom: "0", cursor: "pointer"}}>
                <span style={{fontSize: "1.2em"}}>
                  {cFL(da.pxs_data.nombre)}
                </span>
                {(!da.dpdt && !da.pago_iniciado) && (
                  <button className="btn ml-auto"
                  style={{paddingTop: "0", paddingBottom: "0", fontSize: "15px"}}
                  onClick={()=>editProcedure(da.pk)}>
                    <i className="fal fa-edit"></i>
                  </button>
                )}
                {(!da.pago_iniciado || da.dpdt) && (
                  <button className={"btn"+(da.dpdt?" ml-auto":"")}
                  style={{paddingTop: "0", paddingBottom: "0", fontSize: "15px"}}
                  onClick={ev=>modalConfirmDelete(da.pk, ev)}>
                    <i className="fal fa-trash-alt"></i>
                  </button>
                )}
              </li>
              {da.observaciones && da.observaciones.length!=0 && (
                <div id={"da-desc-"+da.pk} className="collapse" onClick={() => showDAObservation(da)}
                style={{
                  paddingLeft: "1.8rem",
                  paddingTop: "0",
                  paddingBottom: ".75rem",
                  background: "#e6eff7",
                  cursor: "pointer"}}>
                  <span>
                    {da.observaciones}
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
      <AlertModal func={deleteProcedure} />
      <DAUpdate da={selected_da} />
    </div>
  )
}
const AlertModal = ({func}) => {
  return (
    <div className="modal modal-alert" id="modal_delete_procedure" tabIndex="-1" role="dialog" style={{display: "none", paddingRight: "15px"}} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Eliminar procedimiento</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"><i className="fal fa-times"></i></span>
            </button>
          </div>
          <div className="modal-body">
            Esta seguro que quiere eliminar el procedimiento?
          </div>
          <div className="modal-footer">
            <button type="button" data-dismiss="modal"
              className="btn btn-secondary waves-effect waves-themed">Cancelar</button>
            <button type="button" data-dismiss="modal"
              className="btn btn-primary waves-effect waves-themed" onClick={func}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
const Links = ({cita, fakeFinishCita, redirectTo}) => {
  const finishCita = () => {
    simplePostData(`atencion/cita/anular/${cita.pk}/`, {estado: '5'}, "PUT")
    .then(() => handleErrorResponse("custom", "Exito", "La cita ha culminado exitosamente", "success"))
    .then(fakeFinishCita)
  }

  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">
          <div style={{display: "inline-block", textAlign: "center", marginLeft: "15px", marginRight: "15px"}}>
            <Icon type="odontogram" onClick={() => redirectTo(`/nav/odontograma/${cita.pk}/`)} /><br/>
            <span style={{fontSize: "0.9rem"}}>Odontograma</span>
          </div>
          {cita.estado=='1' && (
            <div style={{display: "inline-block", textAlign: "center", marginLeft: "15px", marginRight: "15px"}}>
              <Icon type="procedure" onClick={() => redirectTo(`/nav/procedimiento/${cita.pk}/agregar/`)} /><br/>
              <span style={{fontSize: "0.87rem"}}>Procedimiento</span>
            </div>
          )}
          <div style={{display: "inline-block", textAlign: "center", marginLeft: "15px", marginRight: "15px"}}>
            <Icon type="prescription" onClick={() => redirectTo(`/nav/prescripcion/${cita.pk}/`)} /><br/>
            <span style={{fontSize: "0.9rem"}}>Receta</span>
          </div>
          {cita.estado!="5"
            ? (
              <div style={{display: "inline-block", textAlign: "center", marginLeft: "15px", marginRight: "15px"}}>
                <Icon type="check" onClick={finishCita} /><br/>
                <span style={{fontSize: "0.9rem"}}>Finalizar</span>
              </div>
            ) : ""}
        </div>
      </div>
    </div>
  )
}
export const GDriveFile = ({file, deleteFile}) => {
  let last_dot_index = file.nombre_archivo.split("").lastIndexOf(".")
  let ext = file.nombre_archivo.slice(last_dot_index+1, file.nombre_archivo.length)
  let name = file.descripcion ? file.descripcion : file.nombre_archivo.slice(0, last_dot_index)

  const css = {
    icon: {
      display: "inline-flex",
      flex: "1 1 0%",
      alignItems: "middle",
      justifyContent: "center",
    },
    name: {
      fontSize: "1.3em",
      flex: "9 1 0%",
      width: "0px"
    },
  }

  return (
    <div style={{
      textAlign: "left",
      display: "flex",
    }}>
      <b style={css.name}>{name}</b>
      <div style={css.icon}>
        <a href={file.webViewLink} target="_blank" style={{
          display: "inline-block",
          width: "32px",
        }}>
          <FileIcon extension={ext} color="#F8F5E1" {...defaultStyles[ext]} />
        </a>
      </div>
      <div style={css.icon}>
        <a href={file.webContentLink} target="_blank" style={{
          display: "inline-block",
          width: "40px",
          textAlign: "center",
        }} className="fa-2x">
          <i className="fal fa-download"></i>
        </a>
      </div>
      <div style={css.icon}>
        <div style={{
            textAlign: "center",
            fontSize: "2em",
            cursor: "pointer",
          }}
          onClick={()=>deleteFile(file.file_id)}
        >
          <i className="fal fa-trash-alt"></i>
        </div>
      </div>
    </div>
  )
}
const DAUpdate = ({da}) => {
  const saveDAObservaciones = () => {
    let _observaciones = window.document.getElementById('da_update_observaciones').value
    simplePostData(`atencion/detalle/${da.pk}/`, {observaciones: _observaciones}, "PATCH")
    .finally(() => {
      window.$('#'+html_da_observaciones_id).modal("hide")
    })
  }

  useEffect(() => {
    window.document.getElementById('da_update_observaciones').value = da.observaciones
  }, [da])

  return (
    <RegularModalCentered
      _id={html_da_observaciones_id}
      _title={"Observación del procedimiento"}
      _body={
        <div>
          <div style={{marginBottom: "10px"}}>
            <label className="form-label" htmlFor="da_update_observaciones">Observaciones</label>
            <textarea className="form-control" id="da_update_observaciones" rows="5" placeholder="Observaciones del procedimiento"></textarea>
          </div>
          <div>
            <button className="btn btn-primary" onClick={saveDAObservaciones}>Guardar</button>
          </div>
        </div>
      } />
  )
}
const InformedConsent = ({cita, consents, getConsents}) => {
  const html_id_modalconsentform = "html_id_modalconsentform"
  const html_id_modaluploadconsentfile = "html_id_modaluploadconsentfile"
  const html_id_confirmdelete = "html_id_confirmdelete"
  const _body_text = "Esta seguro que quiere eliminar este consentimiento? El consentimiento retornara a su estado inicial sin datos, para eliminar el consentimiento de forma definitiva eliminelo después de haber finalizado la atención"
  const [selected_consent, selectConsent] = useState(false)

  const showCustomForm = _c => {
    console.log("showCustomForm")
    selectConsent(Object.assign({}, _c), () => console.log("finished"))
    window.$('#'+html_id_modalconsentform).modal("show")
  }
  const openPrintableDoc = _c => window.open(process.env.REACT_APP_PROJECT_API+`atencion/viewdoc/consentimiento/${_c.pk}/`, "_blank")
  const modalUploadConsentFile = _c => {
    selectConsent(Object.assign({}, _c))
    window.$('#'+html_id_modaluploadconsentfile).modal('show')
  }
  const openViewConsentFile = _c => window.open(_c.archivo, "_blank")
  const modalConfirmDelete = _c => {
    selectConsent(Object.assign({}, _c))
    window.$('#'+html_id_confirmdelete).modal('show')
  }
  const deleteDCI = () => simpleDelete(`atencion/consentimiento/detalle/${selected_consent.pk}/`).then(getConsents)

  return (
    <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
      <div className="card-header">
        <div className="card-title">
          Consentimientos Informados Necesarios
        </div>
      </div>
      <div id="proc-list" style={{minHeight: "48px", position: "relative"}}>
        {consents.map(c => (
          <div key={"consent-"+c.pk}>
            <li className="list-group-item d-flex">
              {c.nombre.toUpperCase()}

              {/* Editar, Imprimir, Subir, Visualizar, Eliminar */}
              <span className="ml-auto"></span>
              {[1, 2].indexOf(c.fase)!=-1 && (
                <button className="btn" onClick={()=>showCustomForm(c)} style={
                  {paddingTop: "0", paddingBottom: "0"}
                }>
                  <i className="fal fa-edit"></i>
                </button>
              )}
              {[2].indexOf(c.fase)!=-1 && (
                <button className="btn" onClick={()=>openPrintableDoc(c)} style={
                  {paddingTop: "0", paddingBottom: "0"}
                }>
                  <i className="fal fa-print"></i>
                </button>
              )}
              {[2].indexOf(c.fase)!=-1 && (
                <button className="btn" onClick={()=>modalUploadConsentFile(c)} style={
                  {paddingTop: "0", paddingBottom: "0"}
                }>
                  <i className="fal fa-upload"></i>
                </button>
              )}
              {[3].indexOf(c.fase)!=-1 && (
                <button className="btn" onClick={()=>openViewConsentFile(c)} style={
                  {paddingTop: "0", paddingBottom: "0"}
                }>
                  <i className="fal fa-eye"></i>
                </button>
              )}
              {[3, 4].indexOf(c.fase)!=-1 && (
                <button className="btn" onClick={()=>modalConfirmDelete(c)} style={
                  {paddingTop: "0", paddingBottom: "0"}
                }>
                  <i className="fal fa-trash-alt"></i>
                </button>
              )}
            </li>
          </div>
        ))}
      </div>

      <ModalCancel
        _id={html_id_confirmdelete}
        _title={"Eliminar consentimiento"}
        _action_text={"Eliminar"}
        _action_func={deleteDCI}
        _body_text={_body_text} />
      <ModalConsentDataForm
        modal_id={html_id_modalconsentform}
        dci={selected_consent}
        refreshConsents={getConsents} />
      <ModalConsentFileUpload
        modal_id={html_id_modaluploadconsentfile}
        patient_pk={cita.paciente}
        atencion_pk={cita.atencion}
        dci_pk={selected_consent.pk}
        refreshFiles={getConsents} />
    </div>
  )
}
const ModalConsentDataForm = ({modal_id, dci, refreshConsents}) => {
  const style_ = {
    mb: {marginBottom: "10px"}
  }

  const saveConsentData = () => {
    // Formar JSON son los datos del formulario
    let _json = {}
    if( dci.campos.indexOf(".apoderado.")!=-1 ){
      let _apoderado = {}
      _apoderado['dni'] = window.document.getElementById("dci_campos_apoderado_dni").value
      _apoderado['fullname'] = window.document.getElementById("dci_campos_apoderado_fullname").value
      _apoderado['direccion'] = window.document.getElementById("dci_campos_apoderado_direccion").value
      // Validar solo si al menos un valor ha sido especificado
      if(_apoderado.dni != "" && _apoderado.fullname != "" && _apoderado.direccion != ""){
        // Validar valores
        if(_apoderado.dni.length != 8 || isNaN(Number(_apoderado.dni))){
          handleErrorResponse("modalconsentform", "Error", "El dni debe ser un número de 8 digitos", "warning")
          return
        }
        if(!/^[a-zA-Z][ a-zA-Z]+[a-zA-Z]$/.test(_apoderado.fullname) || _apoderado.fullname.split(" ").length<3){
          handleErrorResponse("modalconsentform", "Error", "Debe escribir el nombres y apellidos completos", "warning")
          return
        }
        if(_apoderado.direccion.length<6){
          handleErrorResponse("modalconsentform", "Error", "Debe especificar una direccion de al menos 6 digitos", "warning")
          return
        }
      }
      _json['apoderado'] = _apoderado
    }
    if( dci.campos.indexOf(".precio_inicial")!=-1 ){
      _json['precio_inicial'] = window.document.getElementById("dci_campos_precioinicial").value
    }
    if( dci.campos.indexOf(".n_cuotas")!=-1 ){
      _json['n_cuotas'] = window.document.getElementById("dci_campos_ncuotas").value
    }
    if( dci.campos.indexOf(".precio_cuota")!=-1 ){
      _json['precio_cuota'] = window.document.getElementById("dci_campos_preciocuota").value
    }
    if( dci.campos.indexOf(".observaciones")!=-1 ){
      _json['observaciones'] = window.document.getElementById("dci_campos_observaciones").value
    }

    let _datos = JSON.stringify({custom: _json})
    simplePostData(`atencion/consentimiento/detalle/${dci.pk}/`, {datos: _datos}, "PATCH")
    .then(() => handleErrorResponse("custom", "Exito", "El consentimiento se modifico exitosamente", "success"))
    .then(refreshConsents)
    .finally(() => window.$('#'+modal_id).modal("hide"))
  }

  useEffect(() => {
    if(!dci || !dci.datos) return
    // Fill data from selected dci
    if( dci.campos.indexOf(".apoderado.")!=-1 ){
      window.document.getElementById("dci_campos_apoderado_dni").value = dci.datos.custom.apoderado.dni
      window.document.getElementById("dci_campos_apoderado_fullname").value = dci.datos.custom.apoderado.fullname
      window.document.getElementById("dci_campos_apoderado_direccion").value = dci.datos.custom.apoderado.direccion
    }
    if( dci.campos.indexOf(".precio_inicial")!=-1 ) window.document.getElementById("dci_campos_precioinicial").value = dci.datos.custom.precio_inicial
    if( dci.campos.indexOf(".n_cuotas")!=-1 ) window.document.getElementById("dci_campos_ncuotas").value = dci.datos.custom.n_cuotas
    if( dci.campos.indexOf(".precio_cuota")!=-1 ) window.document.getElementById("dci_campos_preciocuota").value = dci.datos.custom.precio_cuota
    if( dci.campos.indexOf(".observaciones")!=-1 ) window.document.getElementById("dci_campos_observaciones").value = dci.datos.custom.observaciones
  }, [dci])

  return (
    <RegularModalCentered
      _id={modal_id}
      _title={"Datos requeridos del consentimiento"}
      _body={!dci?"":!dci.campos?"":
        <div>
          {/* Alert */}
          <div id="alert-modalconsentform" className="alert bg-warning-700 fade" role="alert" style={{display: "none"}}>
            <strong id="alert-modalconsentform-headline">Error!</strong> <span id="alert-modalconsentform-text">Algo salió mal</span>.
          </div>
          {/* Apoderado */}
          {dci.campos.indexOf(".apoderado.")!=-1 && (
            <div>
              <div style={style_.mb}>
                <label className="form-label" htmlFor="dci_campos_apoderado_dni">DNI Apoderado</label>
                <input className="form-control" id="dci_campos_apoderado_dni" type="text" maxLength="8" />
              </div>
              <div style={style_.mb}>
                <label className="form-label" htmlFor="dci_campos_apoderado_fullname">Nombre completo del apoderado (como aparecera en contrato)</label>
                <input className="form-control" id="dci_campos_apoderado_fullname" type="text" />
              </div>
              <div style={style_.mb}>
                <label className="form-label" htmlFor="dci_campos_apoderado_direccion">Dirección del apoderado</label>
                <input className="form-control" id="dci_campos_apoderado_direccion" type="text" />
              </div>
            </div>
          )}
          {/* Precios/Cuotas */}
          {dci.campos.indexOf(".precio_inicial")!=-1 && (
            <div style={style_.mb}>
              <label className="form-label" htmlFor="dci_campos_precioinicial">Pago inicial</label>
              <input className="form-control" id="dci_campos_precioinicial" type="number" min="0" />
            </div>
          )}
          {dci.campos.indexOf(".n_cuotas")!=-1 && (
            <div style={style_.mb}>
              <label className="form-label" htmlFor="dci_campos_ncuotas">Número de cuotas</label>
              <input className="form-control" id="dci_campos_ncuotas" type="number" min="0" />
            </div>
          )}
          {dci.campos.indexOf(".precio_cuota")!=-1 && (
            <div style={style_.mb}>
              <label className="form-label" htmlFor="dci_campos_preciocuota">Pago por cuota</label>
              <input className="form-control" id="dci_campos_preciocuota" type="number" min="0" />
            </div>
          )}
          {/* Observaciones */}
          {dci.campos.indexOf(".observaciones")!=-1 && (
            <div style={style_.mb}>
              <label className="form-label" htmlFor="dci_campos_observaciones">Observaciones</label>
              <textarea className="form-control" id="dci_campos_observaciones" rows="3"></textarea>
            </div>
          )}

          <div><button className="btn btn-primary" onClick={saveConsentData}>Guardar</button></div>
        </div>
      } />
    )
}
const ModalConsentFileUpload = ({modal_id, patient_pk, atencion_pk, dci_pk, refreshFiles}) => {
  const [selectedFile, setSelectedFile] = useState(false)
  const modal_load_id = "html_modal_file_uploading"

  const uploadFile = () => {
    let input_file = window.document.getElementById('input-consent-file')
    if(input_file.files.length == 0) return

    let file = input_file.files[0]
    let data = new FormData()
    data.append("file", file)
    data.append("paciente", patient_pk)
    data.append("atencion", atencion_pk)
    data.append("consentimiento", dci_pk)  // Consent file

    window.$('#'+modal_id).modal("hide")  // Hide file upload modal
    showLoadingUploadModal()  // Show loading file upload modal

    return addRequestValidation(fetch(
        process.env.REACT_APP_PROJECT_API+`atencion/paciente/${patient_pk}/files/`,
        { method: "POST", body: data, headers: {Authorization: localStorage.getItem('access_token')} }
      ))
      .then(refreshFiles)
      .then(hideLoadingUploadModal)
  }
  const inputFileChange = ev => setSelectedFile(ev.target.files.length!=0)
  const showLoadingUploadModal = () => window.$('#'+modal_load_id).modal("show")
  const hideLoadingUploadModal = () => window.$('#'+modal_load_id).modal("hide")

  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+modal_id).modal("hide")
    window.$('#'+modal_id).modal("hide")
  }, [])

  return (
    <div>
      <RegularModalCentered
        _id={modal_id}
        _title={"Guardar archivo de consentimiento"}
        _body={
          <div>
            <div className="form-group">
              <input type="file" id="input-consent-file" onChange={inputFileChange} />
            </div>
            <button className="btn btn-primary" disabled={!selectedFile} onClick={uploadFile}>Subir archivo</button>
          </div>
        } />

      <ModalLoading
        _id={modal_load_id}
        _title={"Cargando.."}
        _body_text={"Por favor espere unos segundos mientras se guarda el archivo"} />
    </div>
  )
}


export default Atencion
