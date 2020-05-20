import React, { useState, useEffect, useRef, useCallback } from 'react';
import { savePageHistory, getPageHistory, getCacheData } from '../HandleCache';
import { Switch, Route, Redirect, Link, useHistory } from "react-router-dom";
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  getDataByPK
} from '../../functions';
import { ListSavedMedicine } from '../prescripcion/Prescripcion';
import { PageTitle, Icon } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_admision";


function Admision(props){
  return(
  <>
    <PageTitle title={"Admision"} />

    <Switch>
      <Route exact path="/nav/admision">
        <AdmisionHome
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/admision/nuevo">
        <RegisterPatient
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>
      <Route exact path="/nav/admision/detalle">
        {!props.data.patient && !getCacheData().patient
          ? <Redirect to="/nav/admision" />
          : <AdmisionDetail
              sucursal_pk={props.sucursal_pk}
              redirectTo={props.redirectTo}
              patient={props.data.patient} />
        }
      </Route>
      <Route exact path="/nav/admision/editar">
        {!props.data.patient
          ? <Redirect to="/nav/admision" />
          : <EditPatient
              sucursal_pk={props.sucursal_pk}
              redirectTo={props.redirectTo}
              patient={props.data.patient} />
        }
      </Route>
      <Route>
        <Redirect to="/nav/admision" />
      </Route>
    </Switch>
  </>
  )
}

