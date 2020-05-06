import React from 'react';


// Here there will be placed small components to be reused all over navigation
export function Icon(props){
  const onClick = (ev) => {
    if(props.onClick) props.onClick();
  }

  const el = [];
  switch(props.type){
    case "odontogram": el.push(  // Odontograma
      <a onClick={(ev)=>onClick(ev)}
        title="Odontograma" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-warning btn-icon rounded-circle waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tooth" className="svg-inline--fa fa-tooth fa-w-14" role="img" viewBox="0 0 448 512" style={{width: "60%"}}>
            <path fill="currentColor" d="M443.98 96.25c-11.01-45.22-47.11-82.06-92.01-93.72-32.19-8.36-63 5.1-89.14 24.33-3.25 2.39-6.96 3.73-10.5 5.48l28.32 18.21c7.42 4.77 9.58 14.67 4.8 22.11-4.46 6.95-14.27 9.86-22.11 4.8L162.83 12.84c-20.7-10.85-43.38-16.4-66.81-10.31-44.9 11.67-81 48.5-92.01 93.72-10.13 41.62-.42 80.81 21.5 110.43 23.36 31.57 32.68 68.66 36.29 107.35 4.4 47.16 10.33 94.16 20.94 140.32l7.8 33.95c3.19 13.87 15.49 23.7 29.67 23.7 13.97 0 26.15-9.55 29.54-23.16l34.47-138.42c4.56-18.32 20.96-31.16 39.76-31.16s35.2 12.85 39.76 31.16l34.47 138.42c3.39 13.61 15.57 23.16 29.54 23.16 14.18 0 26.48-9.83 29.67-23.7l7.8-33.95c10.61-46.15 16.53-93.16 20.94-140.32 3.61-38.7 12.93-75.78 36.29-107.35 21.95-29.61 31.66-68.8 21.53-110.43z"/>
          </svg>
      </a>
      ); break;
    case "procedure": el.push(  // Procedure
      <a onClick={(ev)=>onClick(ev)}
        title="Procedimiento Odontologico" data-dismiss={props.data_dismiss ? props.data_dismiss : ""}
        className="btn btn-warning btn-icon rounded-circle waves-effect waves-themed"
        style={{margin: "0 4px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-medical" className="svg-inline--fa fa-file-medical fa-w-12" role="img" viewBox="0 0 384 512" style={{width: "60%"}}>
            <path fill="currentColor" d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 160v48c0 4.4-3.6 8-8 8h-56v56c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-56h-56c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h56v-56c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v56h56c4.4 0 8 3.6 8 8z"/>
          </svg>
      </a>
    ); break;
    default: break;
  }

  return (
    <div className="btn-group">  {/* Links */}
      {el}
    </div>
  );
}
