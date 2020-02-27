import React from 'react';
import {
  BrowserRouter,  // Allow history of visited pages
  Switch,  // Allow to change only content
  Route,  // Route handling
  Redirect  // Redirect url
} from "react-router-dom";  // https://reacttraining.com/react-router/web/api/
// Components
import Login from './login/Login';

class Master extends React.Component {
  constructor(props){
    super();
    this.state = {
      logged: false  // User is loged in?
    }
  }
  middlewarePage(element){
    let target = element.type.name
    // Check if user is logged and url
    if(target==='Login') return
    if(!this.state.logged){  // User is not logged and target is not login
      return <Redirect to="login" />
    }
    return element
  }
  render(){  /*** RENDER ***/
    return (
      <BrowserRouter>  {/* Interface for Routes */}
        <Switch>  {/* SWITCH: area to be changed by Link */}
          <Route exact path="/">
            <Home />  {/* No need of middleware */}
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route>
            {/*this.state.logged ? <Home /> : <Redirect to="login" />*/}
            {this.middlewarePage(<Home/>)}
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

/* COMPONENTS */
function Home(){
  return (
    <h1>Home</h1>
  )
}

/* EXPORT MASTER */
export default Master;
