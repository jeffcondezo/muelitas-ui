import React, { useState, useEffect, useRef, useCallback } from 'react';
import { savePageHistory } from '../HandleCache';
import { Switch, Route, Redirect, Link, useHistory } from "react-router-dom";
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { Icon } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_admision";


function Admision(props){
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
        <i className="subheader-icon fal fa-chart-area"></i> Admision
      </h1>
    </div>

    <Switch>
      <Route exact path="/nav/admision">
        <AdmisionHome
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/admision/detalle">
        {!props.data.patient
          ? <Redirect to="/nav/admision" />
          : <AdmisionDetail
              sucursal_pk={props.sucursal_pk}
              redirectTo={props.redirectTo}
              patient={props.data.patient} />
        }
      </Route>
      <Route>
        <Redirect to="/nav/admision" />
      </Route>
    </Switch>
  </>
  )
}

const AdmisionHome = props => {
  console.log("AdmisionHome", props);
  useEffect(() => {
    savePageHistory();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-8">
        <div style={{marginBottom: "25px"}}>
          <SearchPatient sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
        </div>
      </div>
      <div className="col-lg-4">
        <div className="panel">
          <Links />
        </div>
        <div className="panel">
          <LastAttendedPatients sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
        </div>
      </div>
    </div>
  );
}
const SearchPatient = props => {
  const [patients, setPatients] = useState(false);
  const [datatable, setDatatable] = useState(false);

  function getAllPatients(_sucursal_pk=props.sucursal_pk){
    let filter = `filtro={"all":"all"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/paciente/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),
        },
      });
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
        setPatients(response_obj);
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
        getAllPatients();
      };
      document.body.appendChild(dt_script);
    }else{
      getAllPatients();
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
      console.log("UNMOUNTING PATIENT LIST");
    }
  }, []);
  // When patients are setted
  useEffect(() => {
    if(!patients) return;  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#search-patient').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#search-patient').DataTable({
      data: patients,
      columns: [
        {title: "Nombre", data: null},
        {title: "Apellidos", data: null},
        {title: "DNI", data: 'dni'},
        {title: "Ultima atencion", data: null},
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
            props.redirectTo("/nav/admision/detalle", {patient: rowData});
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
      }, {
        // Última atención
        targets: 3,
        render: (data, type, row) => (
          row.dni
        ),
      }],
      pageLength: 8,
      lengthMenu: [[8, 15, 25], [8, 15, 25]],
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
  }, [patients]);

  return !patients
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="search-patient" style={{width: "100%"}}></table>
      </div>
    );
}
const LastAttendedPatients = props => {
  const [lastPatients, setLastPatients] = useState(false);

  function getLastAttendedPatients(_sucursal_pk=props.sucursal_pk, ndays=4){
    // Get lastest attended patients within the last four days
    let _day = new Date();
    _day.setDate(_day.getDate()-ndays)
    _day = _day.toDateInputValue();

    let filter = `filtro={"sucursal":"${_sucursal_pk}", "fecha_desde":"${_day}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      });
    }, () => handleErrorResponse('server'));
    result.then(
      response_obj => {
        let _fake_obj = [];
        let _tmp1 = [];
        response_obj.map(cita => {
          if(_tmp1.includes(cita.paciente_data.pk)) return;  // Abort
          else _tmp1.push(cita.paciente_data.pk);  // Save patient's pk

          _fake_obj.push(cita.paciente_data);  // Save patient's data
        })

        setLastPatients(_fake_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getLastAttendedPatients(props.sucursal_pk);
  }, []);

  return !lastPatients
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
        <div className="card-header">
          <div className="card-title">
            Pacientes atendidos en los últimos días
          </div>
        </div>
        <div id="proc-list" className={lastPatients.length==0?"card-body":""}>
          {lastPatients.length==0
            ? "No hay pacientes atendidos ultimamente"
            : lastPatients.map(pat => (
              <div key={"proc-"+pat.pk}>
                <li className="list-group-item d-flex" id={pat.pk}
                  data-toggle="collapse" data-target={"#pat-desc-"+pat.pk}
                  aria-expanded="true" aria-controls={"pat-desc-"+pat.pk}
                  style={{cursor: "pointer", borderBottom: "0"}}>
                    <span
                      onClick={()=>{props.redirectTo("/nav/admision/detalle", {patient: pat})}}
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
            <Icon type="add" onClick={() => props.redirectTo("/nav/admision/nuevo")} /><br/>
            <span style={{fontSize: "0.9rem"}}>Nuevo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdmisionDetail = props => {
  console.log("AdmisionDetail", props);
  useEffect(() => {
    savePageHistory();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-6">
        <div style={{marginBottom: "25px"}}>
          <PatientData
            patient={props.patient}
            sucursal_pk={props.sucursal_pk}
            redirectTo={props.redirectTo} />
        </div>
      </div>
      <div className="col-lg-6">
        <div className="panel">
          <Links />
        </div>
        <div className="panel">
          <EditData
            patient={props.patient}
            sucursal_pk={props.sucursal_pk}
            redirectTo={props.redirectTo} />
        </div>
      </div>
    </div>
  );
}
const PatientData = props => {
  // Receive props.cita.paciente_data
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Paciente
        </div>
      </div>
      <div className="card-body">
        <h6>
          {cFL(props.patient.ape_paterno)+" "+cFL(props.patient.ape_materno)
            +", "+cFL(props.patient.nombre_principal)+
            (props.patient.nombre_secundario?" "+cFL(props.patient.nombre_secundario):"")}&nbsp;
          <code>{props.patient.dni}</code>
        </h6>
      </div>
    </div>
  );
}
const EditData = props => {
  return "EDITAR DATOS";
}
const RegisterPatient = props => {
  return "Registrar paciente";
}
const ClinicHistory = props => {
  return "Historia Clinica";
}

export default Admision;

/*
* Show patient data (
  * Clinic history (link)
  * Procedimientos realizados (add|link)
  * Show current prescription
  * Show attention history
)
* Update patient data
* Register patient
*/
