import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse } from '../../functions';
import { SelectOptions_Procedimiento } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_prescription";


const Prescripcion = props => {
  const cita = useRef(props.data).current;

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
        <i className="subheader-icon fal fa-chart-area"></i> Prescripción
      </h1>
    </div>
  </>
  )
}

export default Prescripcion;
