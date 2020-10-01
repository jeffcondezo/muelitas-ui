import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import {
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import {
  handleErrorResponse,
  getDataByPK,
  simplePostData,
  simpleGet,
  simpleDelete,
  getPatientFullName,
  capitalizeFirstLetter as cFL,
  isArray,
} from '../../functions'
import {
  PageTitle,
  SelectOptions_Procedimiento,
  ModalCancel,
  Icon
} from '../bits';

const PDTContext = createContext({
  current_pdt_pk: null,
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
  const pdt_context = useContext(PDTContext)
  let {patient_pk} = useParams()
  // PDT List info
  const [patient, setPatient] = useState(false)
  const [ar_proc_selected, setSelectPDT] = useState([])
  // Multi component state handling
  const [pdtDeleted, setPDTDeleted] = useState(false)
  const [thereIsPDT, setThereIsPDT] = useState(false)
  /* 'selected_list' is used as a reference variable
  * it keeps the previous value of 'ar_proc_selected'
  * ar_proc_selected's update is not tracked by addOrRemoveFromList function (even with useCallback)
  * this value is only a reference, the actual value is ar_proc_selected
  */
  const selected_list = useRef([])

  const addOrRemoveFromList = _obj => {
    // BUG: ar_proc_selected's value is not tracking the value update from using setSelectPDT
    // FIX: use a useRef to update the value
    let ar_copy = selected_list.current.map(i => i)  // Copy array with no memory reference
    // Search if _obj is already in the array if so find its index
    let _inx = ar_copy.findIndex(i => i.dpdt == _obj.dpdt)
    if(_inx == -1) ar_copy.push(_obj)
    else ar_copy.splice(_inx, 1)
    // Set new array
    setSelectPDT(ar_copy)
  }
  const deletePDT = () => {
    if(pdt_context.current_pdt_pk == null){
      console.error("current_pdt_pk from PDTContext is null");
      return;
    }
    // Delete
    simpleDelete(`atencion/plantrabajo/${Number(pdt_context.current_pdt_pk)}/`)
    .then(() => setPDTDeleted(true))
  }

  useEffect(() => {
    getDataByPK('atencion/paciente', patient_pk)
    .then(setPatient)
  }, [])
  useEffect(() => {
    selected_list.current = ar_proc_selected
  }, [ar_proc_selected])

  return (
    <div>
      <h2>Paciente: {patient ? getPatientFullName(patient) : "loading.."}</h2>

      <div className="row">
        <div className="col-lg-8">
          <div style={{
            marginTop: "25px",
            marginBottom: "25px"
          }}>
            <PlanDeTrabajoList
              sucursal_pk={sucursal_pk}
              redirectTo={redirectTo}
              patient_pk={patient_pk}
              pdtDeleted={pdtDeleted}
              setPDTDeleted={setPDTDeleted}
              thereIsPDT={thereIsPDT}
              setThereIsPDT={setThereIsPDT}
              selectProc={addOrRemoveFromList} />
          </div>
          <div className="row">
            <div className="col-2">
              <button className="btn btn-primary" style={{fontSize: "0.9rem"}} onClick={() => redirectTo(`/nav/plandetrabajo/${patient_pk}/crear`)}>Nuevo</button>
            </div>
            {thereIsPDT
              ? (
                <div className="col-2">
                  <button className="btn btn-danger" style={{fontSize: "0.9rem"}} data-toggle="modal" data-target="#modal_eliminar_pdt">Eliminar</button>
                </div>
              ) : ""
            }
          </div>
        </div>
        {thereIsPDT
          ? (
            <div className="col-lg-4">
              <div className="panel">
                <PDTActions
                  redirectTo={redirectTo}
                  selected={ar_proc_selected}
                  patient_pk={patient_pk} />
              </div>
              <div className="panel">
                <DPDTActions
                  patient_dni={patient.dni}
                  selected={ar_proc_selected}
                  redirectTo={redirectTo} />
              </div>
            </div>
          ) : ""
        }
      </div>
      <ModalCancel
        _id={"modal_eliminar_pdt"}
        _title={"Eliminar Plan de trabajo"}
        _action_text={"Eliminar"}
        _action_func={deletePDT}
        _body_text={"Esta seguro que quiere eliminar este Plan de trabajo"} />
    </div>
  )
}
const PlanDeTrabajoList = ({sucursal_pk, redirectTo, patient_pk, pdtDeleted, setPDTDeleted, selectProc, thereIsPDT, setThereIsPDT}) => {
  const pdt_context = useContext(PDTContext)
  const [pdts, setPdts] = useState(false)  // Planes de trabajo
  const [dpdts, setDpdts] = useState(false)  // Detalles de Plan de trabajo
  const [datatable, setDatatable] = useState(false)

  const getPdts = () => {
    simpleGet(`atencion/plantrabajo/?filtro={"paciente":"${patient_pk}"}`)
    .then(setPdts)
  }
  const getDptByPdt = (pdt_pk) => {
    simpleGet(`atencion/plantrabajo/detalle/?pt=${pdt_pk}`)
    .then(setDpdts)
    .then(() => pdt_context.current_pdt_pk = Number(pdt_pk))
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
    if(!pdts) return;
    if(isArray(pdts) && pdts.length == 0){
      // There is no pdt
      setThereIsPDT(false)
      return;
    }

    if(!thereIsPDT) setThereIsPDT(true)  // Fix state
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
        {title: "", data: 'cita_relacionada'},
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
        render: data => data==null?"<input type='checkbox' />":"",
        createdCell: (cell, data, rowData) => {
          // Add click listener to button (children[0])
          var tmp = cell.children[0]
          if(tmp){
            tmp.onchange = () => {
              selectProc({dpdt: rowData.pk, proc_pk: rowData.procedimiento})
            }
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
    _select.value = pdt_context.current_pdt_pk
    _input.replaceWith(_select);  // Replace previous input.text with new select element
  }, [datatable])
  useEffect(() => {
    if(pdtDeleted){
      getPdts()
      setPDTDeleted(false)
    }
  }, [pdtDeleted])

  return !pdts
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <h3>
          {thereIsPDT
            ? "Seleccione un plan de trabajo"
            : "El paciente no tiene ningún plan de trabajo programado"
          }
        </h3>
        {thereIsPDT
          ? (
            <table id="show-dpdt" style={{width: "100%"}}></table>
          ) : ""
        }
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
          Acciones del Plan de Trabajo
        </div>
      </div>
      <div className="card-body" style={{
        display: "flex",
        alignItems: "center",
      }}>
        <div className="col-4" style={{
          display: "inline-block",
          textAlign: "center"
        }}>
          <Icon type="edit" onClick={() => redirectTo(`/nav/plandetrabajo/${patient_pk}/editar/${pdt_context.current_pdt_pk}/`)} />
          <span style={{fontSize: "0.9rem"}}>Editar</span>
        </div>
      </div>
    </div>
  )
}
const DPDTActions = ({redirectTo, selected, patient_dni}) => {
  const redirectToCita = () => {
    if(selected.length == 0){
      handleErrorResponse('custom', "", "Debe seleccionar al menos un procedimiento")
      return
    }

    redirectTo('/nav/cita/', {
      patient_dni: patient_dni,
      selected: selected
    })
  }

  return (
    <div className="card col-12" style={{
      padding: "0px"
    }}>
      <div className="card-header">
        <div className="card-title">
          Acciones de los seleccionados
        </div>
      </div>
      <div className="card-body" style={{
        display: "flex",
        alignItems: "center",
      }}>
        <div className="col-4" style={{
          display: "inline-block",
          textAlign: "center"
        }}>
          <Icon type="add" onClick={redirectToCita} />
          <span style={{fontSize: "0.9rem"}}>Crear Cita</span>
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
    simpleGet(`atencion/plantrabajo/detalle/?pt=${pdt_pk}`)
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
          <button className="btn btn-primary" onClick={() => handleSubmitPDT()}>
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
            <ListSavedProc proc_list={proc_list} refreshProcList={refreshProcList} />
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
    simpleGet(`maestro/procedimiento/precio/?filtro={"sucursal":"${_sucursal_pk}"}`)
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
          <button className="btn btn-primary" onClick={() => handleSubmitProc()}>
            Agregar
          </button>
          <button className="btn btn-light ml-auto" onClick={() => getBack()}>
            Regresar
          </button>
        </div>
      </div>
    )
}
const ListSavedProc = ({proc_list, refreshProcList}) => {
  const ctx_pdt = useContext(PDTCreateCxt)

  const removeProcFromList = proc_pk => {
    simpleDelete(`atencion/plantrabajo/detalle/${proc_pk}/`)
    .then(() => refreshProcList())
  }
  const onDragDrop = (ev, orden_f) => {
    ev.preventDefault()
    let orden_o = ev.dataTransfer.getData('proc_orden')
    // If both indexes are the same skip
    if(orden_o == orden_f) return
    // Send both indexes to swap
    changePositionProc(orden_o, orden_f)
  }
  const onDragStart = (ev, proc_orden) => {
    ev.dataTransfer.setData('proc_orden', proc_orden)
  }
  const changePositionProc = (inx_o, inx_f) => {
    simplePostData(`atencion/plantrabajo/detalle/${ctx_pdt.pdt}/swap/${inx_o}/${inx_f}/`, {})
    .then(() => refreshProcList())
  }

  // Generate elements from medicine_list
  if(!proc_list || !proc_list.length || proc_list.length==0){
    return (<div className="card-body"><span style={{fontSize: ".9rem"}}>No se han agregado procedimientos</span></div>);
  }
  const el = [];
  proc_list.map((proc, inx) => {el.push(
    <div key={"proc-"+inx} onDragOver={e => e.preventDefault()} onDrop={ev => onDragDrop(ev, proc.orden)}>
      <li className="list-group-item d-flex" id={inx} style={{borderBottom: "0"}} draggable="true" onDragStart={ev => onDragStart(ev, proc.orden)}>
        <span style={{fontSize: "1.2em", width: "100%"}}>
          {proc.orden} - {cFL(proc.procedimiento_nombre)}
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
