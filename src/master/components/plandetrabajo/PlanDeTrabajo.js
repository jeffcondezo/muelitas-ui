import React, { useState, useEffect } from 'react'
import {
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import { getDataByPK, simplePostData, getPatientFullName } from '../../functions'
import { PageTitle } from '../bits';


const PlanDeTrabajo = ({sucursal_pk, redirectTo}) => {

  return (
    <>
    <PageTitle title="Plan de Trabajo" />

    <Switch>
      <Route exact path="/nav/plandetrabajo/:patient_pk/">
        <PlanDeTrabajoLista
          sucursal_pk={sucursal_pk}
          redirectTo={redirectTo} />
      </Route>
      <Route exact path="/nav/plandetrabajo/:patient_pk/detalle/:pdt_pk/">
        <PlanDeTrabajoDetalle
          sucursal_pk={sucursal_pk}
          redirectTo={redirectTo} />
      </Route>
    </Switch>
    </>
  )
}

const PlanDeTrabajoLista = ({sucursal_pk, redirectTo}) => {
  let {patient_pk} = useParams()
  const [patient, setPatient] = useState(false)
  const [pdts, setPdts] = useState(false)

  const creatProc = () => {
    console.log("Agregar procedimiento");
  }

  useEffect(() => {
    getDataByPK('atencion/paciente', patient_pk)
    .then(setPatient)
    .then( () => simplePostData(`atencion/plantrabajo/?filtro={"paciente":"${patient_pk}"}`, {}, "GET") )
    .then(setPdts)
  }, [])

  return !patient
  ? "loading"
  : (
    <div>
      <h1>Paciente: {getPatientFullName(patient)}</h1>
      <div>
      {!pdts ? "loading" : pdts.length==0 ? "No hay Planes de trabajo para este paciente"
        : pdts.forEach((pdt) => (
          <h4>pdt.nombre</h4>
        ))
      }
      </div>
      <br/>

      <div style={{
        display: "flex",
      }}>
        <div class="form-group" style={{
          flex: "1 1 0%"
        }}>
          <label className="form-label" for="proc-name">Nombre</label>
          <input type="text" id="proc-name" className="form-control" />
        </div>
        <div style={{
          alignSelf: "center",
          flex: "1 1 0%"
        }}>
          <button className="btn btn-primary">Crear</button>
        </div>
      </div>
    </div>
  )
}
const PlanDeTrabajoDetalle = ({sucursal_pk, redirectTo}) => {
  let {patient_pk} = useParams()

  return (
    <>
      <div className="row" style={{
        justifyContent: "center",
        paddingBottom: "45px",
      }}>
        <div className="card">
          <div className="card-body" style={{
            display: "flex",
            flexFlow: "column",
            alignItems: "center"
          }}>
            <Graph_Circle />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
            <Graph_InterLine />
            <Graph_Box />
          </div>
        </div>
      </div>
      {/* Fixed action bar */}
      <div style={{
        bottom: "0",
        right: "0",
        width: "100%",
        height: "100px",
        backgroundColor: "#dad8db",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        HOLA
      </div>
    </>
  )
}

const Graph_Circle = () => {
  return (
    <div className="btn btn-icon rounded-circle" style={{
      backgroundColor: "#eee",
      border: "1px solid #ddd",
      width: "30px",
      height: "30px"
    }}>
    </div>
  )
}
const Graph_InterLine = () => {
  return (
    <div style={{
      width: "2px",
      height: "25px",
      border: "1px solid #bbb",
    }}>
    </div>
  )
}
const Graph_Box = ({proc_title}) => {
  return (
    <div style={{
      maxWidth: "300px",
      fontSize: "1.6em",
      padding: "10px",
      border: "1px solid #bbb",
      textAlign: "center",
      borderRadius: "6px"
    }}>
      {proc_title || "Titulo del procedimiento"}
    </div>
  )
}


export default PlanDeTrabajo




/**/
