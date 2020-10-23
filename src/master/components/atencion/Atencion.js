import React, { useState, useEffect, useRef } from 'react';
import { Switch, Route, Redirect, useParams } from "react-router-dom";
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK,
  simplePostData,
  simpleGet,
} from '../../functions';
import { PageTitle, Icon, ModalLoading } from '../bits';
import { FileIcon, defaultStyles } from 'react-file-icon'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


function Atencion(props){
  // Receive {data.cita, sucursal_pk, redirectTo}
  return(
  <>
    <PageTitle title={"Atención"} />

    <Switch>
      <Route exact path="/nav/atencion">
        <AttentionList sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/atencion/:cita_pk/detalle">
        <AttentionDetail
          sucursal_pk={props.sucursal_pk}
          cita={props.data.cita}
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

    /* Send all values as string */
    let filter = `filtro={"sucursal":"${_sucursal_pk}", "fecha": "${_date}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      });
    }, () => handleErrorResponse('server'));
    result.then(
      response_obj => {  // In case it's ok
        // Remove duplicated attention
        let _tmp = response_obj;
        let _tmp1 = [];  // Store attention's id
        if(_tmp.length>0){
          _tmp = response_obj.filter(i => {
            if(_tmp1.includes(i.atencion)){  // If attention already in _tmp1
              return false;  // Remove
            }
            _tmp1.push(i.atencion);  // Save attention in _tmp1 array
            return true;
          });
        }

        setAttentions(_tmp);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
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
  // Receive {cita, sucursal_pk, redirectTo}
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
            <CitaData cita={cita} />
          </div>
          <div className="panel">
            <AttentionProcedures cita={cita} redirectTo={props.redirectTo} />
          </div>
        </div>
        <div className="col-lg-6" style={{display: "inline-block"}}>
          <div className="panel">
            <Links paciente_data={cita.paciente_data} redirectTo={redirect} cita_pk={cita.pk} />
          </div>
          <div className="panel">
            <PatientAttentionHistory
              sucursal_pk={props.sucursal_pk}
              cita={cita}
              redirectTo={props.redirectTo} />
          </div>
          <div className="panel">
            <PatientAttentionFiles atencion={cita.atencion} />
          </div>
        </div>
      </div>
    );
}
const CitaData = props => {
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
          {cFL(props.cita.paciente_data.ape_paterno)+" "+cFL(props.cita.paciente_data.ape_materno)
            +", "+cFL(props.cita.paciente_data.nombre_principal)+
            (props.cita.paciente_data.nombre_secundario?" "+cFL(props.cita.paciente_data.nombre_secundario):"")}&nbsp;
          <code>{props.cita.paciente_data.dni}</code>
        </h6>
        <h6>
          <b>Programado: </b>
          {cFL(props.cita.programado)}
        </h6>
        <h6>
          <b>Fecha y hora: </b>
          {props.cita.fecha} <code>{props.cita.hora.slice(0, 5)} - {props.cita.hora_fin.slice(0, 5)}</code>
        </h6>
        <h6>
          <b>Personal de atención: </b>
          {cFL(props.cita.personal.ape_paterno)+" "+cFL(props.cita.personal.ape_materno)
            +", "+cFL(props.cita.personal.nombre_principal)+
            (props.cita.personal.nombre_secundario?" "+cFL(props.cita.personal.nombre_secundario):"")}
        </h6>
        <h6>
          <b>Indicaciones: </b>
          {cFL(props.cita.indicaciones)}
        </h6>
        <h6>
          <b>Estado: </b>
          {props.cita.estado==1
            ? "Cita"
            : props.cita.estado==4
            ? "Paciente no se presento"
            : props.cita.estado==5
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
    // Get last n patient's attentions
    let filter = `filtro={"sucursal":"${props.sucursal_pk}", "estado":"5", "paciente":"${_patient_pk}", "last":"5"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      });
    }, () => handleErrorResponse('server'));
    result.then(
      response_obj => {  // In case it's ok
        // Remove current attention
        let _tmp = response_obj;
        if(_tmp.length>0){
          _tmp = response_obj.filter(i => i.pk!=props.cita.pk);
        }

        setAttentionList(_tmp);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  const redirectToAttentionDetail = _cita => {
    if(_cita.pk == props.cita.pk) return

    props.redirectTo(`/nav/atencion/${_cita.pk}/detalle`, {cita: _cita});
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
              //onClick={()=>redirectToAttentionDetail(i)}
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
const PatientAttentionFiles = ({atencion}) => {
  const gadrive_modal_id = "gadrive_loading"
  const [files, setFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(false)

  // Google drive API functions
  const getAtencionFiles = () => {
    simpleGet(`atencion/${atencion}/files/`)
    .then(setFiles)
  }
  const inputFileChange = ev => setSelectedFile(ev.target.files.length!=0)
  const uploadFile = () => {
    let input_file = window.document.getElementById('input-file')
    if(input_file.files.length == 0){
      return
    }

    let file = input_file.files[0]
    let data = new FormData()
    data.append("file", file)

    /* Show modal */
    showLoadingModal()

    return fetch(
      process.env.REACT_APP_PROJECT_API+`atencion/${atencion}/files/`,
      {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          // 'Content-Type': 'application/octet-stream'  // JSON type
        },
        body: data,
      },
    ).then(
      response => (
        response.ok
        ? response.json()
        : response.status==403
        ? handleErrorResponse('permission')
        : response.status==500
        ? handleErrorResponse('server')
        : Promise.reject()
      ),
      () => handleErrorResponse('server')
    )
    .then(getAtencionFiles)
    .then(hideLoadingModal)
  }
  const deleteFile = file_id => {
    simplePostData(`atencion/${atencion}/files/delete/`, {file_id: file_id})
    .then(getAtencionFiles)
  }
  const showLoadingModal = () => window.$(`#${gadrive_modal_id}`).modal("show")
  const hideLoadingModal = () => window.$(`#${gadrive_modal_id}`).modal("hide")


  // Run at first render
  useEffect(() => {
    getAtencionFiles()
  }, []);

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
            <div key={"file_list_"+f.id} style={{
              margin: "15px 0",
            }}>
              <GDriveFile file={f} deleteFile={deleteFile} />
            </div>
          )) : "No hay archivos añadidos"}
        </div>
        <div className="card-footer">
          <input type="file" id="input-file" onChange={inputFileChange} />
          <button className="btn btn-primary" disabled={!selectedFile} onClick={uploadFile}>Subir archivo</button>
        </div>

        <ModalLoading
          _id={gadrive_modal_id}
          _title={"Subiendo archivo"}
          _body_text={"Por favor espere unos segundos mientras el archivos se guarda"} />
      </div>
    )
}
const AttentionProcedures = props => {
  const [procedures, setProcedures] = useState(false);
  const delete_proc_pk = useRef(-1);

  function getProcedures(_atencion){
    // Add procedure to cita's attention
    let filter = `filtro={"atencion":"${_atencion}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/detalle/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok
        setProcedures(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }

  function modalConfirmDelete(_pk){
    window.$('#modal_delete_procedure').modal('show');
    delete_proc_pk.current = _pk;
  }
  function deleteProcedure(){
    window.$('#modal_delete_procedure').modal('hide');  // Hide modal
    if(delete_proc_pk.current==-1) return;

    // Delete procedure to cita's attention
    let url = process.env.REACT_APP_PROJECT_API+`atencion/detalle/${delete_proc_pk.current}/`;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.text())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok
        // Delete item from DOM
        document.getElementById(delete_proc_pk.current).parentElement.remove();
        // Reset delete_proc_pk val
        delete_proc_pk.current = -1;
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
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
                    <button className="btn"
                      style={{paddingTop: "0", paddingBottom: "0", fontSize: "15px"}}
                      onClick={()=>modalConfirmDelete(proc.pk)}>
                        <i className="fal fa-trash-alt"></i>
                    </button>
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
const Links = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="admision"
              onClick={() => props.redirectTo(`/nav/admision/${props.paciente_data.pk}/detalle`, {patient: props.paciente_data})} /><br/>
            <span style={{fontSize: "0.9rem"}}>Admision</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="odontogram" onClick={() => props.redirectTo(`/nav/odontograma/${props.cita_pk}/`)} /><br/>
            <span style={{fontSize: "0.9rem"}}>Odontograma</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="procedure" onClick={() => props.redirectTo(`/nav/procedimiento/${props.cita_pk}/agregar/`)} /><br/>
            <span style={{fontSize: "0.87rem"}}>Procedimiento</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="prescription" onClick={() => props.redirectTo(`/nav/prescripcion/${props.cita_pk}/`)} /><br/>
            <span style={{fontSize: "0.9rem"}}>Receta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
const GDriveFile = ({file, deleteFile}) => {
  let last_dot_index = file.name.split("").lastIndexOf(".")
  let ext = file.name.slice(last_dot_index+1, file.name.length)
  let name = file.name.slice(0, last_dot_index)

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
          onClick={()=>deleteFile(file.id)}
        >
          <i className="fal fa-trash-alt"></i>
        </div>
      </div>
    </div>
  )
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
