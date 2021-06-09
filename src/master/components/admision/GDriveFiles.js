import React, { useState, useEffect } from 'react'
import { FileIcon, defaultStyles } from 'react-file-icon'
import {
  useParams,
} from "react-router-dom"
import {
  simpleGet,
  simplePostData,
  addRequestValidation,
} from '../../functions'
import {
  ModalLoading,
  RegularModalCentered
} from '../bits'

const ArchivosPaciente = () => {
  const _params_ = useParams()
  const fileupload_modal_id = "gadrive_upload"
  const fileloadingdelete_modal_id = "gadrive_loadingdelete"
  const [files, setFiles] = useState(false);

  // Google drive API functions
  const getPatientFiles = pac_pk => {
    if(!pac_pk) pac_pk = _params_.patient
    // Get patient by id}
    simpleGet(`atencion/paciente/${pac_pk}/files/`)
    .then(
      res => {
        console.log("res", res);
        // if(!res) getBack()
        setFiles(res)
      }
    )
  }
  const deleteFile = file_id => {
    /* Show modal */
    showLoadingDeleteModal()

    simplePostData(`atencion/paciente/${_params_.patient}/files/delete/`, {file_id: file_id})
    .then(() => getPatientFiles())
    .then(hideLoadingDeleteModal)
  }
  // Modals
  const showLoadingDeleteModal = () => window.$('#'+fileloadingdelete_modal_id).modal("show")
  const hideLoadingDeleteModal = () => window.$('#'+fileloadingdelete_modal_id).modal("hide")

  // Run at first render
  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+fileupload_modal_id).modal("hide")
    window.$('#'+fileloadingdelete_modal_id).modal("hide")
  }, [])
  // Files
  useEffect(() => {
    if(!files) getPatientFiles(_params_.patient)

  }, [files])

  const css = {
    table: {
      width: "100%",
      tableLayout: "fixed",
      fontSize: "1.1em"
    },
    icon_container: {
      width: "7%",
      textAlign: "center",
    },
    icon: {
      textAlign: "center",
    },
  }

  return !files
    ? (<div className="card"><div className="card-body">loading</div></div>)
    : (
      <div className="card col-12" style={{padding: "0px"}}>
        <div className="card-header">
          <div className="card-title">
            Archivos
          </div>
        </div>
        <div className="card-body">
          {/* table files */}
          <table style={css.table}>
            <thead style={{fontWeight: "bold"}}>
              <tr>
                <td style={{width: "55%"}}>Nombre</td>
                <td style={{width: "15%"}}>Fecha</td>
                {/*
                <td style={css.icon_container}>Atencion</td>
                */}
                <td style={css.icon_container}>Ver</td>
                <td style={css.icon_container}>Descargar</td>
                <td style={css.icon_container}>Eliminar</td>
              </tr>
            </thead>
            <tbody>
              {files.length>0
                ? files.map(file => {
                  let last_dot_index = file.nombre_archivo.split("").lastIndexOf(".")
                  let ext = file.nombre_archivo.slice(last_dot_index+1, file.nombre_archivo.length)
                  let name = file.descripcion ? file.descripcion : file.nombre_archivo.slice(0, last_dot_index)

                  return (
                    <tr key={"file_list_"+file.pk}>
                      <td>
                        {name}
                      </td>
                      <td>
                        <pre>{file.fecha}</pre>
                      </td>
                      <td style={css.icon}>
                        <a href={file.webViewLink} target="_blank" style={{
                          display: "inline-block",
                          width: "32px",
                        }}>
                          <FileIcon extension={ext} color="#F8F5E1" {...defaultStyles[ext]} />
                        </a>
                      </td>
                      <td style={css.icon}>
                        <a href={file.webContentLink} target="_blank" style={{
                          display: "inline-block",
                          width: "40px",
                          textAlign: "center",
                        }} className="fa-2x">
                          <i className="fal fa-download"></i>
                        </a>
                      </td>
                      <td style={css.icon}>
                        <div style={{
                            textAlign: "center",
                            fontSize: "2em",
                            cursor: "pointer",
                          }}
                          onClick={()=>deleteFile(file.file_id)}
                        >
                          <i className="fal fa-trash-alt"></i>
                        </div>
                      </td>
                    </tr>
                  )
                })
                : (<tr><td>No hay archivos añadidos</td></tr>)
              }
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" data-toggle="modal" data-target={'#'+fileupload_modal_id}>Subir archivo</button>
          <button className="btn btn-secondary" style={{marginLeft: "10px"}} onClick={()=>window.history.back()}>Regresar</button>
        </div>

        <ModalFileUpload
          modal_id={fileupload_modal_id}
          patient_pk={_params_.patient}
          refreshFiles={() => setFiles(false)} />
        <ModalLoading
          _id={fileloadingdelete_modal_id}
          _title={"Cargando.."}
          _body_text={"Por favor espere unos segundos mientras se elimina el archivo"} />
      </div>
    )
}
export const ModalFileUpload = ({modal_id, patient_pk, refreshFiles, atencion_pk}) => {
  const gadriveloadingupload_modal_id = "gadrive_loadingupload"
  const [selectedFile, setSelectedFile] = useState(false)

  const uploadFile = () => {
    let input_file = window.document.getElementById('input-file')
    if(input_file.files.length == 0) return

    let file = input_file.files[0]
    let data = new FormData()
    data.append("file", file)
    let input_descripcion = window.document.getElementById('input-descripcion').value
    data.append("descripcion", input_descripcion)
    let input_fecha = window.document.getElementById('input-fecha').value
    data.append("fecha", input_fecha)
    if(atencion_pk) data.append("atencion", atencion_pk)

    window.$('#'+modal_id).modal("hide")  // Hide file upload modal
    showLoadingUploadModal()  // Show loading file upload modal

    return addRequestValidation(
        fetch(
          process.env.REACT_APP_PROJECT_API+`atencion/paciente/${patient_pk}/files/`,
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem('access_token'),  // Token
            },
            body: data,
          },
        )
      )
      .then(refreshFiles)
      .finally(hideLoadingUploadModal)
  }
  const inputFileChange = ev => setSelectedFile(ev.target.files.length!=0)
  const showLoadingUploadModal = () => window.$('#'+gadriveloadingupload_modal_id).modal("show")
  const hideLoadingUploadModal = () => window.$('#'+gadriveloadingupload_modal_id).modal("hide")

  useEffect(() => () => {
    // Assure modals will be closed before leaving current page
    window.$('#'+modal_id).modal("hide")
    window.$('#'+gadriveloadingupload_modal_id).modal("hide")
  }, [])

  return (
    <div>
      <RegularModalCentered
        _id={modal_id}
        _title={"Subir archivo"}
        _body={
          <div>
            <div className="form-group">
              <input type="file" id="input-file" onChange={inputFileChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-descripcion">Descripcion del archivo</label>
              <input type="text" id="input-descripcion" className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="input-fecha">Fecha</label>
              <input type="date" id="input-fecha" className="form-control" defaultValue={(new Date().toDateInputValue())} />
            </div>
            <button className="btn btn-primary" disabled={!selectedFile} onClick={uploadFile}>Subir archivo</button>
          </div>
        } />

      <ModalLoading
        _id={gadriveloadingupload_modal_id}
        _title={"Cargando.."}
        _body_text={"Por favor espere unos segundos mientras se guarda el archivo"} />
    </div>
  )
}

export default ArchivosPaciente
