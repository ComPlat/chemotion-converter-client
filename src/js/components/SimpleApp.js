import React, { Component} from "react"

class SimpleApp extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      error: false,
      errorMessage: ''
    }

    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
  }

  onFileChangeHandler(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
  }

  onSubmitFileHandler() {
    const data = new FormData()
    data.append('file', this.state.selectedFile)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    let fileName = 'convert.jcamp'

    return fetch('http://127.0.0.1:5000/api/v1/simplefileconversion', requestOptions)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName

      document.body.appendChild(a)
      a.click()
      a.remove()
    })
    .catch(error => {
      return {
        errors: {
          path: 'File not found'
        }
      }
    })
  }

  render() {
    return(
      <div className='container vh-100'>
          <div className='row justify-content-center'>
              <h1 className="p-5">Chemotion file converter</h1>
          </div>
          <div>
            <div className='row justify-content-center'>
              <div className='col-6'>
                <p className="text-center">Please upload a file of the following types: csv, xy</p>
              </div>
            </div>
            <div className='row justify-content-center h-100'>
              <form>
                <div className="form-group">
                  <input type="file" className="form-control-file" id="fileUpload" onChange={this.onFileChangeHandler}/>
                </div>
                <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.onSubmitFileHandler}>Upload</button>
                {this.state.error &&
                  <div className="alert alert-danger mt-2">{ this.state.errorMessage }</div>
                }
              </form>
            </div>
          </div>
      </div>
    )
  }
}

export default SimpleApp
