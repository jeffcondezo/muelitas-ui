import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect,  // Redirect url
  Link,  // Alternative to HTML element 'a'
  withRouter,  // Allow us access to route props
} from "react-router-dom";  // https://reacttraining.com/react-router/web/api/
import './Navigation.css';
import {
  UNSAFE_cache_postState,
  UNSAFE_cache_getState,
  savePageHistory,
  getPageHistory,
} from './HandleCache';

// Components to import
import Admision from './admision/Admision';
import Cita from './cita/Cita';
import Atencion from './atencion/Atencion';
import Odontograma from './odontograma/Odontograma';
import Procedimiento from './procedimiento/Procedimiento';
import Prescripcion from './prescripcion/Prescripcion';
import HistoriaClinica from './historia/Historia';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_nav";


function Navigation(props){
  const [, updateState] = useState({});
  /* Set new state to empty object value
  'cuz when React compares the last state with the new empty object value
  it'll be different 'cuz objects are always different
  btw we're using forceUpdate function 'cuz our elements are dinamically generated
  and its changes are not tracked by react so their changes won't fire a render
  that's why we've used forceUpdate function
  */
  const forceUpdate = () => updateState({});

  const profile_pic = "https://1.bp.blogspot.com/-w9uMJlU2jME/XDeKZl2VDSI/AAAAAAAAuHg/BG_ou7b5zJcf_9eIi--zV30LQ8MGXpwdACLcBGAs/s1600/lovecraft.jpg";
  /* We want to keep these values even when any state change, so we declare 'em as Ref
    We initialize its value and reference it's 'current' attribute (which is the actual value)
    declaring to useRef().current directly only works on objects
  */
  let user = useRef(props.user?props.user:null).current;
  const sucursales = useRef([]);  // User's sucursal
  const [current_sucursal_pk, setCurrentSucursal] = useState(-1);  // Current enviroment sucursal
  const redirect = useRef(false);  // Only to store values, changes do not render

  if(__debug__==="true") console.log(`%c --------- MOUNTING ${props.history.location.pathname} ---------`, 'background: black; color: red');
  if(__debug__==="true") console.log(`%c PROPS:`, 'color: yellow', user, sucursales.current, current_sucursal_pk, redirect.current);

  function setPersonalInfo(){
    let result = new Promise((resolve, reject) => {
      let _filter = `filtro={"usuario":"${user.pk}"}`;
      let url = process.env.REACT_APP_PROJECT_API+'maestro/admin/permisos/asignar/';
      url = url + '?' + _filter;
      // Get user's sucursal
      let request = fetch(url);
      // {headers:{Authorization: localStorage.getItem('access_token')}}
      request.then(response => {
        if(response.ok){
          resolve(response.json())
        }else{
          reject(response.statusText)
        }
      }, error => {
        console.log("ERROR", error);
      });
    });
    result.then(response_obj => {
      let _obj = response_obj[0];
      // Save data
      sucursales.current = _obj.sucursales;
      setCurrentSucursal(_obj.sucursales[0].pk);
    },
    error => {
      console.log(error);
    });
  }
  const changeSucursal = (pk) => {
    console.log("changeSucursal", pk);
    // If it's the same pk than the current one, abort
    if(current_sucursal_pk===pk) return;
    setCurrentSucursal(pk);
  }
  function redirectTo(url, data=null){
    if(data) redirect.current = data;
    props.history.push(url);
  }

  // Only run after first render
  useEffect(() => {
    // Add resources
    if(!document.getElementById('main_script')){
      const main_script = document.createElement("script");
      main_script.id = "main_script";
      main_script.async = false;
      main_script.src = "/js/vendors.bundle.js";
      document.body.appendChild(main_script);
    }
    if(!document.getElementById('main_script2')){
      const main_script2 = document.createElement("script");
      main_script2.async = false;
      main_script2.id = "main_script2";
      main_script2.src = "/js/app.bundle.js";
      document.body.appendChild(main_script2);
    }

    /* Check if there is data stored in cache
    * This is a great security risk if data is not encrypted
    */
    let __dataInCache__ = getPageHistory();
    if(__dataInCache__){  // If there is data in cache
      if(__debug__==="true") console.log("__dataInCache__", __dataInCache__);
      /* Page data handling
      * During usage of the system window.history.length will raise up its value
      * And when we close the tab that counter will reset, but our __dataInCache__ will not
      * So the next time the user enter into the page
      * window.history.length will be less than __dataInCache__.prev_length
      * that will cause the system to get the data from DB and set __dataInCache__ again
      * the next renders and reloads in the system will use that stored data
      */
      // Check if page was reloaded
      if(props.history.length>=__dataInCache__.prev_length){  // Page was reloaded
        if(__debug__==="true") console.log(`%c RELOADED`, 'background: #433; color: gray');

        // Check if there is component state data in cache
        let __state__ = UNSAFE_cache_getState(__cacheName__);
        if(__state__){  // If there is state data in cache
          if(__debug__==="true") console.log(`%c CACHE STATE:`, 'background: #433; color: green', __state__);
          // Check if all state's parameters exists in cache before setting 'em
          if(!__state__.user || !__state__.sucursales || !__state__.current_sucursal_pk){
            /* Lack of state's parameter in cache
            * This may be caused by a reload action executed before all state properties changes and get saved up in cache
            */
            setPersonalInfo();  // Get personal info from service due lack of state's propertie in cache
            savePageHistory();  // Save page history
            return;  // Cancel operation due lack of data in cache
          }
          // Set data from cache
          user = __state__.user;
          sucursales.current = __state__.sucursales;
          setCurrentSucursal(__state__.current_sucursal_pk);

          // Has page changed in redirect?
          if(props.history.location.pathname===__dataInCache__.prev_pathname) return;
          // Redirect to previous page
          props.history.push(__dataInCache__.prev_pathname);
          return;
        }
      }
    }
    if(__debug__==="true") console.log(`%c REGULAR BEHAVIOR:`, 'background: #433; color: gray');
    setPersonalInfo();  // Regular set data
    savePageHistory();  // Save page history
  }, []);
  // Execute when current_sucursal_pk changes
  useEffect(() => {
    if(current_sucursal_pk===-1) return;
    UNSAFE_cache_postState(__cacheName__, {
      current_sucursal_pk: current_sucursal_pk,
      sucursales: sucursales.current,
      user: user,
    });
  }, [current_sucursal_pk]);

  return (
    <div>
      <div className="page-wrapper">
        <div className="page-inner">
          <Aside
            profile_pic={profile_pic}
            user={user} history={props.history}
            current_sucursal_pk={current_sucursal_pk} />
          <PageContent
            user={user}
            redirect={redirect}
            history={props.history}
            profile_pic={profile_pic}
            sucursales={sucursales.current}
            current_sucursal_pk={current_sucursal_pk}
            changeSucursal={changeSucursal}
            redirectTo={redirectTo} />
        </div>
      </div>
      <FloatShortcut />
      <Messenger />
      <Settings />
    </div>
  );
}

