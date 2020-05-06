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
  const [cita, setCita] = useState(props.data &&  props.data.cita);

  useEffect(() => {
    console.log(cita);
  }, [cita]);

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
    props.redirectTo(url, props.cita);
  }

  // Run only at first render
  useEffect(() => {
    console.log(props);
  }, []);

  return (
    <div className="row">
      {/* Patient data */}
      <div className="col-lg-6" style={{display: "inline-block"}}>
        <div className="panel">
          <PatientData cita={props.cita} />
        </div>
      </div>
      {/* Patient attention history */}
      <div className="col-lg-6" style={{display: "inline-block"}}>
        <div className="panel">
          <PatientAttentionHistory sucursal_pk={props.sucursal_pk} cita={props.cita} />
        </div>
        <div className="panel">
          <Links redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
};
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
    let filter = `filtro={"sucursal":"${_sucursal_pk}", "estado":"5", "fecha": "${_date}"}`;
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
        setAttentions(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    // Add DataTable rel docs
    const dt_script = document.createElement("script");
    dt_script.async = false;
    dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
    dt_script.onload = () => {
      // Run at first execution
      getLatestAttentions();
    };
    document.body.appendChild(dt_script);
    const dt_style = document.createElement("link");
    dt_style.rel = "stylesheet";
    dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
    document.head.appendChild(dt_style);

    savePageHistory();  // Save page history
    return () => {
      console.log("UNMOUNTING");
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
          <table id="last-attentions"></table>
        </div>
      </div>
    )
  );
};

const PatientData = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Paciente
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">
          {cFL(props.cita.paciente_data.ape_paterno)+" "+cFL(props.cita.paciente_data.ape_materno)
            +", "+cFL(props.cita.paciente_data.nombre_principal)+
            (props.cita.paciente_data.nombre_secundario?" "+cFL(props.cita.paciente_data.nombre_secundario):"")}&nbsp;
          <code>{props.cita.paciente_data.dni}</code>
        </h5>
        <h5 className="card-title">
          <b>Programado: </b>
          {cFL(props.cita.programado)}
        </h5>
        <h5 className="card-title">
          <b>Fecha y hora: </b>
          {props.cita.fecha} <code>{props.cita.hora.slice(0, 5)} - {props.cita.hora_fin.slice(0, 5)}</code>
        </h5>
        <h5 className="card-title">
          <b>Personal de atención: </b>
          {cFL(props.cita.personal.ape_paterno)+" "+cFL(props.cita.personal.ape_materno)
            +", "+cFL(props.cita.personal.nombre_principal)+
            (props.cita.personal.nombre_secundario?" "+cFL(props.cita.personal.nombre_secundario):"")}
        </h5>
        <h5 className="card-title">
          <b>Indicaciones: </b>
          {cFL(props.cita.indicaciones)}
        </h5>
      </div>
    </div>
  );
}
const PatientAttentionHistory = props => {
  console.log(props);
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
  // Run when attention_list is setted
  useEffect(() => {
    if(!attention_list) return;

    console.log(attention_list);
  }, [attention_list]);

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
const Links = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Agregar documento
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">
          <div className="card col-6" style={{display: "inline-block", textAlign: "center"}}>
            <div className="card-header">
              <Icon type="odontogram" onClick={() => props.redirectTo("/nav/odontograma")} />
            </div>
            <div className="card-body">
              Odontograma
            </div>
          </div>
          <div className="card col-6" style={{display: "inline-block", textAlign: "center"}}>
            <div className="card-header">
              <Icon type="procedure" onClick={() => props.redirectTo("/nav/procedimiento")} />
            </div>
            <div className="card-body">
              Procedimiento
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Atencion;

/*
* Procedimientos realizados (add|link)

* atención(roles, filtro fecha, print, receta, recomendación)
+ Prescripción y medicamentos (show)
*/
