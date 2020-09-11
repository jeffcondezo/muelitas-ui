import React, { useState, useEffect, createContext, useContext } from 'react'
import {
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import {
  handleErrorResponse,
  getDataByPK,
  simplePostData,
  getPatientFullName,
  capitalizeFirstLetter as cFL
} from '../../functions'
import { PageTitle, SelectOptions_Procedimiento, Icon } from '../bits';

const PDTContext = createContext({
  current_pdt_pk: null
})
const PDTCreateCxt = createContext({
  pdt: false,
})


const PlanDeTrabajo = ({sucursal_pk, redirectTo}) => {

  return (
    <>
    <PageTitle title="Plan de Trabajo" />

    <Switch>
      <Route exact path="/nav/plandetrabajo/:patient_pk/">
        <PlanDeTrabajoHome sucursal_pk={sucursal_pk} redirectTo={redirectTo} />
      </Route>
      <Route exact path="/nav/plandetrabajo/:patient_pk/crear">
        <CreatePDT sucursal_pk={sucursal_pk} />
      </Route>
      <Route exact path="/nav/plandetrabajo/:patient_pk/editar/:pdt_pk/">
        <CreatePDT sucursal_pk={sucursal_pk} />
      </Route>
    </Switch>
    </>
  )
}

const PlanDeTrabajoHome = ({sucursal_pk, redirectTo}) => {
  let {patient_pk} = useParams()
  const [patient, setPatient] = useState(false)
  const [ar_proc_selected, setSelectPDT] = useState([])

  useEffect(() => {
    getDataByPK('atencion/paciente', patient_pk)
    .then(setPatient)
  }, [])

  return (
    <div>
      <h2>Paciente: {patient ? getPatientFullName(patient) : "loading.."}</h2>

      <div className="row">
        <div className="col-lg-8">
          <div style={{
            marginBottom: "25px"
          }}>
            <PlanDeTrabajoList
              sucursal_pk={sucursal_pk}
              redirectTo={redirectTo}
              patient_pk={patient_pk}
              selectProc={setSelectPDT} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel">
            <PDTActions
              redirectTo={redirectTo}
              selected={ar_proc_selected}
              patient_pk={patient_pk} />
          </div>
          <div className="panel">
            <div className="card"><div className="card-body">Información Extra</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
const PlanDeTrabajoList = ({sucursal_pk, redirectTo, patient_pk, selectProc}) => {
  const pdt_context = useContext(PDTContext)
  const [pdts, setPdts] = useState(false)  // Planes de trabajo
  const [dpdts, setDpdts] = useState(false)  // Detalles de Plan de trabajo
  const [datatable, setDatatable] = useState(false)

  const getPdts = () => {
    simplePostData(`atencion/plantrabajo/?filtro={"paciente":"${patient_pk}"}`, {}, "GET")
    .then(setPdts)
  }
  const getDptByPdt = (pdt_pk) => {
    simplePostData(`atencion/plantrabajo/detalle/?pt=${pdt_pk}`, {}, "GET")
    .then(setDpdts)
    .then(() => pdt_context.current_pdt_pk = pdt_pk)
  }

  // Add DataTable rel docs
  useEffect(() => {
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script");
      dt_script.async = false;
      dt_script.id = "dt_script";
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
      dt_script.onload = () => {
        // Run at first execution
        getPdts();
      };
      document.body.appendChild(dt_script);
    }else{
      getPdts();
    }
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link");
      dt_style.rel = "stylesheet";
      dt_style.id = "dt_style";
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
      document.head.appendChild(dt_style);
    }
  }, []);
  // When pdts are setted
  useEffect(() => {
    if(!pdts || String(pdts)=="") return;

    getDptByPdt(pdts[0].pk)
  }, [pdts]);
  // When dpdts are setted
  useEffect(() => {
    if(!dpdts) return;  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#show-dpdt').DataTable().clear().destroy();
    // Generate Datatable
    let _tmp = window.$('#show-dpdt').DataTable({
      data: dpdts,
      columns: [
        {title: "Procedimiento", data: "procedimiento_nombre"},
        {title: "Estado", data: 'estado'},
        {title: "Orden", data: 'orden'},
        {title: "", data: null},
      ],
      columnDefs: [
        {
        targets: 0,
        render: data => cFL(data),
        }, {
          // Estado
          targets: 1,
          render: data => data=='1'?'Planificado':'Concluido',
        }, {
        // Checkbox
        targets: -1,
        orderable: false,
        // width: "1px",
        defaultContent: "<input type='checkbox' />",
        createdCell: (cell, data, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            console.log(this);
            // selectProc(rowData.id)
          }
        }
      }],
      order: [[2, 'asc']],  // Default sort by 'orden' field
      pageLength: 8,
      lengthMenu: [[8, 15, 25], [8, 15, 25]],
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay procedimientos programados como plan de trabajo",
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
  }, [dpdts]);
  // When datatable is setted
  useEffect(() => {
    if(!datatable) return;

    // Change search type && set default value today
    let _input = document.querySelector('#show-dpdt_filter');
    let _select = document.createElement("select");
    _select.classList.add("form-control");
    pdts.map(v => {
      let opt = document.createElement("option");
      opt.value = v.pk;
      opt.label = v.nombre;
      _select.options.add(opt);
    })
    _select.onchange = (e) => getDptByPdt(e.target.value);  // Add change listener
    _input.replaceWith(_select);  // Replace previous input.text with new select element
  }, [datatable])

  return !pdts
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="show-dpdt" style={{width: "100%"}}></table>
      </div>
    );
}
const PDTActions = ({redirectTo, selected, patient_pk}) => {
  const pdt_context = useContext(PDTContext);

  return (
    <div className="card col-12" style={{
      padding: "0px"
    }}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="col-3" style={{
          display: "inline-block",
          textAlign: "center"
        }}>
          <Icon type="new-patient" onClick={() => redirectTo(`/nav/plandetrabajo/${patient_pk}/crear`)} />
          <span style={{fontSize: "0.9rem"}}>Nuevo Plan de trabajo</span>
        </div>
        <div className="col-3" style={{
          display: "inline-block",
          textAlign: "center"
        }}>
          <Icon type="new-patient" onClick={() => redirectTo(`/nav/plandetrabajo/${patient_pk}/editar/${pdt_context.current_pdt_pk}/`)} />
          <span style={{fontSize: "0.9rem"}}>Editar Plan de trabajo</span>
        </div>
      </div>
    </div>
  )
}

const CreatePDT = ({sucursal_pk}) => {
  let {patient_pk, pdt_pk} = useParams()
  const ctx_pdt = useContext(PDTCreateCxt)

  const [pdt, setPdt] = useState(false);
  const [proc_list, setProcList] = useState(false)  // Detalles de Plan de trabajo

  const handleSubmitPDT = () => {
    let data = {}
    data.paciente = patient_pk;
    data.nombre = document.getElementById('proc-name').value;

    // Dinamically change when pdt is already created update instead of create a new one
    simplePostData(`atencion/plantrabajo/${pdt?pdt.pk+'/':''}`, data, pdt?"PUT":"POST")
    .then(setPdt)
    .then(() => handleErrorResponse('custom', "Exito", "Guardado correctamente", 'info'))
  }
  const getDptByPdt = (pdt_pk) => {
    simplePostData(`atencion/plantrabajo/detalle/?pt=${pdt_pk}`, {}, "GET")
    .then(setProcList)
  }
  const refreshProcList = () => {
    // Get procs
    getDptByPdt(pdt.pk)
  }

  useEffect(() => {
    if(pdt_pk) getDataByPK('atencion/plantrabajo', pdt_pk).then(setPdt)
  }, [])
  useEffect(() => {
    if(!pdt) return

    document.getElementById('proc-name').value = pdt.nombre
    // Add to context
    ctx_pdt.pdt = pdt.pk
    refreshProcList()
  }, [pdt])


  return (
    <div>
      <div className="row">
        <div className="col-8">
          <label className="form-label" htmlFor="proc-name">Nombre</label>
          <input type="text" className="form-control form-control-lg" id="proc-name" />
        </div>
        <div className="col-4" style={{
          display: "inline-flex",
          alignItems: "flex-end"
        }}>
          <button className="btn btn-light" onClick={() => handleSubmitPDT()}>
            Guardar
          </button>
        </div>
      </div>
      <br/>
      <div className="row">
        <div className="col-lg-8">
          <CreatePDTForm sucursal_pk={sucursal_pk} refreshProcList={refreshProcList} />
        </div>
        <div className="col-lg-4 position-relative">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                Procedimientos agregados
              </div>
            </div>
            <ListSavedProc proc_list={proc_list} />
          </div>
        </div>
      </div>
    </div>
  )
}
const CreatePDTForm = ({sucursal_pk, refreshProcList}) => {
  const ctx_pdt = useContext(PDTCreateCxt)
  const [procedures, setProcedures] = useState(false)

  const getProcedures = _sucursal_pk => {
    simplePostData(`maestro/procedimiento/precio/?filtro={"sucursal":"${_sucursal_pk}"}`, {}, "GET")
    .then(setProcedures)
  }
  const handleSubmitProc = () => {
    if(!ctx_pdt.pdt){
      handleErrorResponse('custom', "Error", "Primero debe establecer un nombre para el plan de trabajo y guardarlo")
      return
    }
    let data = {}
    data.plantrabajo = ctx_pdt.pdt;
    data.procedimiento = document.getElementById('procedimiento').value

    simplePostData(`atencion/plantrabajo/detalle/`, data)
    .then(() => refreshProcList())
  }
  const getBack = () => {
    window.history.back()
  }

  useEffect(() => {
    getProcedures(sucursal_pk);
  }, []);

  return !procedures
    ? "loading"
    : (
      <div>
        <label className="form-label" htmlFor="procedimiento">Procedimiento: </label>
        <select className="custom-select form-control custom-select-lg" id="procedimiento" >
          <SelectOptions_Procedimiento procedimientos={procedures} />
        </select>

        <br/><br/>
        <div className="d-flex">
          <button className="btn btn-light" onClick={() => handleSubmitProc()}>
            Agregar
          </button>
          <button className="btn btn-primary ml-auto" onClick={() => getBack()}>
            Regresar
          </button>
        </div>
      </div>
    )
}
const ListSavedProc = ({proc_list}) => {
  const removeProcFromList = proc_pk => {
  }

  // Generate elements from medicine_list
  if(!proc_list || !proc_list.length || proc_list.length==0){
    return (<div className="card-body"><span style={{fontSize: ".9rem"}}>No se han agregado procedimientos</span></div>);
  }
  const el = [];
  proc_list.map((proc, inx) => {el.push(
    <div key={"proc-"+inx}>
      <li className="list-group-item d-flex" id={inx} style={{borderBottom: "0"}}>
        <span style={{fontSize: "1.2em", width: "100%"}}>
          {cFL(proc.procedimiento_nombre)}
        </span>
        <button className="btn ml-auto" onClick={() => removeProcFromList(proc.pk)} style={{
          paddingTop: "0",
          paddingBottom: "0"
        }} >
          <i className="fal fa-trash-alt"></i>
        </button>
      </li>
    </div>
  )});

  return (
    <div id="slimscroll">
      {el}
    </div>
  )
}


export default PlanDeTrabajo
