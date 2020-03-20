import React, { useState, useEffect } from 'react';
// Calendar components
import { Calendar } from '@fullcalendar/core';  // Class
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';
import listPlugin from '@fullcalendar/list';
import './fullcalendar.bundle.css'


/* We use extended class of React.Component instead of function components
    because we'll need to use componentDidMount function
*/
class Cita extends React.Component {
  constructor(props){
    super();
    this.state = {
      calendar: false,
      personal: false,
      procedimiento: false,
      selected_cita: false,  // Cita shown in Cita info modal
      calendar_filter: [],
      global: props.state,  // This is only setted first time this component is rendered
    }
    this.color_personal = [
      "#6e4e9e", "#179c8e", "#51adf6", "#ffb20e", "#fc077a", "#363636"
    ];
    this.redirectTo = props.redirectTo;
  }
  UNSAFE_componentWillReceiveProps(nextProps){
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.global = nextProps.state  // Change attribute's value

    // Save change (re-render)
    // Shall we re render calendar?
    if(this.state.global.current_sucursal_pk!==nextProps.state.current_sucursal_pk){  // Sucursal has changed
      if(!this.state.calendar)  // First execution calendar == false so not render calendar
        this.setState(clone, this.getProcedimiento)  // Get procedimientos according new sucursal
      else
        this.setState(clone, this.getCitas)  // Re render calendar
    }else{  // Something else has changed
      this.setState(clone)  // Only update this.state
    }
  }
  // This.props functions
  getPersonal(){
    // HTTP REQUEST
    // Add filter to url
    let xhr = new XMLHttpRequest();
    let _filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
    let _url = process.env.REACT_APP_PROJECT_API+'maestro/empresa/personal/';
    let url = _url + '?' + _filter;
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    /* We use arrow function instead of memory function declaration to avoid
      problems with two 'this' objects inside the called function
    */
    xhr.onload = (xhr) => {
      xhr = xhr.target;
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===400){this.handleServerError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      // Convert response to json object
      const response_object = JSON.parse(xhr.response);

      let clone = Object.assign({}, this.state);
      clone.personal = response_object;
      this.setState(clone, this.getCitas);  // Render citas after personal is setted
    }
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send();  // Send request
  }
  getCitas(){
    // HTTP REQUEST
    // Add filter to url
    let xhr = new XMLHttpRequest();
    let _filter = ``;  // Filtro

    // Personal filter for cita calendar
    if(this.state.calendar_filter.length!==0){
      _filter = `filtro={
        "sucursal":"${this.state.global.current_sucursal_pk}",
        "estado":"1",
        "personal":"${String(this.state.calendar_filter)}"
      }`;
    }else{  // Regular filter
      _filter = `filtro={
        "sucursal":"${this.state.global.current_sucursal_pk}",
        "estado":"1"
      }`;
    }

    let _url = process.env.REACT_APP_PROJECT_API+'atencion/cita/';
    let url = _url + '?' + _filter;
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    /* We use arrow function instead of memory function declaration to avoid
      problems with two 'this' objects inside the called function
    */
    xhr.onload = (xhr)=>this.handleCitaResponse(xhr);
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send();  // Send request
  }
  handleCitaResponse(xhr){
    xhr = xhr.target;
    if(xhr.status===403){this.handlePermissionError();return;}
    if(xhr.status===400){this.handleServerError();return;}
    if(xhr.status===500){this.handleServerError();return;}

    // Call sucursal's procedimientos
    this.getProcedimiento();

    // Convert response to json object
    const response_object = JSON.parse(xhr.response);
    console.log(response_object);

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
  getProcedimiento(){
    let xhr = new XMLHttpRequest();
    let _filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
    let _url = process.env.REACT_APP_PROJECT_API+'maestro/procedimiento/precio/';
    let url = _url + '?' + _filter;
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.onload = (xhr) => {
      xhr = xhr.target;
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===400){this.handleServerError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      // Convert response to json object
      const response_object = JSON.parse(xhr.response);
      if(response_object.length<1) return;

      // Save in this.state
      let clone = Object.assign({}, this.state);
      clone.procedimiento = response_object
      this.setState(clone);
    }
    xhr.onerror = this.handleServerError;
    xhr.send();  // Send request
  }
  // Errors
  handleBadRequest(xhr){
    let response = JSON.parse(xhr.responseText)
    console.log(response);
    if(typeof(response)==="object"){  // Response is object/array
      if(response.length===1){  // Error code
        switch(response[0]){
          case 'CRUCE_DE_CITAS':
            alert("Ya hay una cita programada para el personal en la hora indicada, por favor revise o actualice la lista de actividades por personal y escoja otro horario")
            break;
          default: return;
        }
      }
      // Indicate the error field in cita form
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
  // Cita functions, arrow function type so we can access to its properties
  getPaciente = (e) => {
    let dni = e.target.value;  // Get dni
    if(dni.length<8){
      // Reset paciente data
      document.getElementById("pac_pk").value = "";
      document.getElementById("pac_nom_pri").disabled = false;
      document.getElementById("pac_nom_sec").disabled = false;
      document.getElementById("pac_ape_pat").disabled = false;
      document.getElementById("pac_ape_mat").disabled = false;
      return;  // if dni is not 8 length
    }

    let xhr = new XMLHttpRequest();
    /* To pass data to GET type requests we send it through url
    */
    // Add filter to url
    let _filter = `filtro={"dni":"${dni}"}`;
    let _url = process.env.REACT_APP_PROJECT_API+'atencion/paciente/';
    let url = _url + '?' + _filter;
    xhr.open('GET', url);
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = (xhr)=>{
      xhr = xhr.target
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}
      const response_object = JSON.parse(xhr.response);
      if(response_object.length!==1){
        document.getElementById("pac_nom_pri").disabled = false;
        document.getElementById("pac_nom_sec").disabled = false;
        document.getElementById("pac_ape_pat").disabled = false;
        document.getElementById("pac_ape_mat").disabled = false;
        return;
      }
      // Set paciente data and disable inputs
      document.getElementById("pac_pk").disabled = true;
      document.getElementById("pac_pk").value = response_object[0].pk;
      document.getElementById("pac_nom_pri").disabled = true;
      document.getElementById("pac_nom_pri").value = response_object[0].nombre_principal;
      document.getElementById("pac_nom_sec").disabled = true;
      document.getElementById("pac_nom_sec").value = response_object[0].nombre_secundario;
      document.getElementById("pac_ape_pat").disabled = true;
      document.getElementById("pac_ape_pat").value = response_object[0].ape_paterno;
      document.getElementById("pac_ape_mat").disabled = true;
      document.getElementById("pac_ape_mat").value = response_object[0].ape_materno;
    }
    xhr.onerror = this.handleServerError;
    xhr.send();  // Send request
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
  cancelCitaForm = () => {  // Reset values
    // Other values
    document.getElementById("pac_pk").value = "";
    document.getElementById("pac_dni").value = "";
    document.getElementById("date").value = "";
    document.getElementById("hour").value = "08";
    document.getElementById("minute").value = "00";
    document.getElementById("duracion").value = "15";
    document.getElementById("programado").value = '1';
    window.$("#personal").empty().trigger("change");  // Set personal to empty
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
    let now = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
    if(_fecha < now.toJSON().slice(0,10)){
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
    if(_hora<8 || _hora>21){
      this.errorForm("La hora está fuera del horario de trabajo");  // Show form error
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
      let reg_expr = (/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/);
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
      _paciente.sexo = "1";
      _paciente.nombre_principal = document.getElementById("pac_nom_pri").value;
      _paciente.nombre_secundario = document.getElementById("pac_nom_sec").value;
      _paciente.ape_paterno = document.getElementById("pac_ape_pat").value;
      _paciente.ape_materno = document.getElementById("pac_ape_mat").value;
      // _paciente.sexo = document.querySelector("#pac_genre").value;
      // _paciente.celular = document.querySelector("#pac_celular").value;
    }

    // Get META
    let _minutos = document.getElementById("minute").value;
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
      // Fix left zeros
      _temp_hora = String(_temp_hora).length === 1 ? '0'+_temp_hora:_temp_hora;
      _temp_min = String(_temp_min).length === 1 ? '0'+_temp_min:_temp_min;
      return `${_temp_hora}:${_temp_min}`;
    })();  // OBTENER


    // Generate data object
    let data = {};
    data['sucursal'] = _sucursal;
    data['personal_array'] = String(_personal);
    data['fecha'] = _fecha;
    data['hora'] = _hora+":"+_minutos;
    data['hora_fin'] = _hora_fin;
    data['origen_cita'] = _origen_cita;
    data['estado'] = _estado;
    // data['indicaciones'] = _indicaciones;
    data['programado'] = _programado;
    // Handle paciente
    if(typeof(_paciente)==='number')
      data['paciente'] = _paciente;
    else if(typeof(_paciente)==='object')
      data['paciente_obj'] = _paciente;

    // Send data to create cita
    let xhr = new XMLHttpRequest();
    xhr.open('POST', process.env.REACT_APP_PROJECT_API+'atencion/cita/');
    // Json type content 'cuz we may send paciente data object
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.onload = (xhr)=>{
      xhr = xhr.target
      if(xhr.status===400){this.handleBadRequest(xhr);return;}
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      // Error disposition personal&date&hour
      if(xhr.statusText!=="Created"){
        alert("IDK")
      }
      alert("Cita creada exitosamente");

      document.getElementById("cita-close").click()  // Cerrar formulario cita
      this.getCitas()  // Re render fullcalendar
    };
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send(JSON.stringify(data));  // Send request
  }
  // Cita detail modal functions
  getEventInfo = (info) => {
    let data = info.event.extendedProps.info;
    let clone = Object.assign({}, this.state);
    clone.selected_cita = data;
    this.setState(clone, ()=>{
      window.$('#modal_ver_cita').modal('show');
    });
  }
  addOdontograma = (cita_pk) => {
    let url = "/nav/odontograma";
    let data = {
      cita_pk: cita_pk,
    };
    this.redirectTo(url, data);
  }
  addProcedure = (cita_pk) => {
    let url = "/nav/procedimiento";
    let data = {
      cita_pk: cita_pk,
    };
    this.redirectTo(url, data);
  }
  annulCita = (cita_pk, status) => {
    let data = {};
    data['estado'] = status;
    // Send data to create cita
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', process.env.REACT_APP_PROJECT_API+`atencion/cita/anular/${cita_pk}/`);
    // Json type content 'cuz we may send paciente data object
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.onload = (xhr)=>{
      xhr = xhr.target
      if(xhr.status===400){this.handleBadRequest(xhr);return;}
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      window.$('#modal_ver_cita').modal('hide');
      alert("Cita anulada",status);
      this.getCitas()  // Re render fullcalendar
    };
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send(JSON.stringify(data));  // Send request
  }
  finishCita = (cita_pk) => {
    let data = {};
    data['estado'] = '5';
    // Send data to create cita
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', process.env.REACT_APP_PROJECT_API+`atencion/cita/anular/${cita_pk}/`);
    // Json type content 'cuz we may send paciente data object
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.onload = (xhr)=>{
      xhr = xhr.target
      if(xhr.status===400){this.handleBadRequest(xhr);return;}
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      window.$('#modal_ver_cita').modal('hide');
      alert("Cita finalizada");
      this.getCitas()  // Re render fullcalendar
    };
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send(JSON.stringify(data));  // Send request
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
    // console.log(this.state);  // Test this.state rendered
    return(
    <>
      {/* ALERTS */}
      <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Error</strong> No se ha podido establecer conexión con el servidor.
      </div>
      <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
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
              {/* Fin Paciente */}
              <SelectProcedimiento state={this.state} />
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <label className="form-label" htmlFor="date">Fecha: </label>
                <input type="date" id="date" name="date" className="form-control form-control-lg" required />
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
        finishCita={this.finishCita}
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
    const fullcalendar_script = document.createElement("script");
    fullcalendar_script.async = false;
    fullcalendar_script.onload = ()=>{
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
          left: 'prev,next today addEventButton',
          center: 'title',
          right: 'timeGridWeek,timeGridDay,listWeek'
        },
        navLinks: true, // can click day/week names to navigate views
        editable: false,  // Not editable
        eventLimit: true, // allow "more" link when too many events
        eventClick: this.getEventInfo,
        customButtons: {
          addEventButton: {  // Add Cita
            text: '+',
            click: function(){
              document.querySelector('button#toggleModal').click()
            }
          }
        },
        eventColor: 'tomato',  // Default event color
      });

      // Handle calendar, citas and personal
      let clone = Object.assign({}, this.state)  // Clone this.state object
      clone.calendar = calendar  // Change attribute's value
      this.setState(clone, this.getPersonal)  // Save change (re-render)
    };
    fullcalendar_script.src = "/js/miscellaneous/fullcalendar/fullcalendar.bundle.js";
    document.body.appendChild(fullcalendar_script);

    // Select2 for personal choose in Cita
    // CSS
    const select2_link = document.createElement("link");
    select2_link.rel = "stylesheet";
    select2_link.media = "screen, print";
    select2_link.href = "/css/formplugins/select2/select2.bundle.css";
    document.head.appendChild(select2_link);
    // JS
    const select2_script = document.createElement("script");
    select2_script.async = false;
    select2_script.onload = ()=>{
      // Set select2 for personal
      window.$("#personal").select2({
        dropdownParent: window.$("#personal").parent()
      });
    };
    select2_script.src = "/js/formplugins/select2/select2.bundle.js";
    document.body.appendChild(select2_script);

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
          className="btn btn-primary waves-effect waves-themed"
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
  const procedimiento = [];
  let CONSULTA_REGULAR = 1;  // DB consulta regular regiter's pk
  if(props.state.procedimiento!==false){
    for(let p of props.state.procedimiento){
      // Consulta
      if(p.procedimiento_data.pk === CONSULTA_REGULAR){
        procedimiento.push(
          <option key={CONSULTA_REGULAR} value={CONSULTA_REGULAR} defaultValue>
            CONSULTA REGULAR
          </option>
        )
        continue;
      }
      // Regular execution
      procedimiento.push(
        <option key={p.procedimiento_data.pk} value={p.procedimiento_data.pk}>
          {p.procedimiento_data.nombre.toUpperCase()}
        </option>
      );
    }
  }
  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor="programado">Programado: </label>
      <select id="programado" className="custom-select form-control custom-select-lg">
        {procedimiento}
      </select>
    </div>
  )
}
function InfoCita(props){
  const [annulCita, setAnnulCita] = useState({toCheck: false, show: false});
  useEffect(()=>{  // To call after render
    if(annulCita.show===true){  // Show annulCita modal
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
    _pac_nombre += props.cita.paciente_data.nombre_secundario ? " "+props.cita.paciente_data.nombre_secundario : " ";
    _pac_nombre += (props.cita.paciente_data.ape_paterno+" "+props.cita.paciente_data.ape_materno).toUpperCase();
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
              {/* Odontograma */}
              <div className="btn-group">
                <a onClick={()=>props.addOdontograma(props.cita.pk)}
                  title="Odontograma" data-dismiss="modal"
                  className="btn btn-warning btn-icon rounded-circle waves-effect waves-themed"
                  style={{margin: "0 4px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14" role="img" viewBox="0 0 448 512" style={{width: "60%"}}>
                      <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
                    </svg>
                </a>
                <a onClick={()=>props.addProcedure(props.cita.pk)}
                  title="Procedimiento Odontologico" data-dismiss="modal"
                  className="btn btn-warning btn-icon rounded-circle waves-effect waves-themed"
                  style={{margin: "0 4px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-medical" className="svg-inline--fa fa-file-medical fa-w-12" role="img" viewBox="0 0 384 512" style={{width: "60%"}}>
                      <path fill="currentColor" d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 160v48c0 4.4-3.6 8-8 8h-56v56c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-56h-56c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h56v-56c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v56h56c4.4 0 8 3.6 8 8z"/>
                    </svg>
                </a>
              </div>
              {/* Estado cita */}
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-primary waves-effect waves-themed"
                  onClick={()=>props.finishCita(props.cita.pk)}>
                  Concluir
                </button>
                <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split waves-effect waves-themed" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                </button>
                <div className="dropdown-menu">
                  <a className="dropdown-item"
                    onClick={()=>assureAnnul(props.annulCita, props.cita.pk, 3)}>Anular cita</a>
                  <a className="dropdown-item"
                    onClick={()=>assureAnnul(props.annulCita, props.cita.pk, 2)}>Anulado por cliente</a>
                  <a className="dropdown-item"
                    onClick={()=>props.annulCita(props.cita.pk, 4)}>Paciente no se presento</a>
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


/* EXPORT CITA */
export default Cita;
