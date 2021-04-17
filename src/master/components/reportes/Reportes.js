import React, { useState, useEffect, useContext } from 'react'
import {
  simpleGet,
} from '../../functions'
import {
  PageTitle,
} from '../bits'
import { NavigationContext } from '../Navigation'
import c3 from 'c3'
import 'c3/c3.css'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Reportes = () => {
  const {current_sucursal} = useContext(NavigationContext)

  const [script_dt, setScriptDT] = useState(false)
  const [reportes, setReportes] = useState(false)

  const getReportes = () => {
    simpleGet(`maestro/sucursal/${current_sucursal}/reporte/1/`)
    .then(setReportes)
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
      <div className="row">
        <div className="col-6">
          <div className="row">
            <Report1 data={reportes[1]} />
            <Report2 data={reportes[2]} />
            <Report3 data={reportes[3]} />
          </div>
        </div>
        <div className="col-6">
          <div className="row">
            <Report4 data={reportes[4]} />
            <Report5 data={reportes[5]} />
            <Report6 data={reportes[6]} />
          </div>
        </div>
        {script_dt && <Report7 data={reportes[7]} />}
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
        <div className="card-body">
          <div id="report1"></div>
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
          ratio: .8
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
            Atenciones realizadas por procedimiento
          </div>
        </div>
        <div className="card-body">
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
        <div className="card-body">
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
        <div className="card-body">
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
          ratio: .8
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
            Top 20 mayores ingresos generados por procedimiento
          </div>
        </div>
        <div className="card-body">
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
        <div className="card-body">
          <div id="report6"></div>
        </div>
      </div>
    </div>
  )
}
const Report7 = ({data}) => {
  useEffect(() => {
    if(!data) return

    console.log("data", data)
    window.$('#report7').DataTable({
      data: data.pacientes,
      columns: [
        {title: "Paciente", data: 'fullname'},
        {title: "Deuda", data: 'deuda'},
      ],
      searching: false,
      bLengthChange: false,
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay pacientes registrados",
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
  }, [data])

  return (
    <div className="col-12">
      <div className="panel">
        <div className="card-header">
          <div className="card-title">
            Tabular de cuentas por cobrar
          </div>
        </div>
        <div className="card-body">
          <table id="report7"></table>
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
