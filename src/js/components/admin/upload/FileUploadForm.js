import React, { Component } from "react"
import PropTypes from 'prop-types';

class FileUploadForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <form>
        {this.props.error &&
          <div className="alert alert-danger mt-10">{this.props.errorMessage}</div>
        }
        <div className="form-group">
          <input type="file" className="form-control form-control-file" id="fileUpload" onChange={this.props.onFileChangeHandler} />
        </div>
        <button type="button" className="btn btn-primary float-right"
                onClick={this.props.onSubmitFileHandler}
                disabled={this.props.disabled}>
          Upload
        </button>
        {this.props.isLoading &&
          <div className="d-flex justify-content-center mt-10">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        }
      </form>
    )
  }

}

FileUploadForm.propTypes = {
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  onFileChangeHandler: PropTypes.func,
  onSubmitFileHandler: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string
}

export default FileUploadForm
