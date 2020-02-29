import React from 'react';

/* We use extended class of React.Component instead of function components
    because we'll need to use componentDidMount function
*/
class Cita extends React.Component {
  render(){
    return(
      <h1>CITA</h1>
    )
  }
  componentDidMount(){
    const script = document.createElement("script");
    script.async = false;
    script.src = "/js/vendors.bundle.js";
    // For body
    document.body.appendChild(script);

    const script2 = document.createElement("script");
    script2.async = false;
    script2.src = "/js/app.bundle.js";
    // For body
    document.body.appendChild(script2);
  }
}

/* EXPORT CITA */
export default Cita;
