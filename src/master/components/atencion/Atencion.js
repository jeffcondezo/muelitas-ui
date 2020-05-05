import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UNSAFE_cache_postState,
  UNSAFE_cache_getState,
  savePageHistory,
} from '../HandleCache';
import { handleErrorResponse, capitalizeFirstLetter } from '../../functions';

function Atencion(props){
  const [attention_pk, setAttention] = useState(props.data &&  props.data.cita.atencion);
  console.log(props);
  console.log(attention_pk);

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

    {attention_pk
      ? <AttentionDetail sucursal_pk={props.sucursal_pk} cita={props.cita} />
      : <AttentionList sucursal_pk={props.sucursal_pk} setAttention={setAttention} />}
  </>
  )
}

const AttentionDetail = (props) => {
  console.log(props);

  function getAttentionDetail(_atencion_id){
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

  /*
  sucursal: 1
  fecha: "2020-05-01"
  hora: "08:00:00"
  atencion: 45
  hora_fin: "12:00:00"
  origen_cita: "3"
  estado: "5"
  indicaciones: "consulta"
  programado: "CONSULTA REGULAR↵Atendido por neldo agustin y sam sachez"
  paciente_data: {pk: 8, nombre_principal: "asdfawefsadf", nombre_secundario: "sadfsad", ape_paterno: "fsadfasdf", ape_materno: "asdfasdf", …}
  personal: {nombre_principal: "neldo", nombre_secundario: "nombredos", ape_paterno: "agustin", ape_materno: "falcon", dni: "4567831", …}
  pk: 6
  */

  return "ATTENTION DETAIL";
};
const AttentionList = (props) => {
  const [latest_attentions, setAttentions] = useState(false);
  const [datatable, setDatatable] = useState(false);

  function getLatestAttentions(_sucursal_pk, _last_n){
    // Get latest done citas
    /* Send all values as string */
    let filter = `filtro={"sucursal":"${_sucursal_pk}", "estado":"5", "last": "${_last_n}"}`;
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

  // Add DataTable rel docs
  useEffect(() => {
    const dt_script = document.createElement("script");
    dt_script.async = false;
    dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
    document.body.appendChild(dt_script);
    const dt_style = document.createElement("link");
    dt_style.rel = "stylesheet";
    dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
    document.head.appendChild(dt_style);
    console.log("DATATABLE");
  }, []);
  // Run at first execution
  useEffect(() => {
    getLatestAttentions(props.sucursal_pk, 15);

    savePageHistory();  // Save page history
    return () => {
      console.log("UNMOUNTING");
    }
  }, []);
  // When latest_attentions are setted
  useEffect(() => {
    if(!latest_attentions) return;  // Abort if it's false
    console.log("latest_attentions", latest_attentions);

    // Destroy previous DT if exists
    if(datatable) window.$('#last-attentions').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#last-attentions').DataTable({
      data: latest_attentions,
      columns: [
        {title: "Paciente", data: 'paciente_data.dni'},
        {title: "Indicaciones", data: 'indicaciones'},
        {title: "Fecha", data: 'fecha'},
        {title: "Hora programada", data: 'hora'},
        {title: "Hora fin", data: 'hora_fin'},
        {title: "", data: null},
      ],
      columnDefs: [{
        targets: -1,
        defaultContent: "<button class='select-attention'>Seleccionar</button>",
      }, {
        targets: 0,
        render: (data, type, row) => (
          row.paciente_data.ape_paterno.toUpperCase()+", "+
          capitalizeFirstLetter(row.paciente_data.nombre_principal)
        ),
      }],
      pageLength: 10,
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "Ningún dato disponible en esta tabla =(",
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
        var data = datatable.row(el).data();
        console.log("Selected", data);
        setAttention(data.setAttention);
      }
    });
  }, [datatable]);

  return (
    !latest_attentions
    ? "loading"
    : (
      <div>
        <div className="datatable-container">
          <table id="last-attentions"></table>
        </div>
      </div>
    )
  );
};

export default Atencion;

/*
* Datos del paciente (show)
* Historia clinica (link)
* Registrar odontograma (link)
* Procedimientos realizados (link)
+ Prescripción y medicamentos (show)
*/
