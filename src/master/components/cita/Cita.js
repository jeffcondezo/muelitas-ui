import React, { useState, useEffect, useRef, useContext } from 'react'
/* Calendar components
* FullCalendar required @fullcalendar/react to provide the FullCalendar component
* additionally it required a package for each plugin we want to include in the calendar
* we included @fullcalendar/core package to use esLocale spanish language injection
* Further changes were made right into the package's code
  route: node_modules/@fullcalendar/bootstrap/main.js
  * change the following prototype property BootstrapTheme.prototype.baseIconClass = 'fal'  // Changed 'fa' -> 'fal'
  * in BootstrapTheme.prototype.classes we added the following property: ` button: 'btn btn-default' `
*/
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from "@fullcalendar/interaction"
import bootstrapPlugin from "@fullcalendar/bootstrap"
import esLocale from '@fullcalendar/core/locales/es'

import {
  Icon,
  RegularModalCentered
} from '../bits'
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
  simplePostData,
} from '../../functions'
import { NavigationContext } from '../Navigation';

// Static
const __debug__ = process.env.REACT_APP_DEBUG


const Cita = () => {
  const {current_sucursal, redirectTo, redirect_data} = useContext(NavigationContext)
  console.log("ctx_Cita", current_sucursal, redirect_data)
  const events_response_data = useRef([])  // Used to preserve events values after filters
  const [events, setEvents] = useState([])  // FullCalendar events
  const [personal, setPersonal] = useState(false)  // Sucursal's personal
  const [procedures, setProcedures] = useState(false)  // Sucursal's procedures
  const [cita_selected, selectCita] = useState(false)  // Cita selected to get info
  const personal_color = ["#6e4e9e", "#179c8e", "#51adf6", "#ffb20e", "#fc077a", "#363636"]
  // const usageHint = useRef(false)  // Allow to change dynamically the behaviour
  // HTML constant values
  const html_cita_form = "modal-crear_cita"
  const html_cita_detail = "modal-ver_cita"
  const html_cita_annul = "modal-anular_cita"
  const html_cita_repro = "modal-repro_cita"

  // initial requests
  const getPersonal = () => simpleGet(`maestro/empresa/personal/?filtro={"sucursal":"${current_sucursal}", "atencion":"true"}`).then(setPersonal)
  const getProcedures = () => simpleGet(`maestro/procedimiento/sucursal/${current_sucursal}/?filtro={"active":"1"}`).then(setProcedures)
  const getCitas = () => {
    if(__debug__) console.log("Cita getCitas")

    simpleGet(`atencion/cita/?filtro={"estado":"1","programado":"1","sucursal":"${current_sucursal}"}`)
    .then(handleCitaResponse)
  }
  const handleCitaResponse = _citas => {
    if(__debug__) console.log("Cita handleCitaResponse")

    // Format cita as event
    let _events = _citas.map(c => {
      return {
        cita: c,
        title: c.paciente_data.fullname.toUpperCase()+" - "+c.programado,
        start: c.fecha+"T"+c.hora,
        end: c.fecha+"T"+c.hora_fin,
        color: personal_color[ personal.findIndex(p => p.pk==c.personal.pk) ]
      }
    })
    setEvents(_events)
    events_response_data.current = _events  // Save response in useRef variable (to use in filters)
  }
  // helpers
  const fixFCStyles = () => {
    if(__debug__) console.log("Cita fixFCStyles")

    // CSS changes for react's fullcalendar
    window.document.querySelector("div.fc-scroller table.fc-col-header") &&
    (window.document.querySelector("div.fc-scroller table.fc-col-header").style.backgroundImage = "linear-gradient(0deg,#f2f2f2 0,#fafafa)")
    window.document.querySelector("div.fc-scroller") &&
    (window.document.querySelector("div.fc-scroller").style.overflow = "hidden")
    window.document.querySelector("td.fc-day-today div.fc-timegrid-now-indicator-container") &&
    window.document.querySelector("td.fc-day-today div.fc-timegrid-now-indicator-container").classList.add("alert-info")
  }
  const fillPatienteByDNI = _dni => {
    console.log("fillPatienteByDNI", _dni)
    // if dni is not 8 length
    if(_dni.length<8){
      // Reset paciente data
      document.getElementById("pac_pk").value = ""
      // Disable form fields
      let _ = ["pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_sex_m", "pac_sex_f", "pac_celular"]
      .map(i => document.getElementById(i).disabled = false)
      return
    }else{
      let _ = ["pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_celular"]
      .map(i => document.getElementById(i).value = "")
      document.getElementById("pac_permiso_sms").value = "1"
      document.getElementById("pac_sex_m").checked = true
    }

    // Generate promise
    simpleGet(`atencion/paciente/?filtro={"dni":"${_dni}"}`)
    .then(res => {
      // If patient was not found, enable inputs
      if(res.length<1){
        let _ = ["pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_sex_m", "pac_sex_f", "pac_celular"]
        .map(i => document.getElementById(i).disabled = false)
        return
      }

      // Set paciente data
      document.getElementById("pac_pk").value = res[0].pk
      document.getElementById("pac_dni").value = res[0].dni
      document.getElementById("pac_nom_pri").value = res[0].nombre_principal
      document.getElementById("pac_nom_sec").value = res[0].nombre_secundario
      document.getElementById("pac_ape_pat").value = res[0].ape_paterno
      document.getElementById("pac_ape_mat").value = res[0].ape_materno
      document.getElementById("pac_celular").value = res[0].celular
      document.getElementById("pac_sex_m").checked = res[0].sexo == '1'
      document.getElementById("pac_sex_f").checked = res[0].sexo != '1'
      document.getElementById("pac_permiso_sms").value = res[0].permiso_sms ? "1" : "0"
      // Disable inputs
      let _ = ["pac_pk", "pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_celular", "pac_sex_m", "pac_sex_f"]
      .map(i => document.getElementById(i)).map(i => i.disabled = true)
    })
  }
  const cancelCitaForm = () => {
    if(redirect_data) return

    document.getElementById("pac_pk").value = ""
    document.getElementById("pac_dni").value = ""
    document.getElementById("cita-date").value = new Date().toDateInputValue()
    document.getElementById("cita-hour").value = "08"
    document.getElementById("cita-minute").value = "00"
    document.getElementById("cita-duracion").value = "15"
    window.$("#select-filtro_personal").val(null).trigger('change')
    window.$("#select-procedimiento_programado").val([]).trigger("change")  // Set personal to empty
    // Reset values
    let _
    _ = ["pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_celular"]
    .map(i => document.getElementById(i).value = "")
    // Enable inputs
    _ = ["pac_nom_pri", "pac_nom_sec", "pac_ape_pat", "pac_ape_mat", "pac_celular"]
    .map(i => document.getElementById(i).disabled = false)
  }
  const errorForm = log => {
    document.querySelector('div#alert-cita-form span').innerText = log
    document.getElementById('alert-cita-form').style.display = "block"
    document.getElementById('alert-cita-form').classList.remove("fade")
    setTimeout(function(){
      if(document.getElementById('alert-cita-form'))
        document.getElementById('alert-cita-form').classList.add("fade")
    }, 2500)
    setTimeout(function(){
      if(document.getElementById('alert-cita-form'))
        document.getElementById('alert-cita-form').style.display = "none"
    }, 2700)
  }
  const fillDataFromRedirect = () => {
    if(__debug__) console.log("Cita fillDataFromRedirect")
    /* redirect_data.selected
    * procedures are added through the SelectProcedure component
    * select patient through fillPatientByDNI
    */
    // Set patient data
    fillPatienteByDNI(redirect_data.patient_dni)
    // Open modal
    window.$('#'+html_cita_form).modal('show')
  }
  const redirectDataFinal = cita => {
    if(!redirect_data?.selected) return
    // Compare procs sended and procs received
    let sended_ar = window.$("#select-procedimiento_programado").select2('data').map(i => Number(i.id))
    // BUG: Execute it all in promise to avoid multiple instant execution (duplicity in DB objects)
    // redirect_data.selected = [{proc_pk, dpdt}]
    redirect_data.selected.reduce(
      (promise_chain, obj) => {
        return sended_ar.indexOf(obj.proc_pk) == -1
          ? promise_chain
          : promise_chain.then(
            // If proc was sended add cita as dpdt's reference
            () => simplePostData(`atencion/plantrabajo/detalle/${obj.dpdt}/cita/${cita.pk}/`)
          ).then(
            // Add DA from DPDT
            () => simplePostData(`atencion/${cita.atencion}/detalle/dpdt/${obj.dpdt}/`)
          )
      }, Promise.resolve()
    )
  }
  const getValidatedCitaFormData = () => {
    // VALIDATIONS
    // Validate date
    let _fecha = document.getElementById("cita-date").value
    let now = new Date().toDateInputValue()
    if(_fecha < now){
      errorForm("No se puede programar una cita para días anteriores")
      return
    }

    // Validate dni & time
    let _dni = String(document.getElementById("pac_dni").value)
    if(_dni.length!=8){
      errorForm("El dni no contiene 8 digitos")  // Show form error
      return
    }
    let _hora = Number(document.getElementById("cita-hour").value)
    if(document.querySelector('input[name="sexo"]:checked') == null){
      errorForm("Indique el sexo del paciente")
      return
    }
    let _sexo = document.querySelector('input[name="sexo"]:checked').value
    // Get PERSONAL
    let personal_ = window.$("#select-filtro_personal").select2('data')
    if(personal_.length==0){
      errorForm("Debe seleccionar al menos un personal de atención")
      return
    }
    let _personal = []
    let _personal_atencion = ""
    personal_.forEach((personal, inx) => {
      _personal.push(personal.id)

      // Personal name to programado
      let _personal_name = personal.text
      if(inx==personal_.length-1) _personal_atencion+=" y "
      else if(inx>0) _personal_atencion+=", "
      _personal_atencion += _personal_name
    })

    // Get patient data
    let _paciente
    if(document.getElementById("pac_pk").value!==""){ // User is known
      _paciente = parseInt(document.getElementById("pac_pk").value) // Set user id
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
        errorForm("El nombre secundario solo pueden contener letras y espacios")
        return
      }
      // Check main values
      let reg_expr = (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ ]+[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/)
      if(
        !reg_expr.test(document.getElementById("pac_nom_pri").value) ||
        !reg_expr.test(document.getElementById("pac_ape_pat").value) ||
        !reg_expr.test(document.getElementById("pac_ape_mat").value)
      ){
        errorForm("Los apellidos y nombres solo pueden contener letras y espacios, como minimo 3 caracteres")
        return
      }

      _paciente = {
        dni: _dni,
        sexo: _sexo,
        nombre_principal: document.getElementById("pac_nom_pri").value,
        nombre_secundario: document.getElementById("pac_nom_sec").value,
        ape_paterno: document.getElementById("pac_ape_pat").value,
        ape_materno: document.getElementById("pac_ape_mat").value,
        celular: document.getElementById("pac_celular").value,
        permiso_sms: document.getElementById("pac_permiso_sms").value,
      }
    }

    // Get META
    let _minutos = document.getElementById("cita-minute").value
    let _celular = document.getElementById("pac_celular").value
    let _permiso_sms = document.getElementById("pac_permiso_sms").value
    let _sucursal = current_sucursal
    let _origen_cita = "3"  // Origen Web
    let _estado = "1"  // Cita Pendiente
    let _programado = window.$("#select-procedimiento_programado").select2('data').map(i => i.text).join(", ")

    // Add personal to 'programado'
    if(_personal.length>1) _programado += `\nAtendido por ${_personal_atencion}`
    let _duracion = document.getElementById("cita-duracion").value
    let _hora_fin = (()=>{
      let _minres = parseInt(_duracion)+parseInt(_minutos)
      let _temp_hora = parseInt(_hora)+parseInt(_minres/60)
      let _temp_min = _minres%60
      // Handle more than 24hrs time
      if(_temp_hora>=22 && _temp_min>0) return -1
      // Fix left zeros
      _temp_hora = String(_temp_hora).length === 1 ? '0'+_temp_hora:_temp_hora
      _temp_min = String(_temp_min).length === 1 ? '0'+_temp_min:_temp_min
      return _temp_hora+":"+_temp_min
    })()
    // Handle hora_fin out of work time
    if(_hora_fin==-1){
      alert("La hora de finalización no debe exceder el horario de trabajo")
      return
    }


    // Generate data object
    let data = {
      sucursal: _sucursal,
      personal_array: String(_personal),
      fecha: _fecha,
      hora: _hora+":"+_minutos,
      hora_fin: _hora_fin,
      origen_cita: _origen_cita,
      estado: _estado,
      permiso_sms: _permiso_sms,
    }
    if(_celular != "") data['celular'] = _celular
    if(_programado.length != 0) data['programado'] = _programado
    // Handle paciente
    if(typeof(_paciente)==='number')
      data['paciente'] = _paciente
    else if(typeof(_paciente)==='object')
      data['paciente_obj'] = _paciente
    // Add PDT reference if exist
    if(redirect_data) data['pdt'] = redirect_data.pdt

    return data
  }
  // events
  const getCitaInfo = ev => {
    if(ev.event.extendedProps.cita == cita_selected) openCitaDetail()
    else selectCita(ev.event.extendedProps.cita)
  }
  const selectRangoFecha = ev => {
    if(__debug__) console.log("Cita selectRangoFecha")
    // if(!usageHint.current){
    //   alert("Ahora puedes crear una cita seleccionando un rango de tiempo en el calendario")
    //   usageHint.current = true
    //   return
    // }

    // Assure selected range doesn't cross days
    if(ev.start.toDateInputValue() != ev.end.toDateInputValue()){
      handleErrorResponse("custom", "", 'Por favor seleccione un rango de tiempo perteneciente al mismo día', 'info')

      return
    }

    // Calc cita duration
    document.getElementById("cita-date").value = ev.start.toDateInputValue()
    document.getElementById("cita-hour").value = String(ev.start.getHours()).padStart(2, '0')
    document.getElementById("cita-minute").value = String(ev.start.getMinutes()).padStart(2, '0')
    // Get selected range's duration
    let _duration = Math.floor((ev.end.getTime() - ev.start.getTime())/60000)
    // Add custom option if there is none for the duration value
    let html_input_duration = document.getElementById("cita-duracion")
    if(![...html_input_duration.options].find(inp => inp.value==_duration)){
      let _html_custom_duration_input = window.document.createElement("option")
      _html_custom_duration_input.value = _duration
      _html_custom_duration_input.text = _duration+" minutos"
      html_input_duration.options.add(_html_custom_duration_input)
    }
    document.getElementById("cita-duracion").value = _duration

    window.$('#'+html_cita_form).modal("show")
  }
  const filterByPersonal = _filter => {
    if(_filter.length == 0) setEvents(events_response_data.current)
    else setEvents(events_response_data.current.filter(e => _filter.indexOf(e.cita.personal.pk) != -1 ))
  }
  const saveCita = () => {
    if(__debug__) console.log("Cita saveCita")

    let data = getValidatedCitaFormData()

    // Generate promise
    simplePostData('atencion/cita/', data)
    .then(
      cita => {
        // If there was data from redirect
        if(redirect_data) redirectDataFinal(cita)

        // In case it's ok
        handleErrorResponse("custom", "Exito", "La cita fue creada exitosamente", "info")
        document.getElementById("cita-close").click()  // Cerrar formulario cita
        fakeCrearCita(cita)
      },
      res => {
        // We expect an error bc of CRUCE_DE_CITAS
        // the simpleFetch functions are standar in the system and when error it returns the response itself
        // er = Response || we need to use er.json() to acces the info inside the response
        res.text().then(er => {
          if(er == '["CRUCE_DE_CITAS"]')
            handleErrorResponse("custom", "ERROR: ", "Ya hay una cita programada para el personal en la hora indicada, por favor escoja otro horario", "warning")
          else handleErrorResponse("custom", "", "Ha ocurrido un error", "warning")
          document.getElementById("cita-close").click()  // Cerrar formulario cita
        })
      }
    )
  }
  const openCitaForm = () => window.$('#'+html_cita_form).modal('show')
  const openCitaDetail = () => window.$('#'+html_cita_detail).modal('show')
  const confirmAnnul = _state => {
    if(__debug__) console.log("Cita confirmAnnul", _state)

    window.$('#'+html_cita_detail).modal('hide')
    window.$('#'+html_cita_annul).data({estado: _state}).modal('show')
  }
  const openReprogramarCitaModal = () => {
    window.$('#'+html_cita_detail).modal('hide')
    window.$('#'+html_cita_repro).modal('show')
  }
  const annulCita = () => {
    let _state = window.$('#'+html_cita_annul).data('estado')
    if(!_state) return

    simplePostData(`atencion/cita/anular/${cita_selected.pk}/`, {estado: _state}, 'PUT')
    .then(() => fakeAnnulCita(cita_selected))
  }
  const fakeAnnulCita = _cita => {
    let f_events = events.filter(e => e.cita.pk != _cita.pk)
    setEvents(f_events)
    events_response_data.current = f_events  // Save response in useRef variable (to use in filters)
  }
  const fakeReprogramarCita = (_cita, _data) => {
    /* f_: fake_ */
    let f_events = events
    let f_cita_inx = f_events.findIndex(e => e.cita.pk==_cita.pk)
    let f_cita = f_events[f_cita_inx]

    if(!f_cita) return

    // Calc cita duration
    let _duration = (
      (Number(f_cita.cita.hora_fin.split(":")[0])*60 + Number(f_cita.cita.hora_fin.split(":")[1])) -
      (Number(f_cita.cita.hora.split(":")[0])*60 + Number(f_cita.cita.hora.split(":")[1]))
    )
    let f_hora_fin = (
      (Number(_data.hora.split(":")[0])*60 + Number(_data.hora.split(":")[1]))
      + _duration
    )
    // Fake update values
    f_cita.cita.fecha = _data.fecha
    f_cita.cita.hora = _data.hora
    f_cita.cita.hora_fin = String(Math.floor(f_hora_fin/60)).padStart(2, "0")+":"+String(f_hora_fin%60).padStart(2, "0")
    f_cita.start = f_cita.cita.fecha+'T'+f_cita.cita.hora
    f_cita.end = f_cita.cita.fecha+'T'+f_cita.cita.hora_fin

    // Replace cita and set new events
    /* refer: codeStructure.js: state change: Array state change not firing */
    setEvents([...f_events])
    events_response_data.current = f_events  // Save response in useRef variable (to use in filters)
  }
  const fakeCrearCita = _cita => {
    if(!_cita) return

    let f_events = events

    // New cita fake event
    let f_cita = {
      cita: _cita,
      title: _cita.paciente_data.fullname.toUpperCase()+" - "+_cita.programado,
      start: _cita.fecha+"T"+_cita.hora,
      end: _cita.fecha+"T"+_cita.hora_fin,
      color: personal_color[ personal.findIndex(p => p.pk==_cita.personal.pk) ],
    }

    /* refer: codeStructure.js: state change: Array state change not firing */
    f_events.push(f_cita)
    setEvents([...f_events])
    events_response_data.current = f_events  // Save response in useRef variable (to use in filters)
  }


  useEffect(() => {
    // Select2 for personal choose in Cita
    // CSS
    if(!document.getElementById('select2_link')){
      const select2_link = document.createElement("link")
      select2_link.rel = "stylesheet"
      select2_link.id = "select2_link"
      select2_link.media = "screen, print"
      select2_link.href = "/css/formplugins/select2/select2.bundle.css"
      document.head.appendChild(select2_link)
    }
    // JS
    if(!document.getElementById('select2_script')){
      const select2_script = document.createElement("script")
      select2_script.async = false
      select2_script.id = "select2_script"
      select2_script.onload = ()=>{
        // Set select2 for personal
        window.$("#select-filtro_personal").select2({
          dropdownParent: window.$("#select-filtro_personal").parent()
        })
        // Set select2 for programado
        window.$("#select-procedimiento_programado").select2({
          dropdownParent: window.$("#select-procedimiento_programado").parent()
        })
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js"
      document.body.appendChild(select2_script)
    }else{
      // Set select2 for personal
      window.$("#select-filtro_personal").select2({
        dropdownParent: window.$("#select-filtro_personal").parent()
      })
      // Set select2 for programado
      window.$("#select-procedimiento_programado").select2({
        dropdownParent: window.$("#select-procedimiento_programado").parent()
      })
    }

    // Fill data from redirect_data
    if(redirect_data) fillDataFromRedirect()

    // Will unmount
    return () => {
      if(__debug__) console.log("Cita unmount")
      window.$('#'+html_cita_form).modal('hide')
      window.$('#'+html_cita_detail).modal('hide')
      window.$('#'+html_cita_annul).modal('hide')
      window.$('#'+html_cita_repro).modal('hide')
    }
  }, [])
  useEffect(() => {
    if(!personal || personal.length==0) return

    getCitas()
  }, [personal])
  useEffect(() => {
    if(!events || events.length==0) return

    fixFCStyles()
  }, [events])
  useEffect(() => {
    if(!cita_selected) return

    openCitaDetail()
  }, [cita_selected])
  useEffect(() => {
    // Get data everytime sucursal changes
    getPersonal()
    getProcedures()
  }, [current_sucursal])
  // TODO: Handle sucursal dynamic change

  return (
    <div>
      {/* ALERTS */}
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal</span>.
      </div>

      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <i className="subheader-icon fal fa-chart-area"></i> Cita
        </h1>
        <FilterPersonal
          personal={personal}
          personal_color={personal_color}
          filterByPersonal={filterByPersonal}
          />
      </div>

      {/* FULLCALENDAR */}
      <FullCalendar
        plugins={[timeGridPlugin, listPlugin, interactionPlugin, bootstrapPlugin]}
        initialView="timeGridWeek"
        themeSystem='bootstrap'
        nowIndicator={true}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        slotDuration='00:15:00'
        headerToolbar={{
          start: 'prev,next today addCita refreshCita',
          center: 'title',
          end: 'timeGridWeek,timeGridDay,listWeek'
        }}
        navLinks={true}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: true,
          hour12: true,
        }}
        editable={false}
        eventClick={getCitaInfo}
        customButtons={{
          addCita: { text: '+', click: openCitaForm },
          refreshCita: { text: 'Actualizar', click: getCitas },
        }}
        locale={esLocale}
        allDaySlot={false}
        displayEventTime={false}
        selectable={true}
        select={selectRangoFecha}
        events={events}
        eventColor='gray'
        />

      {/* MODAL CITA FORM */}
      <ModalCitaForm
        id={html_cita_form}
        saveCita={saveCita}
        cancelCitaForm={cancelCitaForm}
        fillPatienteByDNI={fillPatienteByDNI}
        personal={personal}
        procedures={procedures}
        redirect_data={redirect_data}
        />

      {/* INFO CITA (modal) */}
      <InfoCita
        id={html_cita_detail}
        cita={cita_selected}
        confirmAnnul={confirmAnnul}
        openReprogramarCitaModal={openReprogramarCitaModal}
        redirectTo={redirectTo} />
      <AnnulCita
        id={html_cita_annul}
        annulCita={annulCita}
        />

      {/* REPROGRAMAR CITA (modal) */}
      <ReprogramarCita
        id={html_cita_repro}
        cita={cita_selected}
        fakeReprogramarCita={fakeReprogramarCita}
        />
    </div>
  )
}