/*** COMPONENTS ***/
function SelectComponent(props){  // CONTENT
  let _redirect_obj = props.redirect.current;  // Copy its value
  // By accessing .current we avoid memory reference
  if(props.redirect.current){  // Reset redirect data
    props.redirect.current = false;  // We can change useRef variable value only using .current
  }

  return (
    <main id="js-page-content" role="main" className="page-content">
      <Switch>
        <Route exact path="/nav/home">
          <h1> HOME </h1>
        </Route>
        <Route path="/nav/cita">
          <Cita
            current_sucursal_pk={props.current_sucursal_pk}
            redirectTo={props.redirectTo} />
        </Route>
        <Route path="/nav/atencion">
          <Atencion
            sucursal_pk={props.current_sucursal_pk}
            data={_redirect_obj}
            redirectTo={props.redirectTo} />
        </Route>
        <Route path="/nav/admision">
          <Admision
            sucursal_pk={props.current_sucursal_pk}
            data={_redirect_obj}
            redirectTo={props.redirectTo} />
        </Route>

        {/* Components accessed only by redirect */}
        <Route exact path="/nav/odontograma">
          {!_redirect_obj
            ? <Redirect to="/nav/home" />
            : <Odontograma data={_redirect_obj} redirectTo={props.redirectTo} />
          }
        </Route>
        <Route exact path="/nav/procedimiento">
          {!_redirect_obj
            ? <Redirect to="/nav/home" />
            : <Procedimiento
                sucursal_pk={props.current_sucursal_pk}
                data={_redirect_obj} redirectTo={props.redirectTo} />
          }
        </Route>
        <Route exact path="/nav/prescripcion">
          {!_redirect_obj
            ? <Redirect to="/nav/home" />
            : <Prescripcion
                sucursal_pk={props.current_sucursal_pk}
                data={_redirect_obj} redirectTo={props.redirectTo} />
          }
        </Route>
        <Route exact path="/nav/historiaclinica">
          {!_redirect_obj
            ? <Redirect to="/nav/home" />
            : <HistoriaClinica
                sucursal_pk={props.current_sucursal_pk}
                data={_redirect_obj} redirectTo={props.redirectTo} />
          }
        </Route>

        {/* Default link */}
        <Route>
          <Redirect to="/nav/home" />
        </Route>
      </Switch>
    </main>
  )
}
/*** PAGE ***/
function AsideLinks(props){
  return (
    <ul id="js-nav-menu" className="nav-menu">
      <li className="nav-title" style={{color: "#CCC"}}>Principales paginas</li>
      <li className={props.history.location.pathname==="/nav/home"?"active":""}>
        <Link data-filter-tags="home" to='/nav/home'>
          <span className="nav-link-text">HOME</span>
        </Link>
      </li>
      <li className={props.history.location.pathname==="/nav/admision"?"active":""}>
        <Link data-filter-tags="admision" to='/nav/admision'>
          <span className="nav-link-text">ADMISION</span>
        </Link>
      </li>
      <li className={props.history.location.pathname==="/nav/cita"?"active":""}>
        <Link data-filter-tags="cita" to='/nav/cita'>
          <span className="nav-link-text">CITA</span>
        </Link>
      </li>
      <li className={props.history.location.pathname==="/nav/atencion"?"active":""}>
        <Link data-filter-tags="atencion" to='/nav/atencion'>
          <span className="nav-link-text">ATENCION</span>
        </Link>
      </li>
      {/*<li>
        <Link data-filter-tags="odontograma" to='/nav/odontograma'>
          <span className="nav-link-text">ODONTOGRAMA</span>
        </Link>
      </li>*/}
    </ul>
  )
}
function Aside(props){
  return (<>
    <aside className="page-sidebar">
      <div className="page-logo">
          <a href="#" className="page-logo-link press-scale-down d-flex align-items-center position-relative" data-toggle="modal" data-target="#modal-shortcut">
              <img src="/img/logo.png" alt="SmartAdmin WebApp" aria-roledescription="logo"/>
              <span className="page-logo-text mr-1">Muelitas</span>
              <span className="position-absolute text-white opacity-50 small pos-top pos-right mr-2 mt-n2"></span>
              <i className="fal fa-angle-down d-inline-block ml-1 fs-lg color-primary-300"></i>
          </a>
      </div>

      <nav id="js-primary-nav" className="primary-nav" role="navigation">
        <div className="nav-filter">
            <div className="position-relative">
                <input type="text" id="nav_filter_input" placeholder="Filter menu" className="form-control" tabIndex="0" />
                <a href="#" onClick={e => e.preventDefault()} className="btn-primary btn-search-close js-waves-off" data-action="toggle" data-class="list-filter-active" data-target=".page-sidebar">
                    <i className="fal fa-chevron-up"></i>
                </a>
            </div>
        </div>
        <div className="info-card">
          <img
            src={props.current_sucursal_pk!==-1 ? props.profile_pic : "/img/demo/avatars/avatar-admin.png"}
            className="profile-image rounded-circle"
            alt={props.current_sucursal_pk!==-1 ? props.user.username : "Dr. Codex Lantern"}
          />
          <div className="info-card-text">
            <a href="#" className="d-flex align-items-center text-white">
              <span className="text-truncate text-truncate-sm d-inline-block">
                {props.user.personal?
                  props.user.personal.nombre_principal+" "+props.user.personal.ape_paterno :
                  props.user.username
                }
              </span>
            </a>
            <span className="d-inline-block text-truncate text-truncate-sm"
              title={props.user.personal ? props.user.personal.especialidad : "Administrador"}>
              {props.user.personal ? props.user.personal.especialidad : "Administrador"}
            </span>
          </div>
          <img src="/img/card-backgrounds/cover-2-lg.png" className="cover" alt="cover"/>
          <a href="#" onClick={e => e.preventDefault()} className="pull-trigger-btn" data-action="toggle" data-class="list-filter-active" data-target=".page-sidebar" data-focus="nav_filter_input">
            <i className="fal fa-angle-down"></i>
          </a>
        </div>

        <AsideLinks history={props.history} />

        <div className="filter-message js-filter-message bg-success-600"></div>
      </nav>

      <div className="nav-footer shadow-top">
        <a href="#" onClick={e => e.preventDefault()} data-action="toggle" data-class="nav-function-minify" className="hidden-md-down">
          <i className="ni ni-chevron-right"></i>
          <i className="ni ni-chevron-right"></i>
        </a>
        <ul className="list-table m-auto nav-footer-buttons">
          <li>
            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Chat logs">
              <i className="fal fa-comments"></i>
            </a>
          </li>
          <li>
            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Support Chat">
              <i className="fal fa-life-ring"></i>
            </a>
          </li>
          <li>
            <a href="#" onClick={e => e.preventDefault()} data-toggle="tooltip" data-placement="top" title="Make a call">
              <i className="fal fa-phone"></i>
            </a>
          </li>
        </ul>
      </div>
    </aside>
    <div className="page-content-overlay" data-action="toggle" data-class="mobile-nav-on"></div>
    </>
  )
}
function PageContent(props){
  return (
    <div className="page-content-wrapper">
        <PageHeader
          user={props.user}
          profile_pic={props.profile_pic}
          sucursales={props.sucursales}
          current_sucursal_pk={props.current_sucursal_pk}
          changeSucursal={props.changeSucursal} />
        <SelectComponent
          history={props.history}
          redirect={props.redirect}
          current_sucursal_pk={props.current_sucursal_pk}
          redirectTo={props.redirectTo} />
        <PageFooter />

        <div className="modal fade modal-backdrop-transparent" id="modal-shortcut" tabIndex="-1" role="dialog" aria-labelledby="modal-shortcut" aria-hidden="true">
            <div className="modal-dialog modal-dialog-top modal-transparent" role="document">
                <div className="modal-content">
                    <div className="modal-body">
                        <ul className="app-list w-auto h-auto p-0 text-left">
                            <li>
                                <a href="intel_introduction.html" className="app-list-item text-white border-0 m-0">
                                    <div className="icon-stack">
                                        <i className="base base-7 icon-stack-3x opacity-100 color-primary-500 "></i>
                                        <i className="base base-7 icon-stack-2x opacity-100 color-primary-300 "></i>
                                        <i className="fal fa-home icon-stack-1x opacity-100 color-white"></i>
                                    </div>
                                    <span className="app-list-name">
                                        Home
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="page_inbox_general.html" className="app-list-item text-white border-0 m-0">
                                    <div className="icon-stack">
                                        <i className="base base-7 icon-stack-3x opacity-100 color-success-500 "></i>
                                        <i className="base base-7 icon-stack-2x opacity-100 color-success-300 "></i>
                                        <i className="ni ni-envelope icon-stack-1x text-white"></i>
                                    </div>
                                    <span className="app-list-name">
                                        Inbox
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="intel_introduction.html" className="app-list-item text-white border-0 m-0">
                                    <div className="icon-stack">
                                        <i className="base base-7 icon-stack-2x opacity-100 color-primary-300 "></i>
                                        <i className="fal fa-plus icon-stack-1x opacity-100 color-white"></i>
                                    </div>
                                    <span className="app-list-name">
                                        Add More
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <p id="js-color-profile" className="d-none">
            <span className="color-primary-50"></span>
            <span className="color-primary-100"></span>
            <span className="color-primary-200"></span>
            <span className="color-primary-300"></span>
            <span className="color-primary-400"></span>
            <span className="color-primary-500"></span>
            <span className="color-primary-600"></span>
            <span className="color-primary-700"></span>
            <span className="color-primary-800"></span>
            <span className="color-primary-900"></span>
            <span className="color-info-50"></span>
            <span className="color-info-100"></span>
            <span className="color-info-200"></span>
            <span className="color-info-300"></span>
            <span className="color-info-400"></span>
            <span className="color-info-500"></span>
            <span className="color-info-600"></span>
            <span className="color-info-700"></span>
            <span className="color-info-800"></span>
            <span className="color-info-900"></span>
            <span className="color-danger-50"></span>
            <span className="color-danger-100"></span>
            <span className="color-danger-200"></span>
            <span className="color-danger-300"></span>
            <span className="color-danger-400"></span>
            <span className="color-danger-500"></span>
            <span className="color-danger-600"></span>
            <span className="color-danger-700"></span>
            <span className="color-danger-800"></span>
            <span className="color-danger-900"></span>
            <span className="color-warning-50"></span>
            <span className="color-warning-100"></span>
            <span className="color-warning-200"></span>
            <span className="color-warning-300"></span>
            <span className="color-warning-400"></span>
            <span className="color-warning-500"></span>
            <span className="color-warning-600"></span>
            <span className="color-warning-700"></span>
            <span className="color-warning-800"></span>
            <span className="color-warning-900"></span>
            <span className="color-success-50"></span>
            <span className="color-success-100"></span>
            <span className="color-success-200"></span>
            <span className="color-success-300"></span>
            <span className="color-success-400"></span>
            <span className="color-success-500"></span>
            <span className="color-success-600"></span>
            <span className="color-success-700"></span>
            <span className="color-success-800"></span>
            <span className="color-success-900"></span>
            <span className="color-fusion-50"></span>
            <span className="color-fusion-100"></span>
            <span className="color-fusion-200"></span>
            <span className="color-fusion-300"></span>
            <span className="color-fusion-400"></span>
            <span className="color-fusion-500"></span>
            <span className="color-fusion-600"></span>
            <span className="color-fusion-700"></span>
            <span className="color-fusion-800"></span>
            <span className="color-fusion-900"></span>
        </p>
    </div>
  )
}
function PageHeader(props){
  return (
    <header className="page-header" role="banner">

        <div className="page-logo">
          <a href="#" className="page-logo-link press-scale-down d-flex align-items-center position-relative" data-toggle="modal" data-target="#modal-shortcut">
            <img src="/img/logo.png" alt="SmartAdmin WebApp" aria-roledescription="logo"/>
            <span className="page-logo-text mr-1">SmartAdmin WebApp</span>
            <span className="position-absolute text-white opacity-50 small pos-top pos-right mr-2 mt-n2"></span>
            <i className="fal fa-angle-down d-inline-block ml-1 fs-lg color-primary-300"></i>
          </a>
        </div>

        <div className="hidden-md-down dropdown-icon-menu position-relative">
            <a href="#" className="header-btn btn js-waves-off" data-action="toggle" data-class="nav-function-hidden" title="Hide Navigation">
                <i className="ni ni-menu"></i>
            </a>
            <ul>
                <li>
                    <a href="#" className="btn js-waves-off" data-action="toggle" data-class="nav-function-minify" title="Minify Navigation">
                        <i className="ni ni-minify-nav"></i>
                    </a>
                </li>
                <li>
                    <a href="#" className="btn js-waves-off" data-action="toggle" data-class="nav-function-fixed" title="Lock Navigation">
                        <i className="ni ni-lock-nav"></i>
                    </a>
                </li>
            </ul>
        </div>

        <div className="hidden-lg-up">
          <a href="#" className="header-btn btn press-scale-down" data-action="toggle" data-class="mobile-nav-on">
            <i className="ni ni-menu"></i>
          </a>
        </div>
        <div className="search">
          <form className="app-forms hidden-xs-down" role="search" action="page_search.html" autoComplete="off">
            <input type="text" id="search-field" placeholder="Search for anything" className="form-control" tabIndex="1"/>
            <a href="#" onClick={e => e.preventDefault()} className="btn-danger btn-search-close js-waves-off d-none" data-action="toggle" data-class="mobile-search-on">
              <i className="fal fa-times"></i>
            </a>
          </form>
        </div>
        <div className="ml-auto d-flex">
            <div className="hidden-sm-up">
              <a href="#" className="header-icon" data-action="toggle" data-class="mobile-search-on" data-focus="search-field" title="Search">
                <i className="fal fa-search"></i>
              </a>
            </div>
            <div className="hidden-md-down">
              <a href="#" className="header-icon" data-toggle="modal" data-target=".js-modal-settings">
                <i className="fal fa-cog"></i>
              </a>
            </div>
            <div>
              <a href="#" className="header-icon" data-toggle="dropdown" title="My Apps">
                <i className="fal fa-cube"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-animated w-auto h-auto">
                <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center rounded-top">
                  <h4 className="m-0 text-center color-white">
                    Quick Shortcut
                    <small className="mb-0 opacity-80">User Applications & Addons</small>
                  </h4>
                </div>
                <div className="custom-scroll h-100">
                  <ul className="app-list">
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-2 icon-stack-3x color-primary-600"></i>
                          <i className="base-3 icon-stack-2x color-primary-700"></i>
                          <i className="ni ni-settings icon-stack-1x text-white fs-lg"></i>
                        </span>
                        <span className="app-list-name">
                          Services
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-2 icon-stack-3x color-primary-400"></i>
                          <i className="base-10 text-white icon-stack-1x"></i>
                          <i className="ni md-profile color-primary-800 icon-stack-2x"></i>
                        </span>
                        <span className="app-list-name">
                          Account
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-9 icon-stack-3x color-success-400"></i>
                          <i className="base-2 icon-stack-2x color-success-500"></i>
                          <i className="ni ni-shield icon-stack-1x text-white"></i>
                        </span>
                        <span className="app-list-name">
                          Security
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-18 icon-stack-3x color-info-700"></i>
                          <span className="position-absolute pos-top pos-left pos-right color-white fs-md mt-2 fw-400">28</span>
                        </span>
                        <span className="app-list-name">
                          Calendar
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-7 icon-stack-3x color-info-500"></i>
                          <i className="base-7 icon-stack-2x color-info-700"></i>
                          <i className="ni ni-graph icon-stack-1x text-white"></i>
                        </span>
                        <span className="app-list-name">
                          Stats
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-4 icon-stack-3x color-danger-500"></i>
                          <i className="base-4 icon-stack-1x color-danger-400"></i>
                          <i className="ni ni-envelope icon-stack-1x text-white"></i>
                        </span>
                        <span className="app-list-name">
                          Messages
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-4 icon-stack-3x color-fusion-400"></i>
                          <i className="base-5 icon-stack-2x color-fusion-200"></i>
                          <i className="base-5 icon-stack-1x color-fusion-100"></i>
                          <i className="fal fa-keyboard icon-stack-1x color-info-50"></i>
                        </span>
                        <span className="app-list-name">
                          Notes
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-16 icon-stack-3x color-fusion-500"></i>
                          <i className="base-10 icon-stack-1x color-primary-50 opacity-30"></i>
                          <i className="base-10 icon-stack-1x fs-xl color-primary-50 opacity-20"></i>
                          <i className="fal fa-dot-circle icon-stack-1x text-white opacity-85"></i>
                        </span>
                        <span className="app-list-name">
                          Photos
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-19 icon-stack-3x color-primary-400"></i>
                          <i className="base-7 icon-stack-2x color-primary-300"></i>
                          <i className="base-7 icon-stack-1x fs-xxl color-primary-200"></i>
                          <i className="base-7 icon-stack-1x color-primary-500"></i>
                          <i className="fal fa-globe icon-stack-1x text-white opacity-85"></i>
                        </span>
                        <span className="app-list-name">
                          Maps
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-5 icon-stack-3x color-success-700 opacity-80"></i>
                          <i className="base-12 icon-stack-2x color-success-700 opacity-30"></i>
                          <i className="fal fa-comment-alt icon-stack-1x text-white"></i>
                        </span>
                        <span className="app-list-name">
                          Chat
                        </span>
                      </a>
                    </li>
                    <li>
                    <a href="#" className="app-list-item hover-white">
                      <span className="icon-stack">
                        <i className="base-5 icon-stack-3x color-warning-600"></i>
                        <i className="base-7 icon-stack-2x color-warning-800 opacity-50"></i>
                        <i className="fal fa-phone icon-stack-1x text-white"></i>
                      </span>
                      <span className="app-list-name">
                        Phone
                      </span>
                    </a>
                    </li>
                    <li>
                      <a href="#" className="app-list-item hover-white">
                        <span className="icon-stack">
                          <i className="base-6 icon-stack-3x color-danger-600"></i>
                          <i className="fal fa-chart-line icon-stack-1x text-white"></i>
                        </span>
                        <span className="app-list-name">
                          Projects
                        </span>
                      </a>
                    </li>
                    <li className="w-100">
                      <a href="#" className="btn btn-default mt-4 mb-2 pr-5 pl-5"> Add more apps </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <a href="#" className="header-icon" data-toggle="modal" data-target=".js-modal-messenger">
              <i className="fal fa-globe"></i>
              <span className="badge badge-icon">!</span>
            </a>
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

            <UserSettings
              user={props.user}
              profile_pic={props.profile_pic}
              sucursales={props.sucursales}
              current_sucursal_pk={props.current_sucursal_pk}
              changeSucursal={props.changeSucursal} />
        </div>
    </header>
  )
}
function UserSettings(props){
  return (
    <div>
        <a href="#" data-toggle="dropdown"
          title={props.current_sucursal_pk!=-1 ? props.user.email : ""}
          className="header-icon d-flex align-items-center justify-content-center ml-2"
        >
          <img
            src={props.current_sucursal_pk!=-1 ? props.profile_pic : "/img/demo/avatars/avatar-admin.png"}
            className="profile-image rounded-circle"
            alt={props.current_sucursal_pk!=-1 ? props.user.username : "Invitado"}
          />
          <span className="ml-1 mr-1 text-truncate text-truncate-header hidden-xs-down">
            { props.current_sucursal_pk!=-1 && props.user.username}
          </span>
          <i className="ni ni-chevron-down hidden-xs-down"></i>
        </a>
        <div className="dropdown-menu dropdown-menu-animated dropdown-lg">
            <div className="dropdown-header bg-trans-gradient d-flex flex-row py-4 rounded-top">
              <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
                <span className="mr-2">
                  <img
                    src={props.current_sucursal_pk!=-1 ? props.profile_pic : "/img/demo/avatars/avatar-admin.png"}
                    className="rounded-circle profile-image"
                    alt={props.current_sucursal_pk!=-1 ? props.user.username : "Invitado"}
                  />
                </span>
                <div className="info-card-text">
                  <div className="fs-lg text-truncate text-truncate-lg">
                    {props.current_sucursal_pk!=-1 && props.user.username.toUpperCase()}
                  </div>
                  <span className="text-truncate text-truncate-md opacity-80">
                    {props.current_sucursal_pk!=-1 && props.user.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="dropdown-divider m-0"></div>
            <a href="#" className="dropdown-item" data-action="app-reset">
                <span data-i18n="drpdwn.reset_layout">Reset Layout</span>
            </a>
            <a href="#" className="dropdown-item" data-toggle="modal" data-target=".js-modal-settings">
                <span data-i18n="drpdwn.settings">Settings</span>
            </a>
            <div className="dropdown-divider m-0"></div>
            <a href="#" className="dropdown-item" data-action="app-fullscreen">
                <span data-i18n="drpdwn.fullscreen">Fullscreen</span>
                <i className="float-right text-muted fw-n">F11</i>
            </a>
            <a href="#" className="dropdown-item" data-action="app-print">
                <span data-i18n="drpdwn.print">Print</span>
                <i className="float-right text-muted fw-n">Ctrl + P</i>
            </a>
            {/* CHOOSE SUCURSAL */}
            <ChooseSucursal
              sucursales={props.sucursales}
              current_sucursal_pk={props.current_sucursal_pk}
              changeSucursal={props.changeSucursal} />
            {/* FIN CHOOSE SUCURSAL*/}
            <a className="dropdown-item fw-500 pt-3 pb-3" href="page_login_alt.html">
              <span data-i18n="drpdwn.page-logout">Logout</span>
              <span className="float-right fw-n"></span>
            </a>
        </div>
    </div>
  )
}
function ChooseSucursal(props){
  // https://flaviocopes.com/react-how-to-loop/
  const sucursales = [];  // Declare variable to use
  for(let a of props.sucursales){  // Iterate over all sucursales this user has
    sucursales.push(
      <a key={a.pk}
        onClick={()=>props.changeSucursal(a.pk)}
        className={a.pk==props.current_sucursal_pk?"dropdown-item active":"dropdown-item"}>
          {a.direccion}
      </a>
    );
  }
  return (
    <>
    <div className="dropdown-multilevel dropdown-multilevel-left">
      <div className="dropdown-item">
        Sucursal
      </div>
      <div className="dropdown-menu">
        {sucursales}
      </div>
    </div>
    <div className="dropdown-divider m-0"></div>
    </>
  )
}
function PageFooter(){
  return (
    <footer className="page-footer" role="contentinfo">
      <div className="d-flex align-items-center flex-1 text-muted">
          <span className="hidden-md-down fw-700">2020 © Muelitas by&nbsp;<a href='http://datakrafthco.com/' className='text-primary fw-500' title='' target='_blank'>DataKraft EIRL</a></span>
      </div>
      {/*<div>
          <ul className="list-table m-0">
              <li><a href="intel_introduction.html" className="text-secondary fw-700">About</a></li>
              <li className="pl-3"><a href="info_app_licensing.html" className="text-secondary fw-700">License</a></li>
              <li className="pl-3"><a href="info_app_docs.html" className="text-secondary fw-700">Documentation</a></li>
              <li className="pl-3 fs-xl"><a href="https://wrapbootstrap.com/user/MyOrange" className="text-secondary" target="_blank"><i className="fal fa-question-circle" aria-hidden="true"></i></a></li>
          </ul>
      </div>*/}
    </footer>
  )
}
/* ADDITIONAL FEATURES */
function FloatShortcut(){
  return (
    <nav className="shortcut-menu d-none d-sm-block">
        <input type="checkbox" className="menu-open" name="menu-open" id="menu_open" />
        <label htmlFor="menu_open" className="menu-open-button ">
            <span className="app-shortcut-icon d-block"></span>
        </label>
        <a href="#" className="menu-item btn" data-toggle="tooltip" data-placement="left" title="Scroll Top">
            <i className="fal fa-arrow-up"></i>
        </a>
        <a href="page_login_alt.html" className="menu-item btn" data-toggle="tooltip" data-placement="left" title="Logout">
            <i className="fal fa-sign-out"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-fullscreen" data-toggle="tooltip" data-placement="left" title="Full Screen">
            <i className="fal fa-expand"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-print" data-toggle="tooltip" data-placement="left" title="Print page">
            <i className="fal fa-print"></i>
        </a>
        <a href="#" className="menu-item btn" data-action="app-voice" data-toggle="tooltip" data-placement="left" title="Voice command">
            <i className="fal fa-microphone"></i>
        </a>
    </nav>
  )
}
function Messenger(){
  return (
    <div className="modal fade js-modal-messenger modal-backdrop-transparent" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-right">
            <div className="modal-content h-100">
                <div className="dropdown-header bg-trans-gradient d-flex align-items-center w-100">
                    <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
                        <span className="mr-2">
                            <span className="rounded-circle profile-image d-block"></span>
                        </span>
                        <div className="info-card-text">
                            <a href="#" onClick={e => e.preventDefault()} className="fs-lg text-truncate text-truncate-lg text-white" data-toggle="dropdown" aria-expanded="false">
                                Tracey Chang
                                <i className="fal fa-angle-down d-inline-block ml-1 text-white fs-md"></i>
                            </a>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="#">Send Email</a>
                                <a className="dropdown-item" href="#">Create Appointment</a>
                                <a className="dropdown-item" href="#">Block User</a>
                            </div>
                            <span className="text-truncate text-truncate-md opacity-80">IT Director</span>
                        </div>
                    </div>
                    <button type="button" className="close text-white position-absolute pos-top pos-right p-2 m-1 mr-2" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true"><i className="fal fa-times"></i></span>
                    </button>
                </div>
                <div className="modal-body p-0 h-100 d-flex">
                    <div className="msgr-list d-flex flex-column bg-faded border-faded border-top-0 border-right-0 border-bottom-0 position-absolute pos-top pos-bottom">
                        <div>
                            <div className="height-4 width-3 h3 m-0 d-flex justify-content-center flex-column color-primary-500 pl-3 mt-2">
                                <i className="fal fa-search"></i>
                            </div>
                            <input type="text" className="form-control bg-white" id="msgr_listfilter_input" placeholder="Filter contacts" aria-label="FriendSearch" data-listfilter="#js-msgr-listfilter"/>
                        </div>
                        <div className="flex-1 h-100 custom-scroll">
                            <div className="w-100">
                                <ul id="js-msgr-listfilter" className="list-unstyled m-0">
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="tracey chang online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block"  ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Tracey Chang
                                                    <small className="d-block font-italic text-success fs-xs">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="oliver kopyuv online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Oliver Kopyuv
                                                    <small className="d-block font-italic text-success fs-xs">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="dr john cook phd away">
                                            <div className="d-table-cell align-middle status status-warning status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Dr. John Cook PhD
                                                    <small className="d-block font-italic fs-xs">
                                                        Away
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney online">
                                            <div className="d-table-cell align-middle status status-success status-sm ">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Ali Amdaney
                                                    <small className="d-block font-italic fs-xs text-success">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="sarah mcbrook online">
                                            <div className="d-table-cell align-middle status status-success status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    Sarah McBrook
                                                    <small className="d-block font-italic fs-xs text-success">
                                                        Online
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney offline">
                                            <div className="d-table-cell align-middle status status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs">
                                                        Offline
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney busy">
                                            <div className="d-table-cell align-middle status status-danger status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs text-danger">
                                                        Busy
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney offline">
                                            <div className="d-table-cell align-middle status status-sm">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    oliver.kopyuv@gotbootstrap.com
                                                    <small className="d-block font-italic fs-xs">
                                                        Offline
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="d-table w-100 px-2 py-2 text-dark hover-white" data-filter-tags="ali amdaney inactive">
                                            <div className="d-table-cell align-middle">
                                                <span className="profile-image-md rounded-circle d-block" ></span>
                                            </div>
                                            <div className="d-table-cell w-100 align-middle pl-2 pr-2">
                                                <div className="text-truncate text-truncate-md">
                                                    +714651347790
                                                    <small className="d-block font-italic fs-xs opacity-50">
                                                        Missed Call
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                                <div className="filter-message js-filter-message"></div>
                            </div>
                        </div>
                        <div>
                            <a className="fs-xl d-flex align-items-center p-3">
                                <i className="fal fa-cogs"></i>
                            </a>
                        </div>
                    </div>

                    <div className="msgr d-flex h-100 flex-column bg-white">

                        <div className="custom-scroll flex-1 h-100">
                            <div id="chat_container" className="w-100 p-4">

                                <div className="chat-segment">
                                    <div className="time-stamp text-center mb-2 fw-400">
                                        Jun 19
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent">
                                    <div className="chat-message">
                                        <p>
                                            Hey Tracey, did you get my files?
                                        </p>
                                    </div>
                                    <div className="text-right fw-300 text-muted mt-1 fs-xs">
                                        3:00 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get">
                                    <div className="chat-message">
                                        <p>
                                            Hi
                                        </p>
                                        <p>
                                            Sorry going through a busy time in office. Yes I analyzed the solution.
                                        </p>
                                        <p>
                                            It will require some resource, which I could not manage.
                                        </p>
                                    </div>
                                    <div className="fw-300 text-muted mt-1 fs-xs">
                                        3:24 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent chat-start">
                                    <div className="chat-message">
                                        <p>
                                            Okay
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-sent chat-end">
                                    <div className="chat-message">
                                        <p>
                                            Sending you some dough today, you can allocate the resources to this project.
                                        </p>
                                    </div>
                                    <div className="text-right fw-300 text-muted mt-1 fs-xs">
                                        3:26 pm
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get chat-start">
                                    <div className="chat-message">
                                        <p>
                                            Perfect. Thanks a lot!
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get">
                                    <div className="chat-message">
                                        <p>
                                            I will have them ready by tonight.
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment chat-segment-get chat-end">
                                    <div className="chat-message">
                                        <p>
                                            Cheers
                                        </p>
                                    </div>
                                </div>

                                <div className="chat-segment">
                                    <div className="time-stamp text-center mb-2 fw-400">
                                        Jun 20
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="d-flex flex-column">
                            <div className="border-faded border-right-0 border-bottom-0 border-left-0 flex-1 mr-3 ml-3 position-relative shadow-top">
                                <div className="pt-3 pb-1 pr-0 pl-0 rounded-0" tabIndex="-1">
                                    <div id="msgr_input" contentEditable="true" data-placeholder="Type your message here..." className="height-10 form-content-editable"></div>
                                </div>
                            </div>
                            <div className="height-8 px-3 d-flex flex-row align-items-center flex-wrap flex-shrink-0">
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl width-1 mr-1" data-toggle="tooltip" data-original-title="More options" data-placement="top">
                                    <i className="fal fa-ellipsis-v-alt color-fusion-300"></i>
                                </a>
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl mr-1" data-toggle="tooltip" data-original-title="Attach files" data-placement="top">
                                    <i className="fal fa-paperclip color-fusion-300"></i>
                                </a>
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-icon fs-xl mr-1" data-toggle="tooltip" data-original-title="Insert photo" data-placement="top">
                                    <i className="fal fa-camera color-fusion-300"></i>
                                </a>
                                <div className="ml-auto">
                                    <a href="#" onClick={e => e.preventDefault()} className="btn btn-info">Send</a>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </div>
  )
}
function Settings(){
  return (
    <div className="modal fade js-modal-settings modal-backdrop-transparent" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-right modal-md">
            <div className="modal-content">
                <div className="dropdown-header bg-trans-gradient d-flex justify-content-center align-items-center w-100">
                    <h4 className="m-0 text-center color-white">
                        Layout Settings
                        <small className="mb-0 opacity-80">User Interface Settings</small>
                    </h4>
                    <button type="button" className="close text-white position-absolute pos-top pos-right p-2 m-1 mr-2" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true"><i className="fal fa-times"></i></span>
                    </button>
                </div>
                <div className="modal-body p-0">
                    <div className="settings-panel">
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    App Layout
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="fh">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="header-function-fixed"></a>
                            <span className="onoffswitch-title">Fixed Header</span>
                            <span className="onoffswitch-title-desc">header is in a fixed at all times</span>
                        </div>
                        <div className="list" id="nff">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-fixed"></a>
                            <span className="onoffswitch-title">Fixed Navigation</span>
                            <span className="onoffswitch-title-desc">left panel is fixed</span>
                        </div>
                        <div className="list" id="nfm">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-minify"></a>
                            <span className="onoffswitch-title">Minify Navigation</span>
                            <span className="onoffswitch-title-desc">Skew nav to maximize space</span>
                        </div>
                        <div className="list" id="nfh">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-hidden"></a>
                            <span className="onoffswitch-title">Hide Navigation</span>
                            <span className="onoffswitch-title-desc">roll mouse on edge to reveal</span>
                        </div>
                        <div className="list" id="nft">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-function-top"></a>
                            <span className="onoffswitch-title">Top Navigation</span>
                            <span className="onoffswitch-title-desc">Relocate left pane to top</span>
                        </div>
                        <div className="list" id="mmb">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-main-boxed"></a>
                            <span className="onoffswitch-title">Boxed Layout</span>
                            <span className="onoffswitch-title-desc">Encapsulates to a container</span>
                        </div>
                        <div className="expanded">
                            <ul className="">
                                <li>
                                    <div className="bg-fusion-50" data-action="toggle" data-class="mod-bg-1"></div>
                                </li>
                                <li>
                                    <div className="bg-warning-200" data-action="toggle" data-class="mod-bg-2"></div>
                                </li>
                                <li>
                                    <div className="bg-primary-200" data-action="toggle" data-class="mod-bg-3"></div>
                                </li>
                                <li>
                                    <div className="bg-success-300" data-action="toggle" data-class="mod-bg-4"></div>
                                </li>
                            </ul>
                            <div className="list" id="mbgf">
                                <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-fixed-bg"></a>
                                <span className="onoffswitch-title">Fixed Background</span>
                            </div>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Mobile Menu
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="nmp">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-push"></a>
                            <span className="onoffswitch-title">Push Content</span>
                            <span className="onoffswitch-title-desc">Content pushed on menu reveal</span>
                        </div>
                        <div className="list" id="nmno">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-no-overlay"></a>
                            <span className="onoffswitch-title">No Overlay</span>
                            <span className="onoffswitch-title-desc">Removes mesh on menu reveal</span>
                        </div>
                        <div className="list" id="sldo">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="nav-mobile-slide-out"></a>
                            <span className="onoffswitch-title">Off-Canvas <sup>(beta)</sup></span>
                            <span className="onoffswitch-title-desc">Content overlaps menu</span>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Accessibility
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="mbf">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-bigger-font"></a>
                            <span className="onoffswitch-title">Bigger Content Font</span>
                            <span className="onoffswitch-title-desc">content fonts are bigger for readability</span>
                        </div>
                        <div className="list" id="mhc">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-high-contrast"></a>
                            <span className="onoffswitch-title">High Contrast Text (WCAG 2 AA)</span>
                            <span className="onoffswitch-title-desc">4.5:1 text contrast ratio</span>
                        </div>
                        <div className="list" id="mcb">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-color-blind"></a>
                            <span className="onoffswitch-title">Daltonism <sup>(beta)</sup> </span>
                            <span className="onoffswitch-title-desc">color vision deficiency</span>
                        </div>
                        <div className="list" id="mpc">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-pace-custom"></a>
                            <span className="onoffswitch-title">Preloader Inside</span>
                            <span className="onoffswitch-title-desc">preloader will be inside content</span>
                        </div>
                        <div className="mt-4 d-table w-100 px-5">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Global Modifications
                                </h5>
                            </div>
                        </div>
                        <div className="list" id="mcbg">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-clean-page-bg"></a>
                            <span className="onoffswitch-title">Clean Page Background</span>
                            <span className="onoffswitch-title-desc">adds more whitespace</span>
                        </div>
                        <div className="list" id="mhni">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-hide-nav-icons"></a>
                            <span className="onoffswitch-title">Hide Navigation Icons</span>
                            <span className="onoffswitch-title-desc">invisible navigation icons</span>
                        </div>
                        <div className="list" id="dan">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-disable-animation"></a>
                            <span className="onoffswitch-title">Disable CSS Animation</span>
                            <span className="onoffswitch-title-desc">Disables CSS based animations</span>
                        </div>
                        <div className="list" id="mhic">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-hide-info-card"></a>
                            <span className="onoffswitch-title">Hide Info Card</span>
                            <span className="onoffswitch-title-desc">Hides info card from left panel</span>
                        </div>
                        <div className="list" id="mlph">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-lean-subheader"></a>
                            <span className="onoffswitch-title">Lean Subheader</span>
                            <span className="onoffswitch-title-desc">distinguished page header</span>
                        </div>
                        <div className="list" id="mnl">
                            <a href="#" onClick={e => e.preventDefault()} className="btn btn-switch" data-action="toggle" data-class="mod-nav-link"></a>
                            <span className="onoffswitch-title">Hierarchical Navigation</span>
                            <span className="onoffswitch-title-desc">Clear breakdown of nav links</span>
                        </div>
                        <div className="list mt-1">
                            <span className="onoffswitch-title">Global Font Size <small>(RESETS ON REFRESH)</small> </span>
                            <div className="btn-group btn-group-sm btn-group-toggle my-2" data-toggle="buttons">
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-sm" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> SM
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text" data-target="html">
                                    <input type="radio" name="changeFrontSize" defaultChecked={true}/> MD
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-lg" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> LG
                                </label>
                                <label className="btn btn-default btn-sm" data-action="toggle-swap" data-class="root-text-xl" data-target="html">
                                    <input type="radio" name="changeFrontSize"/> XL
                                </label>
                            </div>
                            <span className="onoffswitch-title-desc d-block mb-0">Change <strong>root</strong> font size to effect rem
                                values</span>
                        </div>
                        <hr className="mb-0 mt-4" />
                        <div className="mt-2 d-table w-100 pl-5 pr-3">
                            <div className="fs-xs text-muted p-2 alert alert-warning mt-3 mb-2">
                                <i className="fal fa-exclamation-triangle text-warning mr-2"></i>The settings below uses localStorage to load
                                the external CSS file as an overlap to the base css. Due to network latency and CPU utilization, you may
                                experience a brief flickering effect on page load which may show the intial applied theme for a split
                                second. Setting the prefered style/theme in the header will prevent this from happening.
                            </div>
                        </div>
                        <div className="mt-2 d-table w-100 pl-5 pr-3">
                            <div className="d-table-cell align-middle">
                                <h5 className="p-0">
                                    Theme colors
                                </h5>
                            </div>
                        </div>
                        <div className="expanded theme-colors pl-5 pr-3">
                            <ul className="m-0">
                                <li>
                                    <a href="#" id="myapp-0" data-action="theme-update" data-themesave data-theme="" data-toggle="tooltip" data-placement="top" title="Wisteria (base css)" data-original-title="Wisteria (base css)"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-1" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-1.css"} data-toggle="tooltip" data-placement="top" title="Tapestry" data-original-title="Tapestry"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-2" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-2.css"} data-toggle="tooltip" data-placement="top" title="Atlantis" data-original-title="Atlantis"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-3" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-3.css"} data-toggle="tooltip" data-placement="top" title="Indigo" data-original-title="Indigo"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-4" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-4.css"} data-toggle="tooltip" data-placement="top" title="Dodger Blue" data-original-title="Dodger Blue"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-5" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-5.css"} data-toggle="tooltip" data-placement="top" title="Tradewind" data-original-title="Tradewind"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-6" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-6.css"} data-toggle="tooltip" data-placement="top" title="Cranberry" data-original-title="Cranberry"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-7" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-7.css"} data-toggle="tooltip" data-placement="top" title="Oslo Gray" data-original-title="Oslo Gray"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-8" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-8.css"} data-toggle="tooltip" data-placement="top" title="Chetwode Blue" data-original-title="Chetwode Blue"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-9" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-9.css"} data-toggle="tooltip" data-placement="top" title="Apricot" data-original-title="Apricot"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-10" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-10.css"} data-toggle="tooltip" data-placement="top" title="Blue Smoke" data-original-title="Blue Smoke"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-11" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-11.css"} data-toggle="tooltip" data-placement="top" title="Green Smoke" data-original-title="Green Smoke"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-12" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-12.css"} data-toggle="tooltip" data-placement="top" title="Wild Blue Yonder" data-original-title="Wild Blue Yonder"></a>
                                </li>
                                <li>
                                    <a href="#" id="myapp-13" data-action="theme-update" data-themesave data-theme={process.env.PUBLIC_URL+"/css/themes/cust-theme-13.css"} data-toggle="tooltip" data-placement="top" title="Emerald" data-original-title="Emerald"></a>
                                </li>
                            </ul>
                        </div>
                        <hr className="mb-0 mt-4" />
                        <div className="pl-5 pr-3 py-3 bg-faded">
                            <div className="row no-gutters">
                                <div className="col-6 pr-1">
                                    <a href="#" className="btn btn-outline-danger fw-500 btn-block" data-action="app-reset">Reset Settings</a>
                                </div>
                                <div className="col-6 pl-1">
                                    <a href="#" className="btn btn-danger fw-500 btn-block" data-action="factory-reset">Factory Reset</a>
                                </div>
                            </div>
                        </div>

                    </div> <span id="saving"></span>
                </div>
            </div>
        </div>
    </div>
  )
}

/* NOTES
<> content </> => Functions components can return only one element,
  to return more than only one, you should put them inside another tag
Handle routes params
  let { path, url } = useRouteMatch();
  let { topicId } = useParams();
React only update real DOM when virtual DOM has changed, and only update that little change between it's versions
  https://stackoverflow.com/questions/24718709/reactjs-does-render-get-called-any-time-setstate-is-called
When we need to execute a function from DOM Events (onclick, onchange, etc)
  we should declare 'em as arrow function to access to 'this', otherwise we cann't
  ()=>{this.prop}
*/

/* EXPORT NAVIGATION */
export default withRouter(Navigation);
// eslint-disable-next-line react-hooks/exhaustive-deps
