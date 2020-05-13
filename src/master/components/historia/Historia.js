import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';
import { savePageHistory } from '../HandleCache';
import { Icon } from '../bits';


const HistoriaClinica = props => {
  const patient = useRef(props.data.patient).current;
  console.log(props, patient);
  const [citaList, setCitaList] = useState(false);

  function getCitaHistory(_pac_pk){
    // Get all attentions order by date
    let filter = `filtro={"paciente":"${_pac_pk}", "estado":"5", "sort":"true"}`;
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
        setCitaList(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getCitaHistory(patient.pk);

    savePageHistory();
  }, []);

  return !citaList
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px", userSelect: "none"}}>
        <div className="card-header">
          <div className="card-title">
            Historia Médica
          </div>
        </div>
        {/* LEFT TO STRUCTURE */}
        <div id="cita-list" className={citaList.length==0?"card-body":""}>
          {citaList.length==0
            ? "No se tiene registro de atenciones anteriores del paciente"
            : citaList.map(cita => (
              <div key={"cita-"+cita.pk}>
                <li className="list-group-item d-flex" id={cita.pk}
                  onClick={()=>{props.redirectTo("/nav/procedimiento/detalle", {cita: cita})}}
                  data-toggle="collapse" data-target={"#cita-desc-"+cita.pk}
                  aria-expanded="true" aria-controls={"cita-desc-"+cita.pk}
                  style={{cursor: "pointer", borderBottom: "0"}}>
                    <span style={{fontSize: "1.2em"}}>
                      sdlñfkjsadlñk
                    </span>
                </li>
              </div>
            ))}
        </div>
      </div>
    );
}

export default HistoriaClinica;

/*
* Handle cache state
*/
