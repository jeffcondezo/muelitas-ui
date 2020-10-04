import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { handleErrorResponse, getDataByPK } from '../../functions';
import { SelectOptions_Procedimiento } from '../bits';
import { postCacheData, getCacheData } from '../HandleCache';
import { PageTitle } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG


const Prescripcion = props => {
  // Receive {cita}
  let __params__ = useParams();

  const [cita, setCita] = useState(false)
  const [medicine_list, setMedicineList] = useState(false);

  const getCita = cita_pk => {
    getDataByPK('atencion/cita', cita_pk)
    .then(setCita)
  }
  const addMedicineToList = _medc => {
    if(!medicine_list){
      setMedicineList([_medc]);
      return;
    }

    setMedicineList([...medicine_list, _medc]);
  }
  const removeMedicineFromList = _medc_pk => {
    // Remove medicine by index in array
    let _tmp = medicine_list.filter(i => i.pk!=_medc_pk);

    setMedicineList(_tmp);
  }
  const getPrescriptionMedicine = (_attention_pk) => {
    // Add procedure to cita's attention
    let filter = `filtro={"atencion":"${_attention_pk}"}`;
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
        setMedicineList(response_obj);
      },
      error => {
        console.log("WRONG!", error);
      }
    );
  }
  const getBack = () => {
    props.redirectTo(`/nav/atencion/${cita.pk}/detalle`, {cita: cita});
  }
  const finishCita = () => {
    let data = {};
    data['estado'] = '5';

    let url = process.env.REACT_APP_PROJECT_API+`atencion/cita/anular/${cita.pk}/`;
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
            this.handleErrorResponse("permission");
          }else{
            reject(response.statusText)
          }
        }
      }, error => {
        this.handleErrorResponse("server");
      });
    });
    result.then(
      res => {
        handleErrorResponse("custom", "Exito", "La cita ha culminado exitosamente", "success")
        // props.redirectTo(`/nav/atencion/${}/detalle`);
        window.history.back()
      },
      er => handleErrorResponse("custom", "Ups!","Un error ha ocurrido")
    );
  }

  useEffect(() => {
    // Si props no recibe cita
    if(!cita) getCita(__params__.cita_pk)
  }, []);
  useEffect(() => {
    if(cita) getPrescriptionMedicine(cita.atencion);
  }, [cita])

  return !cita
  ? "loading"
  : (
  <>
    <PageTitle title={"Prescripción"} />
    <div id="alert-info" className="alert bg-info-700" role="alert">
      <strong id="alert-headline">Ojo</strong> <span id="alert-text">Al guardar la receta se finalizará la atención</span>.
    </div>

    <div className="row">
      <div className="col-lg-8">
        <AddMedicine
          cita={cita}
          sucursal_pk={props.sucursal_pk}
          addMedicineToList={addMedicineToList} />
      </div>
      <div className="col-lg-4 position-relative">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Medicamentos agregados
            </div>
          </div>

          <ListSavedMedicine medicine_list={medicine_list} removeMedicineFromList={removeMedicineFromList} />

        </div>
        <div className="position-absolute pos-bottom">
          {cita.estado==5
            ? <button className="btn btn-primary" onClick={() => getBack()}>
                Regresar
              </button>
            : <button className="btn btn-primary" onClick={() => finishCita()}>
                FINALIZAR ATENCION
              </button>
          }
        </div>
      </div>
    </div>
  </>
  )
}

