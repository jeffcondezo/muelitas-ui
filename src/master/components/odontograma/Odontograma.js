import React from 'react';
import { withRouter } from "react-router-dom";  // Allow us access to route props

class Odontograma extends React.Component {
  constructor(props){
    super();
  }
  render(){
    return (
      <h1>Odontograma</h1>
    )
  }
}

/* Export by giving access to route props
  Source:
  https://reacttraining.com/react-router/web/api/withRouter
*/
export default withRouter(Odontograma);
