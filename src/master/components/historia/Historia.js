import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { savePageHistory } from '../HandleCache';
import { Icon } from '../bits';
import { PatientDataList } from '../admision/Admision';


const HistoriaClinicaWrapper = props => {
  return (
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
          <i className="subheader-icon fal fa-chart-area"></i> Historia Clinica
        </h1>
      </div>
    </>
  )
}
const HistoriaClinica = props => {
  // Receive {data.patient_pk, sucursal_pk, redirectTo}
  const patient_pk = useRef(props.data.patient_pk).current;

  return (
    <>
      <HistoriaClinicaWrapper />
      <h5 style={{paddingBottom: "15px"}}>Fecha de generación de documento: {new Date().toDateInputValue()}</h5>
      <HistoriaPatientData patient_pk={patient_pk} />
      <HistoriaCitaList patient_pk={patient_pk} />
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
    getCitas(props.patient_pk);
  }, []);

  return (
    <div>
      <h3>Atenciones</h3>
      {!citaList
        ? (<div className="card"><div className="card-body">loading</div></div>)
        : (
          <div className="col-12" style={{padding: "0px", userSelect: "none", fontSize: "1.2em"}}>
            <div id="cita-list" className={citaList.length==0?"card-body":""}>
              {citaList.length==0
                ? "No se tiene registro de atenciones anteriores del paciente"
                : citaList.map(cita => (
                  <div key={"cita-"+cita.pk} className="card-body" style={{paddingBottom:"10px"}}>
                    <span>
                      La cita se realizó el día {cita.fecha} a las {cita.hora.slice(0, 5)} - {cita.hora_fin.slice(0, 5)} <br/>
                      El paciente fue atendido por el {cita.personal.especialidad_descripcion}
                      <span style={{color:"black"}}> {
                        cFL(cita.personal.ape_paterno)+" "+
                        cFL(cita.personal.ape_materno)+", "+
                        cFL(cita.personal.nombre_principal)+
                        (cita.personal.nombre_secundario?" "+cFL(cita.personal.nombre_secundario):"")
                      }</span><br/>
                    </span>
                    <div>
                      <h4>Procedimientos</h4>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      }
    </div>
  )
}

export default HistoriaClinica;

/*
* change history format to table
* procedimientos por atencion

* Handle cache state
*/
