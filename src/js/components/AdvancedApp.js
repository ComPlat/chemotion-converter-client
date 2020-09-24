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
      xValues: '0',
      yValues: '0',
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
    let newSelectedOptions = {...this.state.selectedOptions}
    newSelectedOptions[key] = value
    this.setState({
      selectedOptions: newSelectedOptions
    })

  }

  addIdentifier(type) {
    let identifier = {
      type: type,
      table: 0,
      linenumber: '',
      metadataKey: '',
      value: '',
      isExact: false,
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
    this.setState({ xValues: event.target.value })
  }

  onSelectYcolumn(event) {
    this.setState({ yValues: event.target.value })
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

    const data = {
      rules: {
        x_column: columnList[xValues].value,
        y_column: columnList[yValues].value,
        firstRowIsHeader: tableData.data.map(table => {
          return table.firstRowIsHeader || false
        })
      },
      identifiers: identifiers,
      metadata: selectedOptions
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
            options: tableData.options,
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
              <input type="file" className="form-control-file" id="fileUpload" onChange={this.onFileChangeHandler} />
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
          <select className="form-control" id="x_column" onChange={this.onSelectXcolumn}>
            {columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="y_column">Which column should be used as y-values?</label>
          <select className="form-control" id="y_column" onChange={this.onSelectYcolumn}>
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
              <label htmlFor={option} >{ option }</label>
              <select className="form-control" onChange={this.addOrUpdateOption} id={option}>
                {
                  options[option].map((select, selectIndex) => {
                    return <option value={select} key={select}>{select}</option>
                  })
                }
              </select>
            </div>
          )
        })}
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
        <div className="row position-relative">
          <div className="col-md-8">
            <div className='row justify-content-center'>
              <h1 className="p-5">Chemotion file converter</h1>
              <h2>Step 2: Add rules and identifiers for conversion profile</h2>
            </div>
            <ul className="nav nav-tabs" id="Tabs" role="tablist">
              {tableData.data.map((table, index) => {
                return (
                  <li key={index} className="nav-item" role="presentation">
                    <a className={`nav-link ${index==0 ? "active" : ""}`} id="table-data-tab" href={'#table-data-' + index}
                      data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Table #{index + 1}</a>
                  </li>
                )
              })}
            </ul>

            <div className="tab-content border-bottom" id="Tabs">
              {tableData.data.map((table, index) => {
                return (
                  <div key={index} className={`tab-pane fade p-3 ${index==0 ? "active show" : ""}`} id={'table-data-' + index}
                    role="tabpanel" aria-labelledby="table-data-tab">

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
          <div className="col-md-4 sidenav p-3 border-left">
            {this.renderOptions()}
            {this.renderColumnsForm()}
            <label>Metadata</label>
            <IdentifierInputBox
              type={'metadata'}
              identifiers={this.state.identifiers}
              addIdentifier={this.addIdentifier}
              updateIdentifiers={this.updateIdentifiers}
              removeIdentifier={this.removeIdentifier}
              data={tableData.metadata}
            />

            <label>Table Headers</label>
            <IdentifierInputBox
              type={'tabledata'}
              identifiers={this.state.identifiers}
              addIdentifier={this.addIdentifier}
              updateIdentifiers={this.updateIdentifiers}
              removeIdentifier={this.removeIdentifier}
              data={tableData.data}
            />

            <div className="row justify-content-center pt-3">
              <form>
                <button type="submit" className="btn btn-primary" onClick={this.onSubmitSelectedData}>Submit</button>
              </form>
            </div>
          </div>
        </div>


      </div>
    )
  }

  render() {
    const { tableData } = this.state

    return (
      <div className='container-fluid vh-100'>
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