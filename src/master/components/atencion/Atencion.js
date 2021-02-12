import React, { useState, useEffect, useRef } from 'react';
import { Switch, Route, Redirect, useParams } from "react-router-dom";
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
  simplePostData,
  simpleGet,
  simpleDelete,
} from '../../functions';
import { PageTitle, Icon, ModalLoading } from '../bits';
import { FileIcon, defaultStyles } from 'react-file-icon'
import { ModalFileUpload } from '../admision/Admision';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


function Atencion(props){
  // Receive {data.cita, sucursal_pk, redirectTo}
  return(
  <>
    {/* <PageTitle title={"Atención"} />
    */}

    <Switch>
      <Route exact path="/nav/atencion">
        <AttentionList sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/atencion/:cita_pk/detalle">
        <AttentionDetail
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/atencion/:pac_pk/atender">
        <AtenderPaciente
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>

      <Route>
        <Redirect to="/nav/atencion" />
      </Route>
    </Switch>
  </>
  )
}

const AttentionList = props => {
  // Receive {sucursal_pk, redirectTo}
  const [latest_attentions, setAttentions] = useState(false);
  const [datatable, setDatatable] = useState(false);
  const searchDate = useRef(false);

  function getLatestAttentions(_date=false, _last_n=15, _sucursal_pk=props.sucursal_pk){
    // Get today's finished citas
    if(!_date) _date = (new Date().toDateInputValue());
    else searchDate.current = _date;

    simpleGet(`atencion/cita/?filtro={"sucursal":"${_sucursal_pk}", "fecha": "${_date}"}`)
    .then(res => {
      // Remove duplicated attention
      let _tmp = res;
      let _tmp1 = [];  // Store attention's id
      if(_tmp.length>0){
        _tmp = res.filter(i => {
          if(_tmp1.includes(i.atencion)){  // If attention already in _tmp1
            return false;  // Remove
          }
          _tmp1.push(i.atencion);  // Save attention in _tmp1 array
          return true;
        });
      }

      setAttentions(_tmp);
    })
  }

  useEffect(() => {
    // Add DataTable rel docs
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script");
      dt_script.async = false;
      dt_script.id = "dt_script";
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
      dt_script.onload = () => {
        // Run at first execution
        getLatestAttentions();
      };
      document.body.appendChild(dt_script);
    }else{
      getLatestAttentions();
    }
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link");
      dt_style.rel = "stylesheet";
      dt_style.id = "dt_style";
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
      document.head.appendChild(dt_style);
    }

    return () => {
      // console.log("UNMOUNTING ATTENTION LIST");
    }
  }, []);
  // When latest_attentions are setted
  useEffect(() => {
    if(!latest_attentions) return;  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#last-attentions').DataTable().clear().destroy();
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
        createdCell: (cell, data, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            props.redirectTo(`/nav/atencion/${rowData.pk}/detalle`, {cita: rowData});
          }
        }
      }, {
        // Paciente
        targets: 2,
        render: (data, type, row) => (
          row.paciente_data.ape_paterno.toUpperCase()+", "+
          cFL(row.paciente_data.nombre_principal)+" - "+
          row.paciente_data.dni
        ),
      }, {
        // Hora
        targets: 1,
        render: (data, type, row) => (row.hora.slice(0, 5)+" - "+row.hora_fin.slice(0, 5)),
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
    });

    setDatatable(_tmp);  // Save DT in state
  }, [latest_attentions]);
  // Run after datatable is setted
  useEffect(() => {
    if(!datatable) return;

    // Change search type && set default value today
    let _input = document.querySelector('#last-attentions_filter input[type=search]');
    _input.type = "date";
    _input.value = searchDate.current ? searchDate.current : (new Date().toDateInputValue());
    _input.onchange = (e) => getLatestAttentions(e.target.value);
  }, [datatable]);

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
  );
}

