import React, { Component} from "react"

import ConverterApi from '../api/ConverterApi'


class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selectedFile: null,
      error: false,
      errorMessage: '',
      isLoading: false,
    }

    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
  }

  onFileChangeHandler(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      error: false,
      errorMessage: ''
    })
  }

  onSubmitFileHandler() {
    const { selectedFile } = this.state

    this.setState({
      isLoading: true
    })

    ConverterApi.fetchConversion(selectedFile)
      .then(message => {
        if (message === 'success') {
          this.setState({
            isLoading: false
          })
        }
      })
      .catch(error => {
        if (error.status === 413) {
          this.setState({
            error: true,
            errorMessage: 'The uploaded file is too large.',
            isLoading: false
          })
        } else {
          error.text().then( errorMessage => {
            this.setState({
              error:true,
              errorMessage: JSON.parse(errorMessage).error,
              isLoading: false
            })
          })
        }
      })
  }

  render() {
    return(
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <h1 className="text-center p-5">Chemotion file converter</h1>
          </div>
          <div className="col-md-4 col-md-offset-4">
            <p className="text-center">Please upload a file.</p>
            <form>
              <div className="form-group mb-10">
                <input type="file" className="form-control form-control-file" id="fileUpload" onChange={this.onFileChangeHandler}/>
              </div>
              <p>
                <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.onSubmitFileHandler}>Upload</button>
              </p>
              {this.state.error &&
                <div className="alert alert-danger">{ this.state.errorMessage }</div>
              }
              {this.state.isLoading &&
              <div className="">
                <div className="text-primary text-center" role="status">
                  <span>Loading...</span>
                </div>
              </div>
              }
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default App
