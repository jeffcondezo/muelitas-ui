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
import { Icon } from './bits';

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
import Reportes from './reportes/Reportes'

// Constant
const __debug__ = process.env.REACT_APP_DEBUG == "true"
export const NavigationContext = createContext({})

function Navigation({user, history}){
  const [current_sucursal_pk, setCurrentSucursal] = useState(false)  // Current enviroment sucursal
  const sucursales = useRef([])  // User's sucursal
  const redirect = useRef(false)  // Only to store values, changes do not render

  if(__debug__==="true") console.log(`%c --------- MOUNTING ${history.location.pathname} ---------`, 'background: black; color: red')
  if(__debug__==="true") console.log(`%c PROPS:`, 'color: yellow', user, sucursales.current, current_sucursal_pk, redirect.current)

  function setSucursal(){
    // Get sucursales where user is included
    simpleGet(`maestro/empresa/sucursal/user/`)
    .then(
      res => {
        if(res.length == 0){
          noSucursalAdded()
          return
        }
        // Handle sucursal response
        // Save data
        sucursales.current = res
        // Set current sucursal
        setCurrentSucursal(res[0].pk)
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
  const noSucursalAdded = () => {
    // User has no sucursal in which to work
    alert("lo sentimos, su usuario no tiene ninguna sucursal asignada")
    deleteUserLogIn()  // Delete token from localstorage
    window.location.replace("/")  // Reload page
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
  if(redirect.current) redirect.current = false

  return !current_sucursal_pk
  ? "loading"
  : (
    <NavigationContext.Provider value={context}>
      <div>
        <div className="page-wrapper">
          <div className="page-inner">
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
        <Redirect to="/nav/cita" />
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
      <Route path="/nav/reporte">
        <Reportes />
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
const PageContent = () => (
  <div className="page-content-wrapper bg-brand-gradient">
    <PageHeader />
    <SelectComponent />
    <PageFooter />
  </div>
)
const PageHeader = () => (
  <header className="page-header" style={{
    backgroundColor: "#2b4c81",
    backgroundImage: "linear-gradient(270deg,rgba(46,182,151,.18),transparent)"
  }}>
    {/* Logo */}
    <div className="press-scale-down">
      <div className="page-logo-link d-flex align-items-center position-relative">
        <img src="/img/logo_muelitas_image.png" style={{
          display: "inline-block",
          width: "58px", height: "58px",
        }} />
        <img src="/img/logo_muelitas_text.png" style={{
          display: "inline-block",
          height: "50px",
          filter: "invert(1)",
        }} />
      </div>
    </div>

    {/* Actions */}
    <div className="ml-auto d-flex">
      <ActionApps />
      <ActionSettings />
      <ActionUser />
    </div>
  </header>
)
const ChooseSucursal = ({sucursales, changeSucursal, current_sucursal}) => (
  <div className="dropdown-multilevel dropdown-multilevel-left">
    <div className="dropdown-item">
      Sucursal
    </div>
    <div className="dropdown-menu">
      {sucursales && sucursales.map(s =>
        <a key={s.pk} onClick={()=>changeSucursal(s.pk)}
        className={s.pk==current_sucursal?"dropdown-item active":"dropdown-item"}>
          {s.direccion}
        </a>
      )}
    </div>
  </div>
)
const PageFooter = () => (
  <footer className="page-footer" role="contentinfo">
    <div className="d-flex align-items-center flex-1 text-muted">
      <span className="hidden-md-down fw-700">2021 © Muelitas by&nbsp;<a href='http://datakrafthco.com/' className='text-primary fw-500' target='_blank'>DataKraft EIRL</a></span>
    </div>
  </footer>
)

// Unused components
const ActionUser = () => {
  const {user, current_sucursal, sucursales, changeSucursal} = useContext(NavigationContext)
  const userLogOut = () => {
    deleteUserLogIn()  // Delete token from localstorage
    window.location.replace("/")  // Reload page
  }

  return (
    <div>
      <a href="#" data-toggle="dropdown" className="header-icon d-flex align-items-center justify-content-center">
        <img className="rounded-circle" style={{width: "2rem", height: "2rem"}}
        src={(user.personal.sexo == "1" ? "/img/unk_user_male.jpg" : "/img/unk_user_female.jpg")} />
      </a>
      <div className="dropdown-menu dropdown-menu-animated dropdown-lg">
        {/* User card */}
        <div className="dropdown-header bg-trans-gradient d-flex flex-row py-4 rounded-top">
          <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
            <span className="mr-2">
              <img className="rounded-circle profile-image"
              src={(user.personal.sexo == "1" ? "/img/unk_user_male.jpg" : "/img/unk_user_female.jpg")} />
            </span>
            <div className="info-card-text">
              <div className="fs-lg text-truncate text-truncate-lg">
                {user.personal ? cFL(user.personal.nombre_principal)+" "+cFL(user.personal.ape_paterno) : "Invitado"}
              </div>
              <span className="text-truncate text-truncate-md opacity-80">
                {user.personal ? cFL(user.personal.especialidad) : "Administrador"}
              </span>
            </div>
          </div>
        </div>

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
const ActionSettings = () => {
  const {redirectTo} = useContext(NavigationContext)

  return (
    <div>
      <a href="#" className="header-icon" data-toggle="dropdown">
        <i className="fal fa-cog text-white"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-animated w-auto h-auto">
        <div className="dropdown-header d-flex justify-content-center align-items-center rounded-top" style={{backgroundColor: "#2b5d84"}}>
          <h4 className="m-0 text-center color-white">
            Configuración
            <small className="mb-0 opacity-80">Herramientas de administración</small>
          </h4>
        </div>
        <div className="custom-scroll h-100">
          <ul className="app-list">
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/admin/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-list icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Admin
                </span>
              </a>
            </li>
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/reporte/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-chart-bar icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Reportes
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
const ActionApps = () => {
  const {redirectTo} = useContext(NavigationContext)

  return (
    <div>
      <a href="#" className="header-icon" data-toggle="dropdown">
        <i className="fal fa-chevron-double-down text-white"></i>
      </a>
      <div className="dropdown-menu dropdown-menu-animated w-auto h-auto">
        <div className="dropdown-header d-flex justify-content-center align-items-center rounded-top" style={{backgroundColor: "#2b5d84"}}>
          <h4 className="m-0 text-center color-white">
            Páginas
            <small className="mb-0 opacity-80">Vistas y funciones</small>
          </h4>
        </div>
        <div className="custom-scroll h-100">
          <ul className="app-list">
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/cita/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-calendar-alt icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Citas
                </span>
              </a>
            </li>
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/admision/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-user-md icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Admision
                </span>
              </a>
            </li>
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/atencion/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-id-card-alt icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Atencion
                </span>
              </a>
            </li>
            <li>
              <a className="app-list-item hover-white" onClick={() => redirectTo("/nav/admision/mensaje/")}>
                <span className="icon-stack">
                  <i className="base-5 icon-stack-3x color-primary-500"></i>
                  <i className="fal fa-envelope icon-stack-1x text-white"></i>
                </span>
                <span className="app-list-name">
                  Mensajes
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
const ActionNotifications = () => {
  return (
    <div>
        <a href="#" className="header-icon" data-toggle="dropdown" title="You got 11 notifications">
          <i className="fal fa-bell"></i>
          <span className="badge badge-icon">11</span>
        </a>
        <div className="dropdown-menu dropdown-menu-animated dropdown-xl">
            <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center rounded-top mb-2">
              <h4 className="m-0 text-center color-white">
                11 New
                <small className="mb-0 opacity-80">User Notifications</small>
              </h4>
            </div>
            <ul className="nav nav-tabs nav-tabs-clean" role="tablist">
              <li className="nav-item">
                <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-messages" data-i18n="drpdwn.messages">Messages</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-feeds" data-i18n="drpdwn.feeds">Feeds</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-4 fs-md js-waves-on fw-500" data-toggle="tab" href="#tab-events" data-i18n="drpdwn.events">Events</a>
              </li>
            </ul>
            <div className="tab-content tab-notification">
                <div className="tab-pane active p-3 text-center">
                  <h5 className="mt-4 pt-4 fw-500">
                    <span className="d-block fa-3x pb-4 text-muted">
                      <i className="ni ni-arrow-up text-gradient opacity-70"></i>
                    </span> Select a tab above to activate
                    <small className="mt-3 fs-b fw-400 text-muted">
                      This blank page message helps protect your privacy, or you can show the first message here automatically through
                      <a href="#">settings page</a>
                    </small>
                  </h5>
                </div>
                <div className="tab-pane" id="tab-messages" role="tabpanel">
                  <div className="custom-scroll h-100">
                    <ul className="notification">
                      <li className="unread">
                        <a href="#" className="d-flex align-items-center">
                          <span className="status mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Melissa Ayre <span className="badge badge-primary fw-n position-absolute pos-top pos-right mt-1">INBOX</span></span>
                            <span className="msg-a fs-sm">Re: New security codes</span>
                            <span className="msg-b fs-xs">Hello again and thanks for being part...</span>
                            <span className="fs-nano text-muted mt-1">56 seconds ago</span>
                          </span>
                        </a>
                      </li>
                      <li className="unread">
                        <a href="#" className="d-flex align-items-center">
                          <span className="status mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Adison Lee</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">2 minutes ago</span>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="d-flex align-items-center">
                          <span className="status status-success mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Oliver Kopyuv</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">3 days ago</span>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="d-flex align-items-center">
                          <span className="status status-warning mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Dr. John Cook PhD</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">2 weeks ago</span>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="d-flex align-items-center">
                            <span className="status status-success mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Sarah McBrook</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">3 weeks ago</span>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="d-flex align-items-center">
                          <span className="status status-success mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Anothony Bezyeth</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">one month ago</span>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="d-flex align-items-center">
                          <span className="status status-danger mr-2">
                            <span className="profile-image rounded-circle d-inline-block"></span>
                          </span>
                          <span className="d-flex flex-column flex-1 ml-1">
                            <span className="name">Lisa Hatchensen</span>
                            <span className="msg-a fs-sm">Msed quia non numquam eius</span>
                            <span className="fs-nano text-muted mt-1">one year ago</span>
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="tab-pane" id="tab-feeds" role="tabpanel">
                  <div className="custom-scroll h-100">
                    <ul className="notification">
                      <li className="unread">
                        <div className="d-flex align-items-center show-child-on-hover">
                          <span className="d-flex flex-column flex-1">
                            <span className="name d-flex align-items-center">Administrator <span className="badge badge-success fw-n ml-1">UPDATE</span></span>
                            <span className="msg-a fs-sm">
                              System updated to version <strong>4.0.2</strong> <a href="intel_build_notes.html">(patch notes)</a>
                            </span>
                            <span className="fs-nano text-muted mt-1">5 mins ago</span>
                          </span>
                          <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="d-flex align-items-center show-child-on-hover">
                          <div className="d-flex flex-column flex-1">
                            <span className="name">
                              Adison Lee <span className="fw-300 d-inline">replied to your video <a href="#" className="fw-400"> Cancer Drug</a> </span>
                            </span>
                            <span className="msg-a fs-sm mt-2">Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day...</span>
                            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
                          </div>
                          <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="d-flex align-items-center show-child-on-hover">
                          <div className="d-flex flex-column flex-1">
                            <span className="name">
                              Troy Norman'<span className="fw-300">s new connections</span>
                            </span>
                            <div className="fs-sm d-flex align-items-center mt-2">
                              <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                              <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                              <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                              <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                              <div data-hasmore="+3" className="rounded-circle profile-image-md mr-1">
                                <span className="profile-image-md mr-1 rounded-circle d-inline-block"></span>
                              </div>
                            </div>
                            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
                          </div>
                          <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="d-flex align-items-center show-child-on-hover">
                          <div className="d-flex flex-column flex-1">
                            <span className="name">Dr John Cook <span className="fw-300">sent a <span className="text-danger">new signal</span></span></span>
                            <span className="msg-a fs-sm mt-2">Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.</span>
                            <span className="fs-nano text-muted mt-1">10 minutes ago</span>
                          </div>
                          <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="d-flex align-items-center show-child-on-hover">
                          <div className="d-flex flex-column flex-1">
                            <span className="name">Lab Images <span className="fw-300">were updated!</span></span>
                            <div className="fs-sm d-flex align-items-center mt-1">
                              <a href="#" className="mr-1 mt-1" title="Cell A-0012">
                                <span className="d-block img-share" ></span>
                              </a>
                              <a href="#" className="mr-1 mt-1" title="Patient A-473 saliva">
                                <span className="d-block img-share" ></span>
                              </a>
                              <a href="#" className="mr-1 mt-1" title="Patient A-473 blood cells">
                                <span className="d-block img-share" ></span>
                              </a>
                              <a href="#" className="mr-1 mt-1" title="Patient A-473 Membrane O.C">
                                <span className="d-block img-share" ></span>
                              </a>
                            </div>
                            <span className="fs-nano text-muted mt-1">55 minutes ago</span>
                          </div>
                          <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                            <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="d-flex align-items-center show-child-on-hover">
                          <div className="d-flex flex-column flex-1">
                            <div className="name mb-2">
                              Lisa Lamar<span className="fw-300"> updated project</span>
                            </div>
                            <div className="row fs-b fw-300">
                              <div className="col text-left">
                                Progress
                              </div>
                              <div className="col text-right fw-500">
                                45%
                              </div>
                            </div>
                            <div className="progress progress-sm d-flex mt-1">
                              <span className="progress-bar-45 progress-bar bg-primary-500 progress-bar-striped" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></span>
                            </div>
                            <span className="fs-nano text-muted mt-1">2 hrs ago</span>
                            <div className="show-on-hover-parent position-absolute pos-right pos-bottom p-3">
                              <a href="#" className="text-muted" title="delete"><i className="fal fa-trash-alt"></i></a>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="tab-pane" id="tab-events" role="tabpanel">
                    <div className="d-flex flex-column h-100">
                        <div className="h-auto">
                            <table className="table table-bordered table-calendar m-0 w-100 h-100 border-0">
                            <tbody>
                                <tr>
                                  <th colSpan="7" className="pt-3 pb-2 pl-3 pr-3 text-center">
                                    <div className="js-get-date h5 mb-2">[your date here]</div>
                                  </th>
                                </tr>
                                <tr className="text-center">
                                    <th>Sun</th>
                                    <th>Mon</th>
                                    <th>Tue</th>
                                    <th>Wed</th>
                                    <th>Thu</th>
                                    <th>Fri</th>
                                    <th>Sat</th>
                                </tr>
                                <tr>
                                    <td className="text-muted bg-faded">30</td>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                    <td>4</td>
                                    <td>5</td>
                                    <td><i className="fal fa-birthday-cake mt-1 ml-1 position-absolute pos-left pos-top text-primary"></i> 6</td>
                                </tr>
                                <tr>
                                    <td>7</td>
                                    <td>8</td>
                                    <td>9</td>
                                    <td className="bg-primary-300 pattern-0">10</td>
                                    <td>11</td>
                                    <td>12</td>
                                    <td>13</td>
                                </tr>
                                <tr>
                                    <td>14</td>
                                    <td>15</td>
                                    <td>16</td>
                                    <td>17</td>
                                    <td>18</td>
                                    <td>19</td>
                                    <td>20</td>
                                </tr>
                                <tr>
                                    <td>21</td>
                                    <td>22</td>
                                    <td>23</td>
                                    <td>24</td>
                                    <td>25</td>
                                    <td>26</td>
                                    <td>27</td>
                                </tr>
                                <tr>
                                    <td>28</td>
                                    <td>29</td>
                                    <td>30</td>
                                    <td>31</td>
                                    <td className="text-muted bg-faded">1</td>
                                    <td className="text-muted bg-faded">2</td>
                                    <td className="text-muted bg-faded">3</td>
                                </tr>
                              </tbody>
                            </table>
                        </div>
                        <div className="flex-1 custom-scroll">
                            <div className="p-2">
                                <div className="d-flex align-items-center text-left mb-3">
                                    <div className="width-5 fw-300 text-primary l-h-n mr-1 align-self-start fs-xxl">
                                        15
                                    </div>
                                    <div className="flex-1">
                                        <div className="d-flex flex-column">
                                            <span className="l-h-n fs-md fw-500 opacity-70">
                                                October 2020
                                            </span>
                                            <span className="l-h-n fs-nano fw-400 text-secondary">
                                                Friday
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <p>
                                                <strong>2:30PM</strong> - Doctor's appointment
                                            </p>
                                            <p>
                                                <strong>3:30PM</strong> - Report overview
                                            </p>
                                            <p>
                                                <strong>4:30PM</strong> - Meeting with Donnah V.
                                            </p>
                                            <p>
                                                <strong>5:30PM</strong> - Late Lunch
                                            </p>
                                            <p>
                                                <strong>6:30PM</strong> - Report Compression
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-2 px-3 bg-faded d-block rounded-bottom text-right border-faded border-bottom-0 border-right-0 border-left-0">
                <a href="#" className="fs-xs fw-500 ml-auto">view all notifications</a>
            </div>
        </div>
    </div>
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
