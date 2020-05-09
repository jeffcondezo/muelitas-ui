import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UNSAFE_cache_postState,
  UNSAFE_cache_getState,
  savePageHistory,
} from '../HandleCache';
import { Link, useHistory } from "react-router-dom";
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { Icon } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_attention";


function Atencion(props){
  const [cita, setCita] = useState(props.data &&  props.data.cita || false);

  return(
  <>
    {/* ALERTS */}
    <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
        <strong>Error</strong> No se ha podido establecer conexión con el servidor.
    </div>
    <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
        <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
    </div>

    {/* HEADER */}
    <div className="subheader">
      <h1 className="subheader-title">
        <i className="subheader-icon fal fa-chart-area"></i> Atencion
      </h1>
    </div>

    {cita
      ? <AttentionDetail sucursal_pk={props.sucursal_pk} cita={cita} redirectTo={props.redirectTo} />
      : <AttentionList sucursal_pk={props.sucursal_pk} setCita={setCita} />}
  </>
  )
}

const AttentionDetail = (props) => {
  const getAttentionDetail = (_atencion_id) => {
    /* Promise as a component
    * We don't use Promise and Fetch as components 'cuz we need to customize a lot of its properties
    * that'd result in a function with much parameters than it'd less verbose
    */
    // Get plan trabajo
    let filter = `filtro={"atencion":"${_atencion_id}"}`;
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
      });
    }, () => handleErrorResponse('server'));
    result.then(
      response_obj => {  // In case it's ok
        console.log(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  const redirect = (url) => {
    props.redirectTo(url, {cita: props.cita});
  }

  return (
    <div className="row">
      <div className="col-lg-6" style={{display: "inline-block"}}>
        <div className="panel">
          <PatientData cita={props.cita} />
        </div>
        <div className="panel">
          <AttentionProcedures cita={props.cita} />
        </div>
      </div>
      <div className="col-lg-6" style={{display: "inline-block"}}>
        <div className="panel">
          <Links redirectTo={redirect} />
        </div>
        <div className="panel">
          <PatientAttentionHistory sucursal_pk={props.sucursal_pk} cita={props.cita} />
        </div>
      </div>
    </div>
  );
}
const AttentionList = props => {
  const [latest_attentions, setAttentions] = useState(false);
  const [datatable, setDatatable] = useState(false);
  const searchDate = useRef(false);

  function getLatestAttentions(_date=false, _last_n=15, _sucursal_pk=props.sucursal_pk){
    // Get today's finished citas
    if(!_date){
      let _tmp = new Date();
      _date = _tmp.getFullYear()+"-"+(_tmp.getMonth()+1)+"-"+_tmp.getDate();
    }else searchDate.current = _date;

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

    savePageHistory();  // Save page history
    return () => {
      console.log("UNMOUNTING ATTENTION LIST");
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

    document.querySelectorAll("#last-attentions tbody tr td button.select-attention").forEach(el => {
      el.onclick = () => {
        var data = datatable.row(el.parentElement.parentElement).data();
        props.setCita(data);
      }
    });
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
            <Icon type="finance" onClick={() => props.redirectTo("/nav/finanzas")} /><br/>
            <span style={{fontSize: "0.9rem"}}>Cobrar</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="odontogram" onClick={() => props.redirectTo("/nav/odontograma")} /><br/>
            <span style={{fontSize: "0.9rem"}}>Odontograma</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="procedure" onClick={() => props.redirectTo("/nav/procedimiento")} /><br/>
            <span style={{fontSize: "0.87rem"}}>Procedimiento</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="prescription" onClick={() => props.redirectTo("/nav/prescripcion")} /><br/>
            <span style={{fontSize: "0.9rem"}}>Receta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
const PatientData = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Paciente
        </div>
      </div>
      <div className="card-body">
        <h6>
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
      </div>
    </div>
  );
}
const PatientAttentionHistory = props => {
  const [attention_list, setAttentionList] = useState(false);

  const getAttentionHistory = (_patient_pk, _sucursal_pk=props.sucursal_pk) => {
    // Get last n patient's attentions
    let filter = `filtro={"sucursal":"${_sucursal_pk}", "estado":"5", "paciente":"${_patient_pk}", "last":"5"}`;
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

  // Run at first render
  useEffect(() => {
    getAttentionHistory(props.cita.paciente_data.pk);
  }, []);

  return !attention_list
    ? "loading"
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
            <div key={"inc_list_"+i.pk} style={{cursor: "pointer"}}>
              <span>{i.fecha} <b>{i.programado}</b></span>
            </div>
          )}) : "No se encontraron otras atenciones"}
        </div>
        <div className="card-footer">
          Para más información revise el apartado de atenciones de paciente en <Link to="/nav/admision/"><b>Admision</b></Link>
        </div>
      </div>
    );
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

  function modelConfirmDelete(_pk){
    window.$('#modal_delete_procedure').modal('show');
    delete_proc_pk.current = _pk;
  }
  function deleteProcedure(){
    console.log("DELETE");
    window.$('#modal_delete_procedure').modal('hide');  // Hide modal
    if(delete_proc_pk.current==-1) return;

    // Add procedure to cita's attention
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
        document.getElementById(delete_proc_pk.current).remove();
        // Reset delete_proc_pk val
        delete_proc_pk.current = -1;
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getProcedures(props.cita.atencion);
  }, []);

  return !procedures
    ? "loading"
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
                      onClick={()=>modelConfirmDelete(proc.pk)}>
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
            <h5 className="modal-title">Anular cita</h5>
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

export default Atencion;

/*
* roles
* Prescripción y medicamentos (show)
* print
*/