/*** COMPONENTS ***/
const FilterPersonal = ({personal, personal_color, filterByPersonal}) => {
  const getFilterByPersonalValues = () => {
    let html_inputs = []
    personal.map(p => window.document.getElementById('filter-personal_'+p.pk).checked && html_inputs.push(p.pk) )
    filterByPersonal(html_inputs)
  }

  return (
    <div className="btn-group btn-group-toggle" data-toggle="buttons">
      {personal && personal.map(p =>
        <label key={p.pk} className="btn btn-light waves-effect waves-themed"
        onClick={getFilterByPersonalValues}>
          <input key={"filter-personal_"+p.pk} type="checkbox" id={"filter-personal_"+p.pk} />
          <span style={{
            fontSize:"1.1em", filter:"contrast(2)",
            color: personal_color[ personal.indexOf(p) ],
          }}>
            <b>{(p.nombre_principal+" "+p.ape_paterno[0]+"."+p.ape_materno[0]+".").toUpperCase()}</b>
          </span>
        </label>
      ) || "loading"}
    </div>
  )
}
const ModalCitaForm = ({id, saveCita, cancelCitaForm, fillPatienteByDNI, procedures, personal, redirect_data}) => (
  <div className="modal fade" id={id} tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
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
        <div className="modal-body" id="cita-form">
          <SelectPersonal personal={personal} />
          <div className="form-group col-md-12">
            <label className="form-label" htmlFor="pac_dni">Dni: </label>
            <input type="text" id="pac_dni" required placeholder="Dni del paciente"
              className="form-control form-control-lg" maxLength="8"
              onChange={e => fillPatienteByDNI(e.target.value)} />
          </div>
          {/* Paciente */}
          <label className="form-label col-md-12">Paciente: </label>
          <input type="text" id="pac_pk" style={{display:'none'}} defaultValue="" disable="true" />
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <input type="text" id="pac_nom_pri" className="form-control form-control-lg" placeholder="Nombre Principal" />
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <input type="text" id="pac_nom_sec" className="form-control form-control-lg" placeholder="Nombres secundarios" />
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <input type="text" id="pac_ape_pat" className="form-control form-control-lg" placeholder="Apellido Paterno" />
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <input type="text" id="pac_ape_mat" className="form-control form-control-lg" placeholder="Apellido Materno" />
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <input type="text" id="pac_celular" className="form-control form-control-lg" maxLength="9" placeholder="Celular" />
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
          <select id="pac_permiso_sms" className="form-control form-control-lg">
            <option value="1" defaultValue>Permitir envío de SMS</option>
            <option value="0">NO Permitir envío de SMS</option>
          </select>
          </div>
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <div className="frame-wrap" style={{display:'flex', justifyContent:'center'}} id="radio">
              <div className="custom-control custom-radio custom-control-inline">
                <input type="radio" value="1" className="custom-control-input" id="pac_sex_m" name="sexo" defaultChecked />
                <label className="custom-control-label" style={{fontSize:'1rem'}} htmlFor="pac_sex_m">Masculino</label>
              </div>
              <div className="custom-control custom-radio custom-control-inline">
                <input type="radio" value="2" className="custom-control-input" id="pac_sex_f" name="sexo" />
                <label className="custom-control-label" style={{fontSize:'1rem'}} htmlFor="pac_sex_f">Femenino</label>
              </div>
            </div>
          </div>
          {/* Fin Paciente */}
          <SelectProcedure
            procedimientos={procedures}
            selected={redirect_data?.selected}
            />
          <div className="form-group col-md-6" style={{display:'inline-block'}}>
            <label className="form-label" htmlFor="cita-date">Fecha: </label>
            <input type="date" id="cita-date" className="form-control form-control-lg" defaultValue={(new Date().toDateInputValue())} required />
          </div>
          <div className="form-group col-md-3" style={{display:'inline-block'}}>
            <label className="form-label" htmlFor="cita-hour" style={{display:'block'}}>Hora: </label>
            <select id="cita-hour" className="custom-select col-lg-6">
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
            <select id="cita-minute" className="custom-select col-lg-6">
              <option value="00" defaultValue>00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
          </div>
          <div className="form-group col-md-3" style={{display:'inline-block'}}>
            <label className="form-label" htmlFor="cita-duracion" style={{display:'block'}}>Duración aproximada: </label>
            <select id="cita-duracion" className="custom-select form-control">
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
          <button type="button" data-dismiss="modal" onClick={cancelCitaForm}
            className="btn btn-secondary waves-effect waves-themed" id="cita-close">Cancelar</button>
          <button type="button" onClick={saveCita}
            className="btn btn-primary waves-effect waves-themed">Guardar</button>
        </div>
      </div>
    </div>
  </div>
)
const InfoCita = ({id, cita, confirmAnnul, openReprogramarCitaModal, redirectTo}) => {
  if(!cita) return "no data"

  const addAttention = () => redirectTo(`/nav/atencion/${cita.pk}/detalle`)
  const addOdontograma = () => redirectTo(`/nav/odontograma/${cita.pk}`)
  const addProcedure = () => redirectTo(`/nav/procedimiento/${cita.pk}/agregar/`)

  return (
    <div className="modal fade" id={id} tabIndex="-1" role="dialog" style={{display: "none"}} aria-hidden="true">
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
          <div className="modal-body">
            <h6>
              <b>Paciente: </b>
              <span style={{color: "blue", cursor: "pointer"}}
              onClick={() => redirectTo(`/nav/admision/${cita.paciente_data.pk}/detalle`)}
              >{cita.paciente_data.fullname}</span>
            </h6>
            <h6><b>DNI: </b>{cita.paciente_data.dni}</h6>
            <h6><b>Fecha: </b>{cita.fecha.split("-").reverse().join("/")}</h6>
            <h6><b>Hora: </b>{cita.hora} - {cita.hora_fin}</h6>
            <h6><b>Celular: </b>{cita.paciente_data.celular}</h6>
            <h6><b>Direccion: </b>{cita.paciente_data.direccion}</h6>
            <h6><b>Personal: </b>{cita.personal.fullname} - {cita.personal.especialidad_descripcion}</h6>
            <h6><b>Programado: </b>{cita.programado}</h6>
          </div>
          <div className="modal-footer">
            {/* Icons */}
            <div className="btn-group">
              <Icon type="attention" onClick={addAttention} data_dismiss="modal" />
              <Icon type="odontogram" onClick={addOdontograma} data_dismiss="modal" />
              <Icon type="procedure" onClick={addProcedure} data_dismiss="modal" />
            </div>
            {/* Reprogramar cita */}
            <button className="btn btn-info" onClick={openReprogramarCitaModal}>Reprogramar</button>
            {/* Estado cita */}
            <div className="btn-group">
              <button className="btn btn-primary waves-effect waves-themed"
                onClick={()=>confirmAnnul(3)}>Anular cita</button>
              <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split waves-effect waves-themed" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              </button>
              <div className="dropdown-menu">
                <button className="dropdown-item" data-dismiss="modal"
                  onClick={()=>confirmAnnul(2)}>Anulado por cliente</button>
                <button className="dropdown-item" data-dismiss="modal"
                  onClick={()=>confirmAnnul(4)}>Paciente no se presento</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const AnnulCita = ({id, annulCita}) => (
  <div className="modal modal-alert fade" id={id} tabIndex="-1" role="dialog" style={{display: "none", paddingRight: "15px"}} aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Anular cita</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true"><i className="fal fa-times"></i></span>
          </button>
        </div>
        <div className="modal-body">
          Esta seguro que quiere anular la cita?
        </div>
        <div className="modal-footer">
          <button type="button" data-dismiss="modal"
            className="btn btn-secondary waves-effect waves-themed">Cancelar</button>
          <button type="button" data-dismiss="modal"
            className="btn btn-primary waves-effect waves-themed"
            onClick={annulCita}>Anular</button>
        </div>
      </div>
    </div>
  </div>
)
const SelectPersonal = ({personal}) => (
  <div className="form-group col-md-12">
    <label className="form-label" htmlFor="select-filtro_personal">Personal de atención: </label>
    <select id="select-filtro_personal" className="custom-select form-control custom-select-lg" multiple>
      {personal && personal.map(p =>
        <option key={p.pk} value={p.pk}>
          {cFL(p.nombre_principal)+" "+cFL(p.ape_paterno)}
        </option>
      ) || "loading"}
    </select>
  </div>
)
const SelectProcedure = ({procedimientos, selected}) => {
  /* Selected comes from redirect_data which is loaded at the very begining and never changes */
  const html_select_programed_procedure = "select-procedimiento_programado"

  useEffect(() => {
    if(!procedimientos || !selected) return

    // Select values when selected is setted
    window.$('#'+html_select_programed_procedure).val( selected.map(i => i.proc_pk) )
    // window.$('#'+html_select_programed_procedure).trigger('change')
  }, [procedimientos])

  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor={html_select_programed_procedure}>Programado: </label>
      <select id={html_select_programed_procedure} className="custom-select form-control custom-select-lg" multiple>
        {procedimientos && procedimientos.map(p =>
          <option key={p.procedimiento_data.pk} value={p.procedimiento_data.pk}>
            {p.procedimiento_data.nombre.toUpperCase()}
          </option>
        ) || "loading"}
      </select>
    </div>
  )
}
const ReprogramarCita = ({id, cita, fakeReprogramarCita}) => {
  const reprogramarCita = () => {
    if(!cita){
      window.$('#'+id).modal("hide")
      handleErrorResponse('Error', 'No se selecciono una cita a programar. Por favor contacte con el administrador')
      return
    }

    // Obtener valores
    let fecha = window.document.getElementById('reprogram-cita-fecha').value
    let hora = window.document.getElementById('reprogram-cita-hour').value
    let minutos = window.document.getElementById('reprogram-cita-minute').value

    let data = {
      fecha: fecha,
      hora: `${hora}:${minutos}`,
    }

    simplePostData(`atencion/cita/${cita.pk}/reprogramar/`, data)
    .then(res => {
      if( res.hasOwnProperty("reason") ) handleErrorResponse('custom', 'Ups!', res.reason, 'danger')
      else handleErrorResponse('custom', 'Exito!', "Cita reprogramada exitosamente", 'info')
    })
    .then(() => window.$('#'+id).modal("hide"))
    .then(() => fakeReprogramarCita(cita, data))
  }

  return (
    <RegularModalCentered
      _id={id}
      _title={"Reprogramar Cita"}
      _body={
        <div>
          <div className="form-group">
            <label className="form-label" htmlFor="reprogram-cita-fecha">Fecha</label>
            <input type="date" id="reprogram-cita-fecha" className="form-control" defaultValue={(new Date().toDateInputValue())} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reprogram-cita-hour" style={{display:'block'}}>Hora: </label>
            <select id="reprogram-cita-hour" className="custom-select col-lg-6">
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
            <select id="reprogram-cita-minute" className="custom-select col-lg-6">
              <option value="00" defaultValue>00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={reprogramarCita}>Reprogramar</button>
        </div>
      } />
  )
}

export default Cita
// eslint-disable-next-line react-hooks/exhaustive-deps
