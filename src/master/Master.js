import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,  // Router needed && Allow history of visited pages
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect,  // Redirect url
  Link,  // Alternative to a element for Router usage
} from "react-router-dom";  // https://reacttraining.com/react-router/web/api/
import { isArray, deleteUserLogIn } from './functions'
// Components
import Login from './login/Login';
import Navigation from './components/Navigation';


function Master(){
  const [logged, setLogged] = useState(localStorage.getItem("logged")||false);  // User is loged in?
  const [user, setUser] = useState(false);  // Logged user data
  const [error_log, setErrorLog] = useState(false);  // Error log from child components
  if(process.env.REACT_APP_DEBUG==="true") console.log(`%c --------- MOUNTING MASTER ---------`, 'background: black; color: red');
  if(process.env.REACT_APP_DEBUG==="true") console.log(`%c PROPS:`, 'color: yellow', logged, user);

  const checkLogIn = () => {
    // Send token to check if it's alright
    let url = process.env.REACT_APP_PROJECT_API+`maestro/tokenexist/`;
    // Validate there is a access_token in localstorage
    let access_token = localStorage.getItem("access_token")
    if(!access_token){
      // If there is no access_token
      if(logged) setLogged(false)
      return
    }

    // Generate promise
    let key = new FormData();
    key.append("key", access_token)

    // Fetch data to api
    fetch(url, {
      method: 'POST',
      body: key  // Data
    }).then(response => {
      return response.ok
      ? Promise.resolve(response.json())
      : Promise.reject(response.json())
    }, res => {
      setErrorLog(res.message)
    }).then(response => {
      // In case it's ok
      if(!response) return
      if(isArray(response) && response[0]=="delete"){
        // If token is wrong
        if(logged){
          deleteUserLogIn()
          setLogged(false)
        }
        return
      }
      // If token is alright set user data
      setUser(response);
      if(!logged) setLogged(true);
    });
  }

  // Run first render
  useEffect(() => {
    checkLogIn()
  }, []);

  return (
    <BrowserRouter>  {/* Interface for Routes */}
      {error_log!==false && <Redirect to="/error/log" />}
      <Switch>  {/* SWITCH: area to be changed by Link */}
        <Route exact path="/">
          {logged ?
            <Redirect to="/nav/" /> :
            <Redirect to="/login" />
            // <Home logged={logged} />
          }
        </Route>
        <Route path="/login">
          {logged ? <Redirect to="/nav" /> : <Login logIn={checkLogIn} />}
        </Route>
        <Route path="/nav">  {/* NAVIGATION */}
          {logged ?
            <Navigation user={user} errorFunc={setErrorLog} /> :
            <Redirect to="/" />}
        </Route>
        <Route path="/error/log">
          {error_log!==false ?
            <Error log={error_log} setLog={setErrorLog} errorFlag={error_log}/> :
            <Redirect to="/nav" />
          }
        </Route>
        <Route>  {/* ROUTE NOT FOUND REDIRECT */}
          <Redirect to="/error/log" />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}
/* NOTES
Router => Load every Route that matchs the URL
Route:path => Content to be loaded if URL match its path (no path matchs everything)
Route:exact => Does not allow anything else after the path
Switch => Load only the first match of its Routes with the URL
Change some class.state attributes:
  let clone = Object.assign({}, this.state)  // Clone this.state object
  clone.attribute = new_value  // Change attribute's value
  this.setState(clone)  // Save change (re-render)
When generating url with params we should use double quotes ("),
  instead of single quotes (')
*/

/*** COMPONENTS ***/
function Home(props){
  return (
    <div>
      <h1>Home</h1>
      <Link to={props.logged ? '/nav' : '/login'}>{props.logged ? 'Ingresar al sistema' : 'Iniciar sesión'}</Link>
    </div>
  )
}
function Error(props){
  return (
    <div className="h-alt-hf d-flex flex-column align-items-center justify-content-center text-center">
      <h1 className="page-error color-fusion-500">
        ERROR <span className="text-gradient">404</span>
        <small className="fw-500">
          {props.log ? props.log : "Algo salió mal!"}
        </small>
      </h1>
      <h3 className="fw-500 mb-5">
        Estamos experimentando <u>dificultades técnicas</u>. Nos disculpamos.
      </h3>
      <h4>
        Estamos trabajando para solucionar este inconveniente. Por favor espere unos momentos e intentelo de nuevo.
        <br/>
      </h4>
    </div>
  )
}

/* EXPORT MASTER */
export default Master;


/* Some usefull code*/
Date.prototype.toDateInputValue = (function(){
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});
// Set theme settings
window.localStorage.themeSettings = '{"themeURL":"https://smartadmin.lodev09.com/assets/css/themes/cust-theme-3.css"}'
