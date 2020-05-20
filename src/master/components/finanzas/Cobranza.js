import React, { useState, useEffect, useRef } from 'react';
import { handleErrorResponse } from '../../functions';
import { getPageHistory, getCacheData } from '../HandleCache';
import { PageTitle } from '../bits';

// Constant
const __debug__ = process.env.REACT_APP_DEBUG
const __cacheName__ = "_cobranza";


const Cobranza = props => {
  const [list, setList] = useState(false);

  const getBack = () => {
    props.redirectTo(getPageHistory().prev_pathname);
  }

  useEffect(() => {
    console.log("props", props);
  }, []);

  return(
  <>
    <PageTitle title={"Prescripción"} />

    <div className="row">
      <div className="col-lg-6">
        COLUMNA
      </div>
      <div className="col-lg-6">
        COLUMNA
      </div>
    </div>
  </>
  )
}

export default Cobranza;

/*
* Cobro (costs list, payment form (switch between efective/credit))
*/
