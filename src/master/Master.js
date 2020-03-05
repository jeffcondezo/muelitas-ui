import React from 'react';
import {
  BrowserRouter,  // Router needed && Allow history of visited pages
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect,  // Redirect url
  Link  // Alternative to a element for Router usage
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
      error_log: "",
    }
    // Check if user is already loged
    if(!this.state.logged && localStorage.hasOwnProperty('access_token'))
      this.checkAlreadyLogged()  // Token cookie already exists?
  }
  checkAlreadyLogged(){  // Token exists and this.state.logged = false
    // Send token to check if it's alright
    let a = new FormData();
    a.append("key", localStorage["access_token"]);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:8000/maestro/tokenexist/');
    xhr.onload = (xhr) => {
      if(xhr.target.response==="delete"){  // If token is wrong
        localStorage.removeItem("access_token");  // Delete token
        return;
      }
      if(xhr.target.status===0){
        console.log("CONEXIÓN CON EL SERVIDOR FAILED");
        return;
      }
      if(xhr.target.status===500){
        console.log(xhr.target.status);
        return;
      }

      // If token is alright set this.state with user data
      const response_object = JSON.parse(xhr.target.response);

      // Change attribute's value
      let clone = Object.assign({}, this.state)  // Clone this.state object
      clone.logged = true  // Set logged true
      clone.user = response_object  // Set user data
      this.setState(clone)  // Save change (re-render)
    }
    xhr.onerror = (xhr) => {
      console.log(xhr.target.status);
    }
    xhr.send(a);  // Send request
  }
  setLogged(status){
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.logged = status  // Change attribute's value
    this.setState(clone)  // Save change (re-render)
  }
  setError(from, log){
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.error_log = String(log)  // Change attribute's value
    this.setState(clone)  // Save change (re-render)
  }
  render(){  /*** RENDER ***/
    return (
      <BrowserRouter>  {/* Interface for Routes */}
        <Switch>  {/* SWITCH: area to be changed by Link */}
          <Route exact path="/">
            <Home />  {/* No need of middleware */}
          </Route>
          <Route path="/login">
            {this.state.logged ? <Redirect to="/nav" /> : <Login onClick={()=>this.setLogged(true)} />}
          </Route>
          <Route path="/nav">  {/* NAVIGATION */}
            {this.state.logged ? <Navigation state={this.state.user} errorFunc={(a,b)=>this.setError(a,b)} /> : <Redirect to="/login" />}
          </Route>
          <Route path="/error/log">
            {this.state.error_log==="" ? <Redirect to="/nav" /> : <Error log={this.state.error_log} /> }
          </Route>
          <Route>  {/* ROUTE NOT FOUND REDIRECT */}
            <Redirect to="/" />
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
  return (<div>
    <h1>Home</h1>
    <Link to="/login">IR AL LOGIN</Link>
  </div>)
}
function Error(props){
  return (
    <>
    <h3><b>Error: </b></h3><h4><i>{props.log}</i></h4>
    </>
  )
}

/* EXPORT MASTER */
export default Master;
