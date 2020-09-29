import React, { Component } from "react"
import ReactDataGrid from "react-data-grid"

import ConverterApi from '../api/ConverterApi'
import IdentifierInputBox from './IdentifierInputBox'


class AdvancedApp extends Component {

  constructor(props) {

    super(props)
    this.state = {
      selectedFile: null,
      tableData: null,
      columnList: null,
      error: false,
      isLoading: false,
      errorMessage: '',
      xValues: false,
      yValues: false,
      identifiers: [],
      options: {},
      selectedOptions: {}
    }

    this.onSelectXcolumn = this.onSelectXcolumn.bind(this)
    this.onSelectYcolumn = this.onSelectYcolumn.bind(this)
    this.toggleFirstRowIsHeader = this.toggleFirstRowIsHeader.bind(this)
    this.onSubmitSelectedData = this.onSubmitSelectedData.bind(this)
    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
    this.addIdentifier = this.addIdentifier.bind(this)
    this.updateIdentifiers = this.updateIdentifiers.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.addOrUpdateOption = this.addOrUpdateOption.bind(this)
  }

  addOrUpdateOption(event) {
    let key = event.target.getAttribute('id')
    let value = event.target.value
    let newSelectedOptions = { ...this.state.selectedOptions }
    newSelectedOptions[key] = value
    this.setState({
      selectedOptions: newSelectedOptions
    })

  }

  addIdentifier(type) {
    let metadataKey = ''
    let value = ''

    if (type === 'metadata') {
      metadataKey = Object.keys(this.state.tableData.metadata)[0]
      value = this.state.tableData.metadata[metadataKey]
    }

    let identifier = {
      type: type,
      tableIndex: 0,
      lineNumber: '',
      metadataKey: metadataKey,
      headerKey: '',
      value: value,
      isRegex: false
    }
    let identifiers = this.state.identifiers
    identifiers.push(identifier)
    this.setState({
      identifiers: identifiers
    })
  }

  updateIdentifiers(index, data) {
    let newIdentifiers = [...this.state.identifiers]
    if (index !== -1) {
      let newData = newIdentifiers[index]
      Object.assign(newData, data)
      newIdentifiers[index] = newData
      this.setState({ identifiers: newIdentifiers })
    }
  }

  removeIdentifier(index) {
    let newIdentifiers = [...this.state.identifiers]
    if (index !== -1) {
      newIdentifiers.splice(index, 1)
      this.setState({ identifiers: newIdentifiers })
    }
  }

  onSelectXcolumn(event) {
    let value = event.target.value
    if (value === 'default') {
      this.setState({ xValues: false})
    } else {
      this.setState({ xValues: value})
    }
  }

