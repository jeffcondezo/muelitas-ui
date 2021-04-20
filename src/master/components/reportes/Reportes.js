import React, { useState, useEffect, useContext } from 'react'
import {
  simplePostData,
} from '../../functions'
import {
  PageTitle,
} from '../bits'
import { NavigationContext } from '../Navigation'
import Loader from '../loader/Loader'
import c3 from 'c3'
import 'c3/c3.css'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Reportes = () => {
  const {current_sucursal} = useContext(NavigationContext)

  const [script_dt, setScriptDT] = useState(false)
  const [reportes_general, setReportesGeneral] = useState(false)
  const [reportes_bi, setReportesBi] = useState(false)
  const report_month_range = 12  // {6, 12, 18}

  const getReportes = () => {
    let dt_from = window.document.getElementById("dt-from").value
    let dt_to = window.document.getElementById("dt-to").value

    let req_body = reportes_general ? {dt_from: dt_from, dt_to: dt_to} : {}
    let req_url = reportes_general ? 0 : report_month_range/6
    // Set loader when range-date changes
    if(req_url == 0) setReportesBi(false)
    // Make request
    simplePostData(`maestro/sucursal/${current_sucursal}/reporte/${req_url}/`, req_body)
    .then(data => {
      if(data.general) setReportesGeneral(data.general)
      setReportesBi(data.bi)
    })
  }
  const dateRangeChange = ev => {
    // Validate date
    if( ev.target.valueAsDate > new Date() ){
      ev.target.value = new Date().toDateInputValue()
    }
    // Prevent dt-from to be newer than dt-to
    if( window.document.getElementById('dt-from').valueAsDate > window.document.getElementById('dt-to').valueAsDate ){
      window.document.getElementById('dt-from').value = window.document.getElementById('dt-to').valueAsDate
    }

    getReportes()
  }
  const getPastMonthDate = months => {
    if(months < 0) return false

    let _month = months%12
    let _year = Math.floor(months/12)
    let _date = new Date()

    // Set month
    // Date.Month starts from 0
    if(_month > _date.getMonth()+1){
      _year += 1
      _month = 12 - (_month - (_date.getMonth()+1))
      _date.setMonth(_month)
    }else _date.setMonth(_date.getMonth() - _month)

    _date.setFullYear(_date.getFullYear() - _year)
    return _date
  }

  useEffect(() => {
    getReportes()
    /* DataTable */
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script")
      dt_script.async = false
      dt_script.id = "dt_script"
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js"
      dt_script.onload = () => setScriptDT(true)
      document.body.appendChild(dt_script)
    }else setScriptDT(true)
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link")
      dt_style.rel = "stylesheet"
      dt_style.id = "dt_style"
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css"
      document.head.appendChild(dt_style)
    }
  }, [])

  return (
    <div>
      <PageTitle title={"Reportes"} />

      {/* General reports */}
      <div className="row">
        <div className="col-12 col-md-8">
          <div className="row">
            <Report1 data={reportes_general.at_dt} />
            <Report4 data={reportes_general.inc_dt} />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="row" style={{height: "100%"}}>
            {script_dt && <Report7 data={reportes_general.debt_pac} />}
          </div>
        </div>
      </div>

      <hr style={{borderBottom: "1px solid darkgray"}}/>
      {/* Specific reports */}
      <div className="row">
        <div className="col-12 form-group">
          <label className="form-label" htmlFor="dt-from" style={{marginRight: "20px"}}>Rango de fechas: </label>
          <input type="date" id="dt-from" className="form-control col-2"
          style={{display: "inline"}} onChange={dateRangeChange}
          defaultValue={getPastMonthDate(6).toDateInputValue()} />
          <input type="date" id="dt-to" className="form-control col-2"
          style={{display: "inline"}} onChange={dateRangeChange}
          defaultValue={getPastMonthDate(0).toDateInputValue()} />
        </div>

        <div className="col-12 col-md-6">
          <div className="row">
            <Report2 data={reportes_bi.at_pxs} />
            <Report3 data={reportes_bi.at_per} />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <Report5 data={reportes_bi.inc_pxs} />
            <Report6 data={reportes_bi.inc_per} />
          </div>
        </div>
      </div>

    </div>
  )
}

