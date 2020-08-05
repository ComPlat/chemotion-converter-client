import React, { Component} from "react"
import ReactDataGrid from "react-data-grid"

class App extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null,
      error: false,
      errorMessage: '',
      xValues: '0',
      yValues: '0',
      firstRowIsHeader: true
    }

    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
    this.toggleFirstRowIsHeader = this.toggleFirstRowIsHeader.bind(this)
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

  onSubmitSelectedData(e) {
    e.preventDefault()
    const data = new FormData()
    data.append('x_column', this.state.xValues)
    data.append('y_column', this.state.yValues)
    data.append('time_stamp', this.state.tableData.properties.time_stamp)
    data.append('firstRowIsHeader', this.state.firstRowIsHeader)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    let fileName = this.state.tableData.properties.time_stamp + '.jcamp'

    return fetch('http://127.0.0.1:5000/api/v1/jcampconversion', requestOptions)
    .then(response => response.blob())
    .then(blob => {
      debugger
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

    fetch('http://127.0.0.1:5000/api/v1/fileconversion', requestOptions)
      .then(response => {
        if(!response.ok) {
          response.json().then(error => this.setState({
            error: true,
            errorMessage: error.error
          }))
        } else {
          return response.json();
        }
      })
      .then(data => this.setState({
        selectedFile: null,
        tableData: data.result,
        error: false,
        errorMessage: ''
      }))
  }

  render() {
    return(
      <div className='container'>
          {!this.state.tableData &&
          <div className='row justify-content-center'>
            <form>
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1">Example file input</label>
                <input type="file" className="form-control-file" id="exampleFormControlFile1" onChange={this.onFileChangeHandler}/>
              </div>
              <button type="button" className="btn btn-success btn-block" onClick={this.onSubmitFileHandler}>Upload</button>
            </form>
          </div>
          }

          {this.state.error &&
            <div className='row justify-content-center'>
              <div className="alert alert-danger">{ this.state.errorMessage }</div>
            </div>
          }

          {this.state.tableData &&
            <div>
              <div className="row">
                <ul className="list-group">
                  <li className="list-group-item">Filename: {this.state.tableData.properties.file_name }</li>
                  <li className="list-group-item">Conenttype: {this.state.tableData.properties.content_type }</li>
                  <li className="list-group-item">Extension: {this.state.tableData.properties.extension }</li>
                </ul>
              </div>

              <div className='row justify-content-center'>
                <ReactDataGrid
                columns={this.state.tableData.header}
                rowGetter={i => this.state.tableData.data[i]}
                rowsCount={this.state.tableData.data.length}
                minHeight={500} />
              </div>

              <div className="row">
                <form>
                  <div className="form-group form-check">
                    <input type="checkbox" checked={this.state.firstRowIsHeader} onChange={this.toggleFirstRowIsHeader} className="form-check-input" id="first_row_is_header"/>
                    <label className="form-check-label" htmlFor="first_row_is_header">first row is header</label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="x_column"> Which column should be used as x-values?</label>
                    <select className="form-control" id="x_column" onChange={this.onSelectXcolumn}>
                      {this.state.tableData.header.map((value, index) => {
                        return <option value={value.key} key={index}>{value.name}</option>
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="y_column">Which column should be used as y-values?</label>
                    <select className="form-control" id="y_column" onChange={this.onSelectYcolumn}>
                      {this.state.tableData.header.map((value, index) => {
                        return <option value={value.key} key={index}>{value.name}</option>
                      })}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" onClick={this.onSubmitSelectedData}>Submit</button>
                </form>
              </div>

            </div>
          }
      </div>
    )
  }
}

export default App