import React from 'react';
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
      personal: false,  // This work the same as this.state.calendar
      global: props.state,  // This is only setted first time this component is rendered
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps){
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.global = nextProps.state  // Change attribute's value

    // Save change (re-render)
    // Shall we re render calendar?
    if(this.state.global.current_sucursal_pk!==nextProps.state.current_sucursal_pk){
      this.setState(clone, this.getCitas)  // Re render calendar
    }else{  // Something else has changed
      this.setState(clone)  // Only update this.state
    }
  }
  getCitas(){
    // HTTP REQUEST
    // Add filter to url
    let xhr = new XMLHttpRequest();
    let _filter = `filtro={"sucursal":"${this.state.global.current_sucursal_pk}"}`;
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
      console.log(response_object);

      let clone = Object.assign({}, this.state);
      clone.personal = response_object;
      this.setState(clone);
    }
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send();  // Send request
  }
  handleCitaResponse(xhr){
    xhr = xhr.target;
    if(xhr.status===403){this.handlePermissionError();return;}
    if(xhr.status===400){this.handleServerError();return;}
    if(xhr.status===500){this.handleServerError();return;}

    // Convert response to json object
    const response_object = JSON.parse(xhr.response);

    // Get this calendar
    let _calendar = this.state.calendar;
    _calendar.removeAllEvents()  // Remove current events in fullcalendar
    response_object.forEach((v) => {
      let _data = {};
      _data.title = "Paciente: "+v.paciente_data.nombre_principal;
      _data.start = v.fecha+"T"+v.hora;
      _data.end = v.fecha+"T"+v.hora_fin;
      let _color = "gray";
      switch(v.estado){
        case '1': _color = "lightblue"; break;
        case '2': _color = "tomato"; break;
        case '3': _color = "purple"; break;
        case '4': _color = "gray"; break;
        case '5': _color = "green"; break;
      }
      _data.color = _color;
      _calendar.addEvent(_data)  // Add data to fullcalendar
    });
    _calendar.render();
  }
  handleBadRequest(xhr){
    let response = JSON.parse(xhr.responseText)
    console.log(response);
    if(typeof(response)==="object"){  // Response is object/array
      if(response.length===1){  // Error code
        switch(response[0]){
          case 'CRUCE_DE_CITAS':
            alert("Ya hay una cita programada para el personal en la hora indicada, por favor revise la lista de actividades por personal y escoja otro horario")
            break;
          default: return;
        }
      }
      // Indicate the error field in cita form
    }
  }
  handleServerError(){
    document.querySelector("#cita-close").click()  // Cerrar formulario cita
    document.querySelector('div#alert-server').style.display = "block"
    document.querySelector('div#alert-server').classList.remove("fade")
    setTimeout(function(){
      document.querySelector('div#alert-server').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      document.querySelector('div#alert-server').style.display = "none"
    }, 2700)
  }
  handlePermissionError(){  // No permission
    document.querySelector("#cita-close").click()  // Cerrar formulario cita
    document.querySelector('div#alert-permission').style.display = "block";
    document.querySelector('div#alert-permission').classList.remove("fade");
    setTimeout(function(){
      document.querySelector('div#alert-permission').classList.add("fade");
    }, 2500);
    setTimeout(function(){
      document.querySelector('div#alert-permission').style.display = "none";
    }, 2700);
    return;
  }
  getPaciente(dni){  // dni value
    if(dni.length<8){
      // Reset paciente data
      document.querySelector("#pac_pk").value = "";
      document.querySelector("#pac_nom_pri").disabled = false;
      document.querySelector("#pac_nom_sec").disabled = false;
      document.querySelector("#pac_ape_pat").disabled = false;
      document.querySelector("#pac_ape_mat").disabled = false;
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
        document.querySelector("#pac_nom_pri").disabled = false;
        document.querySelector("#pac_nom_sec").disabled = false;
        document.querySelector("#pac_ape_pat").disabled = false;
        document.querySelector("#pac_ape_mat").disabled = false;
        return;
      }
      // Set paciente data and disable inputs
      document.querySelector("#pac_pk").disabled = true;
      document.querySelector("#pac_pk").value = response_object[0].pk;
      document.querySelector("#pac_nom_pri").disabled = true;
      document.querySelector("#pac_nom_pri").value = response_object[0].nombre_principal;
      document.querySelector("#pac_nom_sec").disabled = true;
      document.querySelector("#pac_nom_sec").value = response_object[0].nombre_secundario;
      document.querySelector("#pac_ape_pat").disabled = true;
      document.querySelector("#pac_ape_pat").value = response_object[0].ape_paterno;
      document.querySelector("#pac_ape_mat").disabled = true;
      document.querySelector("#pac_ape_mat").value = response_object[0].ape_materno;
    }
    xhr.onerror = this.handleServerError;
    xhr.send();  // Send request
  }
  saveCita = () => {
    // VALIDATIONS FIRST
    // Validate date
    let _fecha = document.querySelector("#date").value;
    let now = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
    if(_fecha < now.toJSON().slice(0,10)){
      // Show form error
      this.errorForm("No se puede programar una cita para días anteriores");
      return;
    }

    // Validate dni & time
    let _dni = document.querySelector("#pac_dni").value;
    if(String(parseInt(_dni)).length!==8){
      this.errorForm("El dni no contiene 8 digitos");  // Show form error
      return;  // Skip function
    }
    let _hora = document.querySelector("#hour").value;
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
    personal_.forEach((personal) => {
      _personal.push(personal.id);
    });

    // Get PACIENTE
    let _paciente;  // OBTENER
    if(document.querySelector("#pac_pk").value!==""){ // User is known
      _paciente = parseInt(document.querySelector("#pac_pk").value); // Set user id
    }else{ // User is not known
      // Validate paciente form
      /* We use regular expression to check there is only letters and spaces
      We also check that it does not start or end with a space
      */
      if(
        // Check if second name is not empty
        document.querySelector("#pac_nom_sec").value !== "" &&
        // Check if second name is wrong or is less than 3 characters
        ((/[^a-zA-Z]/).test(document.querySelector("#pac_nom_sec").value)
        || document.querySelector("#pac_nom_sec").value.length < 3)
      ){
        this.errorForm("El nombre secundario solo pueden contener letras y espacios");
        return;
      }
      // Check the main values
      let reg_expr = (/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/);
      if(
        !reg_expr.test(document.querySelector("#pac_nom_pri").value) ||
        !reg_expr.test(document.querySelector("#pac_ape_pat").value) ||
        !reg_expr.test(document.querySelector("#pac_ape_mat").value)
      ){
        this.errorForm("Los apellidos y nombres solo pueden contener letras y espacios, como minimo 3 caracteres");
        return;
      }

      // Get paciente data
      _paciente = {}
      _paciente.dni = _dni;
      _paciente.sexo = "1";
      _paciente.nombre_principal = document.querySelector("#pac_nom_pri").value;
      _paciente.nombre_secundario = document.querySelector("#pac_nom_sec").value;
      _paciente.ape_paterno = document.querySelector("#pac_ape_pat").value;
      _paciente.ape_materno = document.querySelector("#pac_ape_mat").value;
      // _paciente.sexo = document.querySelector("#pac_genre").value;
      // _paciente.celular = document.querySelector("#pac_celular").value;
    }
    console.log(_paciente);

    // Get META
    let _minutos = document.querySelector("#minute").value;
    let _sucursal = this.state.global.current_sucursal_pk;
    let _origen_cita = "3";  // Origen Web #############
    let _estado = "1";  // Cita Pendiente
    // let _indicaciones = "";
    let _programado = document.querySelector("#programado").value;
    let _duracion = document.querySelector("#duracion").value;
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
    console.log(data);

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
      // Reset values
      (()=>{
        // Other values
        document.querySelector("#pac_pk").value = "";
        document.querySelector("#dni").value = "";
        document.querySelector("#fecha").value = "";
        document.querySelector("#hora").value = "";
        document.querySelector("#minuto").value = "";
        document.querySelector("#duracion").value = "";
        document.querySelector("#programado").value = "Consulta regular";
        window.$("#personal").empty().trigger("change");
        // Paciente
        document.querySelector("#pac_nom_pri").disabled = false;
        document.querySelector("#pac_nom_pri").value = "";
        document.querySelector("#pac_nom_sec").disabled = false;
        document.querySelector("#pac_nom_sec").value = "";
        document.querySelector("#pac_ape_pat").disabled = false;
        document.querySelector("#pac_ape_pat").value = "";
        document.querySelector("#pac_ape_mat").disabled = false;
        document.querySelector("#pac_ape_mat").value = "";
        document.querySelector("#pac_ape_mat").value = "";
      })()

      document.querySelector("#cita-close").click()  // Cerrar formulario cita
      this.getCitas()  // Re render fullcalendar
    };
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send(JSON.stringify(data));  // Send request
  }
  errorForm(log){
    document.querySelector('div#alert-login span').innerText = log;
    document.querySelector('div#alert-login').style.display = "block"
    document.querySelector('div#alert-login').classList.remove("fade")
    setTimeout(function(){
      document.querySelector('div#alert-login').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      document.querySelector('div#alert-login').style.display = "none"
    }, 2700)
  }

  render(){
    return(
      <>
      {/* alerts */}
      <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Error</strong> No se ha podido establecer conexión con el servidor.
      </div>
      <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
      </div>
      {/* end alerts */}
      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <i className="subheader-icon fal fa-chart-area"></i> Cita <span className="fw-300">Dashboard</span>
        </h1>
      </div>
      {/* FORMULARIO CITA */}
      <button id="toggleModal" style={{display:"none"}} data-toggle="modal" data-target="#modal-center"></button>
      <div className="modal fade" id="modal-center" tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
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
                <input type="text" id="pac_dni" name="paciente" className="form-control form-control-lg" placeholder="Dni del paciente" maxLength="8" required  onChange={(e)=>this.getPaciente(e.target.value)} />
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
              <div className="form-group col-md-12">
                <label className="form-label" htmlFor="simpleinput">Programado</label>
                <input type="text" id="programado" className="form-control form-control-lg" defaultValue="Consulta regular" />
              </div>
              <div id="alert-login" className="alert bg-danger-400 text-white fade" role="alert" style={{display:'none'}}>
                  <strong>Ups!</strong> <span>Parece que los datos introducidos no son correctos.</span>
              </div>
            </div>
            {/* FIN FORMULARIO CITA */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary waves-effect waves-themed" data-dismiss="modal" id="cita-close">Cancelar</button>
              <button type="button" className="btn btn-primary waves-effect waves-themed" onClick={this.saveCita}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
      {/* CALENDAR */}
      <div id="calendar">
      </div>
      </>
    )
  }
  componentDidMount(){
    // Create calendar object
    let calendarEl = document.querySelector('#calendar');
    let calendar = new Calendar(calendarEl, {
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
      plugins: [ timeGridPlugin, listPlugin ],
      header: {
        left: 'prev,next today addEventButton',
        center: 'title',
        right: 'timeGridWeek,timeGridDay,listWeek'
      },
      navLinks: true, // can click day/week names to navigate views
      editable: false,  // Not editable
      eventLimit: true, // allow "more" link when too many events
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
    this.setState(clone)  // Save change (re-render)
    this.getCitas();
    this.getPersonal();

    // Set select2 for personal
    window.$("#personal").select2({
      dropdownParent: window.$("#personal").parent()
    });
  }
}

/*** COMPONENTS ***/
function SelectPersonal(props){
  const personal = [];  // Declare variable to use
  if(props.state.personal!==false){
    for(let p of props.state.personal){  // Iterate over all sucursales this user has
      personal.push(
        <option key={p.pk}
        value={p.pk}>
        {p.nombre_principal+" "+p.ape_paterno+" - "+p.especialidad_descripcion}
        </option>
      );
    }
  }
  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor="personal">Personal de atención: </label>
      <select id="personal" className="custom-select form-control" multiple>
        {personal}
      </select>
    </div>
  )
}


/* NOTES
Child components that receive props from parent component should append the data
  with 'UNSAFE_componentWillReceiveProps' function
  https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change
  https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
*/


/* EXPORT CITA */
export default Cita;
