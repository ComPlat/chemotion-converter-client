import React, { Component} from "react"
import ReactDataGrid from "react-data-grid"

class AdvancedApp extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null,
      error: false,
      errorMessage: '',
      xValues: '0',
      yValues: '0',
      firstRowIsHeader: true,
      identifiers: {}
    }

    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
    this.toggleFirstRowIsHeader = this.toggleFirstRowIsHeader.bind(this)
    this.toggleProperty = this.toggleProperty.bind(this)
    this.onSelectXcolumn = this.onSelectXcolumn.bind(this)
    this.onSelectYcolumn = this.onSelectYcolumn.bind(this)
    this.onSubmitSelectedData = this.onSubmitSelectedData.bind(this)
  }

  onSelectXcolumn(event) {
    this.setState({xValues: event.target.value})
  }

  onSelectYcolumn(event) {
    this.setState({yValues: event.target.value})
  }

  toggleFirstRowIsHeader() {
    this.setState({ firstRowIsHeader: !this.state.firstRowIsHeader });
  }

  toggleProperty(event) {
    const checked  = event.target.checked
    const property = event.target.id

    const { identifiers } = { ...this.state }
    let currentIdentifiers = identifiers

    if (checked) {
      if (!(property in identifiers)) {
        const value = this.state.tableData.metadata[property]
        currentIdentifiers[property] = value
      }
    } else {
      if (property in identifiers) {
        delete currentIdentifiers[property]
      }
    }
    this.setState({ identifiers: currentIdentifiers })
  }

  onSubmitSelectedData(e) {
    e.preventDefault()
    const data = {}
    const rules = {}
    rules['x_column'] = this.state.xValues
    rules['y_column'] = this.state.yValues
    rules['firstRowIsHeader'] = this.state.firstRowIsHeader
    data['rules'] = rules
    data['identifiers'] = this.state.identifiers
    data['uuid'] = this.state.tableData.metadata.uuid

    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let fileName = this.state.tableData.metadata.uuid + '.jcamp'

    return fetch('http://127.0.0.1:5000/api/v1/createprofile', requestOptions)
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

    fetch('http://127.0.0.1:5000/api/v1/fileviewer', requestOptions)
      .then(response => {
        if(!response.ok) {
          response.json().then(error => {
            this.setState({
              error: true,
              errorMessage: error.error
            })
          })
          return
        } else {
          return response.json();
        }
      })
      .then(data => {
        if(data) {
          this.setState({
            selectedFile: null,
            tableData: data,
            error: false,
            errorMessage: ''
          })
        }
      }
    )
  }

  render() {
    return(
      <div className='container vh-100'>
        <div className='row justify-content-center'>
          <h1 className="p-5">Chemotion file converter</h1>
        </div>

        {!this.state.tableData &&
        <div>
          <div className='row justify-content-center'>
            <h2>Step 1: File Upload</h2>
          </div>
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
        }


          {this.state.tableData &&
            <div>
              <div className='row justify-content-center'>
                <h2>Step 2: Pick columns for export</h2>
              </div>

              <div className='row justify-content-center'>
                <div className='col-6'>
                  <p className="text-center">We found the following metadata and table/s in your file. Please pick now, which the data of which column
                 should be used as x-values and which as y-values</p>
                </div>
              </div>

              <ul className="nav nav-tabs" id="Tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <a className="nav-link" id="meta-data-tab" data-toggle="tab" href="#meta-data" role="tab" aria-controls="meta-data" aria-selected="true">Metadata</a>
                </li>
                <li className="nav-item" role="presentation">
                  <a className="nav-link active" id="table-data-tab" data-toggle="tab" href="#table-data" role="tab" aria-controls="profile" aria-selected="false">Tabledata</a>
                </li>
              </ul>

              <div className="tab-content border-bottom" id="Tabs">
                <div className="tab-pane fade p-3" id="meta-data" role="tabpanel" aria-labelledby="meta-data-tab">
                  <form>
                    {
                      Object.keys(this.state.tableData.metadata).map((key, i) =>
                        <div key={i} className="form-group row">
                          <div className="col">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" onChange={this.toggleProperty} id={key}/>
                              <label className="form-check-label" htmlFor={key}>
                                {key}: {this.state.tableData.metadata[key]}
                              </label>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  </form>
                </div>
                <div className="tab-pane fade show active p-3" id="table-data" role="tabpanel" aria-labelledby="table-data-tab">

                  <form>
                    <div className="form-row">
                      <div className="col">
                        <div className="form-group form-check">
                          <input type="checkbox" checked={this.state.firstRowIsHeader} onChange={this.toggleFirstRowIsHeader} className="form-check-input" id="first_row_is_header"/>
                          <label className="form-check-label" htmlFor="first_row_is_header">first row is header</label>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="x_column"> Which column should be used as x-values?</label>
                          <select className="form-control" id="x_column" onChange={this.onSelectXcolumn}>
                            {this.state.tableData.header.map((value, index) => {
                              return <option value={value.key} key={index}>{value.name}</option>
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="y_column">Which column should be used as y-values?</label>
                          <select className="form-control" id="y_column" onChange={this.onSelectYcolumn}>
                            {this.state.tableData.header.map((value, index) => {
                              return <option value={value.key} key={index}>{value.name}</option>
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  </form>


                  <ReactDataGrid
                  columns={this.state.tableData.header}
                  rowGetter={i => this.state.tableData.data[i]}
                  rowsCount={this.state.tableData.data.length}
                  minHeight={300} />
                </div>
              </div>

              <div className="row justify-content-center pt-3">
                <form>
                  <button type="submit" className="btn btn-primary" onClick={this.onSubmitSelectedData}>Submit</button>
                </form>
              </div>
            </div>
          }
      </div>
    )
  }
}

export default AdvancedApp