import React, { useState, useEffect, useRef, useContext } from 'react'
import ReactDOM from 'react-dom'
import { useParams } from "react-router-dom"
import {
  simpleGet,
  simplePostData,
} from '../../functions'
import {
  PageTitle,
  RegularModalCentered,
  ModalCancel
} from '../bits'
import { NavigationContext } from '../Navigation'
import Loader from '../loader/Loader'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"


const HistorialPagos = () => {
  const {current_sucursal} = useContext(NavigationContext)
  let __params__ = useParams()
  const datatable_id = "patientxpagos-table"
  const html_proc_annul = "html_proc_annul"

  const [patientxpagos, setPxP] = useState(false)
  const [datatable, setDatatable] = useState(false)
  const [selected_pago, selectPago] = useState(false)
  let annul_proc = useRef(-1)

  const getPxP = () => {
    if(__debug__) console.log("HistorialPagos getPxP")

    simpleGet(`finanzas/sucursal/${current_sucursal}/paciente/${__params__.patient}/`)
    .then(setPxP)
  }
  const askAnnulPayment = _pk => {
    annul_proc.current = _pk
    window.$('#'+html_proc_annul).modal('show')
  }
  const annulPayment = () => {
    let _pk = annul_proc.current
    if(_pk == -1) return
    simplePostData(`finanzas/pago/revert/`, {pagomaestro: _pk})
    .then(() => {
      annul_proc.current = -1
      setPxP(patientxpagos.filter(pxp => pxp.pk != _pk))
    })
  }

  // Add DataTable rel docs
  useEffect(() => {
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script")
      dt_script.async = false
      dt_script.id = "dt_script"
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js"
      dt_script.onload = () => getPxP()
      document.body.appendChild(dt_script)
    }else getPxP()
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link")
      dt_style.rel = "stylesheet"
      dt_style.id = "dt_style"
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css"
      document.head.appendChild(dt_style)
    }

    return () => {
      window.$("#pago-detalle").modal("hide")
    }
  }, [])
  // When patientxpagos variable is setted
  useEffect(() => {
    if(!patientxpagos) return  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#'+datatable_id).DataTable().clear().destroy()
    // Gen Datatable
    let _tmp = window.$('#'+datatable_id).DataTable({
      data: patientxpagos,
      columns: [
        {title: "Realizado", data: "created"},
        {title: "Monto", data: "monto"},
        {title: "Origen", data: "plantrabajo"},
        {title: "Detalle", data: "detalle"},
        {title: "Comprobante", data: "comprobante"},
        {title: "Anular", data: "pk"},
      ],
      columnDefs: [{
        // Fecha y hora
        targets: 0,
        createdCell: (cell, data, _) => {
          /* Why to use createdCell in this case?
          * We need to change date format after render bc this will be only stetic
          * and datatable will keep sorting and searching values from the original rendered data ('created' field)
          */
          let splited_data = data.split(" ")
          let date = splited_data[0].split("/").reverse().join("/")
          let time = splited_data[1].split(":")
          let minute = time[1].padStart(2, "0")
          let hour = Number(time[0])
          let indicator = hour >= 12 ? "PM" : "AM"
          if(hour > 12) hour = hour-12  // Fix hour
          ReactDOM.render(
            <span>
              {date+" - "+String(hour).padStart(2, "0")+":"+minute+" "+indicator}
            </span>, cell
          )
        },
      }, {
        // Origen del pago
        targets: 2,
        orderable: false,
        createdCell: (cell, data, _) => {
          ReactDOM.render(
            <span className={`badge badge-${data?"info":"success"} badge-pill`} style={{cursor: "pointer"}}>
              {data ? "Plan de trabajo" : "Atencion"}
            </span>
            , cell
          )
        }
      }, {
        // Detalle
        targets: 3,
        orderable: false,
        createdCell: (cell, _, row) => {
          ReactDOM.render(
            <button className="btn-primary btn-pills waves-effect"
              data-toggle="modal" data-target="#pago-detalle"
              onClick={() => selectPago(row)}>Detalle</button>
            , cell
          )
        }
      }, {
        // Comprobante
        targets: -2,
        orderable: false,
        createdCell: (cell, data, _) => {
          if(!data) return
          ReactDOM.render(
            <a className="btn btn-primary btn-sm btn-icon waves-effect waves-themed"
            target='_blank' href={process.env.REACT_APP_PROJECT_API+`fe/comprobante/view/${data}/`}>
              <i class="fal fa-print"></i>
            </a>
            , cell
          )
        }
      }, {
        // Anular
        targets: -1,
        orderable: false,
        createdCell: (cell, pk, _) => {
          ReactDOM.render(
            <button className="btn-secondary btn-pills" onClick={() => askAnnulPayment(pk)}>
              <i className="fal fa-trash-alt"></i>
            </button>
            , cell
          )
        }
      }],
      order: [[0, 'desc']],
      pageLength: 15,  // Default page length
      lengthMenu: [[15, 30, 45], [15, 30, 45]],  // Show n registers select option
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No se han realizado pagos",
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
  }, [patientxpagos])

  return (
    <>
    <PageTitle title={"Historial de pagos del paciente"} />
    {!patientxpagos
      ? <Loader scale={2} />
      : (
        <div className="datatable-container col-12">
          <table id={datatable_id} style={{width: "100%"}}></table>

          <RegularModalCentered
            _id={"pago-detalle"}
            _title={"Detalle de pago"}
            _body={
              <ModalPagoDetalle pago={selected_pago} />
            } />
          <ModalCancel
            _id={html_proc_annul}
            _title={"Eliminar Pago"}
            _action_text={"Eliminar"}
            _action_func={annulPayment}
            _body_text={"Esta seguro que quiere eliminar este Pago? En caso de haber emitido un comprobante de pago este se anulará"} />
        </div>
      )
    }
    </>
  )
}
const ModalPagoDetalle = ({pago}) => {
  return !pago
    ? 'loading'
    : pago.detalle
}


export default HistorialPagos
