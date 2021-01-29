import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import {
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom"
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
  simplePostData,
} from '../../functions';
import {
  Icon,
  PageTitle,
  SelectOptions_Procedimiento,
  RegularModalCentered,
} from '../bits';


// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const ProcedureModalContext = createContext(false)

const Admin = ({sucursal_pk, redirectTo}) => (
  <Switch>
    <Route exact path='/nav/admin/'>
      <AdminMenu redirectTo={redirectTo} />
    </Route>

    <Route exact path='/nav/admin/procedimiento/'>
      <AdminProcedimiento
        sucursal_pk={sucursal_pk}
        redirectTo={redirectTo} />
    </Route>
    <Route exact path='/nav/admin/usuario/'>
      <AdminUsuario
        sucursal_pk={sucursal_pk}
        redirectTo={redirectTo} />
    </Route>
  </Switch>
)

const AdminMenu = ({redirectTo}) => {
  let _style = {
    card: {
      display: "inline-flex",
      textAlign: "center",
      width: "200px",
      height: "120px",
      justifyContent: "center",
      margin: "0 20px",
      borderRadius: "10px",
      cursor: "pointer",
    }
  }

  return (
    <div>
      <PageTitle title={"Lista de deudas"} />
      <div className="row">
        {/* procedimiento */}
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/procedimiento/`)}>
          <Icon type="procedure" />
          <span style={{fontSize: "0.9rem"}}>Procedimiento</span>
        </div>
        {/* usuario */}
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/usuario/`)}>
          <Icon type="user" />
          <span style={{fontSize: "0.9rem"}}>Usuario</span>
        </div>
      </div>
    </div>
  )
}
// Procedimiento
const AdminProcedimiento = ({sucursal_pk, redirectTo}) => {
  let procedure_edit_modal_id = 'procedure_edit_modal_id'
  const [modal_data, setModalData] = useState(false)
  const updateProcedure = () => {}

  return (
    <ProcedureModalContext.Provider value={{modal_data, setModalData, updateProcedure}}>
      {/* ALERTS */}
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal</span>.
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div style={{marginBottom: "25px"}}>
            <ProcedimientoListTable
              procedure_edit_modal_id={procedure_edit_modal_id}
              sucursal_pk={sucursal_pk}
              redirectTo={redirectTo} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel">
            <ProcedimientoActions
              procedure_edit_modal_id={procedure_edit_modal_id}
              sucursal_pk={sucursal_pk}
              redirectTo={redirectTo} />
          </div>
        </div>
        <ProcedimientoEdit
          procedure_edit_modal_id={procedure_edit_modal_id}
          sucursal_pk={sucursal_pk}
          redirectTo={redirectTo} />
      </div>
    </ProcedureModalContext.Provider>
  )
}
const ProcedimientoListTable = ({sucursal_pk, procedure_edit_modal_id}) => {
  const [procedures, setProcedures] = useState(false);
  const [datatable, setDatatable] = useState(false);
  const ctx_md = useContext(ProcedureModalContext)

  const getSucursalProcedures = _sucursal_pk => simpleGet(`maestro/procedimiento/sucursal/${_sucursal_pk}/`).then(setProcedures)
  const changeProcedureActiveState = (_pk, state) => {
    simplePostData(`maestro/procedimiento/sucursal/detalle/${_pk}/`, {active: state}, "PATCH")
  }
  const updateProcedure = (_pk, _data) => {
    // Update procedure values locally only (avoid asking api again)
    let _p = procedures.find(p => p.pk == ctx_md.modal_data.data.pk)
    _p.alias = _data.alias
    _p.precio = _data.precio

    let _proc = procedures
    _proc.splice(procedures.indexOf(_p), 1)
    setProcedures([..._proc, _p])
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
        getSucursalProcedures(sucursal_pk)
      }
      document.body.appendChild(dt_script)
    }else{
      getSucursalProcedures(sucursal_pk)
    }
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link")
      dt_style.rel = "stylesheet"
      dt_style.id = "dt_style"
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css"
      document.head.appendChild(dt_style)
    }
  }, [])
  // Procedures
  useEffect(() => {
    if(!procedures) return;  // Abort if procedures aren't set

    // Destroy previous DT if exists
    if(datatable) window.$('#procedure-list').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#procedure-list').DataTable({
      data: procedures,
      columns: [
        {title: "Nombre", data: null},
        {title: "Precio", data: null},
        {title: "Habilitado", data: "active"},
        {title: "", data: null},
      ],
      columnDefs: [
        // Nombre
        {targets: 0, render: (_, __, row) => cFL(row.alias?row.alias:row.procedimiento_data.nombre)},
        // Price
        {targets: 1, render: (_, __, row) => row.precio || 0},
        // State
        {targets: 2, orderable: false,
          createdCell: (cell, data, row) => ReactDOM.render(
            <div className="custom-switch">
              <input type="checkbox" className="custom-control-input" id={"chxb_switch-"+row.pk}
              defaultChecked={data} onChange={e => changeProcedureActiveState(row.pk, e.target.checked)} />
              <label className="custom-control-label" htmlFor={"chxb_switch-"+row.pk}></label>
            </div>, cell
          )
        },
        // Edit
        {targets: 3, orderable: false,
          defaultContent: "<button class='btn btn-sm btn-light btn-pills waves-effect'>Editar</button>",
          createdCell: (cell, _, row) => cell.children[0].onclick = () => {
            ctx_md.setModalData({data: row, action: 'edit'})
            window.$(`#${procedure_edit_modal_id}`).modal('show')
          }
        },
      ],
      pageLength: 10,
      lengthMenu: [[8, 15, 25], [8, 15, 25]],
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay procedimientos registrados",
        sInfo:           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        sInfoEmpty:      "Mostrando registros del 0 al 0 de un total de 0 registros",
        sInfoFiltered:   "(filtrado de un total de _MAX_ registros)",
        sInfoPostFix:    "",
        // sSearch:         "Buscar:",
        searchPlaceholder: "Buscar",
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
  }, [procedures])
  // ctx_md
  useEffect(() => {
    ctx_md.updateProcedure = updateProcedure
  }, [ctx_md])

  return !procedures
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="procedure-list" style={{width: "100%"}}></table>
      </div>
    )
}
const ProcedimientoActions = ({procedure_edit_modal_id}) => {
  const modal_data = useContext(ProcedureModalContext)
  const openProcedureModal = () => {
    modal_data.setModalData({action: 'new'})
    window.$(`#${procedure_edit_modal_id}`).modal('show')
  }
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="add" onClick={openProcedureModal} />
          <span style={{fontSize: "0.9rem"}}>Nuevo</span>
        </div>
      </div>
    </div>
  )
}
const ProcedimientoEdit = ({sucursal_pk, procedure_edit_modal_id}) => {
  const [procedures, setProcedures] = useState(false);
  const ctx_md = useContext(ProcedureModalContext)

  const handleSubmit = () => {
    if(ctx_md.modal_data.action!="new" && ctx_md.modal_data.action!="edit") return

    let _alias = window.document.getElementById('alias').value
    let _data = {
      procedimiento: window.$('#select_procedure').val(),
      // Sucursal is added automatically in backend according user's current sucursal
      alias: _alias!=""?_alias:null,
      precio: window.document.getElementById('precio').value,
    }
    // Validate values
    if(!_data.procedimiento){
      alert("Seleccione un procedimiento")
      // return
    }

    if(ctx_md.modal_data.action=="new"){
      simplePostData(`maestro/procedimiento/sucursal/0/`, _data)
      .then(() => window.$(`#${procedure_edit_modal_id}`).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Procedimiento añadido exitosamente, actualice la pagina para ver los cambios", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }else{
      simplePostData(`maestro/procedimiento/sucursal/detalle/${ctx_md.modal_data.data.pk}/`, _data, "PATCH")
      .then(() => ctx_md.updateProcedure(ctx_md.modal_data.data.pk, _data))
      .then(() => window.$(`#${procedure_edit_modal_id}`).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Procedimiento editado exitosamente", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }
  }
  const getProcedures = _sucursal_pk => simpleGet(`maestro/procedimiento/`).then(setProcedures)

  // Select2 for procedimiento
  useEffect(() => {
    // CSS
    if(!document.getElementById('select2_link')){
      const select2_link = document.createElement("link");
      select2_link.rel = "stylesheet";
      select2_link.id = "select2_link";
      select2_link.media = "screen, print";
      select2_link.href = "/css/formplugins/select2/select2.bundle.css";
      document.head.appendChild(select2_link);
    }
    // JS
    if(!document.getElementById('select2_script')){
      const select2_script = document.createElement("script");
      select2_script.async = false;
      select2_script.id = "select2_script";
      select2_script.onload = () => {
        // Continue execution here to avoid file not load error
        getProcedures(sucursal_pk);
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }else{
      getProcedures(sucursal_pk);
    }
  }, [])
  // Set procedure input as select2
  useEffect(() => {
    if(!procedures) return

    window.$("#select_procedure").select2({
      dropdownParent: window.$("#select_procedure").parent()
    })
    // Set select2 onchange
    // .on('select2:select', ev => procedureChangePrice(ev.params.data))
  }, [procedures])
  // Assure modals will be closed before leaving current page
  useEffect(() => () => window.$(`#${procedure_edit_modal_id}`).modal("hide"), [])
  /* Why to use React.Context explanation
  * By using context we can easily share values between children compontents
  * as well as value changing functions
  * we then apply the state paradigm by passing from the Context.Provider {value, setValue}
  * That way we only need to setValue from the action firing functions in other components
  * and use the expected values right away in the dependant component (this won't allow value changes from user)
  * this way we avoid the repetitive and sometimes confusing use of setState and useEffect in multiple component states
  * we can also use useEffect as a helper function to set the values received in context
  * only when it comes to a change
  */
  useEffect(() => {
    if(!ctx_md.modal_data) return

    if(ctx_md.modal_data.action=="edit"){
      // Set values in input
      window.$('#select_procedure').val(ctx_md.modal_data.data.procedimiento).change()
      window.document.getElementById('select_procedure').disabled = true
      window.document.getElementById('alias').value = ctx_md.modal_data.data.alias || ""
      window.document.getElementById('precio').value = ctx_md.modal_data.data.precio
    }else if(ctx_md.modal_data.action=="new"){
      // Reset values
      window.document.getElementById('select_procedure').disabled = false
      window.$('#select_procedure').val(null).change()
      window.document.getElementById('alias').value = ""
      window.document.getElementById('precio').value = 0
    }
  }, [ctx_md.modal_data])

  return (
    <RegularModalCentered
      _id={procedure_edit_modal_id}
      _title={"Enviar mensaje al paciente"}
      _body={
        <div className="form-group col-md-12">
          {/* nombre */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="select_procedure">Procedimiento: </label>
            {!procedures
              ? "loading"
              : (
                <select id="select_procedure">
                  <SelectOptions_Procedimiento procedimientos={procedures} />
                </select>
              )}
          </div>
          {/* alias */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="alias">Alias: </label>
            <input type="text" className="form-control" id="alias" />
          </div>
          {/* precio */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="precio">Coste</label>
            <input type="number" className="form-control" id="precio" min="0" />
          </div>

          <br/>
          {/* Agregar button */}
          <div className="col-sm d-flex">
            <button className="btn btn-dark" onClick={() => handleSubmit()}>
              Guardar
            </button>
          </div>
        </div>
      } />
  )
}
// Usuario
const AdminUsuario = ({sucursal_pk, redirectTo}) => {
  return "AdminUsuario"
}

export default Admin