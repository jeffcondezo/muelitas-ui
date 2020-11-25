import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import Master from './master/Master';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Master />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


/* Additional notes:
* Most of the algorithms are explained in commentaries all over the system
*   if you found a non commentaried algorithm it's probably a duplicated case of that algorithm
*   you could look for it's explanation comment in another piece of code with the same algorithm
*
*/
