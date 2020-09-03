import React, { useState, useEffect } from 'react'
import {
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom";
import { getDataByPK } from '../../functions'


const PlanDeTrabajo = props => {
  let {patient_pk} = useParams()
  const [patient, setPatient] = useState(false)

  const getPatient = pac_pk => {
    getDataByPK('atencion/paciente', pac_pk )
    .then(
      response_obj => {
        setPatient(response_obj);
      }, error => {
        console.log("WRONG!", error);
      }
    );
  }

  useEffect(() => {
    getPatient(patient_pk)
  }, [])


  return !patient
  ? 'loading'
  : (
    <Switch>
      <Route exact path='/nav/plandetrabajo/:patient_pk/crear'>
        <PlanTrabajoCrear
          patient={patient}
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>
      <Route exact path='/nav/plandetrabajo/:patient_pk/detalle'>
        <PlanTrabajoDetalle
          patient={patient}
          sucursal_pk={props.sucursal_pk}
          redirectTo={props.redirectTo} />
      </Route>

      <Route>
        <Redirect to="/home" />
      </Route>
    </Switch>
  )
}

const PlanTrabajoDetalle = props => {
  return (
    <h1>DETALLE</h1>
  )
}
const PlanTrabajoCrear = props => {
  return (
    <h1>CREAR</h1>
  )
}

export default PlanDeTrabajo
