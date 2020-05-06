import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UNSAFE_cache_postState,
  UNSAFE_cache_getState,
  savePageHistory,
} from '../HandleCache';
import { handleErrorResponse, capitalizeFirstLetter as cFL } from '../../functions';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_admision";


function Admision(props){
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
        <i className="subheader-icon fal fa-chart-area"></i> Admision
      </h1>
    </div>

  </>
  )
}

export default Admision;

/*
* Datos del paciente (show)
* Admisión (actualizar datos, historia clinica)
* Admision buscar paciente
* admisión(registrar/buscar paciente nuevo|historia)

* Historia clinica (link)
* Procedimientos realizados (add|link)

+ Prescripción y medicamentos (show)
*/
