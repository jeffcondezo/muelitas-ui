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
    case "admision": el.push(  // Admision
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
        title="Cobrar" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
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
        title="Plan de trabajo" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 512 512" enableBackground="new 0 0 512 512" style={{width: "100%"}}>
            <image fill="currentColor" width="512" height="512" x="0" y="0" href="data:image/png;base64,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 gg=="/>
          </svg>
      </a>
    ); break;
    case "add": el.push(  // Agregar
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 512.000000 512.000000" style={{width: "100%"}}>
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
              <path d="M2370 5113 c-371 -35 -653 -114 -961 -269 -406 -203 -782 -548 -1029 -944 -179 -286 -309 -655 -362 -1025 -17 -118 -17 -512 0 -630 42 -295 120 -553 242 -800 137 -280 272 -468 494 -691 221 -220 412 -357 681 -489 188 -92 309 -137 500 -185 500 -126 1002 -102 1490 71 150 53 408 183 540 271 560 374 952 942 1095 1588 33 150 50 291 57 465 15 426 -73 832 -263 1214 -124 250 -263 447 -458 648 -214 222 -430 379 -711 518 -296 146 -572 225 -900 255 -102 9 -333 11 -415 3z m545 -342 c628 -106 1158 -448 1511 -977 179 -267 296 -573 351 -909 24 -153 24 -497 0 -650 -108 -668 -474 -1222 -1042 -1580 -243 -153 -537 -261 -850 -312 -154 -24 -497 -24 -650 1 -657 107 -1198 456 -1557 1006 -168 257 -281 557 -335 885 -24 153 -24 497 0 650 81 497 291 912 636 1255 382 381 862 605 1401 654 108 10 418 -4 535 -23z"/>
              <path d="M2400 3280 l0 -560 -560 0 -560 0 0 -160 0 -160 560 0 560 0 0 -560 0 -560 160 0 160 0 0 560 0 560 560 0 560 0 0 160 0 160 -560 0 -560 0 0 560 0 560 -160 0 -160 0 0 -560z"/>
            </g>
          </svg>
      </a>
    ); break;
    case "edit": el.push(  // Edit
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg viewBox="0 0 24 24" style={{width: "100%"}}>
            <path fill="currentColor" d="M18.363 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z"/>
          </svg>
      </a>
    ); break;
    case "trash": el.push(  // Trash
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg viewBox="0 0 24 24" style={{width: "100%"}}>
            <path fill="currentColor" d="M3 6l3 18h12l3-18h-18zm19-4v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.316c0 .901.73 2 1.631 2h5.711z"/>
          </svg>
      </a>
    ); break;
    case "check": el.push(  // Check
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px", fontSize: "2.1em"}}>
          <i className="fal fa-check-circle"></i>
      </a>
    ); break;
    case "files": el.push(  // Files
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px", fontSize: "2.5em"}}>
          <i className="fal fa-file-alt"></i>
      </a>
    ); break;
    case "pdf": el.push(  // PDF File
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px", fontSize: "2.5em"}}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{width: "100%"}} viewBox="0 0 512 512">
            <g>
              <path d="m507.786 64.62c-.304-.286-60.445-57.641-60.445-57.641-2.299-2.206-4.677-4.486-9.117-4.486h-242.12c-7.072 0-12.826 5.753-12.826 12.825v39.383l-85.335 14.628c-6.84 1.2-11.44 7.746-10.255 14.579l4.331 25.252c-27.737 9.334-56.214 18.956-83.705 28.831-6.496 2.375-9.905 9.598-7.587 16.133l54.685 152.016c1.1 3.059 3.983 4.964 7.058 4.964.842 0 1.7-.143 2.538-.445 3.898-1.402 5.921-5.698 4.519-9.596l-53.876-149.768c25.9-9.273 52.722-18.349 78.935-27.172l25.771 150.245 29.654 173.032c1.071 6.108 6.44 10.454 12.5 10.454.686 0 1.382-.056 2.08-.171l80.316-13.783 62.76-10.758-94.391 33.927-74.435 26.763-57.808-160.789c-1.401-3.898-5.696-5.921-9.595-4.52-3.898 1.401-5.921 5.697-4.52 9.595l58.628 163.074c1.875 5.128 6.733 8.316 11.868 8.316 1.419 0 2.86-.244 4.264-.757l76.671-27.566 174.094-62.574 33.259-5.701h73.471c7.072 0 12.826-5.766 12.826-12.854v-326.985c.001-4.489-2.435-6.779-4.213-8.451zm-19.871 1.776h-37.53l-.93.004c-1.797.012-6.004.043-7.071-1.017-.246-.245-.534-1.063-.534-2.582l-.087-40.415zm9.085 331.512h-298.722v-146.167c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5v148.313c0 7.087 5.754 12.854 12.826 12.854h140.812l-94.545 16.206-77.982 13.383-29.248-170.665-32.269-188.13 80.405-13.783v147.022c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5v-199.449h228.475l.098 45.326c0 5.494 1.671 9.938 4.966 13.21 5.063 5.027 12.22 5.377 16.663 5.377.382 0 .744-.003 1.083-.005l47.438-.003z"/>
              <path d="m234.43 118.949c0 4.142 3.358 7.5 7.5 7.5h214.436c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5h-214.436c-4.142 0-7.5 3.358-7.5 7.5z"/>
              <path d="m456.366 164.731h-214.436c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5h214.436c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5z"/>
              <path d="m456.366 218.013h-214.436c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5h214.436c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5z"/>
              <path d="m456.366 271.295h-214.436c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5h214.436c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5z"/>
              <path d="m456.366 324.578h-214.436c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5h214.436c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5z"/>
            </g>
          </svg>
      </a>
    ); break;
    case "letter": el.push(  // Letter
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px", fontSize: "2.5em"}}>
        <svg xmlns="http://www.w3.org/2000/svg" style={{width: "100%"}} viewBox="0 0 512 512">
          <path d="m478.5 83.5h-385c-18.472 0-33.5 15.028-33.5 33.5v71.5h-52.5c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h90c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5h-22.5v-71.5c0-2.342.455-4.576 1.253-6.64l145.64 145.64-145.64 145.64c-.798-2.064-1.253-4.298-1.253-6.64v-49c0-4.143-3.358-7.5-7.5-7.5s-7.5 3.357-7.5 7.5v49c0 18.472 15.028 33.5 33.5 33.5h385c18.472 0 33.5-15.028 33.5-33.5v-278c0-18.472-15.028-33.5-33.5-33.5zm-128.393 172.5 145.64-145.64c.798 2.064 1.253 4.298 1.253 6.64v278c0 2.342-.455 4.576-1.253 6.64zm128.393-157.5c2.342 0 4.576.455 6.64 1.253l-167.32 167.32c-17.545 17.547-46.094 17.547-63.64 0l-167.32-167.32c2.064-.798 4.298-1.253 6.64-1.253zm-385 315c-2.342 0-4.576-.455-6.64-1.253l145.64-145.64 11.074 11.074c11.697 11.696 27.062 17.545 42.427 17.545s30.729-5.849 42.426-17.545l11.074-11.074 145.64 145.64c-2.064.798-4.298 1.253-6.64 1.253z"/>
          <path d="m67.5 218.5c-4.142 0-7.5 3.357-7.5 7.5v22.5h-52.5c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5h120c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5h-52.5v-22.5c0-4.143-3.358-7.5-7.5-7.5z"/><path d="m97.5 323.5c4.142 0 7.5-3.357 7.5-7.5s-3.358-7.5-7.5-7.5h-22.5v-22.5c0-4.143-3.358-7.5-7.5-7.5s-7.5 3.357-7.5 7.5v22.5h-52.5c-4.142 0-7.5 3.357-7.5 7.5s3.358 7.5 7.5 7.5z"/>
        </svg>
      </a>
    ); break;
    case "user": el.push(  // User
      <a key={props.type+"icon"} onClick={(ev)=>onClick(ev)}
        data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-icon waves-effect waves-themed"
        style={{margin: "0 4px", fontSize: "2.5em"}}>
          <i className="fal fa-user"></i>
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
          <strong>Error</strong> Ha ocurrido un error en el procesamiento.
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
        <option key={p.pk} value={p.pk}>
          {p.nombre.toUpperCase()}
        </option>
      );
    });
  }

  return procedimiento;
}
export const ModalCancel = ({_title, _id, _action_text, _cancel_text, _body_text, _action_func, _cancel_func}) => {
  const actionFunc = () => {
    if(_action_func) _action_func()
    else console.error("action function not defined in ModalCancel");
  }
  const cancelFunc = () => {
    if(_cancel_func) _cancel_func()
  }

  return (
    <div className="modal modal-alert" id={_id} tabIndex="-1" role="dialog" style={{display: "none", paddingRight: "15px"}} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{_title || "Anular cita"}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={cancelFunc}>
              <span aria-hidden="true"><i className="fal fa-times"></i></span>
            </button>
          </div>
          <div className="modal-body">
            {_body_text}
          </div>
          <div className="modal-footer">
            <button type="button" data-dismiss="modal"
              className="btn btn-secondary waves-effect waves-themed"
              onClick={cancelFunc}>{_cancel_text || "Cancelar"}</button>
            <button type="button" data-dismiss="modal"
              className="btn btn-primary waves-effect waves-themed"
              onClick={()=>actionFunc()}>{_action_text || "Anular"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export const ModalLoading = ({_title, _id, _body_text}) => (
  <div className="modal fade" id={_id} tabIndex="-1" role="dialog" style={{display: "none", paddingRight: "15px"}} aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{_title || "Default text"}</h5>
          </div>
          <div className="modal-body">
            {_body_text}
          </div>
      </div>
    </div>
  </div>
)
export const RegularModalCentered = ({_title, _id, _body, _min_width="800"}) => (
  <div className="modal fade" id={_id} tabIndex="-1" role="dialog" style={{display: "none", paddingRight: "15px"}} aria-hidden="true">
    <div className="modal-dialog" role="document" style={{minWidth: _min_width+"px"}}>
      <div className="modal-content" style={{height: "100%"}}>
          <div className="modal-header" style={{paddingBottom: "0px"}}>
            <h1 className="modal-title">{_title || "Default text"}</h1>
          </div>
          <button type="button" className="close p-sm-2 p-md-4 text-white fs-xxl position-absolute pos-right mr-sm-2 mt-sm-1 z-index-space" data-dismiss="modal">
            <span aria-hidden="true"><i className="fal fa-times" style={{color: "black"}}></i></span>
          </button>
          <div className="modal-body">
            {_body}
          </div>
      </div>
    </div>
  </div>
)