const AddMedicine = props => {
  const [medicine, setMedicine] = useState(false);

  function getMedicines(_sucursal_pk){
    // Add procedure to cita's attention
    let url = process.env.REACT_APP_PROJECT_API+`atencion/medicamento/`;
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
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => {  // In case it's ok
        setMedicine(response_obj);
      },
      error => {  // In case of error
        console.log("WRONG!", error);
      }
    );
  }
  function selectOptions_Medicine(_medicines){
    if(!_medicines) return;
    const _medicine = [];

    if(_medicines!==false){
      _medicines.map(m => {
        _medicine.push(
          <option key={m.pk} value={m.pk}>
            {m.nombre.toUpperCase()}
          </option>
        );
      });
    }

    return _medicine;
  }
  const saveMedicineItem = _item => {
    // Save medicina
    fetch(
      process.env.REACT_APP_PROJECT_API+`atencion/prescripcion/`,
      {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
          'Content-Type': 'application/json'  // JSON type
        },
        body: JSON.stringify(_item)  // Data
      }
    ).then(
      response => {
        return response.ok
        ? response.json()
        : Promise.reject();
      },
      error => handleErrorResponse('server')
    ).then(
      response_obj => props.addMedicineToList(response_obj),
      error => handleErrorResponse('custom', "Error", "Ha ocurrido un error inesperado")
    ).then(() => clearForm());
  }
  function handleSubmit(){
    // Values validation
    let _tmp1;
    _tmp1 = document.getElementById("amount");
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Cantidad no especificada");
      return;
    }
    _tmp1 = document.getElementById("period");
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Periodo no especificado");
      return;
    }

    let _tmp = {
      atencion: props.cita.atencion,
      medicamento: document.getElementById('select_medicine').value,
      medicamento_name: document.getElementById('select_medicine').selectedOptions[0].text,
      cantidad: document.getElementById('amount').value,
      periodo: document.getElementById('period').value,
      indicaciones: document.getElementById('indications').value,
      contraindicaciones: document.getElementById('contraindications').value,
      hora_inicio: document.getElementById('start-time').value,
    }

    saveMedicineItem(_tmp);
  }
  function handlePeriodChange(period=4){
    period -= 0; // Convert string to int
    // Vars
    let now_hour = new Date().getHours();
    let now_minute = new Date().getMinutes();
    let suggested_hour = 0;

    // Algorithm
    if(period==12){
      // Breakfast & Dinner
      suggested_hour = 7;  // 7 AM
    }else if(period==8){
      // Breakfast & Lunch & Dinner
      suggested_hour = 6;  // 6 AM
    }else if(period==4){
      // Breakfast & Lunch & Dinner & Before sleep
      suggested_hour = 7;  // 7 AM
    }

    // Fix
    let tmp = suggested_hour;
    while(suggested_hour <= now_hour){
      suggested_hour += period;
      if(suggested_hour > 23){suggested_hour=tmp; break;}
    }
    // Set value
    document.getElementById('start-time').value = suggested_hour+":00";
  }
  const clearForm = () => {
    document.getElementById('amount').value = ""
    document.getElementById('indications').value = ""
    document.getElementById('contraindications').value = ""
    document.getElementById('period').value = "4"
    handlePeriodChange()
  }

  // Run at first execution
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
        getMedicines(props.sucursal_pk);
      }
      select2_script.src = "/js/formplugins/select2/select2.bundle.js";
      document.body.appendChild(select2_script);
    }else{
      getMedicines(props.sucursal_pk);
    }

    handlePeriodChange();
  }, []);
  // Run when medicine is setted
  useEffect(() => {
    if(!medicine) return;

    // Set select2 for medicine
    window.$("#select_medicine").select2({tags: true});
  }, [medicine]);

  return (
    <div className="form-group col-md-12">
      {/* Medicamento */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="select_medicine">Medicamento: </label>
        {!medicine
          ? "loading"
          : (
            <select id="select_medicine" className="custom-select form-control custom-select-lg">
              {selectOptions_Medicine(medicine)}
            </select>
          )}
      </div>
      {/* Cantidad */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="amount">Total a comprar</label>
        <input type="text" className="form-control" id="amount"></input>
      </div>
      {/* Periodo */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="period">Periodo</label>
        <select className="custom-select form-control" id="period" onChange={(e)=>handlePeriodChange(e.target.value)}>
          <option value="4">cada 4 horas</option>
          <option value="8">cada 8 horas</option>
          <option value="12">cada 12 horas</option>
        </select>
      </div>
      {/* Indicaciones */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="indications">Indicaciones</label>
        <textarea className="form-control" id="indications" rows="2"></textarea>
      </div>
      {/* Contraindicaciones */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="contraindications">Contraindicaciones</label>
        <textarea className="form-control" id="contraindications" rows="2"></textarea>
      </div>
      {/* Fecha Fin */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="start-time">Hora sugerida de inicio</label>
        <input className="form-control" id="start-time" type="time"></input>
      </div>

      <br/>
      {/* Agregar button */}
      <div className="col-sm d-flex">
        <button className="btn btn-dark" onClick={() => handleSubmit()}>
          Agregar
        </button>
      </div>
    </div>
  );
}
export const ListSavedMedicine = props => {
  // Receive {medicine_list, removeMedicineFromList}
  function deleteMedicine(_medicine_pk){
    // Add procedure to cita's attention
    let url = process.env.REACT_APP_PROJECT_API+`atencion/prescripcion/${_medicine_pk}/`;
    let result = new Promise((resolve, reject) => {
      let request = fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: localStorage.getItem('access_token'),  // Token
        },
      });
      request.then(response => {
        if(response.ok){
          resolve(response.text())
        }else{
          reject(response.statusText)
        }
      }, () => handleErrorResponse('server'));  // Print server error
    });
    result.then(
      response_obj => props.removeMedicineFromList(_medicine_pk),
      error => console.error
    );
  }

  // Generate elements from medicine_list
  if(!props.medicine_list || !props.medicine_list.length || props.medicine_list.length==0){
    return (<div className="card-body"><span style={{fontSize: ".9rem"}}>No se han agregado medicamentos</span></div>);
  }
  const el = [];
  props.medicine_list.map((medc, inx) => {el.push(
    <div key={"medc-"+inx}>
      <li className="list-group-item d-flex" id={inx}
        style={{cursor: "pointer", borderBottom: "0"}}
        data-toggle="collapse" data-target={"#medc-desc-"+inx}
        aria-expanded="true" aria-controls={"medc-desc-"+inx}>
          <span style={{fontSize: "1.2em", width: "100%"}}>
            {medc.medicamento_name}
          </span>
          <button className="btn ml-auto"
            style={{paddingTop: "0", paddingBottom: "0"}}
            onClick={()=>deleteMedicine(medc.pk)}>
              <i className="fal fa-trash-alt"></i>
          </button>
      </li>
      <div id={"medc-desc-"+inx} className="collapse" aria-labelledby={inx}
        style={{paddingLeft: "1.8rem", paddingTop: "0", paddingBottom: ".75rem"}}>
          <span>
            Cada {medc.periodo} horas <br/>
            {medc.indicaciones} <br/>
            {medc.contraindicaciones}
          </span>
      </div>
    </div>
  )});

  return (
    <div id="slimscroll" className="" style={{}}>
      {el}
    </div>
  );
}

export default Prescripcion;
