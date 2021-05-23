import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom"

const BackendRedirect = () => {
  // standar: /red/docview/{formato_code}/{paciente.pk}/{sucursal.pk}
  // Eg: /red/docview/102/3/84/
  return (
    <Switch>
      <Route exact path="/red/docview/:doc_pk/:suc_pk/:pac_pk/"
        render={p =>
          window.location.replace(`${process.env.REACT_APP_PROJECT_API}atencion/viewdoc/${p.match.params.doc_pk}/${p.match.params.suc_pk}/${p.match.params.pac_pk}/`)} >
      </Route>
    </Switch>
  )
}

export default BackendRedirect
