import React from 'react';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_procedure";


class Procedimiento extends React.Component {
  constructor(props){
    super()
    this.state = {
      a: 'b'
    }
  }

  render(){
    return (
      <h1> PROCEDIMIENTO </h1>
    )
  }
}

export default Procedimiento;