  onSelectYcolumn(event) {
    let value = event.target.value
    if (value === 'default') {
      this.setState({ yValues: false})
    } else {
      this.setState({ yValues: value})
    }
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

  onSubmitSelectedData(event) {
    event.preventDefault()

    const { tableData, columnList, identifiers, xValues, yValues, selectedOptions } = this.state

    let xv = false
    if (xValues) {
      xv = columnList[xValues].value
    }

    let yv = false
    if (yValues) {
      yv = columnList[yValues].value
    }

    const data = {
      table: {
        xColumn: xv,
        yColumn: yv,
        firstRowIsHeader: tableData.data.map(table => {
          return table.firstRowIsHeader || false
        })
      },
      identifiers: identifiers,
      header: selectedOptions
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
      isLoading: false,
      error: false,
      errorMessage: ''
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
            options: tableData.options,
            showSuccessMessage: true,
            error: false,
            errorMessage: ''
          })
        }
      })
      .catch(error => {
        error.text().then(errorMessage => {
          this.setState({
            error: true,
            errorMessage: JSON.parse(errorMessage).error,
            isLoading: false
          })
        })
      })
  }

  renderUpload() {
    return (
      <div>
        <div className='row justify-content-center'>
          <h1 className="p-5">Chemotion file converter</h1>
        </div>
        <div className='row justify-content-center'>
          <h2>File Upload</h2>
        </div>
        <div className='row justify-content-center'>
          <div className='col-6'>
            <p className="text-center">Please upload a file</p>
          </div>
        </div>
        <div className='row justify-content-center h-100'>
          <form>
            <div className="form-group">
              <input type="file" className="form-control-file form-control-sm" id="fileUpload" onChange={this.onFileChangeHandler} />
            </div>
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.onSubmitFileHandler}>Upload</button>
            {this.state.error &&
              <div className="alert alert-danger mt-2">{this.state.errorMessage}</div>
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
        <div className="form-group">
          <label htmlFor="x_column">Which column should be used as x-values?</label>
          <select className="form-control form-control-sm" id="x_column" onChange={this.onSelectXcolumn}>
            <option value='default' >-----------</option>
            {columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="y_column">Which column should be used as y-values?</label>
          <select className="form-control form-control-sm" id="y_column" onChange={this.onSelectYcolumn}>
          <option value='default' >-----------</option>
            {columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
      </div>
    )
  }

  renderOptions() {
    const { options } = this.state

    return (
      <div>
        { Object.keys(options).map((option, index) => {
          return (
            <div key={index} className="form-group">
              <label htmlFor={option} >{option}</label>
              <select className="form-control form-control-sm" onChange={this.addOrUpdateOption} id={option}>
                {
                  options[option].map((select, selectIndex) => {
                    return <option value={select} key={selectIndex}>{select}</option>
                  })
                }
              </select>
            </div>
          )
        })}
      </div>
    )
  }

  renderTableHeader(table) {
    return (
      <div>
        Header
        <pre>
          {
            table.header.map((line, index) => {
              return <code key={index}>{line}</code>
            })
          }
        </pre>
      </div>
    )
  }

  renderDataGrid(table) {
    const rows = table.rows.map(row => {
      return Object.fromEntries(row.map((value, idx) => {
        return [idx, value]
      }))
    })

    return <ReactDataGrid
      columns={table.columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellAutoFocus={false}
      minHeight={600} />
  }

  renderCreateProfile() {
    const { tableData } = this.state

    return (
      <div>
        <div className="row">
          <main className="col-md-7 vh-100">
            <div>
              <div className="pt-3 pb-3">
                <h1>Chemotion file converter</h1>
                <h2>Step 2: Add rules and identifiers for conversion profile</h2>
              </div>

              <h4>Metadata</h4>
              <div className="pt-3 pb-3 mb-3 border-top border-bottom">
                {Object.keys(tableData.metadata).map((entry, index) => {
                    return <div key={index}>{entry}: {tableData.metadata[entry]}</div>
                  })
                }
              </div>

              <h4>Tables</h4>
              <ul className="nav nav-tabs" id="Tabs" role="tablist">
                {tableData.data.map((table, index) => {
                  return (
                    <li key={index} className="nav-item" role="presentation">
                      <a className={`nav-link ${index == 0 ? "active" : ""}`} id="table-data-tab" href={'#table-data-' + index}
                        data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Table #{index + 1}</a>
                    </li>
                  )
                })}
              </ul>

              <div className="tab-content border-bottom pt-3" id="Tabs">
                {tableData.data.map((table, index) => {
                  return (
                    <div key={index} className={`tab-pane fade ${index == 0 ? "active show" : ""}`} id={'table-data-' + index}
                      role="tabpanel" aria-labelledby="table-data-tab">

                      {table.header.length > 0 && this.renderTableHeader(table)}

                      {table.rows.length > 0 &&
                        <div>
                          <div className="form-group form-check">
                            <input type="checkbox" checked={table.firstRowIsHeader || false}
                              onChange={e => this.toggleFirstRowIsHeader(index)}
                              className="form-check-input" id="first_row_is_header" />
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
            </div>
          </main>

          <aside className="col-md-5 vh-100">
            <div>
              <div className="card rounded-0 mt-3">
                <div className="card-header">
                  <div>Metadata</div>
                </div>
                <div className="card-body">
                  {this.renderOptions()}
                  <small className="text-muted">The data you pick here will be added to the metadata of your converted file.</small>
                </div>
              </div>

              <div className="card rounded-0 mt-3">
                <div className="card-header">
                  <div>Rules</div>
                </div>
                <div className="card-body">
                  {this.renderColumnsForm()}
                  <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
                </div>
              </div>

              <div className="card rounded-0 mt-3">
                <div className="card-header">Identifiers</div>
                <div className="card-body">
                  <label>Based on metadata</label>
                  <IdentifierInputBox
                    type={'metadata'}
                    identifiers={this.state.identifiers}
                    addIdentifier={this.addIdentifier}
                    updateIdentifiers={this.updateIdentifiers}
                    removeIdentifier={this.removeIdentifier}
                    data={tableData.metadata}
                  />

                  <label>Based on table headers</label>
                  <IdentifierInputBox
                    type={'table'}
                    identifiers={this.state.identifiers}
                    addIdentifier={this.addIdentifier}
                    updateIdentifiers={this.updateIdentifiers}
                    removeIdentifier={this.removeIdentifier}
                    data={tableData.data}
                  />
                  <small className="text-muted">The identifiers you create will be used to find the right profile for uploaded files. If you fill in the field 'header key', the identifier will also be added to the header of the converted file.</small>
                </div>
              </div>

              <div className="row justify-content-center mt-3 mb-3">
                <form>
                  <button type="submit" className="btn btn-primary" onClick={this.onSubmitSelectedData}>Create profile</button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  render() {
    const { tableData } = this.state

    return (
      <div className='container-fluid'>
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