const AttentionDetail = (props) => {
  // Receive {sucursal_pk, redirectTo}
  let __params__ = useParams()
  const [cita, setCita] = useState(false);

  const redirect = (url, data={cita: cita}) => {
    props.redirectTo(url, data);
  }

  const getCita = cita_pk => {
    getDataByPK('atencion/cita', cita_pk)
    .then(setCita)
  }

  useEffect(() => {
    // Si no se recibe cita en props, obtenerla del url
    if(!props.cita) getCita(__params__.cita_pk)
    else setCita(props.cita)  // Si se recibe cita, set cita from props
  }, [])

  if(cita && cita.pk != __params__.cita_pk) getCita(__params__.cita_pk)

  return !cita
    ? "loading"
    : (
      <div className="row">
        <div className="col-lg-6" style={{display: "inline-block"}}>
          <div className="panel">
            <CitaData cita={cita} redirectTo={props.redirectTo} />
          </div>
          <div className="panel">
            <AttentionProcedures cita={cita} redirectTo={props.redirectTo} />
          </div>
          <div className="panel">
            <PatientAttentionHistory
              sucursal_pk={props.sucursal_pk}
              cita={cita}
              redirectTo={props.redirectTo} />
          </div>
        </div>
        <div className="col-lg-6" style={{display: "inline-block"}}>
          <div className="panel">
            <Links
              cita={cita}
              getCita={() => getCita(cita.pk)}
              redirectTo={redirect} />
          </div>
          <div className="panel">
            <ArchivosPaciente
              atencion_pk={cita.atencion}
              patient_pk={cita.paciente_data.pk} />
          </div>
        </div>
      </div>
    )
}
const CitaData = ({cita,  redirectTo}) => {
  const redirectToPatient = () => {
    redirectTo(`/nav/admision/${cita.paciente_data.pk}/detalle`)
  }

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
          <span
            onClick={redirectToPatient}
            style={{cursor: "pointer", color: "blue"}}
          >
            {cFL(cita.paciente_data.ape_paterno)+" "+cFL(cita.paciente_data.ape_materno)
            +", "+cFL(cita.paciente_data.nombre_principal)+
            (cita.paciente_data.nombre_secundario?" "+cFL(cita.paciente_data.nombre_secundario):"")}
          </span>
          &nbsp;<code>{cita.paciente_data.dni}</code>
        </h6>
        <h6>
          <b>Programado: </b>
          {cFL(cita.programado)}
        </h6>
        <h6>
          <b>Fecha y hora: </b>
          {cita.fecha} <code>{cita.hora.slice(0, 5)} - {cita.hora_fin.slice(0, 5)}</code>
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
  );
}
const PatientAttentionHistory = props => {
  // Receive {cita, redirectTo, sucursal_pk}
  const [attention_list, setAttentionList] = useState(false);

  const getAttentionHistory = (_patient_pk) => {
    simpleGet(`atencion/cita/?filtro={"sucursal":"${props.sucursal_pk}", "estado":"5", "paciente":"${_patient_pk}", "last":"5"}`)
    .then(res => {
      // Remove current attention
      let _tmp = res;
      if(_tmp.length>0){
        _tmp = res.filter(i => i.pk!=props.cita.pk);
      }

      setAttentionList(_tmp);
    })
  }

  // Run at first render
  useEffect(() => {
    getAttentionHistory(props.cita.paciente_data.pk);
  }, []);

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
          {/* attention_list */}
          {attention_list.length>0 ? attention_list.map((i) => {return(
            <div key={"inc_list_"+i.pk}
              style={{cursor: "pointer"}}
              >
                <span>{i.fecha} <b>{i.programado}</b></span>
            </div>
          )}) : "No se encontraron otras atenciones"}
        </div>
        <div className="card-footer">
          Para más información revise el apartado de atenciones de paciente en&nbsp;
          <span style={{cursor: "pointer"}}
            onClick={()=>{
              props.redirectTo(`/nav/admision/${props.cita.paciente_data.pk}/detalle`, {patient: props.cita.paciente_data})
            }}>
              <b>Admision</b>
          </span>
        </div>
      </div>
    );
}
const ArchivosPaciente = ({atencion_pk, patient_pk}) => {
  const fileupload_modal_id = "gadrive_upload"
  const fileloadingdelete_modal_id = "gadrive_loadingdelete"
  const [files, setFiles] = useState(false);

  // Google drive API functions
  const getPatientFiles = () => {
    if(__debug__) console.log("ArchivosPaciente getPatientFiles");
    // Get patient by id}
    simpleGet(`atencion/${atencion_pk}/files/`)
    .then(
      res => {
        console.log("res", res);
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
    ? (<div className="card"><div className="card-body">loading</div></div>)
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
          refresFiles={() => setFiles(false)} />
        <ModalLoading
          _id={fileloadingdelete_modal_id}
          _title={"Cargando.."}
          _body_text={"Por favor espere unos segundos mientras se elimina el archivo"} />
      </div>
    )
}
const AttentionProcedures = props => {
  const [procedures, setProcedures] = useState(false);
  const delete_proc_pk = useRef(-1);

  // Add procedure to cita's attention
  const getProcedures = _atencion => simpleGet(`atencion/detalle/?filtro={"atencion":"${_atencion}"}`).then(setProcedures)

  function modalConfirmDelete(_pk){
    window.$('#modal_delete_procedure').modal('show');
    delete_proc_pk.current = _pk;
  }
  function deleteProcedure(){
    window.$('#modal_delete_procedure').modal('hide');  // Hide modal
    if(delete_proc_pk.current==-1) return;

    simpleDelete(`atencion/detalle/${delete_proc_pk.current}/`)
    .then(() => {
      // Delete item from DOM
      document.getElementById(delete_proc_pk.current).parentElement.remove();
      // Reset delete_proc_pk val
      delete_proc_pk.current = -1;
    })
  }
  function editProcedure(proc){
    props.redirectTo(`/nav/procedimiento/${proc.pk}/editar/`);
  }

  useEffect(() => {
    getProcedures(props.cita.atencion);
  }, []);

  return !procedures
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
        <div className="card-header">
          <div className="card-title">
            Procedimientos realizados
          </div>
        </div>
        <div id="proc-list" className={procedures.length==0?"card-body":""}>
          {procedures.length==0
            ? "No se ha relizado ningún procedimiento"
            : procedures.map(proc => (
              <div key={"proc-"+proc.pk}>
                <li className="list-group-item d-flex" id={proc.pk}
                  data-toggle="collapse" data-target={"#proc-desc-"+proc.pk}
                  aria-expanded="true" aria-controls={"proc-desc-"+proc.pk}
                  style={{cursor: "pointer", borderBottom: "0"}}>
                    <span style={{fontSize: "1.2em"}}>
                        {cFL(proc.procedimiento_data.nombre)}
                    </span>
                    <button className="btn ml-auto"
                      style={{paddingTop: "0", paddingBottom: "0", fontSize: "15px"}}
                      onClick={()=>editProcedure(proc)}>
                        <i className="fal fa-edit"></i>
                    </button>
                    {!proc.paid && (
                      <button className="btn"
                        style={{paddingTop: "0", paddingBottom: "0", fontSize: "15px"}}
                        onClick={()=>modalConfirmDelete(proc.pk)}>
                          <i className="fal fa-trash-alt"></i>
                      </button>
                    )}
                </li>
                <div id={"proc-desc-"+proc.pk} className="collapse"
                  aria-labelledby={proc.pk} data-parent="#proc-list"
                  style={{paddingLeft: "1.8rem", paddingTop: "0", paddingBottom: ".75rem"}}>
                    <span>
                      {proc.observaciones}
                    </span>
                </div>
              </div>
            ))}
        </div>
        <AlertModal func={deleteProcedure} />
      </div>
    );
}
const AlertModal = props => {
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
              className="btn btn-primary waves-effect waves-themed" onClick={props.func}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
const Links = ({cita, getCita, redirectTo}) => {
  const finishCita = () => {
    let data = {estado: '5'}

    simplePostData(`atencion/cita/anular/${cita.pk}/`, data, "PUT")
    .then(
      () => {
        handleErrorResponse("custom", "Exito", "La cita ha culminado exitosamente", "success")
        // Actualizar registro de cita
        getCita()
      },
      () => handleErrorResponse("custom", "Ups!","Un error ha ocurrido, por favor intentelo en unos minutos")
    )
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
          <div style={{display: "inline-block", textAlign: "center", marginLeft: "15px", marginRight: "15px"}}>
            <Icon type="procedure" onClick={() => redirectTo(`/nav/procedimiento/${cita.pk}/agregar/`)} /><br/>
            <span style={{fontSize: "0.87rem"}}>Procedimiento</span>
          </div>
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
  );
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

const AtenderPaciente = ({sucursal_pk, redirectTo}) => {
  let __params__ = useParams()
  let [cita, setCita] = useState(false)

  const getUnfinishedANP = (pac_pk, _sucursal_pk) => {
    if(__debug__) console.log("AtenderPaciente getUnfinishedANP")
    simplePostData(`atencion/noprogramado/unfinished/`, {paciente_pk: pac_pk, sucursal_pk: _sucursal_pk})
    .then(
      res => {
        if(__debug__) console.log("AtenderPaciente getUnfinishedANP res:", res)
        if(!res){
          if(__debug__) console.log("AtenderPaciente: no hay una ANP sin finalizar")
          if(__debug__) console.log("AtenderPaciente: crear una ANP")
          createANP(pac_pk, _sucursal_pk)
        }else setCita(res)
      }
    )
  }
  const createANP = (pac_pk, _sucursal_pk) => {
    if(__debug__) console.log("AtenderPaciente createANP")
    simplePostData(`atencion/noprogramado/create/`, {paciente_pk: pac_pk, sucursal_pk: _sucursal_pk})
    .then(
      res => {
        if(__debug__) console.log("AtenderPaciente createANP res:", res)
        setCita(res)
      }
    )
  }

  useEffect(() => {
    if(__debug__) console.log("AtenderPaciente useEffect")

    getUnfinishedANP(__params__.pac_pk, sucursal_pk)
  }, [])

  return !cita
    ? "loading"
    : <Redirect to={`/nav/atencion/${cita.pk}/detalle`} />
}

export default Atencion;

/*
Update debts after removing procedure
* badge (to pay/paid)
* Disable cobranza button when there is nothing to pay for

* roles (admin, medic)
* Fill attention.detail when attention is over (clinic history) (but where to ask that?)
* prescription (read only) (permission)
* odontogram (read only) (permission)
* BUG: Modal background do not disappear when change page without closing modal
*/
