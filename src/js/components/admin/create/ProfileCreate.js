import React, { Component } from "react"
import { AgGridReact } from 'ag-grid-react';
import { Tabs, Tab } from 'react-bootstrap';

import HeaderForm from './HeaderForm'
import TableForm from './TableForm'
import IdentifierForm from './IdentifierForm'

class ProfileCreate extends Component {

  constructor(props) {
    super(props);
    this.onGridReady = this.onGridReady.bind(this);
  }

  onGridReady(params) {
    this.api = params.api;
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
    const columnDefs = table.columns.map(column => ({
      field: column.key,
      headerName: column.name
    }))

    const defaultColDef = {
        resizable: true,
        lockPosition: true
    };

    const rowData = table.rows.map(row => {
      return Object.fromEntries(row.map((value, idx) => {
        return [idx, value]
      }))
    })

    return (
      <div className="ag-theme-alpine">
        <AgGridReact
          enableColResize
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          domLayout='autoHeight'
          suppressRowHoverHighlight={true}
          onGridReady={this.onGridReady}
        />
      </div>
    )
  }

  render() {
    const { tableData, columnList, headerOptions, title, description, identifiers, tables,
            updateTitle, updateDescription, addTable, updateHeader, updateTable, addOperation,
            updateOperation, removeOperation, removeTable, addIdentifier, updateIdentifier, removeIdentifier,
            createProfile } = this.props

    const tabContents = [];
    tableData.data.forEach((table, idx) => {
      tabContents.push(
        <Tab eventKey={idx} title={`Input table # ${idx}`}>
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
              <hr />
            </div>
          }
        </Tab>
      );
    });
    return (
      <div className="row">
        <div className="col-md-7">
          <div className="mb-5 mb-5-scroll">
            <hr />
            <h4>Input file metadata</h4>
            {Object.keys(tableData.metadata).length > 0 && this.renderMetadata(tableData.metadata)}
            <hr />
            <Tabs defaultActiveKey={0} id="uncontrolled-tab-example">
              {tabContents}
            </Tabs>
          </div>
        </div>
        <div className="col-md-5">
          <div className="mb-5 mb-5-scroll">
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
                          <div className="col-lg-10 card-heade">
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
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={false}
                      identifiers={identifiers}
                      tableData={tableData}
                      tables={tables}
                      addIdentifier={addIdentifier}
                      updateIdentifier={updateIdentifier}
                      removeIdentifier={removeIdentifier}
                    />
                  ))
                }
                <small>
                  <p className="text-muted">
                    The identifiers you create here are used to find the correct profile for uploaded files.
                  </p>
                  <ul className="text-muted mb-0">
                    <li>
                      The <code>Value</code> will be compared to the selected metadata or to the header of a table. If you select <code>Regex</code>, you can enter a regular expression as value.
                    </li>
                    <li>If you provide a line number, only this line of the header will be used. If line number is ommited, the whole header is compared (or searched with the Regex).
                    </li>
                  </ul>
                </small>
              </div>
            </div>

            <div className="card rounded-0 mt-3">
              <div className="card-header">Metadata</div>
              <div className="card-body">
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={true}
                      identifiers={identifiers}
                      tableData={tableData}
                      tables={tables}
                      addIdentifier={addIdentifier}
                      updateIdentifier={updateIdentifier}
                      removeIdentifier={removeIdentifier}
                    />
                  ))
                }
                <small>
                  <p className="text-muted">
                    The metadata you define here are extracted from the input file and added to the output tables.
                  </p>
                  <ul className="text-muted mb-0">
                    <li>
                      As above, the <code>Value</code> will be compared to the selected metadata or to the header of a table. If you select <code>Regex</code>, you can enter a regular expression as value.
                    </li>
                    <li>Also, if you provide a line number, only this line of the header will be used. If line number is ommited, the whole header is compared (or searched with the Regex).
                    </li>
                    <li>
                      If groups are used in the regular expression (e.g. <code>Key: (.*?)</code>) only the first group will be extracted as metadata.
                    </li>
                    <li>
                      If you enter an <code>Output key</code> the matched value will be added to the output tables. If you set an <code>Output table</code> explicitely, it will only be added to this table, otherwise it will be added to all output tables.
                    </li>
                    <li>
                      The <code>Output layer</code> input is used for additional processing in the Chemotion ELN.
                    </li>
                  </ul>
                </small>
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