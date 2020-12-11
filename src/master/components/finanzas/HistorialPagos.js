import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams } from "react-router-dom";
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
} from '../../functions';
import { PageTitle } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const HistorialPagos = ({sucursal_pk, redirectTo}) => {
  let __params__ = useParams();
  const datatable_id = "patientxpagos-table"

  const [patientxpagos, setPxP] = useState(false)
  const [datatable, setDatatable] = useState(false)

  const getPxP = () => {
    if(__debug__) console.log("HistorialPagos getPxP")

    simpleGet(`finanzas/sucursal/${sucursal_pk}/paciente/${__params__.patient}/`)
    .then(setPxP);
  }

  // Add DataTable rel docs
  useEffect(() => {
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script");
      dt_script.async = false;
      dt_script.id = "dt_script";
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
      dt_script.onload = () => getPxP();
      document.body.appendChild(dt_script);
    }else getPxP();
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link");
      dt_style.rel = "stylesheet";
      dt_style.id = "dt_style";
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
      document.head.appendChild(dt_style);
    }
  }, []);
  // When patientxpagos variable is setted
  useEffect(() => {
    if(!patientxpagos) return;  // Abort if it's false
    console.log("patientxpagos", patientxpagos);

    // Destroy previous DT if exists
    if(datatable) window.$(`#${datatable_id}`).DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$(`#${datatable_id}`).DataTable({
      data: patientxpagos,
      columns: [
        {title: "Fecha y hora de pago", data: "fecha"},
        {title: "Monto", data: "monto"},
        {title: "Plan de trabajo", data: "pk"},
        {title: "Detalle", data: "detalle"},
      ],
      columnDefs: [{
        // Origen del pago
        targets: 0,
        render: data => {
          // console.log("data", data);
          let splited_data = data.split("-")
          let date = splited_data[0]
          let time = splited_data[1].split(":")
          let minute = time[1].padStart(2, "0")
          let hour = Number(time[0])
          let indicator = hour >= 12 ? "PM" : "AM"
          if(hour > 12) hour = hour-12  // Fix hour
          return date+" - "+String(hour).padStart(2, "0")+":"+minute+" "+indicator
        }
      }, {
        // Origen del pago
        targets: 2,
        createdCell: (cell, data, row) => {
          ReactDOM.render(
            <span
              className={`badge badge-${row.cita ? "success" : "info"} badge-pill`}
              style={{cursor: "pointer"}}
              onClick={()=>redirectTo(row.cita?`/nav/atencion/${row.cita}/detalle/`:`/nav/plandetrabajo/${__params__.patient}/`)}
            >{row.cita ? "Atencion" : "Plan de trabajo"}</span>
            , cell
          )
        }
      }],
      order: [[0, 'desc']],  // Default sort by newest
      pageLength: 8,  // Default page length
      lengthMenu: [[8, 15, 25], [8, 15, 25]],  // Show n registers select option
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No se han realizado pagos",
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
  }, [patientxpagos]);

  return (
    <>
    <PageTitle title={"Registro de pagos del paciente"} />
    {!patientxpagos
      ? "loading"
      : (
        <div className="datatable-container col-12">
          <table id={datatable_id} style={{width: "100%"}}></table>
        </div>
      )
    }
    </>
  )
}


export default HistorialPagos
