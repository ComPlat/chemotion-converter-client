import React, { Component } from "react"
import { AgGridReact } from 'ag-grid-react';
import { Tabs, Tab } from 'react-bootstrap';
import Select from 'react-select';

import TableForm from './TableForm'
import IdentifierForm from './IdentifierForm'

class ProfileForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dataset: {}
    }
    this.onGridReady = this.onGridReady.bind(this)
    this.onSubmit = this.onSubmit.bind(this)

    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.updateOls = this.updateOls.bind(this)

    this.addTable = this.addTable.bind(this)
    this.updateTable = this.updateTable.bind(this)
    this.removeTable = this.removeTable.bind(this)

    this.addHeader = this.addHeader.bind(this)
    this.updateHeader = this.updateHeader.bind(this)
    this.removeHeader = this.removeHeader.bind(this)

    this.addOperation = this.addOperation.bind(this)
    this.updateOperation = this.updateOperation.bind(this)
    this.removeOperation = this.removeOperation.bind(this)

    this.addIdentifier = this.addIdentifier.bind(this)
    this.updateIdentifier = this.updateIdentifier.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)

    if (this.props.status == 'create') {
      this.addTable()
    }
  }

  onGridReady(params) {
    this.api = params.api;
  }

  onSubmit(e) {
    e.preventDefault()
    this.props.storeProfile()
  }

  updateTitle(title) {
    const profile = Object.assign({}, this.props.profile)
    profile.title = title
    this.props.updateProfile(profile)
  }

  updateDescription(description) {
    const profile = Object.assign({}, this.props.profile)
    profile.description = description
    this.props.updateProfile(profile)
  }

  updateOls(ols) {
    const { datasets } = this.props;
    const profile = Object.assign({}, this.props.profile)
    profile.ols = ols

    const ds = datasets && datasets.find(o => o['ols'] === ols) || {};
    this.setState({ dataset: ds })

    this.props.updateProfile(profile)
  }

  addTable() {
    const { options } = this.props.options
    const header = {}
    if (options) {
      for (let key in options) {
        header[key] = options[key][0]
      }
    }

    const profile = Object.assign({}, this.props.profile)
    profile.tables.push({
      header: header,
      table: {}
    })
    this.props.updateProfile(profile)
  }

  updateTable(index, key, value) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.tables[index].table[key] = value

      // remove the column if tableIndex and columnIndex is null
      if (Object.values(profile.tables[index].table[key]).every(value => (value === null || isNaN(value)))) {
        delete profile.tables[index].table[key]
      }

      this.props.updateProfile(profile)
    }
  }

  removeTable(index) {
    const profile = Object.assign({}, this.props.profile)
    profile.tables.splice(index, 1)
    this.props.updateProfile(profile)
  }

  addHeader(index) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      const key = 'HEADER' + Object.keys(profile.tables[index].header).length
      profile.tables[index].header[key] = ''
    }
    this.props.updateProfile(profile)
  }

  updateHeader(index, key, value, oldKey) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      if (oldKey === undefined) {
        profile.tables[index].header[key] = value
      } else {
        // create a new header to preserve the order
        profile.tables[index].header = Object.keys(profile.tables[index].header).reduce((agg, cur) => {
          if (cur == oldKey) {
            agg[key] = value
          } else {
            agg[cur] = profile.tables[index].header[cur]
          }
          return agg
        }, {})
      }
      this.props.updateProfile(profile)
    }
  }

  removeHeader(index, key) {
    const profile = Object.assign({}, this.props.profile)
    delete profile.tables[index].header[key]
    this.props.updateProfile(profile)
  }

  addOperation(index, key, type) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      const operation = {
        type: type,
        operator: '+'
      }
      if (type == 'column') {
        operation['column'] = {
          tableIndex: null,
          columnIndex: null
        }
      }

      if (profile.tables[index].table[key] === undefined) {
        profile.tables[index].table[key] = []
      }
      profile.tables[index].table[key].push(operation)
      this.props.updateProfile(profile)
    }
  }

  updateOperation(index, key, opIndex, opKey, value) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.tables[index].table[key][opIndex][opKey] = value
      this.props.updateProfile(profile)
    }
  }

  removeOperation(index, key, opIndex) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.tables[index].table[key].splice(opIndex, 1)

      // remove operations if it is empty
      if (profile.tables[index].table[key].length == 0) {
        delete profile.tables[index].table[key]
      }

      this.props.updateProfile(profile)
    }
  }

  addIdentifier(type, optional) {
    const profile = Object.assign({}, this.props.profile)
    const identifier = {
      type: type,
      optional: optional,
      isRegex: false,
    }

    profile.identifiers.push(identifier)
    this.props.updateProfile(profile)
  }

  updateIdentifier(index, data) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.identifiers[index] = Object.assign(profile.identifiers[index], data)
      this.props.updateProfile(profile)
    }
  }

  removeIdentifier(index) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.identifiers.splice(index, 1)
      this.props.updateProfile(profile)
    }
  }

  submitForm(event, profile) {
    event.preventDefault()

    if (profile.id) {
      this.props.updateProfile()
    } else {
      this.props.createProfile()
    }
  }

  renderMetadata(metadata) {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <dl className="dl-horizontal mb-0">
            {
              Object.keys(metadata).map((key, index) => {
                return (
                  <React.Fragment key={index}>
                    <dt>{key}:</dt>
                    <dd>{metadata[key] || ' '}</dd>
                  </React.Fragment>
                )
              })
            }
          </dl>
        </div>
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
    const { status, profile, options, datasets } = this.props
    const { dataset } = this.state;

    // create a flat list of all columns
    let columnList = null
    if (profile.data) {
      columnList = profile.data.tables.reduce((accumulator, table, tableIndex) => {
        const tableColumns = table.columns.map((tableColumn, columnIndex) => {
          return Object.assign({}, tableColumn, {
            label: `Input table #${tableIndex} Column #${columnIndex}`,
            value: {
              tableIndex: tableIndex,
              columnIndex: columnIndex
            }
          })
        })
        return accumulator.concat(tableColumns)
      }, [])
    }

    const dsOpt = datasets && datasets.map(ds => {
      return { value: ds['ols'], label: ds['name'] }
    })

    let datasetList = (<span />);
    datasetList = (
      <div className="panel panel-default">
      <div className="panel-heading">
        <div>Dataset</div>
      </div>
      <div className="panel-body">
        <div>
          <label>Datasets</label>
          <Select
            isDisabled={false}
            isLoading={false}
            isClearable={false}
            isRtl={false}
            name="dataset"
            options={dsOpt}
            onChange={event => this.updateOls(event.value)}
          />
        </div>
      </div>
    </div>
    );

    const tabContents = [];
    if (profile.data) {
      profile.data.tables.forEach((table, idx) => {
        tabContents.push(
          <Tab key={`tableTab${idx}`} eventKey={idx} title={`Input table # ${idx}`}>
            {
              table.metadata !== undefined && Object.keys(table.metadata).length > 0 &&
              <div className="mt-20">
                <h4>Input table metadata</h4>
                {this.renderMetadata(table.metadata)}
              </div>
            }
            {
              table.header !== undefined && table.header.length > 0 &&
              <div className="mt-20">
                <h4>Input table header</h4>
                {this.renderHeader(table.header)}
              </div>
            }
            {
              table.rows !== undefined && table.rows !== undefined && table.rows.length > 0 &&
              <div className="mt-20">
                <h4>Input table data</h4>
                {this.renderDataGrid(table)}
              </div>
            }
          </Tab>
        );
      });
    }

    return (
      <div className="row">
        <div className="col-md-7">
          {
            profile.data ? <div className="scroll">
              <h4>Input file metadata</h4>
              {Object.keys(profile.data.metadata).length > 0 && this.renderMetadata(profile.data.metadata)}
              <h4>Input tables</h4>
              <Tabs defaultActiveKey={0} id="uncontrolled-tab-example">
                {tabContents}
              </Tabs>
            </div> : <p>
              <em>The profile does not contain the initial uploaded data.</em>
            </p>
          }
        </div>
        <div className="col-md-5">
          <div className="scroll">
            <div className="panel panel-default">
              <div className="panel-heading">
                Profile
              </div>
              <div className="panel-body">
                <div>
                  <label>Title</label>
                  <input type="text" className="form-control form-control-sm" onChange={event => this.updateTitle(event.currentTarget.value)} value={profile.title} />
                  <small className="text-muted">Please add a title for this profile.</small>
                </div>
                <div className="mt-10">
                  <label>Description</label>
                  <textarea className="form-control" rows="3" onChange={event => this.updateDescription(event.currentTarget.value)} value={profile.description} />
                  <small className="text-muted">Please add a description for this profile.</small>
                </div>
              </div>
            </div>
            {
              profile.tables.map((table, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className="panel panel-default">
                      <div className="panel-heading">
                        <button type="button" className="btn btn-danger btn-xs pull-right" onClick={() => this.removeTable()}>Remove</button>
                        Output table #{index}
                      </div>
                      <div className="panel-body">
                        <TableForm
                          table={table}
                          columnList={columnList}
                          headerOptions={options}
                          updateHeader={(key, value) => this.updateHeader(index, key, value)}
                          updateTable={(key, value) => this.updateTable(index, key, value)}
                          addOperation={(key, type) => this.addOperation(index, key, type)}
                          updateOperation={(key, opIndex, opKey, value) => this.updateOperation(index, key, opIndex, opKey, value)}
                          removeOperation={(key, opIndex) => this.removeOperation(index, key, opIndex)}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                )
              })
            }

            <div className="mb-20">
              <button type="button" className="btn btn-success btn-sm" onClick={() => this.addTable()}>Add table</button>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">Identifiers</div>
              <div className="panel-body">
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={false}
                      identifiers={profile.identifiers}
                      data={profile.data}
                      tables={profile.tables}
                      dataset={dataset}
                      addIdentifier={this.addIdentifier}
                      updateIdentifier={this.updateIdentifier}
                      removeIdentifier={this.removeIdentifier}
                    />
                  ))
                }
                <small>
                  <p className="text-muted">
                    The identifiers you create here are used to find the correct profile for uploaded files.
                  </p>
                  <ul className="text-muted">
                    <li>
                      The <code>Value</code> will be compared to the selected metadata or to the header of a table. If you select <code>Regex</code>, you can enter a regular expression as value.
                    </li>
                    <li>If you provide a line number, only this line of the header will be used. If line number is ommited, the whole header is compared (or searched with the Regex).
                    </li>
                  </ul>
                </small>
              </div>
            </div>
            { datasetList }

            <div className="panel panel-default">
              <div className="panel-heading">Metadata</div>
              <div className="panel-body">
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={true}
                      identifiers={profile.identifiers}
                      data={profile.data}
                      tables={profile.tables}
                      dataset={dataset}
                      addIdentifier={this.addIdentifier}
                      updateIdentifier={this.updateIdentifier}
                      removeIdentifier={this.removeIdentifier}
                    />
                  ))
                }
                <small>
                  <p className="text-muted">
                    The metadata you define here are extracted from the input file and added to the output tables.
                  </p>
                  <ul className="text-muted">
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

            <form>
              <button type="submit" className="btn btn-primary" onClick={this.onSubmit}>
                {status == 'create' && 'Create profile'}
                {status == 'update' && 'Update profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

}

export default ProfileForm
