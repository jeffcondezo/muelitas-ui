import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { savePageHistory, getPageHistory, getCacheData } from '../HandleCache';
import { Icon, PageTitle } from '../bits';
import { PatientDataList } from '../admision/Admision';


const HistoriaClinica = props => {
  // Receive {data.patient_pk, sucursal_pk, redirectTo}
  const [patient_pk, setPatientPK] = useState(props.data.patient_pk);
  const [selected_cita, selectCita] = useState(false);

  useEffect(() => {
    if( !patient_pk ){
      let tmp = getCacheData().patient_pk
      if(!tmp) props.redirectTo('/nav/admision')
      setPatientPK(tmp)
    }
    savePageHistory({patient_pk: patient_pk});
  }, [patient_pk])

  return (
    <>
      <PageTitle title={"Historia Clinica"} />

      <h5 style={{paddingBottom: "15px"}}>Fecha de generación de documento: {new Date().toDateInputValue()}</h5>
      {/*<HistoriaPatientData patient_pk={patient_pk} />*/}
      <HistoriaCitaList redirectTo={props.redirectTo} patient_pk={patient_pk} selectCita={selectCita} />
    </>
  )
}
// They all receive {patient_pk}
const HistoriaPatientData = props => {
  const [patient, setPatient] = useState(false);

  const getPatient = pac_pk => {
    // Get all attentions order by date
    let url = process.env.REACT_APP_PROJECT_API+`atencion/paciente/${pac_pk}/`;
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
        setPatient(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getPatient(props.patient_pk);
  }, []);

  return (
    <div>
      <h3>Datos del Paciente</h3>
      {!patient
        ? (<div className="card"><div className="card-body">loading</div></div>)
        : <PatientDataList patient={patient} />
      }
    </div>
  )
}
const HistoriaCitaList = props => {
  const [citaList, setCitaList] = useState(false);

  const getCitas = pac_pk => {
    // Get all attentions order by date
    let filter = `filtro={"paciente":"${pac_pk}", "estado":"5", "sort":"true"}`;
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
        // Remove duplicated attention
        let _tmp = response_obj;
        let _tmp1 = [];  // Store attention's id
        if(_tmp.length>0){
          _tmp = response_obj.filter(i => {
            if(_tmp1.includes(i.atencion)){  // If attention already in _tmp1
              return false;  // Remove
            }
            _tmp1.push(i.atencion);  // Save attention in _tmp1 array
            return true;
          });
        }

        setCitaList(_tmp);
      },
      error => {
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
        getCitas(props.patient_pk);
      };
      document.body.appendChild(dt_script);
    }else{
      getCitas(props.patient_pk);
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

  useEffect(() => {
    if(!citaList || citaList.length==0) return;

    // Gen Datatable
    let _tmp = window.$('#list-attention').DataTable({
      dom: 'trip',  // t: table, r: process display, i: information, p: pagination
      pageLength: 8,
      columnDefs: [{
        targets: -1,
        orderable: false,
      }],
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
  }, [citaList]);


  return (
    <div>
      <h3>Atenciones</h3>
      {!citaList
        ? (<div className="card"><div className="card-body">loading</div></div>)
        : (
          <table id="list-attention" className="col-12" style={{userSelect: "none", fontSize: "1.2em"}}>
            {citaList.length!=0
            ? (
              <thead>
                <tr>
                  <td>Fecha</td>
                  <td>Hora</td>
                  <td>Personal</td>
                  <td>Ver detalle</td>
                </tr>
              </thead>
            )
            : <tbody><tr><td></td></tr></tbody>}
            {citaList.length==0
              ? <tbody><tr><td>No se tiene registro de atenciones anteriores del paciente</td></tr></tbody>
              : (
                <tbody>
                {citaList.map(cita => (
                  <tr key={"cita-"+cita.pk} className="card-body" style={{paddingBottom:"10px"}}>
                    {/* FECHA */}
                    <td>
                      {cita.fecha}
                    </td>
                    {/* HORA */}
                    <td>
                      {cita.hora.slice(0, 5)} - {cita.hora_fin.slice(0, 5)}
                    </td>
                    {/* PERSONAL */}
                    <td>
                      {
                        cFL(cita.personal.nombre_principal)+" "+
                        cFL(cita.personal.ape_paterno)+" "+
                        cFL(cita.personal.ape_materno)
                      }
                    </td>
                    <td>
                      <Icon type="attention" onClick={() => props.redirectTo('/nav/atencion/detalle', {cita: cita})} />
                    </td>
                  </tr>
                ))}
                </tbody>
              )}
          </table>
        )
      }
    </div>
  )
}

export default HistoriaClinica;
