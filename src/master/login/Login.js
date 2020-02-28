import React from 'react';
import './Login.css';

function Login(props) {

  // Validate form
  function validateForm(e){
    e.preventDefault()  // Disable regular functionality of form element
    // Form element
    let form = document.querySelector('form#js-login')
    // Decide whether show error or continue
    if(!form.checkValidity()){  // There is error
      form.classList.add('was-validated');
    }else{
      getToken(form)
    }
  }
  // Submit function
  function getToken(form){
    let data = new FormData(form)  // Get data from form element
    // HTTP REQUEST
    let xhr = new XMLHttpRequest()
    xhr.open('POST', process.env.REACT_APP_PROJECT_API_TOKEN)
    xhr.onload = handleTokenResponse  // Receive token or failed
    xhr.onerror = handleErrorResponse  // Receive server error

    xhr.send(data)  // Send request
    // Show waiter
    charging(true)
  }
  function handleTokenResponse(xhr){
    xhr = xhr.target
    // Stop waiter
    charging(false)
    // Convert response to json object
    const response = JSON.parse(xhr.response)
    // Check if token is returned
    if(response.token){
      // Add token to cookies and headers (access_token)
      localStorage.setItem('access_token', response.token)
      /*
        We will use access_token cookie afterwards when creating XMLHttpRequest
        we'd do:
          xhr.setRequestHeader('Authorization', localStorage.getItem('access_token'))
      */
      // Redirect
      props.onClick()
      /*
        Page will automatically redirect to home when calling props.onClick (setLogged)
      */
    }else{  // Handle bad login
      handleErrorResponse(xhr)
    }
  }
  function handleErrorResponse(xhr){
    charging(false)
    if(xhr.type==='error'){
      document.querySelector('div#alert-server').style.display = "block"
      document.querySelector('div#alert-server').classList.remove("fade")
      setTimeout(function(){
        document.querySelector('div#alert-server').classList.add("fade")
      }, 2500)
      setTimeout(function(){
        document.querySelector('div#alert-server').style.display = "none"
      }, 2700)
    }else{
      document.querySelector('div#alert-login').style.display = "block"
      document.querySelector('div#alert-login').classList.remove("fade")
      setTimeout(function(){
        document.querySelector('div#alert-login').classList.add("fade")
      }, 2500)
      setTimeout(function(){
        document.querySelector('div#alert-login').style.display = "none"
      }, 2700)
    }
  }
  function charging(state){
    let spinner = document.querySelector("#spinner")
    spinner.style.display = state?"block":"none"
    document.querySelector('#js-login').style.filter=state?"blur(1px)":""
  }

  return (
    <div className="page-wrapper">
        <div className="page-inner bg-brand-gradient">
            <div className="page-content-wrapper bg-transparent m-0">
                <div className="height-10 w-100 shadow-lg px-4 bg-brand-gradient">
                    <div className="d-flex align-items-center container p-0">
                        <div className="page-logo width-mobile-auto m-0 align-items-center justify-content-center p-0 bg-transparent bg-img-none shadow-0 height-9">
                            <a href="#" onClick={e => e.preventDefault()} className="page-logo-link press-scale-down d-flex align-items-center">
                              <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Muelitas" aria-roledescription="logo" />
                              <span className="page-logo-text mr-1">Muelitas</span>
                            </a>
                        </div>
                        <a href="page_register.html" className="btn-link text-white ml-auto">
                            Registrate
                        </a>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="container py-4 py-lg-5 my-lg-5 px-4 px-sm-0">
                        <div className="row">
                            <div className="col col-md-6 col-lg-7 hidden-sm-down">
                                <h2 className="fs-xxl fw-500 mt-4 text-white">
                                    Muelitas, la herramienta Online para tu consultorio odontológico.
                                    <small className="h3 fw-300 mt-3 mb-5 text-white opacity-60">
                                        Te presentamos la solución que va a darle un nuevo de nivel de calidad a tu empresa.
                                    </small>
                                </h2>
                                <a href="#" className="fs-lg fw-500 text-white opacity-70">Ver más &gt;&gt;</a>
                                <div className="d-sm-flex flex-column align-items-center justify-content-center d-md-block">
                                    <div className="px-0 py-1 mt-5 text-white fs-nano opacity-50">
                                        Redes Sociales
                                    </div>
                                    <div className="d-flex flex-row opacity-70">
                                        <a href="#" className="mr-2 fs-xxl text-white">
                                            <i className="fab fa-facebook-square"></i>
                                        </a>
                                        <a href="#" className="mr-2 fs-xxl text-white">
                                            <i className="fab fa-twitter-square"></i>
                                        </a>
                                        <a href="#" className="mr-2 fs-xxl text-white">
                                            <i className="fab fa-google-plus-square"></i>
                                        </a>
                                        <a href="#" className="mr-2 fs-xxl text-white">
                                            <i className="fab fa-linkedin"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-6 col-lg-5 col-xl-4 ml-auto">
                                <h1 className="text-white fw-300 mb-3 d-sm-block d-md-none">
                                    Ingreso
                                </h1>
                                <div className="card p-4 rounded-plus bg-faded">
                                    <form id="js-login" noValidate>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="username">Usuario</label>
                                            <input type="text" id="username" name="username" className="form-control form-control-lg" placeholder="Ingresa tu usuario." required />
                                            <div className="invalid-feedback">Olvidaste este.</div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="password">Contraseña</label>
                                            <input type="password" id="password" name="password" className="form-control form-control-lg" placeholder="Ingresa tu contraseña" required />
                                            <div className="invalid-feedback">Este te falta c:</div>
                                        </div>
                                        <div className="row no-gutters">
                                            <div className="col-lg-6 pr-lg-1 my-2">
                                                <button type="submit" className="btn btn-info btn-block btn-lg" onClick={validateForm}>Ingresar </button>
                                            </div>
                                            <div className="col-lg-6 pl-lg-1 my-2">
                                                <button id="js-login-btn" type="submit" className="btn btn-danger btn-block btn-lg">Olvidé mi contraseña</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <button className="btn btn-danger rounded-pill waves-effect waves-themed fade" type="button" id="spinner" style={{display:'none'}}>
                                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                    Loading...
                                </button>
                                <div id="alert-login" className="fade bg-danger-400 text-white fade" role="alert" style={{display:'none'}}>
                                    <strong>Ups!</strong> Parece que el usuario o contraseña introducidos no son correctos.
                                </div>
                                <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
                                    <strong>Error</strong> No se ha podido establecer conexión con el servidor.
                                </div>
                            </div>
                        </div>
                        <div className="position-absolute pos-bottom pos-left pos-right p-3 text-center text-white">
                            2020 © Muelitas by&nbsp;<a href='https://www.datakrafthco.com' className='text-white opacity-40 fw-500' title='datakrafthco.com' target='_blank'>datakrafthco.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
export default Login;
