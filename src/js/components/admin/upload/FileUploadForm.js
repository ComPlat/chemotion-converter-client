import React from "react";
import PropTypes from "prop-types";
import { Alert, Button, Form, Spinner } from "react-bootstrap";

function FileUploadForm({
  error,
  errorMessage,
  onFileChangeHandler,
  onSubmitFileHandler,
  disabled,
  isLoading,
}) {
  return (
    <Form>
      {error && <Alert variant="danger">{errorMessage}</Alert>}

      <Form.Group>
        <Form.Control
          type="file"
          id="fileUpload"
          onChange={onFileChangeHandler}
        />
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

      {isLoading && (
        <div className="d-flex justify-content-center mt-10">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </Form>
  );
}

FileUploadForm.propTypes = {
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  onFileChangeHandler: PropTypes.func,
  onSubmitFileHandler: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default FileUploadForm;
