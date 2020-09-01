import React, { useState, useEffect } from 'react';
// Calendar components
import { Calendar } from '@fullcalendar/core';  // Class
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import listPlugin from '@fullcalendar/list';
import './fullcalendar.bundle.css'
import { Icon, SelectOptions_Procedimiento } from '../bits';
import { handleErrorResponse } from '../../functions';


class Cita extends React.Component {
  constructor(props){
    super();
    this.state = {
      calendar: false,
      personal: false,
      procedimiento: false,
      selected_cita: false,  // Cita shown in Cita info modal
      calendar_filter: [],
      global: {
        current_sucursal_pk: props.current_sucursal_pk
      },  // This is only setted first time this component is rendered
    }
    this.color_personal = [
      "#6e4e9e", "#179c8e", "#51adf6", "#ffb20e", "#fc077a", "#363636"
    ];
    this.redirectTo = props.redirectTo;
  }
  UNSAFE_componentWillReceiveProps(nextProps){
    // console.log(this.state.global.current_sucursal_pk, nextProps.current_sucursal_pk);
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.global = {};  // Unlink clone with this.state
    clone.global.current_sucursal_pk = nextProps.current_sucursal_pk  // Change attribute's value

    // Save change (re-render)
    // Shall we re render calendar?
    if(this.state.global.current_sucursal_pk!==nextProps.current_sucursal_pk){  // Sucursal has changed
      if(!this.state.calendar)  // First execution calendar == false so not render calendar
        this.setState(clone, this.getProcedimiento)  // Get procedimientos according new sucursal
      else
        this.setState(clone, this.getPersonal)  // Re render calendar
    }else{  // Something else has changed
      this.setState(clone)  // Only update this.state
    }
  }
  // This.props functions
  getPersonal(){
    // let filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
    let filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
    let url = process.env.REACT_APP_PROJECT_API+'maestro/empresa/personal/';
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            this.handleBadRequest(response.statusText);
          }
        }
      }, error => {
        this.handleServerError();
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        let clone = Object.assign({}, this.state);
        clone.personal = response_obj;
        this.setState(clone, this.getCitas);  // Render citas after personal is setted
      }
    );
  }
  getProcedimiento(){
    let filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
    let url = process.env.REACT_APP_PROJECT_API+'maestro/procedimiento/precio/';
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            this.handleBadRequest(response.statusText);
          }
        }
      }, error => {
        this.handleServerError();
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        if(response_obj.length<1) return;

        // Save in this.state
        let clone = Object.assign({}, this.state);
        clone.procedimiento = response_obj
        this.setState(clone);
      }
    );
  }
  getCitas(){
    let filter = ``;
    // Personal filter for cita calendar
    if(this.state.calendar_filter.length!==0){
      filter = `filtro={
        "sucursal":"${this.state.global.current_sucursal_pk}",
        "estado":"1",
        "personal":"${String(this.state.calendar_filter)}"
      }`;
    }else{  // Regular filter
      filter = `filtro={
        "sucursal":"${this.state.global.current_sucursal_pk}",
        "estado":"1"
      }`;
    }
    let url = process.env.REACT_APP_PROJECT_API+'atencion/cita/';
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            this.handleBadRequest(response.statusText);
          }
        }
      }, error => {
        this.handleServerError();
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        this.handleCitaResponse(response_obj);
      }
    );
  }
  handleCitaResponse(response_object){
    // Call sucursal's procedimientos
    this.getProcedimiento();

    // Get this calendar
    let _calendar = this.state.calendar;
    _calendar.removeAllEvents()  // Remove current events in fullcalendar

    // Set event
    response_object.forEach((v) => {
      let _data = {};
      _data.title = v.programado;
      _data.info = v;
      _data.start = v.fecha+"T"+v.hora;
      _data.end = v.fecha+"T"+v.hora_fin;

      // Choose color according personal
      let _inx_personal = this.state.personal.findIndex(p => p.pk === v.personal.pk)
      _data.color = _inx_personal!==-1 ? this.color_personal[_inx_personal] : "gray";

      _calendar.addEvent(_data)  // Add data to fullcalendar
    });
    _calendar.render();
  }
  setCalendar(){
    let that = this;  // Fake this var to handle conflicts with other 'this' inside calendar function
    // Create calendar object
    let calendarEl = document.querySelector('#calendar');
    let calendar = new Calendar(calendarEl, {
      plugins: [ timeGridPlugin, listPlugin , 'bootstrap' ],
      locale: esLocale,  // https://fullcalendar.io/docs/locale
      nowIndicator: true,
      themeSystem: 'bootstrap',
      minTime: "08:00:00",
      maxTime: "21:00:00",
      slotDuration: '00:15:00',  // Tab frequency
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: true,
        hour12: true,
      },
      header: {
        left: 'prev,next today addCita refreshCita',
        center: 'title',
        right: 'timeGridWeek,timeGridDay,listWeek'
      },
      navLinks: true, // can click day/week names to navigate views
      editable: false,  // Not editable
      eventLimit: true, // allow "more" link when too many events
      eventClick: this.getEventInfo,
      customButtons: {
        addCita: {  // Add Cita
          text: '+',
          click: function(){
            document.querySelector('button#toggleModal').click()
          }
        },
        refreshCita: {  // Refresh citas
          text: 'Actualizar',
          click: function(){
            that.getCitas();
          }
        },
      },
      eventColor: 'tomato',  // Default event color
    });

    // Handle calendar, citas and personal
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.calendar = calendar  // Change attribute's value
    this.setState(clone, this.getPersonal)  // Save change (re-render)
  }
  // Errors
  handleBadRequest(response){
    switch(response){
      case 'CRUCE_DE_CITAS':
        alert("Ya hay una cita programada para el personal en la hora indicada, por favor revise o actualice la lista de actividades por personal y escoja otro horario")
        break;
      default: return;
    }
  }
  handleServerError(){
    document.getElementById("cita-close").click()  // Cerrar formulario cita
    document.getElementById('alert-server').style.display = "block"
    document.getElementById('alert-server').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-server'))
        document.getElementById('alert-server').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-server'))
        document.getElementById('alert-server').style.display = "none"
    }, 2700)
  }
  handlePermissionError(){
    // No permission
    document.getElementById("cita-close").click()  // Cerrar formulario cita
    document.getElementById('alert-permission').style.display = "block";
    document.getElementById('alert-permission').classList.remove("fade");
    setTimeout(function(){
      if(document.getElementById('alert-permission'))
        document.getElementById('alert-permission').classList.add("fade");
    }, 2500);
    setTimeout(function(){
      if(document.getElementById('alert-permission'))
        document.getElementById('alert-permission').style.display = "none";
    }, 2700);
    return;
  }
  /* Arrow function
  * When a function is fired for an DOM event, we should declare 'em with arrow function
  * so we can access 'this' class propertie
  */
  getPaciente = e => {
    let dni = e.target.value;  // Get dni
    if(dni.length<8){
      // Reset paciente data
      document.getElementById("pac_pk").value = "";
      document.getElementById("pac_nom_pri").disabled = false;
      document.getElementById("pac_nom_sec").disabled = false;
      document.getElementById("pac_ape_pat").disabled = false;
      document.getElementById("pac_ape_mat").disabled = false;
      document.getElementById("defaultInline1Radio").disabled = false;
      document.getElementById("defaultInline2Radio").disabled = false;
      return;  // if dni is not 8 length
    }else{
      document.getElementById("pac_nom_pri").value = "";
      document.getElementById("pac_nom_sec").value = "";
      document.getElementById("pac_ape_pat").value = "";
      document.getElementById("pac_ape_mat").value = "";
      document.getElementById("pac_celular").value = "";
      document.getElementById("pac_permiso_sms").value = "1";
      document.getElementById("defaultInline1Radio").checked = true;
    }

    let filter = `filtro={"dni":"${dni}"}`;
    let url = process.env.REACT_APP_PROJECT_API+'atencion/paciente/';
    url = url + '?' + filter;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            this.handleBadRequest(response.statusText);
          }
        }
      }, error => {
        this.handleServerError();
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        if(response_obj.length!==1){
          document.getElementById("pac_nom_pri").disabled = false;
          document.getElementById("pac_nom_sec").disabled = false;
          document.getElementById("pac_ape_pat").disabled = false;
          document.getElementById("pac_ape_mat").disabled = false;
          document.getElementById("defaultInline1Radio").disabled = false;
          document.getElementById("defaultInline2Radio").disabled = false;
          return;
        }
        // Set paciente data and disable inputs
        document.getElementById("pac_pk").disabled = true;
        document.getElementById("pac_pk").value = response_obj[0].pk;
        document.getElementById("pac_nom_pri").disabled = true;
        document.getElementById("pac_nom_pri").value = response_obj[0].nombre_principal;
        document.getElementById("pac_nom_sec").disabled = true;
        document.getElementById("pac_nom_sec").value = response_obj[0].nombre_secundario;
        document.getElementById("pac_ape_pat").disabled = true;
        document.getElementById("pac_ape_pat").value = response_obj[0].ape_paterno;
        document.getElementById("pac_ape_mat").disabled = true;
        document.getElementById("pac_ape_mat").value = response_obj[0].ape_materno;
        document.getElementById("pac_celular").value = response_obj[0].celular;
        if(response_obj[0].sexo == '1'){
          document.getElementById("defaultInline1Radio").checked = true;
          document.getElementById("defaultInline1Radio").disabled = true;
          document.getElementById("defaultInline2Radio").disabled = true;
        }else{
          document.getElementById("defaultInline2Radio").checked = true;
          document.getElementById("defaultInline1Radio").disabled = true;
          document.getElementById("defaultInline2Radio").disabled = true;
        }
        if(response_obj[0].permiso_sms){
          document.getElementById("pac_permiso_sms").value = "1";
        }else{
          document.getElementById("pac_permiso_sms").value = "0";

        }
      }
    );
  }
  errorForm = log => {
    document.querySelector('div#alert-login span').innerText = log;
    document.getElementById('alert-login').style.display = "block"
    document.getElementById('alert-login').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-login'))
        document.getElementById('alert-login').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-login'))
        document.getElementById('alert-login').style.display = "none"
    }, 2700)
  }
  cancelCitaForm(){  // Reset values
    // Other values
    document.getElementById("pac_pk").value = "";
    document.getElementById("pac_dni").value = "";
    document.getElementById("date").value = new Date().toDateInputValue();
    document.getElementById("hour").value = "08";
    document.getElementById("minute").value = "00";
    document.getElementById("duracion").value = "15";
    document.getElementById("programado").value = '1';
    window.$("#personal").val([]).trigger("change");  // Set personal to empty
    // Paciente
    document.getElementById("pac_nom_pri").disabled = false;
    document.getElementById("pac_nom_pri").value = "";
    document.getElementById("pac_nom_sec").disabled = false;
    document.getElementById("pac_nom_sec").value = "";
    document.getElementById("pac_ape_pat").disabled = false;
    document.getElementById("pac_ape_pat").value = "";
    document.getElementById("pac_ape_mat").disabled = false;
    document.getElementById("pac_ape_mat").value = "";
    document.getElementById("pac_ape_mat").value = "";
  }
  saveCita = () => {
    // VALIDATIONS FIRST
    // Validate date
    let _fecha = document.getElementById("date").value;
    let now = new Date().toDateInputValue();
    if(_fecha < now){
      // Show form error
      this.errorForm("No se puede programar una cita para días anteriores");
      return;
    }

    // Validate dni & time
    let _dni = document.getElementById("pac_dni").value;
    if(String(parseInt(_dni)).length!==8){
      this.errorForm("El dni no contiene 8 digitos");  // Show form error
      return;  // Skip function
    }
    let _hora = document.getElementById("hour").value;
    console.log(_hora);
    if(_hora<8 || _hora>21){
      this.errorForm("La hora está fuera del horario de trabajo");  // Show form error
      return;  // Skip function
    }
    let _sexo = "";
    if(document.querySelector('input[name="sexo"]:checked') !== null){
        _sexo = document.querySelector('input[name="sexo"]:checked').value;
    }else{
      this.errorForm("Indique el sexo del paciente");  // Show form error
      return;  // Skip function
    }
    // Get PERSONAL
    let personal_ = window.$("#personal").select2('data');
    if(personal_.length===0){
      this.errorForm("Debe seleccionar al menos un personal de atención");
      return;
    }
    let _personal = [];
    let _personal_atencion = "";
    personal_.forEach((personal, inx) => {
      _personal.push(personal.id);

      // Personal name to programado
      let _personal_name = personal.text.split(" -")[0];
      if(inx===personal_.length-1) _personal_atencion+=" y "; else
      if(inx>0) _personal_atencion+=", ";
      _personal_atencion += _personal_name;
    });

    // Get PACIENTE
    let _paciente;  // OBTENER
    if(document.getElementById("pac_pk").value!==""){ // User is known
      _paciente = parseInt(document.getElementById("pac_pk").value); // Set user id
    }else{ // User is not known
      // Validate paciente form
      /* We use regular expression to check there is only letters and spaces
      We also check that it does not start or end with a space
      */
      if(
        // Check if second name is not empty
        document.getElementById("pac_nom_sec").value !== "" &&
        // Check if second name is wrong or is less than 3 characters
        ((/[^a-zA-Z]/).test(document.getElementById("pac_nom_sec").value)
        || document.getElementById("pac_nom_sec").value.length < 3)
      ){
        this.errorForm("El nombre secundario solo pueden contener letras y espacios");
        return;
      }
      // Check the main values
      let reg_expr = (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ ]+[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/);
      if(
        !reg_expr.test(document.getElementById("pac_nom_pri").value) ||
        !reg_expr.test(document.getElementById("pac_ape_pat").value) ||
        !reg_expr.test(document.getElementById("pac_ape_mat").value)
      ){
        this.errorForm("Los apellidos y nombres solo pueden contener letras y espacios, como minimo 3 caracteres");
        return;
      }

      // Get paciente data
      _paciente = {}
      _paciente.dni = _dni;
      _paciente.sexo = _sexo;
      _paciente.nombre_principal = document.getElementById("pac_nom_pri").value;
      _paciente.nombre_secundario = document.getElementById("pac_nom_sec").value;
      _paciente.ape_paterno = document.getElementById("pac_ape_pat").value;
      _paciente.ape_materno = document.getElementById("pac_ape_mat").value;
      _paciente.celular = document.querySelector("#pac_celular").value;
      _paciente.permiso_sms = document.querySelector("#pac_permiso_sms").value;
    }

    // Get META
    let _minutos = document.getElementById("minute").value;
    let _celular = document.querySelector("#pac_celular").value;
    let _permiso_sms = document.querySelector("#pac_permiso_sms").value;
    let _sucursal = this.state.global.current_sucursal_pk;
    let _origen_cita = "3";  // Origen Web #############
    let _estado = "1";  // Cita Pendiente
    // let _indicaciones = "";
    let _programado = document.getElementById("programado").selectedOptions[0].text;
    // Add personal to 'programado'
    if(_personal.length>1) _programado += `\nAtendido por ${_personal_atencion}`;
    let _duracion = document.getElementById("duracion").value;
    let _hora_fin = (()=>{
      let _minres = parseInt(_duracion)+parseInt(_minutos);
      let _temp_hora = parseInt(_hora)+parseInt(_minres/60);
      let _temp_min = _minres%60;
      // Handle more than 24hrs time
      if(_temp_hora>=22 && _temp_min>0) return -1;
      // Fix left zeros
      _temp_hora = String(_temp_hora).length === 1 ? '0'+_temp_hora:_temp_hora;
      _temp_min = String(_temp_min).length === 1 ? '0'+_temp_min:_temp_min;
      return `${_temp_hora}:${_temp_min}`;
    })();  // OBTENER
    if(_hora_fin==-1){  // Handle error in hours
      alert("La hora de finalización no debe exceder el horario de trabajo");
      return;  // Abort function
    }


    // Generate data object
    let data = {};
    data['sucursal'] = _sucursal;
    data['personal_array'] = String(_personal);
    data['fecha'] = _fecha;
    data['hora'] = _hora+":"+_minutos;
    data['hora_fin'] = _hora_fin;
    data['origen_cita'] = _origen_cita;
    data['estado'] = _estado;
    data['celular'] = _celular;
    data['permiso_sms'] = _permiso_sms;
    // data['indicaciones'] = _indicaciones;
    data['programado'] = _programado;
    // Handle paciente
    if(typeof(_paciente)==='number')
      data['paciente'] = _paciente;
    else if(typeof(_paciente)==='object')
      data['paciente_obj'] = _paciente;

    let url = process.env.REACT_APP_PROJECT_API+'atencion/cita/';
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          'Content-Type': 'application/json'  // JSON type
        },
        body: JSON.stringify(data)  // Data
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            reject(response.json());
          }
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok

        handleErrorResponse("custom", "Exito", "La cita fue creada exitosamente", "info");
        document.getElementById("cita-close").click()  // Cerrar formulario cita
        this.getCitas()  // Re render fullcalendar
      },
      error => {
        console.log("ERROR:", error);
        // The next function is a solution to a UB (at least idk what does cause it)
        error.then((er) => {
          if(er.hasOwnProperty("length") && er[0]==="CRUCE_DE_CITAS"){
            //this.handleBadRequest("CRUCE_DE_CITAS");
            handleErrorResponse("custom", "ERROR: ", "Ya hay una cita programada para el personal en la hora indicada, por favor escoja otro horario", "danger")
            return;
          }else{
          handleErrorResponse("custom", "ERROR: ", er.non_field_errors.join(", "), "danger")
          }
        })
        document.getElementById("cita-close").click()  // Cerrar formulario cita
      }
    );
  }
  // Cita detail modal functions
  getEventInfo = (info) => {
    let data = info.event.extendedProps.info;
    let clone = Object.assign({}, this.state);
    clone.selected_cita = data;
    this.setState(clone, ()=>{
      window.$('#modal_ver_cita').modal('show');
      console.log('xxxx2');
    });
  }
  addAttention = (cita) => {
    let url = `/nav/atencion/${cita.pk}/detalle`;
    let data = {
      cita: cita,
    };
    this.redirectTo(url, data);
  }
  addOdontograma = (cita) => {
    let url = `/nav/odontograma/${cita.pk}`;
    let data = {
      cita: cita,
    };
    this.redirectTo(url, data);
  }
  addProcedure = (cita) => {
    let url = `/nav/procedimiento/${cita.pk}/agregar/`;
    let data = {
      cita: cita,
    };
    this.redirectTo(url, data);
  }
  annulCita = (cita_pk, status) => {
    let data = {};
    data['estado'] = status;

    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/anular/${cita_pk}/`;
    // Generate promise
    let result = new Promise((resolve, reject) => {
      // Fetch data to api
      let request = fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          'Content-Type': 'application/json'  // JSON type
        },
        body: JSON.stringify(data)  // Data
      });
      // Once we get response we either return json data or error
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          if(response.status===403){
            this.handlePermissionError();
          }else{
            this.handleBadRequest(response.statusText);
          }
        }
      }, error => {
        this.handleServerError();
      });
    });
    result.then(
      response_obj => {  // In case it's ok
        window.$('#modal_ver_cita').modal('hide');
        console.log('xxxxxxx3');
        alert("Cita anulada",status);
        this.getCitas()  // Re render fullcalendar
      }
    );
  }
  // Global functions
  setFilter = (personal_pk) => {
    let personal_array = this.state.calendar_filter;
    if(personal_array.indexOf(personal_pk)!==-1){  // Personal already exist in calendar filter
      personal_array.splice(personal_array.indexOf(personal_pk),1);  // remove personal filter
    }else{  // Personal does not exist in calendar filter
      personal_array.push(personal_pk);  // add personal filter
    }

    let clone = Object.assign({}, this.state);
    clone.calendar_filter = personal_array;
    this.setState(clone, this.getCitas);
  }

  render(){
    return(
    <>
      {/* ALERTS */}
      <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Error</strong> No se ha podido establecer conexión con el servidor.
      </div>
      <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
      </div>
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal, parece que al programador se le olvidó especificar qué</span>.
      </div>

      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <i className="subheader-icon fal fa-chart-area"></i> Cita
        </h1>
        <FilterPersonal state={this.state} setFilter={this.setFilter} color_personal={this.color_personal} />
      </div>

      {/* FORMULARIO CITA (modal) */}
      <button id="toggleModal" style={{display:"none"}} data-toggle="modal" data-target="#modal-crear_cita"></button>
      <div className="modal fade" id="modal-crear_cita" tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                Programar Cita
              </h2>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i className="fal fa-times"></i></span>
              </button>
            </div>
            {/* FORMULARIO CITA */}
            <div className="modal-body" id="cita-form">
              <SelectPersonal state={this.state} />
              <div className="form-group col-md-12">
                <label className="form-label" htmlFor="paciente">Dni: </label>
                <input type="text" id="pac_dni" name="paciente" required
                  className="form-control form-control-lg" maxLength="8"
                  placeholder="Dni del paciente" onChange={this.getPaciente} />
              </div>
              {/* Paciente */}
              <label className="form-label col-md-12">Paciente: </label>
              <input type="text" id="pac_pk" style={{display:'none'}} defaultValue="" disable="true" />
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_nom_pri" name="pac_nom_pri" className="form-control form-control-lg" placeholder="Nombre Principal" />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_nom_sec" name="pac_nom_sec" className="form-control form-control-lg" placeholder="Nombres secundarios" />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_ape_pat" name="pac_ape_pat" className="form-control form-control-lg" placeholder="Apellido Paterno" />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_ape_mat" name="pac_ape_mat" className="form-control form-control-lg" placeholder="Apellido Materno" />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <div class="frame-wrap" style={{display:'flex', justifyContent:'center'}} id="radio">
                    <div class="custom-control custom-radio custom-control-inline">
                        <input type="radio" value="1" class="custom-control-input" id="defaultInline1Radio" name="sexo" />
                        <label class="custom-control-label" style={{fontSize:'1rem'}} for="defaultInline1Radio">Masculino</label>
                    </div>
                    <div class="custom-control custom-radio custom-control-inline">
                        <input type="radio" value="2" class="custom-control-input" id="defaultInline2Radio" name="sexo" />
                        <label class="custom-control-label" style={{fontSize:'1rem'}} for="defaultInline2Radio">Femenino</label>
                    </div>
                  </div>
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_celular" name="pac_celular" className="form-control form-control-lg" placeholder="Celular" />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <select id="pac_permiso_sms" className="form-control form-control-lg">
                <option value="1" defaultValue>Permitir envío de SMS</option>
                <option value="0">NO Permitir envío de SMS</option>
              </select>
              </div>
              {/* Fin Paciente */}
              <SelectProcedimiento state={this.state} />
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <label className="form-label" htmlFor="date">Fecha: </label>
                <input type="date" id="date" name="date" className="form-control form-control-lg" defaultValue={(new Date().toDateInputValue())} required />
              </div>
              <div className="form-group col-md-3" style={{display:'inline-block'}}>
                <label className="form-label" htmlFor="hour" style={{display:'block'}}>Hora: </label>
                <select id="hour" className="custom-select col-lg-6">
                  <option value="08" defaultValue>8 AM</option>
                  <option value="09">9 AM</option>
                  <option value="10">10 AM</option>
                  <option value="11">11 AM</option>
                  <option value="12">12 PM</option>
                  <option value="13">1 PM</option>
                  <option value="14">2 PM</option>
                  <option value="15">3 PM</option>
                  <option value="16">4 PM</option>
                  <option value="17">5 PM</option>
                  <option value="18">6 PM</option>
                  <option value="19">7 PM</option>
                  <option value="20">8 PM</option>
                  <option value="21">9 PM</option>
                </select>
                <select id="minute" className="custom-select col-lg-6">
                  <option value="00" defaultValue>00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
              <div className="form-group col-md-3" style={{display:'inline-block'}}>
                <label className="form-label" htmlFor="hour" style={{display:'block'}}>Duración aproximada: </label>
                <select id="duracion" className="custom-select form-control">
                  <option value="15" defaultValue>15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                  <option value="120">2 horas</option>
                  <option value="180">3 horas</option>
                  <option value="240">4 horas</option>
                </select>
              </div>
              <div id="alert-login" className="alert bg-danger-400 text-white fade" role="alert" style={{display:'none'}}>
                  <strong>Ups!</strong> <span>Parece que los datos introducidos no son correctos.</span>
              </div>
            </div>
            {/* FIN FORMULARIO CITA */}
            <div className="modal-footer">
              <button type="button" data-dismiss="modal" onClick={this.cancelCitaForm}
                className="btn btn-secondary waves-effect waves-themed" id="cita-close">Cancelar</button>
              <button type="button" onClick={this.saveCita}
                className="btn btn-primary waves-effect waves-themed">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      {/* INFO CITA (modal) */}
      <InfoCita cita={this.state.selected_cita}
        annulCita={this.annulCita}
        addAttention={this.addAttention}
        addOdontograma={this.addOdontograma}
        addProcedure={this.addProcedure} />

      {/* CALENDAR */}
      <div id="calendar">
      </div>
    </>
    )
  }
  componentDidMount(){
    // Fullcalendar Bundle
    if(!document.getElementById('fullcalendar_script')){
      const fullcalendar_script = document.createElement("script");
      fullcalendar_script.async = false;
      fullcalendar_script.id = "fullcalendar_script";
      fullcalendar_script.onload = ()=>this.setCalendar();
      fullcalendar_script.src = "/js/miscellaneous/fullcalendar/fullcalendar.bundle.js";
      document.body.appendChild(fullcalendar_script);
    }else{
      this.setCalendar();
    }

    // Select2 for personal choose in Cita
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
      select2_script.onload = ()=>{
        // Set select2 for personal
        window.$("#personal").select2({
          dropdownParent: window.$("#personal").parent()
        });
      };
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }else{
      // Set select2 for personal
      window.$("#personal").select2({
        dropdownParent: window.$("#personal").parent()
      });
    }

  }
}

/*** COMPONENTS ***/
function FilterPersonal(props){
  const personal = [];  // Declare variable to use
  if(props.state.personal!==false){
    for(let p of props.state.personal){  // Iterate over all sucursales this user has
      // Choose color according personal
      let _inx_personal = props.state.personal.findIndex(_p => _p.pk === p.pk)
      let _color = _inx_personal!==-1 ? props.color_personal[_inx_personal] : "gray";

      personal.push(
        <label
          key={p.pk}
          className="btn btn-light waves-effect waves-themed"
          onClick={()=>props.setFilter(p.pk)}>
            <input key={"input"+p.pk} type="checkbox" />
            <span
            style={{color:_color, fontSize:"1.1em", filter:"contrast(2)"}}>
              <b>{(p.nombre_principal+" "+p.ape_paterno[0]+"."+p.ape_materno[0]+".").toUpperCase()}</b>
            </span>
        </label>
      );
    }
  }
  return (
    <div className="btn-group btn-group-toggle" data-toggle="buttons">
      {personal}
    </div>
  )
}
function SelectPersonal(props){
  const personal = [];  // Declare variable to use
  if(props.state.personal!==false){
    for(let p of props.state.personal){  // Iterate over all sucursales this user has
      personal.push(
        <option key={p.pk} value={p.pk}>
          {p.nombre_principal+" "+p.ape_paterno+" - "+p.especialidad_descripcion}
        </option>
      );
    }
  }
  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor="personal">Personal de atención: </label>
      <select id="personal" className="custom-select form-control custom-select-lg" multiple>
        {personal}
      </select>
    </div>
  )
}
function SelectProcedimiento(props){
  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor="programado">Programado: </label>
      <select id="programado" className="custom-select form-control custom-select-lg">
        <SelectOptions_Procedimiento procedimientos={props.state.procedimiento} />
      </select>
    </div>
  )
}
function InfoCita(props){
  const [annulCita, setAnnulCita] = useState({toCheck: false, show: false});
  useEffect(()=>{  // To call after render
    if(annulCita.show===true){  // Show annulCita modal
      console.log('xxxx1');
      window.$('#modal_ver_cita').data('bs.modal')._config.backdrop = true;
      window.$('#modal_ver_cita').data('bs.modal')._config.keyboard = true;
      window.$('#modal_ver_cita').modal('show');
    }else if(annulCita.toCheck===true){
      /* Confirm annul modal can't close by 'esc' and by clicking backdrop
      window.$('#modal_anular_cita').data('bs.modal')._config.backdrop = 'static';
      window.$('#modal_anular_cita').data('bs.modal')._config.keyboard = false;
      BUG: _config.keyboard = false // Does not work because conflict with mmodal's backdrop
      FIX: hide and show alert modal so _config is set correctly
      */
      /* Hide event
      window.$('#modal_anular_cita').on('hidden.bs.modal', function(){})
      ERROR: this event listener is setted more than once and may cause performance troubles
      */
      window.$('#modal_anular_cita').data('bs.modal')._config.backdrop = 'static';
      window.$('#modal_anular_cita').data('bs.modal')._config.keyboard = false;
      window.$('#modal_anular_cita').modal('hide');
      window.$('#modal_anular_cita').modal('show');

    }
  });

  if(!annulCita.toCheck){  // Regular behavior
    if(!props.cita) return "";
    let _hora = props.cita.hora.slice(0,5);
    _hora += props.cita.hora_fin ? " - "+props.cita.hora_fin.slice(0,5) : "";
    let _pac_nombre = props.cita.paciente_data.nombre_principal;
    _pac_nombre += props.cita.paciente_data.nombre_secundario ? " "+props.cita.paciente_data.nombre_secundario : "";
    _pac_nombre += (" "+props.cita.paciente_data.ape_paterno+" "+props.cita.paciente_data.ape_materno).toUpperCase();
    let _personal = props.cita.personal.nombre_principal;
    _personal += " "+props.cita.personal.ape_paterno;
    _personal += " "+props.cita.personal.ape_materno;
    _personal += " - "+props.cita.personal.especialidad_descripcion;
    let _celular = props.cita.paciente_data.celular ? props.cita.paciente_data.celular : false;
    let _direccion = props.cita.paciente_data.direccion ? props.cita.paciente_data.direccion : false;
    let _indicaciones = props.cita.paciente_data.indicaciones ? props.cita.paciente_data.indicaciones : false;

    function assureAnnul(func, cita_pk, state){  // Assure annul function
      let clone = {};
      clone.toCheck = true;
      clone.show = false;
      clone.callback = func;
      clone.cita_pk = cita_pk;
      clone.state = state;
      console.log(clone);
      setAnnulCita(clone);
    }
    return (
      <div className="modal fade" id="modal_ver_cita" tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title fw-500" style={{fontSize:'2em'}}>
                Información Cita
              </span>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i className="fal fa-times"></i></span>
              </button>
            </div>
            <div className="modal-body" id="cita-info-form">
              <h6>
                <b>Paciente:</b> {_pac_nombre}
              </h6>
              <h6>
                <b>DNI:</b> {props.cita.paciente_data.dni}
              </h6>
              <h6>
                <b>Fecha:</b> {props.cita.fecha}
              </h6>
              <h6>
                <b>Hora:</b> {_hora}
              </h6>
              {_celular ? <h6><b>Celular:</b> {_celular}</h6>:""}
              {_direccion ? <h6><b>Direccion:</b> {_direccion}</h6>:""}
              <h6>
                <b>Personal:</b> {_personal}
              </h6>
              {_indicaciones ? <h6><b>Indicaciones:</b> {_indicaciones}</h6>:""}
              <h6>
                <b>Programado:</b> {props.cita.programado}
              </h6>
              <br/>
            </div>
            <div className="modal-footer">
              {/* Icons */}
              <div className="btn-group">
                <Icon type="attention" onClick={() => props.addAttention(props.cita)} data_dismiss={"modal"}/>
                <Icon type="odontogram" onClick={() => props.addOdontograma(props.cita)} data_dismiss={"modal"}/>
                <Icon type="procedure" onClick={() => props.addProcedure(props.cita)} data_dismiss={"modal"}/>
              </div>
              {/* Estado cita */}
              <div className="btn-group">
                <button className="btn btn-primary waves-effect waves-themed"
                  onClick={()=>assureAnnul(props.annulCita, props.cita.pk, 3)}>Anular cita</button>
                <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split waves-effect waves-themed" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                </button>
                <div className="dropdown-menu">
                  <button className="dropdown-item" data-dismiss="modal"
                    onClick={()=>assureAnnul(props.annulCita, props.cita.pk, 2)}>Anulado por cliente</button>
                  <button className="dropdown-item" data-dismiss="modal"
                    onClick={()=>props.annulCita(props.cita.pk, 4)}>Paciente no se presento</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }else{  // Annul cita
    function annul(){
      let clone = {};
      clone.toCheck = false;
      clone.show = false;
      setAnnulCita(clone);

      // Call annul function (callback)
      annulCita.callback(annulCita.cita_pk, annulCita.state);
    }
    function cancelAnnul(){
      let clone = Object.assign({}, annulCita);
      clone.toCheck = false;
      clone.show = true;
      setAnnulCita(clone);
    }
    return (
      <div className="modal modal-alert show" id="modal_anular_cita" tabIndex="-1" role="dialog" style={{display: "block", paddingRight: "15px"}} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Anular cita</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={()=>cancelAnnul()}>
                <span aria-hidden="true"><i className="fal fa-times"></i></span>
              </button>
            </div>
            <div className="modal-body">
              Esta seguro que quiere anular la cita?
            </div>
            <div className="modal-footer">
              <button type="button" data-dismiss="modal"
                className="btn btn-secondary waves-effect waves-themed"
                onClick={()=>cancelAnnul()}>Cancelar</button>
              <button type="button" data-dismiss="modal"
                className="btn btn-primary waves-effect waves-themed"
                onClick={()=>annul()}>Anular</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

/* NOTES
Child components that receive props from parent component should append the data
  with 'UNSAFE_componentWillReceiveProps' function
  https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change
  https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
*/

export default Cita;
// eslint-disable-next-line react-hooks/exhaustive-deps
