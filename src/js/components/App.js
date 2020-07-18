import React, { Component} from "react"
import ReactDataGrid from "react-data-grid"

class App extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null
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

    fetch('http://127.0.0.1:5000/api/v1.0/fileconversion', requestOptions)
      .then(response => response.json())
      .then(data => this.setState({
        selectedFile: null,
        tableData: data.result
      }))
  }

  render() {
    return(
      <div className='container'>
        <div className='row justify-content-center'>

          {!this.state.tableData &&
          <form>
            <div className="form-group">
              <label htmlFor="exampleFormControlFile1">Example file input</label>
              <input type="file" className="form-control-file" id="exampleFormControlFile1" onChange={this.onChangeHandler}/>
            </div>
            <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
          </form>
          }

          {this.state.tableData &&
            <ReactDataGrid
            columns={this.state.tableData.header}
            rowGetter={i => this.state.tableData.data[i]}
            rowsCount={this.state.tableData.data.length}
            minHeight={500} />
          }

        </div>
      </div>
    )
  }
}

export default App