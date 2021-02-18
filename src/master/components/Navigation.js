import React, {useState, useEffect, useRef, createContext, useContext } from 'react'
import {
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect,  // Redirect url
  Link,  // Alternative to HTML element 'a'
  withRouter,  // Allow us access to route props
} from "react-router-dom"  // https://reacttraining.com/react-router/web/api/
import './Navigation.css'
import {
  simpleGet,
  capitalizeFirstLetter as cFL,
  deleteUserLogIn,
} from '../functions'
import { postCacheData } from './HandleCache'

// Components to import
import Admision from './admision/Admision'
import Cita from './cita/Cita'
import Atencion from './atencion/Atencion'
import OdontogramaNavigation from './odontograma/Odontograma'
import Procedimiento from './procedimiento/Procedimiento'
import Prescripcion from './prescripcion/Prescripcion'
import HistoriaClinica from './historia/Historia'
import Cobranza from './finanzas/Cobranza'
import PlanDeTrabajo from './plandetrabajo/PlanDeTrabajo'
import Admin from './admin/Admin'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
export const NavigationContext = createContext({})

function Navigation({user, history}){
  const [current_sucursal_pk, setCurrentSucursal] = useState(false)  // Current enviroment sucursal
  const sucursales = useRef([])  // User's sucursal
  const redirect = useRef(false)  // Only to store values, changes do not render

  if(__debug__==="true") console.log(`%c --------- MOUNTING ${history.location.pathname} ---------`, 'background: black; color: red')
  if(__debug__==="true") console.log(`%c PROPS:`, 'color: yellow', user, sucursales.current, current_sucursal_pk, redirect.current)

  function setSucursal(){
    simpleGet(`maestro/admin/permisos/asignar/?filtro={"usuario":"${user.pk}"}`)
    .then(
      response_obj => {
        // Handle sucursal response
        let _obj = response_obj[0]
        // Save data
        sucursales.current = _obj.sucursales
        // Set current sucursal
        setCurrentSucursal(_obj.sucursales[0].pk)
      },
      error => {
        console.log(error)
      }
    )
  }
  const changeSucursal = _pk => {
    console.log("changeSucursal", _pk)
    // If it's the same _pk than the current one, abort
    if(current_sucursal_pk===_pk) return
    setCurrentSucursal(_pk)
  }
  const redirectTo = (url, data=null) => {
    if(data) redirect.current = data
    history.push(url)
  }

  useEffect(() => {
    // Add resources
    if(!document.getElementById('main_script')){
      const main_script = document.createElement("script")
      main_script.id = "main_script"
      main_script.async = false
      main_script.src = "/js/vendors.bundle.js"
      document.body.appendChild(main_script)
    }
    if(!document.getElementById('main_script2')){
      const main_script2 = document.createElement("script")
      main_script2.async = false
      main_script2.id = "main_script2"
      main_script2.src = "/js/app.bundle.js"
      document.body.appendChild(main_script2)
    }
  }, [])
  useEffect(() => {
    // Only when user comes with props get sucursal
    if(user) setSucursal()
  }, [user])
  useEffect(() => {
    // Execute when current_sucursal_pk changes
    if(current_sucursal_pk===-1) return

    // Change current sucursal in cache
    postCacheData({current_sucursal_pk: current_sucursal_pk})
  }, [current_sucursal_pk])

  // Navigation context
  const context = {
    sucursales: sucursales.current,
    current_sucursal: current_sucursal_pk,
    changeSucursal: changeSucursal,
    user: user,
    redirect_data: redirect.current,
    redirectTo: redirectTo,
    history: history,
  }
  // Reset redirect data bc it has already been stored in context
  // if(redirect.current) redirect.current = false

  return !current_sucursal_pk
  ? "loading"
  : (
    <NavigationContext.Provider value={context}>
      <div>
        <div className="page-wrapper">
          <div className="page-inner">
            <Aside />
            <div className="page-content-overlay" data-action="toggle" data-class="mobile-nav-on"></div>

            <PageContent />
          </div>
        </div>
      </div>
    </NavigationContext.Provider>
  )
}

