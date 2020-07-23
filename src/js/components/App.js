import React, { Component} from "react"
import ReactDataGrid from "react-data-grid"

class App extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null,
      error: false,
      errorMessage: ''
    }

    this.onChangeHandler = this.onChangeHandler.bind(this)
    this.onClickHandler = this.onClickHandler.bind(this)
  }

  onChangeHandler(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
  }

  onClickHandler() {
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
                <input type="file" className="form-control-file" id="exampleFormControlFile1" onChange={this.onChangeHandler}/>
              </div>
              <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
            </form>
          </div>
          }

          {this.state.error &&
            <div className='row justify-content-center'>
              <div className="alert alert-danger">{ this.state.errorMessage }</div>
            </div>
          }

          {this.state.tableData &&
            <div className='row justify-content-center'>
              <ReactDataGrid
              columns={this.state.tableData.header}
              rowGetter={i => this.state.tableData.data[i]}
              rowsCount={this.state.tableData.data.length}
              minHeight={500} />
            </div>
          }
      </div>
    )
  }
}

export default App