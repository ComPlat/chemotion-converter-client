import React, { Component } from "react"

class FileUploadForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <form>
        <div className="form-group">
          <input type="file" className="form-control-file form-control-sm" id="fileUpload" onChange={this.props.onFileChangeHandler} />
        </div>
        <button type="button" className="btn btn-primary btn-sm float-right" onClick={this.props.onSubmitFileHandler}>Upload</button>
        {this.props.error &&
          <div className="alert alert-danger mt-2">{this.props.errorMessage}</div>
        }
        {this.props.isLoading &&
          <div className="d-flex justify-content-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        }
      </form>
    )
  }

}

export default FileUploadForm