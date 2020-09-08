import React, { Component} from "react"
import ReactDataGrid from "react-data-grid"

import ConverterApi from '../api/ConverterApi'


class AdvancedApp extends Component {

  constructor (props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null,
      columnList: null,
      error: false,
      isLoading: false,
      errorMessage: '',
      xValues: '0',
      yValues: '0',
      identifiers: {}
    }

    this.onSelectXcolumn = this.onSelectXcolumn.bind(this)
    this.onSelectYcolumn = this.onSelectYcolumn.bind(this)
    this.toggleFirstRowIsHeader = this.toggleFirstRowIsHeader.bind(this)
    this.toggleMetadataProperty = this.toggleMetadataProperty.bind(this)
    this.onSubmitSelectedData = this.onSubmitSelectedData.bind(this)
    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
  }

  onSelectXcolumn(event) {
    this.setState({xValues: event.target.value})
  }

  onSelectYcolumn(event) {
    this.setState({yValues: event.target.value})
  }

  toggleFirstRowIsHeader(index) {
    const { tableData } = this.state
    const table = tableData.data[index]

    if (table.firstRowIsHeader) {
      table.firstRowIsHeader = false
      table.columns = table._columns
      table.rows.splice(0, 0, table._first)
      table._columns = null
      table._first = null
    } else {
      table.firstRowIsHeader = true
      table._columns = table.columns
      table._first = table.rows.shift()
      table.columns = table._first.map((value, idx) => {
        return {
          key: idx.toString(),
          name: value
        }
      })
    }

    this.setState({ tableData });
  }

  toggleMetadataProperty(event) {
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

  onSubmitSelectedData(event) {
    event.preventDefault()

    const { tableData, columnList, identifiers, xValues, yValues } = this.state

    const data = {
      rules: {
        x_column: columnList[xValues].value,
        y_column: columnList[yValues].value,
        firstRowIsHeader: tableData.data.map(table => {
          return table.firstRowIsHeader || false
        })
      },
      identifiers: identifiers
    }

    ConverterApi.createProfile(data)
      .then(data => {
        $('#modal').show()
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
    const { selectedFile } = this.state

    this.setState({
      isLoading: true
    })

    ConverterApi.fetchTables(selectedFile)
      .then(tableData => {
        if (tableData) {
          // create a flat list of all columns
          const columnList = tableData.data.reduce((accumulator, table, tableIndex) => {
            const tableColumns = table.columns.map((tableColumn, columnIndex) => {
              return Object.assign({}, tableColumn, {
                label: `Table #${tableIndex + 1} ${tableColumn.name}`,
                value: {
                  tableIndex: tableIndex,
                  columnIndex: columnIndex
                }
              })
            })
            return accumulator.concat(tableColumns)
          }, [])

          this.setState({
            selectedFile: null,
            isLoading: false,
            tableData: tableData,
            columnList: columnList,
            error: false,
            errorMessage: ''
          })
        }
      })
      .catch(error => {
        this.setState({
          error: true,
          isLoading: false,
          errorMessage: error.message
        })
      })
  }

  renderUpload() {
    return (
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
            {this.state.isLoading &&
              <div className="d-flex justify-content-center mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            }
          </form>
        </div>
      </div>
    )
  }

  renderColumnsForm() {
    const { tableData, columnList } = this.state

    return (
      <div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="x_column">Which column should be used as x-values?</label>
            <select className="form-control" id="x_column" onChange={this.onSelectXcolumn}>
              {columnList.map((column, index) => {
                return <option value={index} key={index}>{column.label}</option>
              })}
            </select>
          </div>
        </div>
        <div className="col">
          <div className="form-group">
            <label htmlFor="y_column">Which column should be used as y-values?</label>
            <select className="form-control" id="y_column" onChange={this.onSelectYcolumn}>
              {columnList.map((column, index) => {
                return <option value={index} key={index}>{column.label}</option>
              })}
            </select>
          </div>
        </div>
      </div>
    )
  }

  renderDataGrid(table) {
    const rows = table.rows.map(row => {
      return Object.fromEntries(row.map((value, idx) => {
        return [idx, value]
      }))
    })

    return <ReactDataGrid columns={table.columns}
                          rowGetter={i => rows[i]}
                          rowsCount={rows.length}
                          minHeight={300} />
  }

  renderCreateProfile() {
    const { tableData } = this.state

    return (
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

        {this.renderColumnsForm()}

        <ul className="nav nav-tabs" id="Tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <a className="nav-link active" id="meta-data-tab" data-toggle="tab" href="#meta-data"
               role="tab" aria-controls="meta-data" aria-selected="true">Metadata</a>
          </li>
          {tableData.data.map((table, index) => {
            return (
              <li key={index} className="nav-item" role="presentation">
                <a className="nav-link " id="table-data-tab" href={'#table-data-' + index}
                   data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Table #{index + 1}</a>
              </li>
            )
          })}
        </ul>

        <div className="tab-content border-bottom" id="Tabs">
          <div className="tab-pane active show fade p-3" id="meta-data" role="tabpanel" aria-labelledby="meta-data-tab">
            <form>
              {
                Object.keys(tableData.metadata).map((key, i) =>
                  <div key={i} className="form-group row">
                    <div className="col">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" onChange={this.toggleMetadataProperty} id={key}/>
                        <label className="form-check-label" htmlFor={key}>
                          {key}: {tableData.metadata[key]}
                        </label>
                      </div>
                    </div>
                  </div>
                )
              }
            </form>
          </div>

          {tableData.data.map((table, index) => {
            return (
              <div key={index} className="tab-pane fade p-3" id={'table-data-' +index}
                   role="tabpanel" aria-labelledby="table-data-tab">
                <form>

                </form>

                {table.header && <pre><code>{
                  table.header.map(line => {
                    return line + '\n'
                  })
                }</code></pre>}
                {table.rows.length > 0 &&
                  <div>
                    <div className="form-group form-check">
                      <input type="checkbox" checked={table.firstRowIsHeader || false}
                             onChange={e => this.toggleFirstRowIsHeader(index)}
                             className="form-check-input" id="first_row_is_header"/>
                      <label className="form-check-label" htmlFor="first_row_is_header">first row are column names</label>
                    </div>

                    {this.renderDataGrid(table)}
                  </div>
                }
              </div>
            )
          })
        }
        </div>

        <div className="row justify-content-center pt-3">
          <form>
            <button type="submit" className="btn btn-primary" onClick={this.onSubmitSelectedData}>Submit</button>
          </form>
        </div>
      </div>
    )
  }

  render() {
    const { tableData } = this.state

    return(
      <div className='container vh-100'>
        <div className='row justify-content-center'>
          <h1 className="p-5">Chemotion file converter</h1>
        </div>

        {tableData ? this.renderCreateProfile() : this.renderUpload()}

        <div className="modal modal-backdrop" data-backdrop="static" id="modal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <div className="alert alert-success" role="alert">Successfully created profile!</div>
              </div>
              <div className="modal-footer">
                <a href="/advanced/" className="btn btn-secondary">Create another profile</a>
                <a href="/" className="btn btn-primary">Upload file and use profile</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default AdvancedApp