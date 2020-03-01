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
      logged: false  // User is loged in?
    }
  }
  setLogged(status){
    let clone = Object.assign({}, this.state)  // Clone this.state object
    clone.logged = status  // Change attribute's value
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
            {this.state.logged ? <Navigation /> : <Redirect to="/login" />}
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
*/

/*** COMPONENTS ***/
function Home(){
  return (<div>
    <h1>Home</h1>
    <Link to="/login">IR AL LOGIN</Link>
  </div>)
}

/* EXPORT MASTER */
export default Master;
