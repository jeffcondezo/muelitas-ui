import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import {
  Switch,
  Route,
  useParams,
} from "react-router-dom"
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
  simplePostData,
  simpleDelete,
  getDataByPK,
} from '../../functions';
import {
  Icon,
  PageTitle,
  SelectOptions_Procedimiento,
  RegularModalCentered,
} from '../bits';
import { NavigationContext } from '../Navigation';


// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"
const ProcedureModalContext = createContext(false)
const AEFModalContext = createContext(false)
const APModalContext = createContext(false)

const Admin = () => (
  <Switch>
    <Route exact path='/nav/admin/'>
      <AdminMenu />
    </Route>

    <Route exact path='/nav/admin/procedimiento/'>
      <AdminProcedimiento />
    </Route>
    <Route exact path='/nav/admin/usuario/'>
      <AdminUsuario />
    </Route>
    <Route exact path='/nav/admin/admision/campos/'>
      <AdminAdmisionCampos />
    </Route>
    <Route exact path='/nav/admin/cuestionario/'>
      <AdminCuestionario />
    </Route>
    <Route exact path='/nav/admin/cuestionario/:pk/'>
      <AdminCuestionarioPreguntas />
    </Route>
  </Switch>
)

const AdminMenu = () => {
  const {redirectTo} = useContext(NavigationContext)
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
      <PageTitle title={"Administrador"} />
      <div className="row">
        {/* procedimiento */}
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/procedimiento/`)}>
          <Icon type="procedure" />
          <span style={{fontSize: "0.9rem"}}>Procedimiento</span>
        </div>
        {/* campos admision */}
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/admision/campos/`)}>
          <Icon type="edit" />
          <span style={{fontSize: "0.9rem"}}>Campos Admision</span>
        </div>
        {/* cuestionario */}
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/cuestionario/`)}>
          <Icon type="list" />
          <span style={{fontSize: "0.9rem"}}>Cuestionarios</span>
        </div>
        {/* usuario
        <div className="card" style={_style.card} onClick={() => redirectTo(`/nav/admin/usuario/`)}>
          <Icon type="user" />
          <span style={{fontSize: "0.9rem"}}>Usuario</span>
        </div>
        */}
      </div>
    </div>
  )
}
// Procedimiento
const AdminProcedimiento = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  let procedure_edit_modal_id = 'procedure_edit_modal_id'
  const [modal_data, setModalData] = useState(false)
  const updateProcedure = () => {}

  return (
    <ProcedureModalContext.Provider value={{modal_data, setModalData, updateProcedure}}>
      <PageTitle title={"Procedimientos Admin"} />

      <div className="row">
        <div className="col-lg-9">
          <div style={{marginBottom: "25px"}}>
            <ProcedimientoListTable
              procedure_edit_modal_id={procedure_edit_modal_id}
              current_sucursal={current_sucursal}
              redirectTo={redirectTo} />
          </div>
        </div>
        <div className="col-lg-3">
          <div className="panel">
            <ProcedimientoActions
              procedure_edit_modal_id={procedure_edit_modal_id}
              current_sucursal={current_sucursal}
              redirectTo={redirectTo} />
          </div>
        </div>
        <ProcedimientoEdit
          procedure_edit_modal_id={procedure_edit_modal_id}
          current_sucursal={current_sucursal}
          redirectTo={redirectTo} />
      </div>
    </ProcedureModalContext.Provider>
  )
}
const ProcedimientoListTable = ({current_sucursal, procedure_edit_modal_id}) => {
  const [pxss, setPXS] = useState(false);
  const [datatable, setDatatable] = useState(false);
  const ctx_md = useContext(ProcedureModalContext)

  const getSucursalProcedures = _sucursal_pk => simpleGet(`maestro/procedimiento/sucursal/`).then(setPXS)
  const changeProcedureActiveState = (_pk, state) => {
    simplePostData(`maestro/procedimiento/sucursal/detalle/${_pk}/`, {active: state}, "PATCH")
  }
  const updateProcedure = (_pk, _data) => {
    // Update procedure values locally only (avoid asking api again)
    let _p = pxss.find(p => p.pk == ctx_md.modal_data.data.pk)
    _p.alias = _data.alias
    _p.precio = _data.precio

    let _proc = pxss
    _proc.splice(pxss.indexOf(_p), 1)
    setPXS([..._proc, _p])
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
        getSucursalProcedures(current_sucursal)
      }
      document.body.appendChild(dt_script)
    }else{
      getSucursalProcedures(current_sucursal)
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
    if(!pxss) return;  // Abort if pxss aren't set

    // Destroy previous DT if exists
    if(datatable) window.$('#procedure-list').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#procedure-list').DataTable({
      data: pxss,
      columns: [
        {title: "Nombre", data: null},
        {title: "Precio", data: null},
        {title: "Habilitado", data: "active"},
        {title: "", data: null},
      ],
      columnDefs: [
        // Nombre
        {targets: 0, render: (_, __, row) => row.nombre.toUpperCase()},
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
            window.$('#'+procedure_edit_modal_id).modal('show')
          }
        },
      ],
      pageLength: 10,
      lengthMenu: [[10, 20, 30], [10, 20, 30]],
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
  }, [pxss])
  // ctx_md
  useEffect(() => {
    ctx_md.updateProcedure = updateProcedure
  }, [ctx_md])

  return !pxss
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
    window.$('#'+procedure_edit_modal_id).modal('show')
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
const ProcedimientoEdit = ({current_sucursal, procedure_edit_modal_id}) => {
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
      simplePostData(`maestro/procedimiento/sucursal/`, _data)
      .then(() => window.$('#'+procedure_edit_modal_id).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Procedimiento añadido exitosamente, actualice la pagina para ver los cambios", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }else{
      simplePostData(`maestro/procedimiento/sucursal/detalle/${ctx_md.modal_data.data.pk}/`, _data, "PATCH")
      .then(() => ctx_md.updateProcedure(ctx_md.modal_data.data.pk, _data))
      .then(() => window.$('#'+procedure_edit_modal_id).modal("hide"))
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
        getProcedures(current_sucursal);
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }else{
      getProcedures(current_sucursal);
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
  useEffect(() => () => window.$('#'+procedure_edit_modal_id).modal("hide"), [])
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
      _title={"Procedimiento"}
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
const AdminUsuario = () => {
  return "AdminUsuario"
}
// Admin Campos
const AdminAdmisionCampos = () => {
  const {current_sucursal, redirectTo} = useContext(NavigationContext)
  let edit_modal_id = 'admfields_edit_modal_id'
  const [modal_data, setModalData] = useState(false)
  const updateEF = () => {}

  // AEF: Admision Extra Fields
  return (
    <AEFModalContext.Provider value={{modal_data, setModalData, updateEF}}>
      <PageTitle title={"Campos de Admision"} />

      <div className="row">
        <div className="col-lg-9">
          <div style={{marginBottom: "25px"}}>
            <AdmisionCamposListTable
              edit_modal_id={edit_modal_id}
              current_sucursal={current_sucursal} />
          </div>
        </div>
        <div className="col-lg-3">
          <div className="panel">
            <AdmisionCamposActions edit_modal_id={edit_modal_id} />
          </div>
        </div>
        <AdmisionCamposEdit edit_modal_id={edit_modal_id} />
      </div>
    </AEFModalContext.Provider>
  )
}
const AdmisionCamposListTable = ({current_sucursal, edit_modal_id}) => {
  const [efs, setEF] = useState(false);
  const [datatable, setDatatable] = useState(false);
  const ctx_md = useContext(AEFModalContext)

  const getSucursalExtraFields = _sucursal_pk => simpleGet(`atencion/admision/extra/`).then(setEF)
  const changeProcedureActiveState = (_pk, state) => {
    simplePostData(`atencion/admision/extra/${_pk}/`, {activo: state}, "PATCH")
  }
  const changeProcedureMostrarState = (_pk, state) => {
    simplePostData(`atencion/admision/extra/${_pk}/`, {mostrar_en_admision: state}, "PATCH")
  }
  const updateEF = (_pk, _data) => {
    // Update procedure values locally only (avoid asking api again)
    let _ef = efs.find(ef => ef.pk == ctx_md.modal_data.data.pk)
    _ef.texto = _data.texto
    _ef.tipo = _data.tipo_campo

    let _efs = efs
    _efs.splice(efs.indexOf(_ef), 1)
    setEF([..._efs, _ef])
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
        getSucursalExtraFields(current_sucursal)
      }
      document.body.appendChild(dt_script)
    }else{
      getSucursalExtraFields(current_sucursal)
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
    if(!efs) return;  // Abort if pxss aren't set

    // Destroy previous DT if exists
    if(datatable) window.$('#extrafields-list').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#extrafields-list').DataTable({
      data: efs,
      columns: [
        {title: "Texto", data: "texto"},
        {title: "Tipo", data: "nombre_tipo_campo"},
        {title: "Activo", data: "activo"},
        {title: "Mostrar", data: "mostrar_en_admision"},
        {title: "", data: null},
      ],
      columnDefs: [
        // Tipo
        {targets: 1, render: (data) => data.toUpperCase()},
        // Activo
        {targets: 2, orderable: false,
          createdCell: (cell, data, row) => ReactDOM.render(
            <div className="custom-switch">
              <input type="checkbox" className="custom-control-input" id={"chxb_switch-"+row.pk}
              defaultChecked={data} onChange={e => changeProcedureActiveState(row.pk, e.target.checked)} />
              <label className="custom-control-label" htmlFor={"chxb_switch-"+row.pk}></label>
            </div>, cell
          )
        },
        // Mostrar
        {targets: 3, orderable: false,
          createdCell: (cell, data, row) => ReactDOM.render(
            <div className="custom-switch">
              <input type="checkbox" className="custom-control-input" id={"chxb_switch-mostraradmision-"+row.pk}
              defaultChecked={data} onChange={e => changeProcedureMostrarState(row.pk, e.target.checked)} />
              <label className="custom-control-label" htmlFor={"chxb_switch-mostraradmision-"+row.pk}></label>
            </div>, cell
          )
        },
        // Edit
        {targets: -1, orderable: false,
          defaultContent: "<button class='btn btn-sm btn-light btn-pills waves-effect'>Editar</button>",
          createdCell: (cell, _, row) => cell.children[0].onclick = () => {
            ctx_md.setModalData({data: row, action: 'edit'})
            window.$('#'+edit_modal_id).modal('show')
          }
        },
      ],
      pageLength: 10,
      lengthMenu: [[10, 20, 30], [10, 20, 30]],
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay campos registrados",
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
    })

    setDatatable(_tmp);  // Save DT in state
  }, [efs])
  // ctx_md
  useEffect(() => {
    ctx_md.updateEF = updateEF
  }, [ctx_md])

  return !efs
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="extrafields-list" style={{width: "100%"}}></table>
      </div>
    )
}
const AdmisionCamposActions = ({edit_modal_id}) => {
  const modal_data = useContext(AEFModalContext)
  const openExtraFieldModal = () => {
    modal_data.setModalData({action: 'new'})
    window.$('#'+edit_modal_id).modal('show')
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
          <Icon type="add" onClick={openExtraFieldModal} />
          <span style={{fontSize: "0.9rem"}}>Nuevo</span>
        </div>
      </div>
    </div>
  )
}
const AdmisionCamposEdit = ({edit_modal_id}) => {
  const ctx_md = useContext(AEFModalContext)

  const handleSubmit = () => {
    if(ctx_md.modal_data.action!="new" && ctx_md.modal_data.action!="edit") return

    let _data = {
      texto: window.document.getElementById('texto').value,
      tipo_campo: window.document.getElementById('tipo').value,
    }

    if(ctx_md.modal_data.action=="new"){
      simplePostData(`atencion/admision/extra/`, _data)
      .then(() => window.$('#'+edit_modal_id).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Campo añadido exitosamente, actualice la pagina para ver los cambios", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }else{
      simplePostData(`atencion/admision/extra/${ctx_md.modal_data.data.pk}/`, _data, "PATCH")
      .then(() => ctx_md.updateEF(ctx_md.modal_data.data.pk, _data))
      .then(() => window.$('#'+edit_modal_id).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Campo editado exitosamente", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }
  }

  // Select2 for Campo extra
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
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }
  }, [])
  // Assure modals will be closed before leaving current page
  useEffect(() => () => window.$('#'+edit_modal_id).modal("hide"), [])
  useEffect(() => {
    if(!ctx_md.modal_data) return

    if(ctx_md.modal_data.action=="edit"){
      // Set values in input
      window.document.getElementById('texto').value = ctx_md.modal_data.data.texto
      window.document.getElementById('tipo').value = ctx_md.modal_data.data.tipo_campo
    }else if(ctx_md.modal_data.action=="new"){
      // Reset values
      window.document.getElementById('texto').value = ""
      window.document.getElementById('tipo').value = 1
    }
  }, [ctx_md.modal_data])

  return (
    <RegularModalCentered
      _id={edit_modal_id}
      _title={"Campo extra en Admision"}
      _body={
        <div className="form-group col-md-12">
          {/* texto */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="texto">Texto: </label>
            <input type="text" className="form-control" id="texto" />
          </div>
          {/* tipo */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="tipo">Tipo: </label>
            <select id="tipo" className="custom-select form-control">
              <option value="1">Texto</option>
              <option value="2">Descripcion</option>
            </select>
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
// Admin Cuestionario
const AdminCuestionario = () => {
  let edit_modal_id = 'cuestionario_edit_modal_id'

  return (
    <>
    <PageTitle title={"Cuestionario Admin"} />

    <div className="row">
      <div className="col-lg-9">
        <div style={{marginBottom: "25px"}}>
          <CuestionarioListTable />
        </div>
      </div>
      <div className="col-lg-3">
        <div className="panel">
          <CuestionarioActions edit_modal_id={edit_modal_id} />
        </div>
      </div>
      <CuestionarioForm edit_modal_id={edit_modal_id} />
    </div>
    </>
  )
}
const CuestionarioListTable = () => {
  const {redirectTo} = useContext(NavigationContext)
  const [cuestionarios, setCuestionarios] = useState(false)
  const [datatable, setDatatable] = useState(false)

  const getCuestionarios = () => simpleGet(`atencion/cuestionario/`).then(setCuestionarios)
  const changeActiveState = (_pk, state) => simplePostData(`atencion/cuestionario/${_pk}/`, {activo: state}, "PATCH")

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
        getCuestionarios()
      }
      document.body.appendChild(dt_script)
    }else{
      getCuestionarios()
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
  // Cuestionarios
  useEffect(() => {
    if(!cuestionarios) return;  // Abort if cuestionarios aren't set

    // Destroy previous DT if exists
    if(datatable) window.$('#cuestionarios-list').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#cuestionarios-list').DataTable({
      data: cuestionarios,
      columns: [
        {title: "Titulo", data: "titulo"},
        {title: "Activo", data: "activo"},
        {title: "", data: null},
      ],
      columnDefs: [
        // Tipo
        {targets: 0, render: (data) => data.toUpperCase()},
        // Activo
        {targets: 1, orderable: false,
          createdCell: (cell, data, row) => ReactDOM.render(
            <div className="custom-switch">
              <input type="checkbox" className="custom-control-input" id={"chxb_switch-"+row.pk}
              defaultChecked={data} onChange={e => changeActiveState(row.pk, e.target.checked)} />
              <label className="custom-control-label" htmlFor={"chxb_switch-"+row.pk}></label>
            </div>, cell
          )
        },
        // Edit
        {targets: -1, orderable: false,
          defaultContent: "<button class='btn btn-sm btn-light btn-pills waves-effect'>Editar</button>",
          createdCell: (cell, _, row) => cell.children[0].onclick = () => redirectTo(`/nav/admin/cuestionario/${row.pk}/`)
        },
      ],
      pageLength: 10,
      lengthMenu: [[10, 20, 30], [10, 20, 30]],
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No se encontraron encuestas",
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
    })

    setDatatable(_tmp);  // Save DT in state
  }, [cuestionarios])

  return !cuestionarios
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="cuestionarios-list" style={{width: "100%"}}></table>
      </div>
    )
}
const CuestionarioActions = ({edit_modal_id}) => {
  const openModal = () => window.$('#'+edit_modal_id).modal('show')

  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="add" onClick={openModal} />
          <span style={{fontSize: "0.9rem"}}>Nuevo</span>
        </div>
      </div>
    </div>
  )
}
const CuestionarioForm = ({edit_modal_id}) => {
  const {redirectTo} = useContext(NavigationContext)

  const handleSubmit = () => {
    let _data = {titulo: window.document.getElementById('cues-titulo').value}

    simplePostData(`atencion/cuestionario/`, _data)
    .then(c => {
      window.$('#'+edit_modal_id).modal("hide")
      handleErrorResponse('custom', "Exito", "Cuestionario añadido exitosamente", 'success')
      redirectTo(`/nav/admin/cuestionario/${c.pk}/`)
    })
    .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
  }

  // Assure modals will be closed before leaving current page
  useEffect(() => () => window.$('#'+edit_modal_id).modal("hide"), [])

  return (
    <RegularModalCentered
      _id={edit_modal_id}
      _title={"Nuevo Cuestionario"}
      _body={
        <div className="form-group col-md-12">
          {/* titulo */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="texto">Titulo del cuestionario: </label>
            <input type="text" className="form-control" id="cues-titulo" />
          </div>

          <br/>
          <div className="col-sm d-flex">
            <button className="btn btn-dark" onClick={handleSubmit}>
              Guardar
            </button>
          </div>
        </div>
      } />
  )
}
// Admin Pregunta
const AdminCuestionarioPreguntas = () => {
  let edit_modal_id = 'cuest-preg_edit_modal_id'
  const [modal_data, setModalData] = useState(false)
  const [cuestionario, setCuestionario] = useState(false)
  const [len_preguntas, setPreguntasLen] = useState(0)
  const cuestionario_pk = useParams().pk
  const updatePregunta = () => {}

  const getCuestionario = _pk => getDataByPK('atencion/cuestionario', _pk).then(setCuestionario)
  useEffect(() => {
    getCuestionario(cuestionario_pk)
  }, [])

  // APModalContext | AP: Admision Preguntas
  return (
    <APModalContext.Provider value={
      {modal_data, setModalData, updatePregunta, cuestionario_pk, cuestionario,
        len_preguntas, setPreguntasLen}
    }>
      <PageTitle title={cuestionario ? "Preguntas de "+cuestionario.titulo : "Preguntas"} />

      <div className="row">
        <div className="col-lg-9">
          <div style={{marginBottom: "25px"}}>
            <AdmisionPreguntaListTable edit_modal_id={edit_modal_id} />
          </div>
        </div>
        <div className="col-lg-3">
          <div className="panel">
            <AdmisionPreguntaActions edit_modal_id={edit_modal_id} />
          </div>
        </div>
        <AdmisionPreguntaEdit edit_modal_id={edit_modal_id} />
      </div>
    </APModalContext.Provider>
  )
}
const AdmisionPreguntaListTable = ({edit_modal_id}) => {
  const [preguntas, setPreguntas] = useState(false)
  const [datatable, setDatatable] = useState(false)
  const ctx_md = useContext(APModalContext)

  const getCuestionarioPreguntas = () => simpleGet(`atencion/cuestionario/${ctx_md.cuestionario_pk}/pregunta/`).then(setPreguntas)
  const deletePreguntaByID = _pk => simpleDelete(`atencion/cuestionario/pregunta/${_pk}/`).then(() => setPreguntas([...preguntas.filter(i => i.pk != _pk)]) )
  const updatePregunta = (_pk, _data) => {
    // Update pregunta values locally (avoid asking api again)
    let _preg = preguntas.find(p => p.pk == ctx_md.modal_data.data.pk)
    _preg.texto = _data.texto
    _preg.orden = _data.orden
    _preg.tipo = _data.tipo_campo

    let _pregs = preguntas
    _pregs.splice(preguntas.indexOf(_preg), 1)
    setPreguntas([..._pregs, _preg])
  }
  const fakeCreatePregunta = _obj => setPreguntas([...preguntas, _obj])

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
        getCuestionarioPreguntas()
      }
      document.body.appendChild(dt_script)
    }else{
      getCuestionarioPreguntas()
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
  // Preguntas
  useEffect(() => {
    if(!preguntas) return

    // Destroy previous DT if exists
    if(datatable) window.$('#preguntas-list').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#preguntas-list').DataTable({
      data: preguntas,
      columns: [
        {title: "Texto", data: "texto"},
        {title: "Orden", data: "orden"},
        {title: "Tipo", data: "tipo_campo"},
        {title: "", data: null},
        {title: "", data: "pk"},
      ],
      columnDefs: [
        // Tipo
        {targets: 2, orderable: false,
          render: (_, __, rowData) => rowData.tipo_campo == "1"
            ? "Texto"
            : rowData.tipo_campo == "1"
            ? "Fecha"
            : ""
        },
        // Edit
        {targets: -2, orderable: false,
          defaultContent: "<button class='btn btn-sm btn-light btn-pills waves-effect'>Editar</button>",
          createdCell: (cell, _, row) => cell.children[0].onclick = () => {
            ctx_md.setModalData({data: row, action: 'edit'})
            window.$('#'+edit_modal_id).modal('show')
          }
        },
        // Delete
        {targets: -1, orderable: false,
          createdCell: (cell, pk, _) => ReactDOM.render(
            <button className="btn-secondary btn-pills" onClick={() => deletePreguntaByID(pk)}>
              <i className="fal fa-trash-alt"></i>
            </button>
            , cell
          )
        },
      ],
      pageLength: 10,
      lengthMenu: [[10, 20, 30], [10, 20, 30]],
      language: {
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay preguntas registradas",
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
    })

    setDatatable(_tmp);  // Save DT in state
    ctx_md.setPreguntasLen(preguntas.length)
  }, [preguntas])
  // ctx_md
  useEffect(() => {
    ctx_md.updatePregunta = updatePregunta
    ctx_md.fakeCreatePregunta = fakeCreatePregunta
  }, [ctx_md, updatePregunta, fakeCreatePregunta])

  return !preguntas
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="preguntas-list" style={{width: "100%"}}></table>
      </div>
    )
}
const AdmisionPreguntaActions = ({edit_modal_id}) => {
  const modal_data = useContext(APModalContext)
  const openModal = () => {
    modal_data.setModalData({action: 'new'})
    window.$('#'+edit_modal_id).modal('show')
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
          <Icon type="add" onClick={openModal} />
          <span style={{fontSize: "0.9rem"}}>Nuevo</span>
        </div>
      </div>
    </div>
  )
}
const AdmisionPreguntaEdit = ({edit_modal_id}) => {
  const ctx_md = useContext(APModalContext)

  const handleSubmit = () => {
    if(ctx_md.modal_data.action!="new" && ctx_md.modal_data.action!="edit") return

    let _data = {
      texto: window.document.getElementById('form_preg-texto').value,
      tipo_campo: window.document.getElementById('form_preg-tipo').value,
      orden: window.document.getElementById('form_preg-orden').value,
    }

    if(ctx_md.modal_data.action=="new"){
      simplePostData(`atencion/cuestionario/${ctx_md.cuestionario.pk}/pregunta/`, _data)
      .then(ctx_md.fakeCreatePregunta)
      .then(() => window.$('#'+edit_modal_id).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Pregunta añadida exitosamente, actualice la pagina para ver los cambios", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }else{
      simplePostData(`atencion/cuestionario/pregunta/${ctx_md.modal_data.data.pk}/`, _data, "PATCH")
      .then(() => ctx_md.updatePregunta(ctx_md.modal_data.data.pk, _data))
      .then(() => window.$('#'+edit_modal_id).modal("hide"))
      .then(() => handleErrorResponse('custom', "Exito", "Pregunta editada exitosamente", 'success'))
      .catch(() => handleErrorResponse('custom', "Error", "Ha ocurrido un error", 'danger'))
    }
  }
  const fixOrdenValue = ev => {
    let val = ev.target.value
    if(val < 1 || val > ctx_md.len_preguntas+1){
      window.document.getElementById('form_preg-orden').value = Number(ctx_md.len_preguntas)+1
    }
  }

  // Select2 for Pregunta.tipo_campo
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
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }
  }, [])
  // Assure modals will be closed before leaving current page
  useEffect(() => () => window.$('#'+edit_modal_id).modal("hide"), [])
  useEffect(() => {
    if(!ctx_md.modal_data) return

    if(ctx_md.modal_data.action=="edit"){
      // Set values in input
      window.document.getElementById('form_preg-texto').value = ctx_md.modal_data.data.texto
      window.document.getElementById('form_preg-orden').value = ctx_md.modal_data.data.orden
      window.document.getElementById('form_preg-tipo').value = ctx_md.modal_data.data.tipo_campo
    }else if(ctx_md.modal_data.action=="new"){
      // Reset values
      window.document.getElementById('form_preg-texto').value = ""
      window.document.getElementById('form_preg-orden').value = Number(ctx_md.len_preguntas)+1
      window.document.getElementById('form_preg-tipo').value = 1
    }
  }, [ctx_md.modal_data])
  useEffect(() => {
    window.document.getElementById('form_preg-orden').max = Number(ctx_md.len_preguntas) + 1
  }, [ctx_md.len_preguntas])

  return (
    <RegularModalCentered
      _id={edit_modal_id}
      _title={"Pregunta"}
      _body={
        <div className="form-group col-md-12">
          {/* texto */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="form_preg-texto">Texto: </label>
            <input type="text" className="form-control" id="form_preg-texto" />
          </div>
          {/* orden */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="form_preg-orden">Orden: </label>
            <input type="text" className="form-control" id="form_preg-orden" min="1" onChange={fixOrdenValue}/>
          </div>
          {/* tipo */}
          <div className="col-sm" style={{paddingBottom: "5px"}}>
            <label className="form-label" htmlFor="form_preg-tipo">Tipo: </label>
            <select id="form_preg-tipo" className="custom-select form-control">
              <option value="1">Texto</option>
              <option value="2">Descripcion</option>
            </select>
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

export default Admin
