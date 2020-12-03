import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
} from '../../functions';
import { PageTitle } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const HistorialPagos = ({_patient, sucursal_pk, redirectTo}) => {
  let __params__ = useParams();
  const datatable_id = "patientxpagos-table"

  const [patient, setPatient] = useState(false)
  const [patientxpagos, setPxP] = useState(false)
  const [datatable, setDatatable] = useState(false)

  const getPatient = () => {
    if(__debug__) console.log("HistorialPagos getPatient")

    if(patient) setPatient(_patient)
    else
    simpleGet(`atencion/paciente/${__params__.patient}/`)
    .then(setPatient);
  }
  const getPxP = patient_dni => {
    if(__debug__) console.log("HistorialPagos getPxP")

    simpleGet(`finanzas/cuentacorriente/pago/?filtro={"dni":"${patient_dni}"}`)
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
      dt_script.onload = () => getPatient();
      document.body.appendChild(dt_script);
    }else getPatient();
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link");
      dt_style.rel = "stylesheet";
      dt_style.id = "dt_style";
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
      document.head.appendChild(dt_style);
    }
  }, []);
  // When patient variable is setted
  useEffect(() => {
    if(!patient) return

    getPxP(patient.dni)
  }, [patient])
  // When patientxpagos variable is setted
  useEffect(() => {
    if(!patientxpagos) return;  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$(`#${datatable_id}`).DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$(`#${datatable_id}`).DataTable({
      data: patientxpagos,
      columns: [
        {title: "Fecha", data: "fecha_pago"},
        {title: "Origen", data: "detallecuentacorriente.detalle_dpdt"},
        {title: "Procedimiento", data: "detallecuentacorriente.detalle"},
        {title: "Monto", data: "monto"},
      ],
      columnDefs: [{
        // Origen del pago
        targets: 1,
        render: data => data ? "Plan de trabajo" : "Atencion"
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
