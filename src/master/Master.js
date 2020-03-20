import React from 'react';
import {
  BrowserRouter,  // Router needed && Allow history of visited pages
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect,  // Redirect url
  Link,  // Alternative to a element for Router usage
  useHistory  // Allow us access to history object
} from "react-router-dom";  // https://reacttraining.com/react-router/web/api/
// Components
import Login from './login/Login';
import Navigation from './components/Navigation';

class Master extends React.Component {
  constructor(props){
    super();
    this.state = {
      logged: false,  // User is loged in?
      user: {},
      error_log: false,
    }
    this.error = false
    // Check if user is already loged
    if(!this.state.logged && localStorage.hasOwnProperty('access_token'))
      this.checkAlreadyLogged()  // Token cookie already exists?
  }
  checkAlreadyLogged(){
    // Send token to check if it's alright
    let a = new FormData();
    a.append("key", localStorage["access_token"]);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:8000/maestro/tokenexist/');
    xhr.onload = (xhr) => {
      xhr = xhr.target;
      if(xhr.response==="delete"){  // If token is wrong
        localStorage.removeItem("access_token");  // Delete token
        return;
      }
      if(xhr.status===0){this.handleServerError();return;}
      if(xhr.status===400){this.handleBadRequest();return;}
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      // If token is alright set this.state with user data
      const response_object = JSON.parse(xhr.response);

      // Change attribute's value
      let clone = Object.assign({}, this.state)  // Clone this.state object
      clone.logged = true  // Set logged true
      clone.user = response_object  // Set user data
      this.setState(clone)  // Save change (re-render)
    }
    xhr.onerror = () => this.handleServerError();
    xhr.send(a);  // Send request
  }
  setLoggedIn(){
    // Send token to retrieve user's info
    let a = new FormData();
    a.append("key", localStorage["access_token"]);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:8000/maestro/tokenexist/');
    xhr.onload = (xhr) => {
      xhr = xhr.target;
      // Posible errors
      if(xhr.response==="delete"){  // If token is wrong
        localStorage.removeItem("access_token");  // Delete token
        return;
      }
      if(xhr.status===0){this.handleServerError();return;}
      if(xhr.status===400){this.handleBadRequest();return;}
      if(xhr.status===403){this.handlePermissionError();return;}
      if(xhr.status===500){this.handleServerError();return;}

      // If token is alright set this.state with user data
      const response_object = JSON.parse(xhr.response);

      // Change attribute's value
      let clone = Object.assign({}, this.state)  // Clone this.state object
      clone.logged = true  // Set logged true
      clone.user = response_object  // Set user data
      this.setState(clone)  // Save change (re-render)
    }
    xhr.onerror = () => this.handleServerError();
    xhr.send(a);  // Send request
  }
  setError(log){
    let clone = Object.assign({}, this.state)
    clone.error_log = log
    this.setState(clone)
  }
  handleBadRequest(){
    this.error = true
    this.setError("BAD REQUEST ERROR");
  }
  handlePermissionError(){
    this.error = true
    this.setError("PERMISSION ERROR");
  }
  handleServerError(){
    this.error = true
    this.setError("SERVER ERROR");
  }

  render(){
    // if(this.error) return <Error log={this.state.error_log} />
    return (
      <BrowserRouter>  {/* Interface for Routes */}
        {(()=>{
          // Print error in case this.error flag is true
          if(this.error){
            console.log("ERROR: TRUE");
            this.error = false;
            return <Redirect to="/error/log" />
          }
        })()}
        <Switch>  {/* SWITCH: area to be changed by Link */}
          <Route exact path="/">
            <Home />  {/* No need of middleware */}
          </Route>
          <Route path="/login">
            {this.state.logged ? <Redirect to="/nav" /> : <Login onClick={()=>this.setLoggedIn()} />}
          </Route>
          <Route path="/nav">  {/* NAVIGATION */}
            {this.state.logged ?
              <Navigation user={this.state.user} errorFunc={(log)=>this.setError(log)} /> :
              <Redirect to="/login" />}
          </Route>
          <Route path="/error/log">
            {this.state.error_log==="" ? <Redirect to="/nav" /> : <Error log={this.state.error_log} />}
          </Route>
          <Route>  {/* ROUTE NOT FOUND REDIRECT */}
            <Redirect to="/error/log" />
          </Route>
        </Switch>
      </BrowserRouter>
    )
  }
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
function Home(){
  return (
    <>
    <h1>Home</h1>
    <Link to="/login">IR AL LOGIN</Link>
    </>
  )
}
function Error(props){
  let a = useHistory();
  console.log(a);
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