const Report1 = ({data}) => {
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report1',
      data: {
        x: 'x',
        columns: [
          ['x', ...data.map(i => String(i.year)+"-"+String(i.month).padStart(2, "0")+'-01')],
          ['Atenciones', ...data.map(i => i.count)],
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%m/%Y'
          }
        }
      },
      tooltip: {
        format: {
          title: () => "",
        }
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Atenciones realizadas por mes
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report1">
          </div>
        </div>
      </div>
    </div>
  )
}
const Report2 = ({data}) => {
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report2',
      data: {
        type : 'bar',
        columns: data.map(i => [i.name, i.count])
      },
      bar: {
        width: {
          ratio: 1
        }
      },
      tooltip: {
        format: {
          title: () => "",
        }
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Atenciones realizadas por procedimiento (15 principales)
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report2"></div>
        </div>
      </div>
    </div>
  )
}
const Report3 = ({data}) => {
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report3',
      data: {
        type : 'pie',
        columns: data.map(i => [i.fullname+": "+i.count, i.count])
      },
      legend: {
        position: 'right'
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Atenciones realizadas por odontologo
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report3"></div>
        </div>
      </div>
    </div>
  )
}
const Report4 = ({data}) => {
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report4',
      data: {
        x: 'x',
        columns: [
          ['x', ...data.map(i => String(i.year)+"-"+String(i.month).padStart(2, "0")+'-01')],
          ['Ingresos', ...data.map(i => i.total)],
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%m/%Y'
          }
        }
      },
      tooltip: {
        format: {
          title: () => "",
          value: parseToSoles
        }
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Ingresos generados por mes
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report4"></div>
        </div>
      </div>
    </div>
  )
}
const Report5 = ({data}) => {
  // Execute after Component's DOM is rendered
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report5',
      data: {
        type : 'bar',
        columns: data.map(i => [i.name, i.total])
      },
      bar: {
        width: {
          ratio: 1
        }
      },
      tooltip: {
        format: {
          title: () => "",
          value: parseToSoles
        }
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Mayores ingresos generados por procedimiento (15 más altos)
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report5"></div>
        </div>
      </div>
    </div>
  )
}
const Report6 = ({data}) => {
  // Execute after Component's DOM is rendered
  useEffect(() => {
    if(!data) return

    c3.generate({
      bindto: '#report6',
      data: {
        type : 'pie',
        columns: data.map(i => [i.fullname+": "+parseToSoles(i.total), i.total])
      },
      legend: {
        position: 'right'
      }
    })
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Ingresos generados por odontologo
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          <div id="report6"></div>
        </div>
      </div>
    </div>
  )
}
const Report7 = ({data}) => {
  const [datatable, setDataTable] = useState(false)

  useEffect(() => {
    if(!data) return

    if(datatable) window.$('#report7').DataTable().clear().destroy()
    let tmp = window.$('#report7').DataTable({
      data: data.pacientes,
      columns: [
        {title: "Paciente", data: 'fullname'},
        {title: "Deuda", data: 'deuda'},
      ],
      pageLength: 26,
      order: [[1, 'desc']],
      searching: false,
      bLengthChange: false,
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay pacientes registrados",
        sInfo:           "",
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

    setDataTable(tmp)
  }, [data])

  return (
    <div className="col-12" style={{display: "flex", alignItems: "stretch"}}>
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Tabular de cuentas por cobrar
          </div>
        </div>
        <div className="card-body" style={{minHeight: "100px", position: "relative"}}>
          {!data && <Loader scale={2} />}
          {data && <h4>Deuda total: {parseToSoles(data.total)}</h4>}
          <table id="report7"></table>
          {data && (
            <div>
              <hr style={{borderBottom: "1px solid #BBB"}}/>
              <p>La deuda se calcula a partir de los procedimientos que se realizaron en una atención o los programados en una plan de trabajo que está parcialmente pagado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const parseToSoles = value => {
  let v = String(value)
  let l = v.length/3
  v = v.split("").reverse()
  for(let i=1; i<l; i++) v.splice(i*3, 0, ' ')
  v = v.reverse().join('')
  v = "S/."+v
  return v
}

export default Reportes


/* Charts
1. Atenciones realizadas por mes (C3 - line)
2. Atenciones realizadas por procedimiento (C3 - bar)
3. Atenciones realizadas por odontologo (C3 - pie)
4. Ingresos generados por mes (C3 - line)
5. Ingresos generados por procedimiento (C3 - bar)
6. Ingresos generados por odontologo (C3 - pie)
7. Tabular de cuentas por cobrar (DataTable)

* Distribution
1 4
2 5
3 6
 7
*/
