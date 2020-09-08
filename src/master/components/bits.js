import React from 'react';


// Here there will be placed small components to be reused all over navigation
export const Icon = props => {
  const onClick = (ev) => {
    if(props.onClick) props.onClick();
  }

  const el = [];
  switch(props.type){
    case "odontogram": el.push(  // Odontograma
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Odontograma" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14" role="img" viewBox="0 0 448 512" style={{width: "80%"}}>
            <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
          </svg>
      </a>
    ); break;
    case "procedure": el.push(  // Procedimiento
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Procedimiento Odontologico" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-medical" className="svg-inline--fa fa-file-medical fa-w-12" role="img" viewBox="0 0 384 512" style={{width: "80%"}}>
            <path fill="currentColor" d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 160v48c0 4.4-3.6 8-8 8h-56v56c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-56h-56c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h56v-56c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v56h56c4.4 0 8 3.6 8 8z"/>
          </svg>
      </a>
    ); break;
    case "attention": el.push(  // Atención
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Atencion" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="id-card-alt" className="svg-inline--fa fa-id-card-alt fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={{width: "100%"}}>
            <path fill="currentColor" d="M528 64H384v96H192V64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM288 224c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm93.3 224H194.7c-10.4 0-18.8-10-15.6-19.8 8.3-25.6 32.4-44.2 60.9-44.2h8.2c12.3 5.1 25.7 8 39.8 8s27.6-2.9 39.8-8h8.2c28.4 0 52.5 18.5 60.9 44.2 3.2 9.8-5.2 19.8-15.6 19.8zM352 32c0-17.7-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32v96h128V32z"></path>
          </svg>
      </a>
    ); break;
    case "admision": el.push(  // Atención
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Admision" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user-md" className="svg-inline--fa fa-user-md fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{width: "70%"}}>
            <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zM104 424c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24zm216-135.4v49c36.5 7.4 64 39.8 64 78.4v41.7c0 7.6-5.4 14.2-12.9 15.7l-32.2 6.4c-4.3.9-8.5-1.9-9.4-6.3l-3.1-15.7c-.9-4.3 1.9-8.6 6.3-9.4l19.3-3.9V416c0-62.8-96-65.1-96 1.9v26.7l19.3 3.9c4.3.9 7.1 5.1 6.3 9.4l-3.1 15.7c-.9 4.3-5.1 7.1-9.4 6.3l-31.2-4.2c-7.9-1.1-13.8-7.8-13.8-15.9V416c0-38.6 27.5-70.9 64-78.4v-45.2c-2.2.7-4.4 1.1-6.6 1.9-18 6.3-37.3 9.8-57.4 9.8s-39.4-3.5-57.4-9.8c-7.4-2.6-14.9-4.2-22.6-5.2v81.6c23.1 6.9 40 28.1 40 53.4 0 30.9-25.1 56-56 56s-56-25.1-56-56c0-25.3 16.9-46.5 40-53.4v-80.4C48.5 301 0 355.8 0 422.4v44.8C0 491.9 20.1 512 44.8 512h358.4c24.7 0 44.8-20.1 44.8-44.8v-44.8c0-72-56.8-130.3-128-133.8z"></path>
          </svg>
      </a>
    ); break;
    case "finance": el.push(  // Finanzas
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Atencion" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="money-check-alt" className="svg-inline--fa fa-money-check-alt fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style={{width: "90%"}}>
            <path fill="currentColor" d="M608 32H32C14.33 32 0 46.33 0 64v384c0 17.67 14.33 32 32 32h576c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zM176 327.88V344c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-16.29c-11.29-.58-22.27-4.52-31.37-11.35-3.9-2.93-4.1-8.77-.57-12.14l11.75-11.21c2.77-2.64 6.89-2.76 10.13-.73 3.87 2.42 8.26 3.72 12.82 3.72h28.11c6.5 0 11.8-5.92 11.8-13.19 0-5.95-3.61-11.19-8.77-12.73l-45-13.5c-18.59-5.58-31.58-23.42-31.58-43.39 0-24.52 19.05-44.44 42.67-45.07V152c0-4.42 3.58-8 8-8h16c4.42 0 8 3.58 8 8v16.29c11.29.58 22.27 4.51 31.37 11.35 3.9 2.93 4.1 8.77.57 12.14l-11.75 11.21c-2.77 2.64-6.89 2.76-10.13.73-3.87-2.43-8.26-3.72-12.82-3.72h-28.11c-6.5 0-11.8 5.92-11.8 13.19 0 5.95 3.61 11.19 8.77 12.73l45 13.5c18.59 5.58 31.58 23.42 31.58 43.39 0 24.53-19.05 44.44-42.67 45.07zM416 312c0 4.42-3.58 8-8 8H296c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h112c4.42 0 8 3.58 8 8v16zm160 0c0 4.42-3.58 8-8 8h-80c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16zm0-96c0 4.42-3.58 8-8 8H296c-4.42 0-8-3.58-8-8v-16c0-4.42 3.58-8 8-8h272c4.42 0 8 3.58 8 8v16z"></path>
        </svg>
      </a>
    ); break;
    case "prescription": el.push(  // Receta
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Receta" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pills" className="svg-inline--fa fa-pills fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={{width: "100%"}}>
            <path fill="currentColor" d="M112 32C50.1 32 0 82.1 0 144v224c0 61.9 50.1 112 112 112s112-50.1 112-112V144c0-61.9-50.1-112-112-112zm48 224H64V144c0-26.5 21.5-48 48-48s48 21.5 48 48v112zm139.7-29.7c-3.5-3.5-9.4-3.1-12.3.8-45.3 62.5-40.4 150.1 15.9 206.4 56.3 56.3 143.9 61.2 206.4 15.9 4-2.9 4.3-8.8.8-12.3L299.7 226.3zm229.8-19c-56.3-56.3-143.9-61.2-206.4-15.9-4 2.9-4.3 8.8-.8 12.3l210.8 210.8c3.5 3.5 9.4 3.1 12.3-.8 45.3-62.6 40.5-150.1-15.9-206.4z"></path>
          </svg>
      </a>
    ); break;
    case "new-patient": el.push(  // New User
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Nuevo Usuario" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="new-patient" className="svg-inline--fa fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style={{width: "100%"}}>
            <path d="M624 208h-64v-64c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v64h-64c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h64v64c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-64h64c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm-400 48c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
          </svg>
      </a>
    ); break;
    case "edit-patient": el.push(  // Edit User
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Editar Usuario" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="edit-patient" className="svg-inline--fa fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style={{width: "100%"}}>
            <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z"/>
          </svg>
      </a>
    ); break;
    case "clinic-history": el.push(  // Clinic History
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Historia Clinica" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="book-medical" className="svg-inline--fa fa-book-medical fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{width: "100%"}}>
            <path fill="currentColor" d="M448 358.4V25.6c0-16-9.6-25.6-25.6-25.6H96C41.6 0 0 41.6 0 96v320c0 54.4 41.6 96 96 96h326.4c12.8 0 25.6-9.6 25.6-25.6v-16q0-9.6-9.6-19.2c-3.2-16-3.2-60.8 0-73.6q9.6-4.8 9.6-19.2zM144 168a8 8 0 0 1 8-8h56v-56a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v56h56a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8h-56v56a8 8 0 0 1-8 8h-48a8 8 0 0 1-8-8v-56h-56a8 8 0 0 1-8-8zm236.8 280H96c-19.2 0-32-12.8-32-32s16-32 32-32h284.8z"></path>
          </svg>
      </a>
    ); break;
    case "plandetrabajo": el.push(  // Plan de trabajo
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        title="Historia Clinica" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="book-medical" className="svg-inline--fa fa-book-medical fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{width: "100%"}}>
          </svg>
      </a>
    ); break;
    default: break;
  }

  return (
    <div className="">  {/* Links */}
      {el}
    </div>
  );
}
export const PageTitle = props => {
  // Receive {title}
  return (
    <>
    {/* ALERTS */}
      <div id="alert-server" className="alert bg-fusion-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Error</strong> No se ha podido establecer conexión con el servidor.
      </div>
      <div id="alert-permission" className="alert bg-primary-200 text-white fade" role="alert" style={{display:'none'}}>
          <strong>Ups!</strong> Parece que no posees permisos para realizar esta acción.
      </div>
      <div id="alert-custom" className="alert bg-warning-700" role="alert" style={{display: "none"}}>
        <strong id="alert-headline">Error!</strong> <span id="alert-text">Algo salió mal, parece que al programador se le olvidó especificar qué</span>.
      </div>

      {/* HEADER */}
      <div className="subheader">
        <h1 className="subheader-title">
          <i className="subheader-icon fal fa-chart-area"></i> {props.title}
        </h1>
      </div>
    </>
  )
}
export const SelectOptions_Procedimiento = props => {
  const procedimiento = [];

  if(props.procedimientos!==false){
    props.procedimientos.map(p => {
      procedimiento.push(
        <option key={p.procedimiento_data.pk} value={p.procedimiento_data.pk}>
          {p.procedimiento_data.nombre.toUpperCase()}
        </option>
      );
    });
  }

  return procedimiento;
}
