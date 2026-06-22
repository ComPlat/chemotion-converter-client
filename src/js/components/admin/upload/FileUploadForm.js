import React, { useState } from "react"
import PropTypes from 'prop-types';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

function FileUploadForm({
  error,
  errorMessage,
  onFileChangeHandler,
  onSubmitFileHandler,
  disabled,
  isLoading,
  ontologyRef=null,
  setOtologyRef=null
}) {
  let [ontology, setOntology] = [ontologyRef, setOtologyRef];
  if(!setOntology) {
    [ontology, setOntology] = useState(ontologyRef || "");
  }


  return (
    <Form>
      {error && (
        <Alert variant="danger">{errorMessage}</Alert>
      )}

      <Form.Group>
        <Form.Control type="file" id="fileUpload" onChange={onFileChangeHandler} />
      </Form.Group>

          <Form.Group className="mb-3" controlId="OntologyLabelGroup">
            <Form.Label column={"lg"}>Ontology</Form.Label>
            <Form.Control type="text" placeholder="n.d." value={ontology} onChange={(e) => setOntology(e.target.value)}/>
          </Form.Group>

        <div className="d-flex justify-content-end mt-4">
        <Button
          variant="primary"
          onClick={onSubmitFileHandler}
          disabled={disabled}
        >
          Upload
        </Button>
      </div>

      {isLoading &&
        <div className="d-flex justify-content-center mt-10">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      }
    </Form>
  )
}

FileUploadForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onFileChangeHandler: PropTypes.func.isRequired,
  onSubmitFileHandler: PropTypes.func.isRequired,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  ontologyRef: PropTypes.string,
  setOtologyRef: PropTypes.func,
}

FileUploadForm.defaultProps = {
  ontologyRef: null,
  setOtologyRef: null,
}

export default FileUploadForm
