import React, { Component } from "react"
import ReactDataGrid from "react-data-grid"

import HeaderForm from './HeaderForm'
import TableForm from './TableForm'
import IdentifierForm from './IdentifierForm'

class ProfileCreate extends Component {

  constructor(props) {
    super(props)
  }

  renderMetadata(metadata) {
    return (
      <div className="">
        <dl className="row">
          {
            Object.keys(metadata).map((key, index) => {
              return (
                <React.Fragment key={index}>
                  <dt className="col-sm-3">{key}:</dt>
                  <dd className="col-sm-9 mb-0">{metadata[key]}</dd>
                </React.Fragment>
              )
            })
          }
        </dl>
      </div>
    )
  }

  renderHeader(header) {
    return (
      <pre>
        {
          header.map((line, index) => {
            return <code key={index}>{line}</code>
          })
        }
      </pre>
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
      minColumnWidth={140}
      minHeight={410}
      nativeScroll={true} />
  }

  render() {
    const { tableData, columnList, headerOptions, title, description, identifiers, tables,
            updateTitle, updateDescription, addTable, updateHeader, updateTable, addOperation,
            updateOperation, removeOperation, removeTable, addIdentifier, updateIdentifier, removeIdentifier,
            toggleFirstRowIsHeader, createProfile } = this.props

    return (
      <div className="row">
        <div className="col-md-7 scroll">
          <div className="mb-5">
            <hr />
            <h4>Input file metadata</h4>
            {Object.keys(tableData.metadata).length > 0 && this.renderMetadata(tableData.metadata)}
            <hr />

            <ul className="nav nav-tabs" id="Tabs" role="tablist">
              {tableData.data.map((table, index) => {
                return (
                  <li key={index} className="nav-item" role="presentation">
                    <a className={`nav-link ${index == 0 ? "active" : ""}`} id="table-data-tab" href={'#table-data-' + index}
                      data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Input table #{index}</a>
                  </li>
                )
              })}
            </ul>

            <div className="tab-content pt-3" id="Tabs">
              {
                tableData.data.map((table, index) => {
                  return (
                    <div key={index} className={`tab-pane fade ${index == 0 ? "active show" : ""}`} id={'table-data-' + index}
                      role="tabpanel" aria-labelledby="table-data-tab">

                      {
                        table.metadata !== undefined && Object.keys(table.metadata).length > 0 &&
                        <div>
                          <h4>Input table metadata</h4>
                          {this.renderMetadata(table.metadata)}
                          <hr />
                        </div>
                      }
                      {
                        table.header !== undefined && table.header.length > 0 &&
                        <div>
                          <h4>Input table header</h4>
                          {this.renderHeader(table.header)}
                          <hr />
                        </div>
                      }
                      {
                        table.rows !== undefined && table.rows !== undefined && table.rows.length > 0 &&
                        <div>
                          <h4>Input table data</h4>

                          {this.renderDataGrid(table)}

                          <div className="form-group form-check mt-3">
                            <input type="checkbox" checked={table.firstRowIsHeader || false}
                              onChange={e => toggleFirstRowIsHeader(index)}
                              className="form-check-input" id="first_row_is_header" />
                            <label className="form-check-label" htmlFor="first_row_is_header">First row are column names</label>
                          </div>
                          <hr />
                        </div>
                      }
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className="col-md-5 scroll">
          <div className="mb-5">

            <div className="card rounded-0 mt-3">
              <div className="card-header">
                <div>Profile</div>
              </div>
              <div className="card-body">
                <div>
                  <label>Title</label>
                  <input type="text" className="form-control form-control-sm" onChange={event => updateTitle(event.currentTarget.value)} value={title} />
                  <small className="text-muted">Please add a title for this profile.</small>
                </div>
                <div className="mt-3">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" onChange={event => updateDescription(event.currentTarget.value)} value={description} />
                  <small className="text-muted">Please add a description for this profile.</small>
                </div>
              </div>
            </div>

            {
              this.props.tables.map((table, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className="card rounded-0 mt-3">
                      <div className="card-header">
                        <div className="form-row">
                          <div className="col-lg-10">
                            Output table #{index}
                          </div>
                          <div className="col-lg-2">
                            <button type="button" className="btn btn-danger btn-sm btn-block float-right" onClick={removeTable}>Remove</button>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <HeaderForm
                          headerOptions={headerOptions}
                          updateHeader={(key, value) => updateHeader(index, key, value)}
                        />
                        <TableForm
                          table={table.table}
                          columnList={columnList}
                          updateTable={(key, value) => updateTable(index, key, value)}
                          addOperation={(key, type) => addOperation(index, key, type)}
                          updateOperation={(key, opIndex, opKey, value) => updateOperation(index, key, opIndex, opKey, value)}
                          removeOperation={(key, opIndex) => removeOperation(index, key, opIndex)}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                )
              })
            }

            <div className="mt-3">
              <button type="button" className="btn btn-success btn-sm" onClick={addTable}>Add table</button>
            </div>

            <div className="card rounded-0 mt-3">
              <div className="card-header">Identifiers</div>
              <div className="card-body">
                <label>Based on metadata</label>
                <IdentifierForm
                  type="metadata"
                  identifiers={identifiers}
                  addIdentifier={addIdentifier}
                  updateIdentifier={updateIdentifier}
                  removeIdentifier={removeIdentifier}
                  data={tableData.metadata}
                />

                <label>Based on table headers</label>
                <IdentifierForm
                  type="table"
                  identifiers={identifiers}
                  addIdentifier={addIdentifier}
                  updateIdentifier={updateIdentifier}
                  removeIdentifier={removeIdentifier}
                  data={tableData.data}
                />
                <small className="text-muted">The identifiers you create will be used to find the right profile for uploaded files. The 'value' will be compared to the selected file metadata or to the header of a table. If you provide a line number, only this line of the header will be used. If you select 'RexExp', you can enter a regular expression as value, which will be used to match the file. If you fill in the field 'header key', the compared string (or the first group of a given RegExp) will be added to the header of the converted file.</small>
              </div>
            </div>

            <div className="row justify-content-center mt-3">
              <form>
                <button type="submit" className="btn btn-primary" onClick={createProfile}>Create profile</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default ProfileCreate