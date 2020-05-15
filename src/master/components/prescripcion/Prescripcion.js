import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse } from '../../functions';
import { SelectOptions_Procedimiento } from '../bits';
import { getPageHistory } from '../HandleCache';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_prescription";


const Prescripcion = props => {
  const [medicine_list, setMedicineList] = useState(false);

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
    props.redirectTo(getPageHistory().prev_pathname, {cita: props.data.cita});
  }

  useEffect(() => {
    getPrescriptionMedicine(props.data.cita.atencion);
  }, []);

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
        <i className="subheader-icon fal fa-chart-area"></i> Prescripción
      </h1>
    </div>

    <div className="row">
      <div className="col-lg-8">
        <AddMedicine cita={props.data.cita} sucursal_pk={props.sucursal_pk} addMedicineToList={addMedicineToList} />
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
          <button className="btn btn-primary" onClick={() => getBack()}>
            Regresar
          </button>
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
    );
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
    _tmp1 = document.getElementById("end-date");
    if(!_tmp1 || _tmp1.value.trim().length==0){
      handleErrorResponse("custom", "Error", "Debe indicar una fecha fin");
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
      fecha_fin: document.getElementById('end-date').value,
    }

    saveMedicineItem(_tmp);
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
        <label className="form-label" htmlFor="amount">Cantidad</label>
        <input type="text" className="form-control" id="amount"></input>
      </div>
      {/* Periodo */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="period">Periodo</label>
        <input type="text" className="form-control" id="period"></input>
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
      {/* Contraindicaciones */}
      <div className="col-sm" style={{paddingBottom: "5px"}}>
        <label className="form-label" htmlFor="end-date">Fecha fin</label>
        <input className="form-control" id="end-date" type="date"></input>
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

  useEffect(() => {
    /*
    if(window.$) window.$('#slimscroll').slimScroll({
      height: "305",
      size: "4px",
      color: "rgba(0,0,0,0.6)",
      distance: "4px",
      railcolor: "#fafafa",
    });
    */
  }, []);

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
            {medc.cantidad} {medc.periodo} {medc.indicaciones} <br/>
            Hasta el {medc.fecha_fin}
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
