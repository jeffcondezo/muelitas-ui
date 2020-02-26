import React from 'react';
import {
  BrowserRouter as Menu,
  Switch,  // Allow to change only content
  Route,  // Route handling
  Link  // Help route working
} from "react-router-dom";
// Components
import Login from './login/Login';

class Master extends React.Component {
  constructor(props){
    super();
    this.url = '/'  // Current url
    this.logged = true  // User is loged in?
  }
  render(){
    return this.logged ? <MenuLinks /> : <Login />
  }
}

function Home(){
  return (
    <h1>Home</h1>
  )
}
function MenuLinks(){
  return (
    <Menu> {/* Menu with links */}
      <li>
        <Link to='/'>Home</Link>
      </li>
      <li>
        <Link to='/Login'>Login</Link>
      </li>
      {/* SWITCH: area to be changed by Link */}
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
    </Menu>
  )
}
/*
Route:exact => Does not allow anything else after the path
*/
export default Master;
