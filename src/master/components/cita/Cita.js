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
  PageTitle,
  RegularModalCentered
} from '../bits'
import {
  handleErrorResponse,
  capitalizeFirstLetter as cFL,
  simpleGet,
  getDataByPK,
  simplePostData,
} from '../../functions'
import { NavigationContext } from '../Navigation';
import { tipo_documento, personaFromReniec, xhtmlDecode } from '../admision/Admision'
import Loader from '../loader/Loader'

// Static
const __debug__ = process.env.REACT_APP_DEBUG == "true"


const Cita = () => {
  const events_response_data = useRef([])  // Used to preserve events values after filters
  const [events, setEvents] = useState([])  // FullCalendar events
  const [personal, setPersonal] = useState(false)  // Sucursal's personal
  const [pxss, setPXS] = useState(false)  // Sucursal's procedures
  const [cita_selected, selectCita] = useState(false)  // Cita selected to get info
  const [show_past_citas, setShowPastCitas] = useState(false)  // Show past citas
  const [loading, setLoader] = useState(true)
  /* fake_redirect_data: Workaround to fake redirect_data empty
  * when it has already been fully used to create a Cita
  * and therefore it is not longer needed
  */
  const [fake_redirect_data, setFakeRedirectData] = useState(false)
  const personal_color = ["#6E4E9E", "#179C8E", "#4580B3", "#FF9800", "#FC077A", "#363636", "#B0410B"]
  const fullname_validado = useRef(false)  // Keeps a track if unknown patient's data came from reniec's service
  // const usageHint = useRef(false)  // Allow to change dynamically the behaviour

  // Redirect data
  const {current_sucursal, redirectTo, redirect_data} = useContext(NavigationContext)
  let _redirect_data = fake_redirect_data ? false : redirect_data

  // HTML constant values
  const html_cita_form = "modal-crear_cita"
  const html_cita_detail = "modal-ver_cita"
  const html_cita_annul = "modal-anular_cita"
  const html_cita_repro = "modal-repro_cita"

  // initial requests
  const getPersonal = () => simpleGet(`maestro/empresa/personal/?filtro={"atencion":"true"}`).then(setPersonal)
  const getPXS = () => simpleGet(`maestro/procedimiento/sucursal/?filtro={"active":"1"}`).then(setPXS)
  const getCitas = () => {
    if(__debug__) console.log("Cita getCitas", show_past_citas)
    setLoader(true)

    let dt = new Date()
    dt.setTime(dt.getTime() - (14*24*60*60*1000))  // get back time to 2 weeks ago
    let filter = show_past_citas
      ? `"fecha_desde":"${dt.toDateInputValue()}","estado":"-1"`
      : `"estado":"1"`
    simpleGet(`atencion/cita/?filtro={"sucursal":"${current_sucursal}","programado":"1",${filter}}`)
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
    let style = document.head.appendChild(document.createElement("style"))
    style.innerHTML = `
      .fc-highlight {background-color: #c2c7cc!important}
      div.fc-scroller table.fc-col-header {background-image: linear-gradient(0deg,#f2f2f2 0,#fafafa)}
      div.fc-scroller {overflow: hidden}
      td.fc-day-today div.fc-timegrid-now-indicator-container {background-color: #bbddf5}
    `
  }
  const pacienteDataInputs = (_pk="", _n1="", _n2="", _a1="", _a2="", _c="", _sms=true, block=false) => {
    window.document.getElementById("pac_pk").value = _pk
    window.document.getElementById("newpat-name-pric").value = _n1
    window.document.getElementById("newpat-name-sec").value = _n2
    window.document.getElementById("newpat-ape-p").value = _a1
    window.document.getElementById("newpat-ape-m").value = _a2
    window.document.getElementById("newpat-phone").value = _c
    window.document.getElementById("newpat-permiso_sms").checked = _sms
    // Enable/Disable
    fullname_validado.current = block
    window.document.getElementById("newpat-name-pric").disabled = block
    window.document.getElementById("newpat-name-sec").disabled = block
    window.document.getElementById("newpat-ape-p").disabled = block
    window.document.getElementById("newpat-ape-m").disabled = block
  }
  const fillPatienteByDNI = _dni => {
    if(__debug__) console.log("fillPatienteByDNI", _dni)

    // Reset values when dni changes
    pacienteDataInputs()

    if(_dni.length < 6) return

    // Generate promise
    getDataByPK('atencion/paciente/dni', _dni)
    .then(pac => {
      // Set paciente data
      pacienteDataInputs(pac.pk, pac.nombre_principal, pac.nombre_secundario, pac.ape_paterno, pac.ape_materno, pac.celular, pac.permiso_sms, pac.fullname_validado)
    })
    .catch(() => {
      if(_dni.length == 8){
        pacienteDataInputs()
        personaFromReniec(_dni)
        .then(res => {
          if(__debug__) console.log("personaFromReniec res", res);
          if(res.hasOwnProperty('error')) return
          else handleErrorResponse('pac_form', "", "Se ha encontrado información relacionada al dni en el servicio de reniec", 'info')
          // Fill data from reniec
          let primer_nombre = res.nombres.split(" ")[0]
          pacienteDataInputs("", xhtmlDecode(primer_nombre),
            xhtmlDecode( res.nombres.replace(primer_nombre, "").trim() ),
            xhtmlDecode(res.apellido_paterno), xhtmlDecode(res.apellido_materno),
            "", true, true)
        })
      }
    })
  }
  const cancelCitaForm = () => {
    if(_redirect_data) return
    window.document.getElementById("pac_dni").value = ""
    pacienteDataInputs()
    window.document.getElementById("cita-date").value = new Date().toDateInputValue()
    window.document.getElementById("cita-hour").value = "08"
    window.document.getElementById("cita-minute").value = "00"
    window.document.getElementById("cita-duracion").value = "15"

    window.$("#select-filtro_personal").val(null).trigger('change')
    window.$("#select-procedimiento_programado").val([]).trigger("change")
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
    /* _redirect_data.selected
    * procedures are added through the SelectProcedure component
    * select patient are setted directly
    */
    // Set paciente data
    window.document.getElementById("pac_dni").value = _redirect_data.patient.dni ? _redirect_data.patient.dni : _redirect_data.patient.dni_otro
    pacienteDataInputs(_redirect_data.patient.pk,
      _redirect_data.patient.nombre_principal,
      _redirect_data.patient.nombre_secundario||"",
      _redirect_data.patient.ape_paterno,
      _redirect_data.patient.ape_materno)
    // Open modal
    window.$('#'+html_cita_form).modal('show')
  }
  const redirectDataFinal = cita => {
    // Compare procs sended and procs received
    // _redirect_data.selected = [{pxs_pk, dpdt}]
    let sended_ar = window.$("#select-procedimiento_programado").select2('data').map(i => Number(i.id))
    simplePostData('atencion/plantrabajo/cita/relacion/', {
      cita: cita.pk,
      dpdt_pks: _redirect_data.selected.filter(i => sended_ar.indexOf(i.pxs_pk)!=-1 ).map(i => i.dpdt)
    })
    .finally(() => setFakeRedirectData(true))
  }
  const createDACita = cita => {
    // Create DA for every programado
    let ar_programado = window.$("#select-procedimiento_programado").select2('data').map(i => Number(i.id))
    ar_programado.reduce(
      (promise_chain, pxs_pk) => promise_chain.then(  // Create DA
        () => simplePostData(`atencion/detalle/`, {atencion: cita.atencion, pxs: pxs_pk})
      ), Promise.resolve()
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

    // Validate hour
    let _hora = Number(document.getElementById("cita-hour").value)
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

    // Get patient
    let _paciente = {}
    let _tmp = document.getElementById("pac_pk").value
    if(_tmp != "") _paciente.pk = _tmp
    if(_tmp == ""){
      // Validate newpat values
      // dni
      _tmp = window.document.getElementById("pac_dni").value
      if(_tmp.trim().length!=8){
        errorForm("El DNI debe tener 8 digitos")
        return
      }
      _paciente.dni = _tmp
      // nombre_principal
      _tmp = window.document.getElementById("newpat-name-pric").value
      if(_tmp.trim() == ""){
        errorForm("Debe especificar un nombre principal")
        return
      }
      if(!/^[a-zA-ZñÑ]+$/.test(_tmp)){
        errorForm("Los nombres solo pueden contener letras")
        return false
      }
      _paciente.nombre_principal = _tmp
      // nombre_secundario
      _tmp = window.document.getElementById("newpat-name-sec").value
      if(_tmp.trim() != ""){
        if(!/^[a-zA-ZñÑ]+$/.test(_tmp)){
          errorForm("Los nombres solo pueden contener letras")
          return false
        }else _paciente.nombre_secundario = _tmp
      }
      // ape_paterno
      _tmp = window.document.getElementById("newpat-ape-p").value
      if(_tmp.trim() == ""){
        errorForm("Debe especificar un apellido paterno")
        return
      }
      if(!/^[a-zA-ZñÑ]+$/.test(_tmp)){
        errorForm("Los apellidos solo pueden contener letras")
        return false
      }
      _paciente.ape_paterno = _tmp
      // ape_materno
      _tmp = window.document.getElementById("newpat-ape-m").value
      if(_tmp.trim() == ""){
        errorForm("Debe especificar un apellido materno")
        return
      }
      if(!/^[a-zA-ZñÑ]+$/.test(_tmp)){
        errorForm("Los apellidos solo pueden contener letras")
        return false
      }
      _paciente.ape_materno = _tmp
      // fullname_validado
      _paciente.fullname_validado = fullname_validado.current
    }
    // celular
    _paciente.celular = window.document.getElementById("newpat-phone").value
    // permiso_sms
    _paciente.permiso_sms = window.document.getElementById("newpat-permiso_sms").checked

    // Get META
    let _minutos = document.getElementById("cita-minute").value
    let _sucursal = current_sucursal
    let _origen_cita = "3"  // Origen Web
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
      paciente: _paciente,
      personal_array: String(_personal),
      fecha: _fecha,
      hora: _hora+":"+_minutos,
      hora_fin: _hora_fin,
      origen_cita: _origen_cita,
    }
    if(_programado.length != 0) data.programado = _programado

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
    console.log("data", data)
    if(!data) return

    // Generate promise
    simplePostData('atencion/cita/', data)
    .then(cita => {
      (_redirect_data?.selected ? redirectDataFinal : createDACita)(cita)  // If there was data from redirect
      handleErrorResponse("custom", "Exito", "La cita fue creada exitosamente", "info")
      fakeCrearCita(cita)
    })
    .catch(res => {
      // We expect an error bc of CRUCE_DE_CITAS
      // the simpleFetch functions are standar in the system and when error it returns the response itself
      // er = Response || we need to use er.json() to acces the info inside the response
      res.text().then(er => {
        if(er == '["CRUCE_DE_CITAS"]')
          handleErrorResponse("custom", "", "Ya hay una cita programada para el personal en la hora indicada, por favor escoja otro horario", "warning")
        else handleErrorResponse("custom", "", "Ha ocurrido un error", "warning")
      })
    })
    .finally( () => document.getElementById("cita-cancel").click() )
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
  const showPastCitas = () => setShowPastCitas(!show_past_citas)


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

    // Fill data from _redirect_data
    if(_redirect_data) fillDataFromRedirect()

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
    setLoader(false)
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
    getPXS()
  }, [current_sucursal])
  useEffect(() => {
    if(events.length == 0) return  // Do not call getCitas before events is set (it might break bc required data is async loading )

    getCitas()
  }, [show_past_citas])

  return (
    <div>
      <PageTitle />

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
          start: 'prev,today,next addCita,refreshCita,showPastCitas',
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
          addCita: { click: openCitaForm, text: <b title="Crear cita">+</b> },
          refreshCita: { click: getCitas, text: <RefreshIcon /> },
          showPastCitas: { click: showPastCitas, text: <EyeIcon state={show_past_citas} /> },
        }}
        locale={esLocale}
        allDaySlot={false}
        displayEventTime={false}
        selectable={true}
        select={selectRangoFecha}
        events={events}
        eventColor='gray'
        />
      {loading && <Loader scale={2} />}

      {/* MODAL CITA FORM */}
      <ModalCitaForm
        id={html_cita_form}
        saveCita={saveCita}
        cancelCitaForm={cancelCitaForm}
        fillPatienteByDNI={fillPatienteByDNI}
        personal={personal}
        pxss={pxss}
        redirect_data={_redirect_data}
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
const ModalCitaForm = ({id, saveCita, cancelCitaForm, fillPatienteByDNI, pxss, personal, redirect_data}) => (
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
          <div id="alert-pac_form" className="alert bg-info-700 fade" role="alert" style={{display: "none"}}>
            <strong id="alert-pac_form-headline"></strong> <span id="alert-pac_form-text"></span>.
          </div>
          <SelectPersonal personal={personal} />
          {/* Paciente */}
          <input type="text" id="pac_pk" style={{display:'none'}} disable="true" />
          <div className="form-group col-md-12">
            <label className="form-label input-sm" htmlFor="pac_dni">Dni: </label>
            <input type="text" id="pac_dni" placeholder="Dni del paciente" maxLength="30"
            className="form-control form-control-lg" onChange={e => fillPatienteByDNI(e.target.value)} />
          </div>

          <div style={{display: "block"}}>
            {/* New Patient Form */}
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <label className="form-label" htmlFor="newpat-name-pric">Nombre principal: </label>
              <input type="text" id="newpat-name-pric" className="form-control" />
            </div>
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <label className="form-label" htmlFor="newpat-name-sec">Nombre secundario: </label>
              <input type="text" id="newpat-name-sec" className="form-control" />
            </div>
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <label className="form-label" htmlFor="newpat-ape-p">Apellido paterno: </label>
              <input type="text" id="newpat-ape-p" className="form-control" />
            </div>
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <label className="form-label" htmlFor="newpat-ape-m">Apellido materno: </label>
              <input type="text" id="newpat-ape-m" className="form-control" />
            </div>
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <label className="form-label" htmlFor="newpat-phone">Celular: </label>
              <span style={{fontSize: ".6875rem", marginLeft: "1em", color: "blue"}}>(Mantener actualizado)</span>
              <input type="text" id="newpat-phone" className="form-control" maxLength="9" />
            </div>
            <div className="form-group col-md-6" style={{display:'inline-block'}}>
              <div className="custom-control custom-checkbox custom-control-inline" style={{alignItems: "center"}}>
                <input type="checkbox" className="custom-control-input" id="newpat-permiso_sms" />
                <label className="custom-control-label" htmlFor="newpat-permiso_sms">Permitir envio de mensajes</label>
              </div>
            </div>
          </div>

          {/* Fin Paciente */}
          <SelectProcedure
            pxss={pxss}
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
          <div id="alert-cita-form" className="alert bg-danger-400 text-white fade" role="alert" style={{display:'none'}}>
            <strong>Ups!</strong> <span>Parece que los datos introducidos no son correctos.</span>
          </div>
        </div>
        {/* FIN FORMULARIO CITA */}
        <div className="modal-footer">
          <button type="button" data-dismiss="modal" onClick={cancelCitaForm}
            className="btn btn-secondary waves-effect waves-themed" id="cita-cancel">Cancelar</button>
          <button type="button" onClick={saveCita}
            className="btn btn-primary waves-effect waves-themed">Guardar</button>
        </div>
      </div>
    </div>
  </div>
)
const InfoCita = ({id, cita, confirmAnnul, openReprogramarCitaModal, redirectTo}) => {
  if(!cita) return ""

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
            <h6><b>{tipo_documento[cita.paciente_data.tipo_documento]}: </b>{cita.paciente_data.dni?cita.paciente_data.dni:cita.paciente_data.dni_otro}</h6>
            <h6><b>Fecha: </b>{cita.fecha.split("-").reverse().join("/")}</h6>
            <h6><b>Hora: </b>{cita.hora} - {cita.hora_fin}</h6>
            <h6><b>Celular: </b>{cita.paciente_data.celular}</h6>
            <h6><b>Direccion: </b>{cita.paciente_data.direccion}</h6>
            <h6><b>Personal: </b>{cita.personal.fullname} - {cita.personal.especialidad_descripcion}</h6>
            <h6><b>Procedimientos: </b>{cita.programado}</h6>
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
const SelectProcedure = ({pxss, selected}) => {
  /* Selected comes from _redirect_data which is loaded at the very begining and never changes */
  const html_select_programed_procedure = "select-procedimiento_programado"

  useEffect(() => {
    if(!pxss || !selected) return

    // Select values when selected is setted
    window.$('#'+html_select_programed_procedure).val( selected.map(i => i.pxs_pk) )
    // window.$('#'+html_select_programed_procedure).trigger('change')
  }, [pxss])

  return (
    <div className="form-group col-md-12">
      <label className="form-label" htmlFor={html_select_programed_procedure}>Programado: </label>
      <select id={html_select_programed_procedure} className="custom-select form-control custom-select-lg" multiple>
        {pxss && pxss.map(pxs =>
          <option key={"select_proc_"+pxs.pk} value={pxs.pk}>
            {pxs.nombre.toUpperCase()}
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
      handleErrorResponse('Error', 'No se selecciono una cita a programar. Por favor contacte con el administrador', 'warning')
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
    .then(() => handleErrorResponse('custom', 'Exito!', "Cita reprogramada exitosamente", 'info'))
    .then(() => fakeReprogramarCita(cita, data))
    .catch(res => {
      res.text().then(er => {
        if(er == '["CRUCE_DE_CITAS"]')
          handleErrorResponse("custom", "", "Ya hay una cita programada para el personal en la hora indicada, por favor escoja otro horario", "warning")
        else handleErrorResponse("custom", "", "Ha ocurrido un error", "warning")
      })
    })
    .finally( () => window.$('#'+id).modal("hide") )
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
// Icon Components
const RefreshIcon = () => (
  <svg viewBox="0 0 16 16" style={{width: "10px"}}>
    <path d="M13.6,2.4 C12.2,0.9 10.2,0 8,0 C3.6,0 0,3.6 0,8 C0,12.4 3.6,16 8,16 C11.7,16 14.8,13.4 15.7,10 L13.6,10 C12.8,12.3 10.6,14 8,14 C4.7,14 2,11.3 2,8 C2,4.7 4.7,2 8,2 C9.7,2 11.1,2.7 12.2,3.8 L9,7 L16,7 L16,0 L13.6,2.4 L13.6,2.4 Z"/>
  </svg>
)
const EyeIcon = ({state}) => state ? (
  <svg viewBox="0 0 16 16" style={{width: "18px"}}>
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
  </svg>
) : (
  <svg viewBox="0 0 16 16" style={{width: "18px"}}>
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299l.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884l-12-12 .708-.708 12 12-.708.708z"/>
  </svg>
)

export default Cita
// eslint-disable-next-line react-hooks/exhaustive-deps