// General
const AdmisionHome = props => {
  useEffect(() => {
    savePageHistory();
  }, []);

  return (
    <div className="row">
      <div className="col-lg-8">
        <div style={{marginBottom: "25px"}}>
          <SearchPatient sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
        </div>
      </div>
      <div className="col-lg-4">
        <div className="panel">
          <LinksHome redirectTo={props.redirectTo} />
        </div>
        <div className="panel">
          <LastAttendedPatients sucursal_pk={props.sucursal_pk} redirectTo={props.redirectTo} />
        </div>
      </div>
    </div>
  );
}
const SearchPatient = props => {
  const [patients, setPatients] = useState(false);
  const [datatable, setDatatable] = useState(false);

  const getAllPatients = (_sucursal_pk=props.sucursal_pk) => {
    let filter = `filtro={"all":"all"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/paciente/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),
        },
      });
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
        setPatients(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    // Add DataTable rel docs
    // JS
    if(!document.getElementById('dt_script')){
      const dt_script = document.createElement("script");
      dt_script.async = false;
      dt_script.id = "dt_script";
      dt_script.src = "/js/datagrid/datatables/datatables.bundle.js";
      dt_script.onload = () => {
        // Run at first execution
        getAllPatients();
      };
      document.body.appendChild(dt_script);
    }else{
      getAllPatients();
    }
    // CSS
    if(!document.getElementById('dt_style')){
      const dt_style = document.createElement("link");
      dt_style.rel = "stylesheet";
      dt_style.id = "dt_style";
      dt_style.href = "/css/datagrid/datatables/datatables.bundle.css";
      document.head.appendChild(dt_style);
    }

    savePageHistory();  // Save page history
  }, []);
  // When patients are setted
  useEffect(() => {
    if(!patients) return;  // Abort if it's false

    // Destroy previous DT if exists
    if(datatable) window.$('#search-patient').DataTable().clear().destroy();
    // Gen Datatable
    let _tmp = window.$('#search-patient').DataTable({
      data: patients,
      columns: [
        {title: "Nombre", data: null},
        {title: "Apellidos", data: null},
        {title: "DNI", data: 'dni'},
        {title: "", data: null},
      ],
      columnDefs: [{
        // Button
        targets: -1,
        orderable: false,
        width: "1px",
        defaultContent: "<button class='select-patient btn btn-light btn-pills waves-effect'>Seleccionar</button>",
        createdCell: (cell, data, rowData) => {
          // Add click listener to button (children[0])
          cell.children[0].onclick = () => {
            props.redirectTo("/nav/admision/detalle", {patient: rowData});
          }
        }
      }, {
        // Nombre
        targets: 0,
        render: (data, type, row) => (
          cFL(row.nombre_principal)+
          (row.nombre_secundario?" "+cFL(row.nombre_secundario):"")
        ),
      }, {
        // Apellidos
        targets: 1,
        render: (data, type, row) => (
          cFL(row.ape_paterno)+" "+
          cFL(row.ape_materno)
        ),
      }],
      pageLength: 8,
      lengthMenu: [[8, 15, 25], [8, 15, 25]],
      language: {
        // url: "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
        sProcessing:     "Procesando...",
        sLengthMenu:     "Mostrar _MENU_ registros",
        sZeroRecords:    "No se encontraron resultados",
        sEmptyTable:     "No hay atenciones registradas para la fecha seleccionada",
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
  }, [patients]);

  return !patients
    ? "loading"
    : (
      <div className="datatable-container col-12">
        <table id="search-patient" style={{width: "100%"}}></table>
      </div>
    );
}
const LastAttendedPatients = props => {
  const [lastPatients, setLastPatients] = useState(false);
  const max_items = 5;

  const getLastAttendedPatients = (_sucursal_pk=props.sucursal_pk, ndays=3) => {
    // Get lastest attended patients within the last four days
    let _day = new Date();
    _day.setDate(_day.getDate()-ndays)
    _day = _day.toDateInputValue();

    let filter = `filtro={"sucursal":"${_sucursal_pk}", "estado":"5", "fecha_desde":"${_day}", "sort":"true"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/`;
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      });
    }, () => handleErrorResponse('server'));
    result.then(
      response_obj => {
        let _fake_obj = [];
        let _tmp1 = [];
        response_obj.map(cita => {  // Select only different patients
          if(_tmp1.includes(cita.paciente_data.pk)) return;  // Abort
          else _tmp1.push(cita.paciente_data.pk);  // Save patient's pk

          _fake_obj.push(cita.paciente_data);  // Save patient's data
        })

        setLastPatients(_fake_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getLastAttendedPatients(props.sucursal_pk);
  }, []);

  return !lastPatients
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
        <div className="card-header">
          <div className="card-title">
            Pacientes atendidos en los últimos días
          </div>
        </div>
        <div id="pat-list" className={lastPatients.length==0?"card-body":""}>
          {lastPatients.length==0
            ? "No hay pacientes atendidos ultimamente"
            : lastPatients.map((pat, inx) => ( inx>max_items-1?"":
              <div key={"pat-"+pat.pk}>
                <li className="list-group-item d-flex" id={pat.pk}
                  onClick={()=>{props.redirectTo("/nav/admision/detalle", {patient: pat})}}
                  data-toggle="collapse" data-target={"#pat-desc-"+pat.pk}
                  aria-expanded="true" aria-controls={"pat-desc-"+pat.pk}
                  style={{cursor: "pointer", borderBottom: "0"}}>
                    <span
                      style={{fontSize: "1.2em"}}>
                        {cFL(pat.nombre_principal)
                          +" "+(pat.nombre_secundario?" "+cFL(pat.nombre_secundario):"")
                          +" "+cFL(pat.ape_paterno)
                          +" "+cFL(pat.ape_materno)
                        }
                    </span>
                </li>
              </div>
            ))}
        </div>
      </div>
    );
}
const LinksHome = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
          <Icon type="new-patient" onClick={() => props.redirectTo("/nav/admision/nuevo")} />
          <span style={{fontSize: "0.9rem"}}>Nuevo</span>
        </div>
      </div>
    </div>
  );
}
// By patient
const AdmisionDetail = props => {
  // Handle prev data flag from cache
  const [patient, setPatient] = useState(props.patient);

  useEffect(() => {
    if(!patient){
      // Get patient data by cache
      getDataByPK('atencion/paciente', getCacheData().patient )
      .then( data => setPatient(data) );
    }else{
      // Regular behavior
      savePageHistory({patient: patient.pk});
    }
  }, [patient]);

  return !patient
    ? "loading"
    : (
      <div className="row">
        <div className="col-lg-6">
          <div style={{marginBottom: "25px"}}>
            <PatientData
              patient={patient}
              sucursal_pk={props.sucursal_pk}
              redirectTo={props.redirectTo} />
          </div>
          <div>
            <PatientDebts
              patient={patient}
              sucursal_pk={props.sucursal_pk}
              redirectTo={props.redirectTo} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="panel">
            <LinksDetail
              patient={patient}
              redirectTo={props.redirectTo} />
          </div>
          <div className="panel">
            <PatientPrescription
              patient={patient}
              redirectTo={props.redirectTo} />
          </div>
        </div>
      </div>
    );
}
const PatientData = props => {
  // Receive {patient}
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Paciente
        </div>
      </div>
      <PatientDataList patient={props.patient} />
    </div>
  );
}
export const PatientDataList = props => {
  // Receive {patient}
  return (
    <div className="card-body">
      <h5>Nombres: <span style={{color:"black"}}>{cFL(props.patient.nombre_principal)+
        (props.patient.nombre_secundario?" "+
        cFL(props.patient.nombre_secundario):"")}</span>
      </h5>
      <h5>Apellidos: <span style={{color:"black"}}>{cFL(props.patient.ape_paterno)+" "+
        cFL(props.patient.ape_materno)}</span>
      </h5>
      <h5>DNI: <span style={{color:"black"}}>{props.patient.dni}</span></h5>
      <h5>Genero: <span style={{color:"black"}}>{props.patient.sexo=="1"?"Masculino":"Femenino"}</span></h5>
      {!props.patient.fecha_nacimiento ? ""
        : <h5>Fecha de nacimiento: <span style={{color:"black"}}>{props.patient.fecha_nacimiento}</span></h5>
      }
      {!props.patient.celular ? ""
        : <h5>Número de contacto: <span style={{color:"black"}}>{props.patient.celular}</span></h5>
      }
      {!props.patient.direccion ? ""
        : <h5>Dirección: <span style={{color:"black"}}>{props.patient.direccion}</span></h5>
      }
      {!props.patient.procedencia ? ""
        : <h5>Procedencia: <span style={{color:"black"}}>{props.patient.procedencia}</span></h5>
      }
      {!props.patient.residencia ? ""
        : <h5>Residencia: <span style={{color:"black"}}>{props.patient.residencia}</span></h5>
      }
    </div>
  )
}
const PatientPrescription = props => {
  // Receive {patient}
  const [prescription_list, setPrescriptionList] = useState(false);

  const removeMedicineFromList = _medc_pk => {
    // Remove medicine by index in array
    let _tmp = prescription_list.filter(i => i.pk!=_medc_pk);

    setPrescriptionList(_tmp);
  }
  const getPrescriptionMedicine = (_patient_pk) => {
    // Get patient's prescription
    let filter = `filtro={"paciente":"${_patient_pk}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`atencion/prescripcion/`;
    url = url + '?' + filter;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(
      response_obj => {
        setPrescriptionList(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getPrescriptionMedicine(props.patient.pk)
  }, []);

  // ListSavedMedicine receive {medicine_list, removeMedicineFromList}
  return !prescription_list
    ? "loading"
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Prescripciones actuales del paciente
          </div>
        </div>
        <ListSavedMedicine
            removeMedicineFromList={removeMedicineFromList}
            medicine_list={prescription_list} />
      </div>
    )
}
const PatientDebts = props => {
  // Receive {patient}
  const [list, setList] = useState(false);

  /* Missing */
  const getPatientDebts = (_patient_dni) => {
    // Get patient's debts
    let filter = `filtro={"by_dni":"${_patient_dni}"}`;
    let url = process.env.REACT_APP_PROJECT_API+`finanzas/cuentacorriente/`;
    url = url + '?' + filter;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(
      response_obj => {
        setList(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    // Get patient's data by dni
    getPatientDebts(props.patient.dni)
  }, []);

  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Deudas
        </div>
      </div>
      <div className="card-body">
        {!list
          ? "loading"
          : list.length==0
            ? <span style={{fontSize: "1.2em"}}>El paciente no tiene deudas</span>
            : (
              <h3>Tiene deudas</h3>
            )
        }
      </div>
    </div>
  )
}
const LinksDetail = props => {
  return (
    <div className="card col-12" style={{padding: "0px"}}>
      <div className="card-header">
        <div className="card-title">
          Acciones
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="edit-patient"
              onClick={() => props.redirectTo("/nav/admision/editar", {patient: props.patient})} />
            <span style={{fontSize: "0.9rem"}}>Editar</span>
          </div>
          <div className="col-3" style={{display: "inline-block", textAlign: "center"}}>
            <Icon type="clinic-history"
              onClick={() => props.redirectTo("/nav/historiaclinica", {patient_pk: props.patient.pk})} />
            <span style={{fontSize: "0.9rem"}}>Historia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// Extra
const EditPatient = props => {
  // Receive {patient, redirectTo, sucursal_pk}
  if(!props.patient) console.error("FATAL ERROR, patient PROPERTY NOT SPECIFIED");

  const [patient, updatePatientData] = useState(props.patient||{});

  const saveEdit = (_data, _patient_pk) => {
    let url = process.env.REACT_APP_PROJECT_API+`atencion/paciente/${_patient_pk}/`;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: localStorage.getItem('access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(
      response_obj => {
        updatePatientData(response_obj);
        handleErrorResponse('custom', "Exito", "Se han guardado los cambios exitosamente")
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }
  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname, {patient: patient});
  }

  return <PatientForm
          patient={patient}
          first_button_text={"Guardar"}
          handleSubmit={saveEdit}
          second_button_text={"Cancelar"}
          secondButtonHandler={getBack} />
}
const RegisterPatient = props => {
  // Receive {sucursal_pk, redirectTo}
  if(!props.sucursal_pk) console.error("FATAL ERROR, sucursal_pk PROPERTY NOT SPECIFIED");

  const savePatient = (_data) => {
    let url = process.env.REACT_APP_PROJECT_API+`atencion/paciente/`;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_data)
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(
      response_obj => {
        // Redirect to AdmisionDetail
        props.redirectTo('/nav/admision/detalle', {patient: response_obj});
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }
  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname);
  }

  return <PatientForm
          first_button_text={"Guardar"}
          handleSubmit={savePatient}
          second_button_text={"Regresar"}
          secondButtonHandler={getBack} />
}
const PatientForm = props => {
  // Receive {patient?, first_button_text?, handleSubmit(form_data, patient_pk?), second_button_text, secondButtonHandler}
  const [ubication, setUbication] = useState([]);
  const patient = props.patient || false;

  function getUbicacion(){
    return;  // Abort execution (API not ready)
    let url = process.env.REACT_APP_PROJECT_API+`maestro/ubicacion/`;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));
    });
    result.then(
      response_obj => {
        console.log(response_obj);
        // setUbication(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }
  function handleSubmit(){
    // Values validation
    let _tmp1;
    _tmp1 = document.getElementById("name-pric");
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Nombre principal no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("name-sec");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Nombre secundario no especificado");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los nombres solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("ape-p");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido paterno no especificado");
      return;
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido paterno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("ape-m");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "Apellido materno no especificado");
      return;
    }
    if(_tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Apellido materno no puede estar vacio");
      return;
    }
    if(!isNaN(parseInt(_tmp1.value))){
      handleErrorResponse("custom", "Error", "Los apellidos solo pueden contener letras");
      return;
    }

    _tmp1 = document.getElementById("dni");
    if(!_tmp1){
      handleErrorResponse("custom", "Error", "DNI no especificado");
      return;
    }
    if(_tmp1.value.trim().length!=8){
      handleErrorResponse("custom", "Error", "El DNI debe tener 8 digitos");
      return;
    }
    if(isNaN(parseInt(_tmp1.value.trim()))){
      handleErrorResponse("custom", "Error", "El DNI debe contener solo números");
      return;
    }

    _tmp1 = document.getElementById("born-date");
    if(_tmp1){
      if(_tmp1.value>=(new Date().toDateInputValue)){
        handleErrorResponse("custom", "Error", "La fecha de nacimiento no debe ser posterior al día de hoy");
        return;
      }
    }

    _tmp1 = document.getElementById("phone");
    if(_tmp1 && !!_tmp1.value){
      if(_tmp1.value.length!=9){
        handleErrorResponse("custom", "Error", "El celular debe tener 9 digitos");
        return;
      }
      if(isNaN(parseInt(_tmp1.value))){
        handleErrorResponse("custom", "Error", "El celular debe contener solo digitos");
        return;
      }
    }

    // Address no not need validation
    // Provenance no not need validation
    // Residence no not need validation

    let _tmp = {
      nombre_principal: document.getElementById('name-pric').value,
      nombre_secundario: document.getElementById('name-sec').value,
      ape_paterno: document.getElementById('ape-p').value,
      ape_materno: document.getElementById('ape-m').value,
      dni: document.getElementById('dni').value,
      sexo: document.getElementById('sexo').value,
    }
    // Add non-required fields
    if(document.getElementById('born-date').value)
      _tmp.fecha_nacimiento = document.getElementById('born-date').value;
    if(document.getElementById('phone').value)
      _tmp.celular = document.getElementById('phone').value;
    if(document.getElementById('address').value)
      _tmp.direccion = document.getElementById('address').value;
    if(document.getElementById('select_provenance').value)
      _tmp.procedencia = document.getElementById('select_provenance').value;
    if(document.getElementById('select_residence').value)
      _tmp.residencia = document.getElementById('select_residence').value;

    props.handleSubmit(_tmp, (patient&&patient.pk||null));
  }

  useEffect(() => {
    // Select2 for medicine choose in Prescripcion
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
        getUbicacion();
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }else{
      getUbicacion();
    }
  }, []);
  useEffect(() => {
    if(ubication.length==0) return;

    // Fill data to selects
    if(window.$){
      window.$("#select_residence").select2({data: ubication});
      window.$("#select_provenance").select2({data: ubication});
    }
  }, [ubication]);

  return (
    <div className="form-group col-md-12">  {/* Form */}
      <div className="col-sm">
        <label className="form-label" htmlFor="name-pric">Nombre principal: </label>
        <input type="text" id="name-pric" className="form-control" defaultValue={patient&&patient.nombre_principal||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="name-sec">Nombre secundario: </label>
        <input type="text" id="name-sec" className="form-control" defaultValue={patient&&patient.nombre_secundario||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-p">Apellido parterno: </label>
        <input type="text" id="ape-p" className="form-control" defaultValue={patient&&patient.ape_paterno||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="ape-m">Apellido materno: </label>
        <input type="text" id="ape-m" className="form-control" defaultValue={patient&&patient.ape_materno||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="dni">DNI: </label>
        <input type="text" id="dni" className="form-control" maxLength="8" defaultValue={patient&&patient.dni||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="sexo">Sexo: </label>
        <select id="sexo" className="custom-select form-control">
          <option value="1" defaultValue={patient&&patient.sexo=="1"||true}>Masculino</option>
          <option value="2" defaultValue={patient&&patient.sexo=="2"||false}>Femenino</option>
        </select>
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="born-date">Fecha de nacimiento: </label>
        <input type="date" id="born-date" className="form-control" defaultValue={patient&&patient.fecha_nacimiento||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="phone">Celular: </label>
        <input type="text" id="phone" className="form-control" maxLength="9" defaultValue={patient&&patient.celular||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="address">Dirección: </label>
        <input type="text" id="address" className="form-control" defaultValue={patient&&patient.direccion||""} />
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="select_provenance">Procedencia: </label>
        <select id="select_provenance" className="custom-select form-control custom-select-lg">
        </select>
      </div>
      <div className="col-sm">
        <label className="form-label" htmlFor="select_residence">Residencia: </label>
        <select id="select_residence" className="custom-select form-control custom-select-lg">
        </select>
      </div>

      <div className="col-sm d-flex" style={{paddingTop: "25px"}}>
        <button className="btn btn-light" onClick={() => handleSubmit()}>
          {props.first_button_text||"Guardar"}
        </button>

        <button className="btn btn-primary ml-auto" onClick={() => props.secondButtonHandler()}>
          {props.second_button_text}
        </button>
      </div>
    </div>
  );
}

export default Admision;

/*
* Add cita (optional|maybe later)
*/