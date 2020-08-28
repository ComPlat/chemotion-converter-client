import React, { Component} from "react"

import ConverterApi from '../api/ConverterApi'


class App extends Component {

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
    const { selectedFile } = this.state
    const fileName = 'convert.jcamp'

    ConverterApi.fetchConversion(selectedFile, fileName)
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

export default App