/*** COMPONENTS ***/
const SelectComponent = () => (
  <main id="js-page-content" role="main" className="page-content">
    <Switch>
      <Route exact path="/nav/home">
        <SPAHome />
      </Route>
      <Route path="/nav/cita">
        <Cita />
      </Route>
      <Route path="/nav/atencion">
        <Atencion />
      </Route>
      <Route path="/nav/admision">
        <Admision />
      </Route>
      <Route path="/nav/cobranza">
        <Cobranza />
      </Route>
      <Route path="/nav/admin">
        <Admin />
      </Route>

      {/* Components accessed only by redirect */}
      <Route path="/nav/odontograma/">
        <OdontogramaNavigation />
      </Route>
      <Route exact path="/nav/procedimiento/:proc_pk/:action/">
        <Procedimiento />
      </Route>
      <Route exact path="/nav/prescripcion/:cita_pk/">
        <Prescripcion />
      </Route>
      <Route exact path="/nav/historiaclinica/:patient_pk/">
        <HistoriaClinica />
      </Route>
      <Route path="/nav/plandetrabajo/:patient_pk/">
        <PlanDeTrabajo />
      </Route>

      {/* Default link */}
      <Route>
        <Redirect to="/nav/cita" />
      </Route>
    </Switch>
  </main>
)
/*** PAGE ***/
const AsideLinks = () => {
  let _path = window.location.pathname
  return (
    <ul id="js-nav-menu" className="nav-menu">
      <li className="nav-title" style={{color: "#CCC"}}>Paginas principales</li>
      <li className={/^\/nav\/admision/.test(_path)?"active":""}>
        <Link data-filter-tags="admision" to='/nav/admision'>
          <span className="nav-link-text">ADMISION</span>
        </Link>
      </li>
      <li className={/^\/nav\/cita/.test(_path)?"active":""}>
        <Link data-filter-tags="cita" to='/nav/cita'>
          <span className="nav-link-text">CITA</span>
        </Link>
      </li>
      <li className={/^\/nav\/atencion/.test(_path)?"active":""}>
        <Link data-filter-tags="atencion" to='/nav/atencion'>
          <span className="nav-link-text">ATENCION</span>
        </Link>
      </li>
      {/*
      <li className={/^\/nav\/admin/.test(_path)?"active":""}>
        <Link data-filter-tags="admin" to='/nav/admin'>
          <span className="nav-link-text">ADMIN</span>
        </Link>
      </li>
      */}
    </ul>
  )
}
const Aside = () => {
  const {user, current_sucursal} = useContext(NavigationContext)
  return (
    <aside className="page-sidebar">
      <div className="page-logo">
        <div className="page-logo-link d-flex align-items-center position-relative">
          <img src="/img/logo_muelitas_image.png" style={{
            display: "inline-block",
            width: "58px", height: "58px",
          }} />
          <img src="/img/logo_muelitas_text.png" style={{
            display: "inline-block",
            height: "40px",
            filter: "invert(1)",
          }} />
        </div>
      </div>

      <nav id="js-primary-nav" className="primary-nav" role="navigation">
        <div className="info-card">
          <img
            src={current_sucursal!==-1 && (user.personal.sexo == "1" ? "/img/unk_user_male.jpg" : "/img/unk_user_female.jpg")}
            className="profile-image rounded-circle"
            alt={current_sucursal!==-1 && user.first_name}
          />
          <div className="info-card-text">
            <a href="#" className="d-flex align-items-center text-white">
              <span className="text-truncate text-truncate-sm d-inline-block">
                {user.personal?
                  cFL(user.personal.nombre_principal)+" "+cFL(user.personal.ape_paterno) :
                  "Invitado"
                }
              </span>
            </a>
            <span className="d-inline-block text-truncate text-truncate-sm"
              title={user.personal ? user.personal.especialidad : "Administrador"}>
              {user.personal ? cFL(user.personal.especialidad) : "Administrador"}
            </span>
          </div>
          <img src="/img/card-backgrounds/cover-2-lg.png" className="cover" alt="cover"/>
        </div>

        <AsideLinks />
      </nav>
    </aside>
  )
}
const PageContent = () => (
  <div className="page-content-wrapper">
    <PageHeader />
    <SelectComponent />
    <PageFooter />
  </div>
)
const PageHeader = () => (
  <header className="page-header" role="banner">
    <div className="hidden-md-down dropdown-icon-menu position-relative">
      <a href="#" className="header-btn btn js-waves-off" data-action="toggle" data-class="nav-function-hidden" title="Hide Navigation">
        <i className="ni ni-menu"></i>
      </a>
    </div>
    <div className="hidden-lg-up">
      <a href="#" className="header-btn btn press-scale-down" data-action="toggle" data-class="mobile-nav-on">
        <i className="ni ni-menu"></i>
      </a>
    </div>

    <div className="ml-auto d-flex">
      <UserSettings />
    </div>
  </header>
)
const UserSettings = () => {
  const {user, current_sucursal, sucursales, changeSucursal} = useContext(NavigationContext)
  const userLogOut = () => {
    deleteUserLogIn()  // Delete token from localstorage
    window.location.replace("/")  // Reload page
  }

  return (
    <div>
      <a href="#" title={current_sucursal!=-1 ? user.email : ""}
      data-toggle="dropdown" className="header-icon d-flex align-items-center justify-content-center ml-2">
        <span className="ml-1 mr-1 text-truncate" style={{fontSize: "1.4em", display: "block"}}>
          {current_sucursal!=-1 && cFL(user.personal.nombre_principal)+" "+cFL(user.personal.ape_paterno)}
        </span>
        <i className="ni ni-chevron-down hidden-xs-down"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-animated dropdown-lg">
        {/* CHOOSE SUCURSAL
        * We pass data as prop in order to ChooseSucursal be a reusable component
        */}
        <ChooseSucursal
          sucursales={sucursales}
          changeSucursal={changeSucursal}
          current_sucursal={current_sucursal}
          />
        <a href="#" className="dropdown-item" data-action="app-fullscreen">
          <span data-i18n="drpdwn.fullscreen">Pantalla Completa</span>
        </a>
        <a className="dropdown-item fw-500 pt-3 pb-3" onClick={userLogOut}>
          <span data-i18n="drpdwn.page-logout">Cerrar sesion</span>
        </a>
      </div>
    </div>
  )
}
const ChooseSucursal = ({sucursales, changeSucursal, current_sucursal}) => (
  <div className="dropdown-multilevel dropdown-multilevel-left">
    <div className="dropdown-item">
      Sucursal
    </div>
    <div className="dropdown-menu">
      {sucursales && sucursales.map(s =>
        <a key={s.pk} onClick={()=>changeSucursal(s.pk)}
        className={s.pk==current_sucursal?"dropdown-item active":"dropdown-item"}>
          {cFL(s.direccion)}
        </a>
      )}
    </div>
  </div>
)
const PageFooter = () => (
  <footer className="page-footer" role="contentinfo">
    <div className="d-flex align-items-center flex-1 text-muted">
      <span className="hidden-md-down fw-700">2020 © Muelitas by&nbsp;<a href='http://datakrafthco.com/' className='text-primary fw-500' target='_blank'>DataKraft EIRL</a></span>
    </div>
  </footer>
)
function SPAHome(){
  return (
    <h1>HOME</h1>
  )
}

/* NOTES
* Functions components can return only one element,
  to return more than only one, you should put them inside another tag
  altough this is a walkaround it's a bad practice bc every function should return only 1 value
  <> content </>

* Handle routes params
  let { path, url } = useRouteMatch()
  let { topicId } = useParams()
*/

export default withRouter(Navigation)
// eslint-disable-next-line react-hooks/exhaustive-deps
