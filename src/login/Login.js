import React from 'react';

function Login() {
  return (

    <div className="page-wrapper">
        <div className="page-inner bg-brand-gradient">
            <div className="page-content-wrapper bg-transparent m-0">
                <div className="height-10 w-100 shadow-lg px-4 bg-brand-gradient">
                    <div className="d-flex align-items-center container p-0">
                        <div className="page-logo width-mobile-auto m-0 align-items-center justify-content-center p-0 bg-transparent bg-img-none shadow-0 height-9">
                            <a href="#" onClick={e => e.preventDefault()} className="page-logo-link press-scale-down d-flex align-items-center">
                                <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Muelitas" aria-roledescription="logo" />
                                <span className="page-logo-text mr-1">SmartAdmin WebApp</span>
                            </a>
                        </div>
                        <a href="page_register.html" className="btn-link text-white ml-auto">
                            Create Account
                        </a>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="container py-4 py-lg-5 my-lg-5 px-4 px-sm-0">
                        <div className="row">
                            <div className="col col-md-6 col-lg-7 hidden-sm-down">
                                <h2 className="fs-xxl fw-500 mt-4 text-white">
                                    The simplest UI toolkit for developers &amp; programmers
                                    <small className="h3 fw-300 mt-3 mb-5 text-white opacity-60">
                                        Presenting you with the next level of innovative UX design and engineering. The most modular toolkit available with over 600+ layout permutations. Experience the simplicity of SmartAdmin, everywhere you go!
                                    </small>
                                </h2>
                                <a href="#" className="fs-lg fw-500 text-white opacity-70">Learn more &gt;&gt;</a>
                                <div className="d-sm-flex flex-column align-items-center justify-content-center d-md-block">
                                    <div className="px-0 py-1 mt-5 text-white fs-nano opacity-50">
                                        Find us on social media
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
                                    Secure login
                                </h1>
                                <div className="card p-4 rounded-plus bg-faded">
                                    <form id="js-login" noValidate action="intel_analytics_dashboard.html">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="username">Username</label>
                                            <input type="email" id="username" className="form-control form-control-lg" placeholder="your id or email" required />
                                            <div className="invalid-feedback">No, you missed this one.</div>
                                            <div className="help-block">Your unique username to app</div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="password">Password</label>
                                            <input type="password" id="password" className="form-control form-control-lg" placeholder="password" required />
                                            <div className="invalid-feedback">Sorry, you missed this one.</div>
                                            <div className="help-block">Your password</div>
                                        </div>
                                        <div className="form-group text-left">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" id="rememberme" />
                                                <label className="custom-control-label" htmlFor="rememberme"> Remember me for the next 30 days</label>
                                            </div>
                                        </div>
                                        <div className="row no-gutters">
                                            <div className="col-lg-6 pr-lg-1 my-2">
                                                <button type="submit" className="btn btn-info btn-block btn-lg">Sign in with <i className="fab fa-google"></i></button>
                                            </div>
                                            <div className="col-lg-6 pl-lg-1 my-2">
                                                <button id="js-login-btn" type="submit" className="btn btn-danger btn-block btn-lg">Secure login</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="position-absolute pos-bottom pos-left pos-right p-3 text-center text-white">
                            2019 © SmartAdmin by&nbsp;<a href='https://www.gotbootstrap.com' className='text-white opacity-40 fw-500' title='gotbootstrap.com' target='_blank'>gotbootstrap.com</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;
