import React, { useState, useEffect } from 'react'
import {
  simpleGet,
  simplePostData,
  handleErrorResponse,
} from '../../functions'
import {
  useParams,
} from "react-router-dom"
import {
  PageTitle,
} from '../bits'



const CuestionarioPaciente = () => {
  const [cuestionario, setCuestionario] = useState(false)
  const [respuesta, setRespuesta] = useState(false)
  const {patient, cuestionario_pk} = useParams()

  const getCuestionario = () => simpleGet(`atencion/cuestionario/${cuestionario_pk}/pregunta/list/`)
    .then(setCuestionario).then(getRespuesta)
  const getRespuesta = () => simpleGet(`atencion/cuestionario/${cuestionario_pk}/paciente/${patient}/`).then(setRespuesta)
  const getBack = () => window.window.location.replace(`/nav/admision/${patient}/detalle`)
  const getCuestionarioData = () => {
    let _data = []
    // Join a pair of data (pregunta.pk, respuesta)
    cuestionario.preguntas.map(p => {
      let t = window.document.getElementById("pregunta-"+p.pk)
      if(t) _data.push({pregunta: p.pk, respuesta: t.value})
    })
    return _data
  }
  const saveData = () => {
    // Get form data
    let _data = {
      paciente: patient,
      cuestionario: cuestionario_pk
    }
    _data.respuestas = getCuestionarioData()

    simplePostData('atencion/cuestionario/respuesta/', _data)
    .then(() => handleErrorResponse("custom", "Registrado", "", "info"))
    .then(getBack)
    .catch(() => handleErrorResponse("custom", "Error", "Ocurrio un error en el procesamiento", "danger"))
  }

  useEffect(() => {
    getCuestionario()
  }, [])
  useEffect(() => {
    if(!respuesta) return

    respuesta.respuestas.map(r => window.document.getElementById("pregunta-"+r.pregunta).value = r.respuesta)
  }, [respuesta])

  return (
    <div className="form-group col-md-12">
      <PageTitle title={"Cuestionario: "+cuestionario.titulo} />
      {cuestionario && cuestionario.preguntas.length == 0 && (
        <h4>No hay preguntas, puede agregarlas <a href={`/nav/admin/cuestionario/${cuestionario_pk}/`}>aquí</a></h4>
      )}
      {cuestionario && cuestionario.preguntas.map(f => (
      <div key={"container-pregunta-field-"+f.pk} className="form-group col-md-6" style={{
        display:'inline-block',
        verticalAlign: 'top'
      }}>
        <label className="form-label" htmlFor={"pregunta-"+f.pk}>{f.texto}</label>
        {f.tipo_campo == 1 && (<input type="text" id={"pregunta-"+f.pk} className="form-control" />)}
        {f.tipo_campo == 2 && (<textarea className="form-control" id={"pregunta-"+f.pk} rows="2"></textarea>)}
      </div>
      ))}

      <div className="form-group d-flex">
        {cuestionario && cuestionario.preguntas.length != 0 && (
          <button className="btn btn-primary" onClick={saveData}>Guardar</button>
        )}

        <button className="btn btn-light ml-auto" onClick={getBack}>
          Regresar
        </button>
      </div>
    </div>
  )
}

export default CuestionarioPaciente
