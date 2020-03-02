import React from 'react';
// Calendar components
import { Calendar } from '@fullcalendar/core';  // Class
import timeGridPlugin from '@fullcalendar/timegrid';
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
      user_id: props.state.user_id,
      sucursal_id: props.state.sucursal_id,
    }
  }
  getCitas(){
    // HTTP REQUEST
    // Add filter to url
    let xhr = new XMLHttpRequest();
    let _filter = `filtro={"sucursal":"${this.state.sucursal_id[0]}"}`;
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
    if(xhr.status===500){this.handleServerError();return;}
    // Convert response to json object
    console.log(this.state.calendar);
    const response_object = JSON.parse(xhr.response);
    // Get this calendar
    let _calendar = this.state.calendar;
    _calendar.removeAllEvents()  // Remove current events in fullcalendar
    console.log(response_object);
    response_object.forEach((v) => {
      let _data = {};
      _data.title = "Paciente: "+v.paciente.nombre_principal
      +' '+ v.paciente.ape_paterno + '\n' + 'Doctor: ' +
      v.personal.nombre_principal +' '+ v.personal.ape_paterno;
      _data.start = v.fecha+"T"+v.hora;
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
      document.querySelector("#pac_nom_pri").value = "";
      document.querySelector("#pac_nom_sec").value = "";
      document.querySelector("#pac_ape_pat").value = "";
      document.querySelector("#pac_ape_mat").value = "";
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
      if(response_object.length!==1) return
      // Get paciente data
      document.querySelector("#pac_nom_pri").value = response_object[0].nombre_principal;
      document.querySelector("#pac_nom_sec").value = response_object[0].nombre_secundario;
      document.querySelector("#pac_ape_pat").value = response_object[0].ape_paterno;
      document.querySelector("#pac_ape_mat").value = response_object[0].ape_materno;
    }
    xhr.onerror = this.handleServerError;
    xhr.send();  // Send request
  }
  saveCita(){
    let _sucursal = "1";  // Get SUCURSAL ###
    let _origen_cita = "3";  // Origen Web
    let _estado = "1";  // Cita Pendiente ###
    let _indicaciones = "";
    let _programado = "";
    /* 'paciente' 'personal' */
    let _dni = document.querySelector("#pac_dni").value;
    let _paciente = '1';  // Obtener
    let _fecha = document.querySelector("#date").value;
    let _hora = document.querySelector("#hour").value;
    let _minute = document.querySelector("#minute").value;
    // Validate dni & time
    if( String(parseInt(_dni)).length!==8 || _hora<8 || _hora>21 ){
      this.errorForm();  // Show form error
      return;  // Skip function
    }
    // Generate data object
    let data = new FormData();
    data.append("sucursal", _sucursal);
    data.append("paciente", _paciente);  // PACIENTE
    data.append("personal", this.state.user_id);
    data.append("fecha", _fecha);
    data.append("hora", _hora+":"+_minute);
    data.append("origen_cita", _origen_cita);
    data.append("estado", _estado);
    data.append("indicaciones", _indicaciones);
    data.append("programado", _programado);
    // Send data to create cita
    let xhr = new XMLHttpRequest();
    xhr.open('POST', process.env.REACT_APP_PROJECT_API+'atencion/cita/');
    // xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'));
    xhr.onload = (xhr)=>{
      xhr = xhr.target
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}
      const response_object = JSON.parse(xhr.response);
      console.log(response_object);
      // if(response_object.length!==1) return
      document.querySelector("#cita-close").click()  // Cerrar formulario cita
      // Re render fullcalendar
      this.getCitas()
    };
    xhr.onerror = this.handleServerError;  // Receive server error
    xhr.send(data);  // Send request
  }
  errorForm(){
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
        <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
            <strong>Error</strong> No se ha podido establecer conexión con el servidor.
        </div>
        <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
            <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
        </div>
      <div className="subheader">
        <h1 className="subheader-title">
          <i className="subheader-icon fal fa-chart-area"></i> Cita <span className="fw-300">Dashboard</span>
        </h1>
      </div>
      <button id="toggleModal" style={{display:"none"}} data-toggle="modal" data-target="#default-example-modal-center"></button>
      <div className="modal fade" id="default-example-modal-center" tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                Programar Cita
              </h2>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"><i className="fal fa-times"></i></span>
              </button>
            </div>
            <div className="modal-body" id="cita-form"> {/* FORMULARIO CITA */}
              <div className="form-group">
                <label className="form-label" htmlFor="paciente">Dni: </label>
                <input type="text" id="pac_dni" name="paciente" className="form-control form-control-lg" placeholder="Dni del paciente" maxLength="8" required  onChange={(e)=>this.getPaciente(e.target.value)} />
              </div>
              {/* Paciente */}
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_nom_pri" name="pac_nom_pri" className="form-control form-control-lg" placeholder="Nombre Principal" disabled />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_nom_sec" name="pac_nom_sec" className="form-control form-control-lg" placeholder="Nombres secundarios" disabled />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_ape_pat" name="pac_ape_pat" className="form-control form-control-lg" placeholder="Apellido Paterno" disabled />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <input type="text" id="pac_ape_mat" name="pac_ape_mat" className="form-control form-control-lg" placeholder="Apellido Materno" disabled />
              </div>
              {/* Fin Paciente */}
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <label className="form-label" htmlFor="date">Fecha: </label>
                <input type="date" id="date" name="date" className="form-control form-control-lg" required />
              </div>
              <div className="form-group col-md-6" style={{display:'inline-block'}}>
                <div className="col-md-6" style={{display:'inline-block'}}>
                  <input className="form-control" id="hour" type="number" min="8" max="21"/>
                </div>
                <div className="col-md-6" style={{display:'inline-block'}}>
                  <select id="minute" className="custom-select form-control">
                    <option value="00" defaultValue>00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>
              <div id="alert-login" className="fade bg-danger-400 text-white fade" role="alert" style={{display:'none'}}>
                  <strong>Ups!</strong> Parece que los datos introducidos no son correctos.
              </div>
            </div> {/* FIN FORMULARIO CITA */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary waves-effect waves-themed" data-dismiss="modal" id="cita-close">Cancelar</button>
              <button type="button" className="btn btn-primary waves-effect waves-themed" onClick={()=>this.saveCita()}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
      <div id="calendar">
      </div>
      </>
    )
  }
  componentDidMount(){
    console.log("CONTINUED");
    // Create calendar object
    let calendarEl = document.querySelector('#calendar');
    let calendar = new Calendar(calendarEl, {
      locale: 'es',  // https://fullcalendar.io/docs/locale
      nowIndicator: true,
      minTime: "08:00:00",
      maxTime: "21:00:00",
      slotDuration: '00:15:00',  // Tab frequency
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

    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.calendar = calendar  // Change attribute's value
    this.setState(clone)  // Save change (re-render)
    this.getCitas();
  }
}

/* EXPORT CITA */
export default Cita;
