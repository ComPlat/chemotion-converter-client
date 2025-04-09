import React, { Component } from "react"
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {Button, Card, Col, Form, Row, Tabs, Tab, InputGroup} from 'react-bootstrap';
import Select from 'react-select';
import TruncatedTextWithTooltip from './common/TruncatedTextWithTooltip'

import {
  getDataset,
  getFileMetadataOptions,
  getInputColumns,
  getInputTables,
  getTableMetadataOptions
} from '../../../utils/profileUtils'

import TableForm from './TableForm'
import IdentifierForm from './IdentifierForm'
import ColumnSelect from "./table/ColumnSelect";

class ProfileForm extends Component {

  constructor(props) {
    super(props);

    this.onGridReady = this.onGridReady.bind(this)
    this.onSubmit = this.onSubmit.bind(this)

    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.updateOls = this.updateOls.bind(this)
    this.toggleMatchTables = this.toggleMatchTables.bind(this)
    this.handleChangeLoop = this.handleChangeLoop.bind(this)

    this.addTable = this.addTable.bind(this)
    this.updateTable = this.updateTable.bind(this)
    this.removeTable = this.removeTable.bind(this)

    this.addHeader = this.addHeader.bind(this)
    this.updateHeader = this.updateHeader.bind(this)
    this.removeHeader = this.removeHeader.bind(this)

    this.addOperation = this.addOperation.bind(this)
    this.updateOperation = this.updateOperation.bind(this)
    this.updateOperationDescription = this.updateOperationDescription.bind(this)
    this.removeOperation = this.removeOperation.bind(this)

    this.addIdentifier = this.addIdentifier.bind(this)
    this.updateIdentifier = this.updateIdentifier.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)

    this.addIdentifierOperation = this.addIdentifierOperation.bind(this)
    this.updateIdentifierOperation = this.updateIdentifierOperation.bind(this)
    this.removeIdentifierOperation = this.removeIdentifierOperation.bind(this)

    if (this.props.status === 'create') {
      this.addTable()
    }
  }

  onGridReady(params) {
    this.api = params.api;
  }

  onSubmit(event) {
    event.preventDefault()
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
    const profile = Object.assign({}, this.props.profile)
    if (typeof profile != 'undefined' && profile !== null && typeof ols !== 'undefined' && ols != null) {
      profile.ols = ols
      this.props.updateProfile(profile)
    }
  }

  toggleMatchTables(index) {
    const profile = Object.assign({}, this.props.profile)
    if (profile.matchTables) { // handling for old profiles
      profile.matchTables = false
      // profile.tables.forEach((table) => table.matchTables = true)
      // profile.tables[index].matchTables = false
    }
    else {
      profile.tables[index].matchTables = !profile.tables[index].matchTables
    }
    this.props.updateProfile(profile)
  }

  handleChangeLoop(value, index) {
    const profile = Object.assign({}, this.props.profile)
    profile.tables[index].loopType = value
    this.props.updateProfile(profile)
  }

  addTable() {
    const { options } = this.props
    const header = {}
    if (options) {
      for (let key in options) {
        header[key] = options[key][0]
      }
    }

    const inputColumns = getInputColumns(this.props.profile)
    const table = {}
    if (inputColumns.length > 2) {
      table.xColumn = inputColumns[0].value
      table.yColumn = inputColumns[1].value
    }

    const profile = Object.assign({}, this.props.profile)
    profile.tables.push({
      header: header,
      table: table
    })

    this.props.updateProfile(profile)
  }

  updateTable(index, key, value) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.tables[index].table[key] = value

      // remove the column if it set to null
      if (profile.tables[index].table[key] === null) {
        delete profile.tables[index].table[key]
      // remove the column if tableIndex and columnIndex is null
      } else if (Object.values(profile.tables[index].table[key]).every(value => (value === null || isNaN(value)))) {
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
    let header = Object.assign({}, profile.tables[index].header)

    if (index !== -1) {
      if (oldKey === undefined) {
        header[key] = value
      } else {
        // create a new header to preserve the order
        header = Object.keys(header).reduce((agg, cur) => {
          if (cur === oldKey) {
            agg[key] = value
          } else {
            agg[cur] = header[cur]
          }
          return agg
        }, {})
      }

      if (header['DATA CLASS'] === 'XYDATA') {
        ['FIRSTX', 'LASTX', 'DELTAX'].forEach(headerKey => {
          // ensure headerKeys are there if XYDATA is selected
          if (header[headerKey] === undefined) {
            header[headerKey] = this.initIdentifier(profile, 'fileMetadata')
          }

          // update header identifiers if the type changed
          if (headerKey === key &&
              profile.tables[index].header[headerKey].type !== header[headerKey].type) {
            header[headerKey] = this.initIdentifier(profile, header[headerKey].type)
          }
        })
      }

      profile.tables[index].header = header
      this.props.updateProfile(profile)
    }
  }

  removeHeader(index, key) {
    const profile = Object.assign({}, this.props.profile)
    delete profile.tables[index].header[key]
    this.props.updateProfile(profile)
  }

  additional_info(operation) {
    switch (operation.type) {
      case 'header_value':
        let line = parseInt(operation.line);
        if (!isNaN(line)) {
            line = ` @line ${line}`;
        } else {
          line = '';
        }
        return  ` (Table # ${operation.table}${line}: Regex: "${operation.regex}")`;
      case 'metadata_value':
        return ` (Table # ${operation.table} ${operation.value})`;
      case 'column':
        return ` (Table # ${operation.column.tableIndex} Column # ${operation.column.columnIndex})`;
      default:
        return `: ${operation.value}`;
    }
  }

  updateAutomatedOperationDescription(profile, index, key) {
    const keyDescription = `${key}Description`;

    let value = profile.tables[index].table[keyDescription] ?? ["",""];
    const type_mapping = {
      "header_value": "File regexp value",
      "metadata_value": "Metadata value",
      "column": "Table column",
      "value": "Scalar value"
    };
    if(profile.tables[index].table[key]) {
        const tmp_value = []
        for (const op of profile.tables[index].table[key]) {
            tmp_value.push(`${op.operator} [${type_mapping[op.type] ?? "??"}${this.additional_info(op)}]`);
        }

        value[0] = tmp_value.join(' ');
    } else {
        value[0] = ''
    }
    profile.tables[index].table[keyDescription]  = value;
  }

  updateOperationDescription(index, key, value) {
    const keyDescription = `${key}Description`;
    const profile = Object.assign({}, this.props.profile);
    const prof_value = profile.tables[index].table[keyDescription] ?? ["",""];
    prof_value[1] = value;
    profile.tables[index].table[keyDescription] = prof_value;
    this.props.updateProfile(profile);
  }

  addOperation(index, key, type) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      const operation = {
        type: type,
        operator: (key==='loop_header' ? '&' : '+')
      }

      if (type === 'header_value') {
        operation.table = '0';
        operation.regex = '';
        operation.line = '';
        operation.ignore_missing_values = false;
      } else if (type === 'metadata_value') {
        const mdZero =  getTableMetadataOptions(profile)[0];
        operation.value = mdZero.key;
        operation.table = `${mdZero.tableIndex}`;
        operation.metadata = '0';
        operation.ignore_missing_values = false;
      } else if (type === 'column') {
        operation['column'] = {
          tableIndex: null,
          columnIndex: null
        };
      }

      if (profile.tables[index].table[key] === undefined) {
        profile.tables[index].table[key] = [];
      }
      profile.tables[index].table[key].push(operation);
      this.updateAutomatedOperationDescription(profile, index, key);
      this.props.updateProfile(profile)
    }
  }

  updateOperation(index, key, opIndex, opKey, value) {

    if (opKey === 'metadata') {
        const data = value.split(':');
        this.updateOperation(index, key, opIndex, 'value', data[1].trim());
        this.updateOperation(index, key, opIndex, 'table', data[2]);
        value = data[0];
    }
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.tables[index].table[key][opIndex][opKey] = value;
      this.updateAutomatedOperationDescription(profile, index, key);
      this.props.updateProfile(profile);
    }
  }

  removeOperation(index, key, opIndex) {
    const profile = Object.assign({}, this.props.profile);
    if (index !== -1) {
      profile.tables[index].table[key].splice(opIndex, 1)

      // remove operations if it is empty
      if (profile.tables[index].table[key].length === 0) {
        delete profile.tables[index].table[key];
      }

      this.updateAutomatedOperationDescription(profile, index, key);
      this.props.updateProfile(profile)
    }
  }

  initIdentifier(profile, type) {
    const identifier = {
      type: type,
      match: 'any',
      value: ''
    }

    if (identifier.type === 'fileMetadata') {
      const fileMetadataOptions = getFileMetadataOptions(profile)
      if (fileMetadataOptions.length > 0) {
        identifier.key = fileMetadataOptions[0].key
        identifier.value = fileMetadataOptions[0].value
      } else {
        identifier.key = ''
      }
    } else if (identifier.type === 'tableMetadata') {
      const tableMetadataOptions = getTableMetadataOptions(profile)
      if (tableMetadataOptions.length > 0) {
        identifier.key = tableMetadataOptions[0].key
        identifier.tableIndex = tableMetadataOptions[0].tableIndex
        identifier.value = tableMetadataOptions[0].value
      } else {
        identifier.key = ''
        identifier.tableIndex = 0
      }
    } else if (identifier.type === 'tableHeader'){
      identifier.tableIndex = 0
      identifier.lineNumber = ''
    }

    return identifier
  }

  addIdentifier(type, optional) {
    const profile = Object.assign({}, this.props.profile)
    const identifier = this.initIdentifier(profile, type)
    identifier.show = true
    identifier.optional = optional

    if (identifier.optional) {
      identifier.outputTableIndex = 0
      identifier.outputLayer = ''
      identifier.outputKey = ''
    } else {
      identifier.match = 'exact'
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

  addIdentifierOperation(index) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      const operation = {
        operator: '+'
      }
      if (profile.identifiers[index].operations === undefined) {
        profile.identifiers[index].operations = []
      }
      profile.identifiers[index].operations.push(operation)
      this.props.updateProfile(profile)
    }
  }

  updateIdentifierOperation(index, opIndex, opKey, value) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.identifiers[index].operations[opIndex][opKey] = value
      this.props.updateProfile(profile)
    }
  }

  removeIdentifierOperation(index, opIndex) {
    const profile = Object.assign({}, this.props.profile)
    if (index !== -1) {
      profile.identifiers[index].operations.splice(opIndex, 1)

      // remove operations if it is empty
      if (profile.identifiers[index].operations.length === 0) {
        delete profile.identifiers[index].operations
      }

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
     <Card>
        <Card.Body>
          <Row as="dl">
            {Object.keys(metadata).map((key, index) => (
              <React.Fragment key={index}>
              <TruncatedTextWithTooltip text={key} />
              <Col as="dd" lg={7}>{metadata[key] || ' '}</Col>
              </React.Fragment>
            ))}
          </Row>
        </Card.Body>
     </Card>
    )
  }

  renderHeader(header) {
    return (
      <pre>
        {header.map((line, index) => (
          <code key={index}>{line}</code>
        ))}
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

    const rowData = table.rows.map(row =>
      Object.fromEntries(row.map((value, idx) => [idx, value]))
    )

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

    const inputTables = getInputTables(profile)
    const inputColumns = getInputColumns(profile)
    const fileMetadataOptions = getFileMetadataOptions(profile)
    const tableMetadataOptions = getTableMetadataOptions(profile)

    let dataset = {}
    let datasetList = null;
    if (datasets.length > 0) {
      dataset = getDataset(profile, datasets)

      const dsOpt = datasets.map(ds => { return { value: ds?.ols, label: ds?.name } })
      const dsValue = (dataset !== null && typeof dataset !== 'undefined') ? { value: dataset?.ols, label: dataset?.name } : ''

      datasetList = (
        <Card className="mt-3">
          <Card.Header>
            Dataset
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Label column="lg">Datasets</Form.Label>
              <Select
                isDisabled={false}
                isLoading={false}
                isClearable={true}
                isRtl={false}
                name="dataset"
                options={dsOpt}
                value={dsValue}
                onChange={event => this.updateOls(event === null ? null : event.value)}
              />
            </Form.Group>
          </Card.Body>
        </Card>
      );
    }

    const tabContents = [];
    if (profile.data) {
      profile.data.tables.forEach((table, idx) => {
        tabContents.push(
          <Tab key={`tableTab${idx}`} eventKey={idx} title={`Input table # ${idx}`}>
            {
              table.metadata !== undefined && Object.keys(table.metadata).length > 0 &&
              <div className="mt-3">
                <h4>Input table metadata</h4>
                {this.renderMetadata(table.metadata)}
              </div>
            }
            {
              table.header !== undefined && table.header.length > 0 &&
              <div className="mt-3">
                <h4>Input table header</h4>
                {this.renderHeader(table.header)}
              </div>
            }
            {
              table.rows !== undefined && table.rows.length > 0 &&
              <div className="mt-3">
                <h4>Input table data</h4>
                {this.renderDataGrid(table)}
              </div>
            }
          </Tab>
        );
      });
    }

    return (
      <Row>
        <Col md={7}>
          {profile.data
            ? (
              <div className="scroll">
                <h4>Input file metadata</h4>
                {Object.keys(profile.data.metadata).length > 0 && this.renderMetadata(profile.data.metadata)}
                <h4 className="mt-3">Input tables</h4>
                <Tabs defaultActiveKey={0} id="uncontrolled-tab-example">
                  {tabContents}
                </Tabs>
              </div>
            ) : (
              <p>
                <em>The profile does not contain the initial uploaded data.</em>
              </p>
            )}
        </Col>

        <Col md={5}>
          <div className="scroll">
            <Card>
              <Card.Header>
                Profile
              </Card.Header>
              <Card.Body>
                <Form.Group controlId="profile-title">
                  <Form.Label column="lg">Title</Form.Label>
                  <Form.Control size="sm" onChange={event => this.updateTitle(event.currentTarget.value)} value={profile.title} />
                  <Form.Text>Please add a title for this profile.</Form.Text>
                </Form.Group>

                <Form.Group controlId="profile-description" className="mt-3">
                  <Form.Label column="lg">Description</Form.Label>
                  <Form.Control as="textarea" size="sm" rows="3" onChange={event => this.updateDescription(event.currentTarget.value)} value={profile.description} />
                  <Form.Text>Please add a description for this profile.</Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {profile.tables.map((table, index) => (
              <Card key={index} className="mt-3">
                <Card.Header className="d-flex align-items-baseline justify-content-between">
                  Output table #{index}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => this.removeTable(index)}
                  >
                    Remove
                  </Button>
                </Card.Header>
                <Card.Body>
                  Use this output table configuration for:
                  <InputGroup>
                    {profile.tables[index].loopType === "all" ? (
                        <InputGroup.Checkbox
                            id="match-tables-checkbox"
                            checked={profile.matchTables || profile.tables[index].matchTables || false}
                            disabled = {profile.tables[index].loopType !== "all"}
                            onChange={() => this.toggleMatchTables(index)}
                        />
                    ) : (
                        <Button
                            variant="outline-success"
                            onClick={() => this.addOperation(index, 'loop_header', 'column')}>
                          +
                        </Button>)}
                  <Form.Select
                      id="loop_select"
                      aria-label="Select looping"
                      value={profile.tables[index].loopType}
                      onChange={(e) => this.handleChangeLoop(e.target.value, index)}
                  >
                    <option value="all">all input tables.</option>
                    <option value="header">all input tables that have the same column header.</option>
                  </Form.Select>
                  </InputGroup>
                  {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_header']
                      && profile.tables[index].table['loop_header'].map((operation, op_index) => (
                    <InputGroup>
                      <InputGroup.Text>&#8627;</InputGroup.Text>
                      <Button
                          variant="outline-danger"
                          onClick={() => this.removeOperation(index, 'loop_header', op_index)}
                      >
                        &times;
                      </Button>
                      <ColumnSelect
                          column={operation.column}
                          columnList={inputColumns}
                          onChange={column => this.updateOperation(index, 'loop_header', op_index, 'column',column)}
                       />
                    </InputGroup>
                  ))}
                  <TableForm
                    table={table}
                    inputTables={inputTables}
                    inputColumns={inputColumns}
                    options={options}
                    updateHeader={(key, value) => this.updateHeader(index, key, value)}
                    updateTable={(key, value) => this.updateTable(index, key, value)}
                    addOperation={(key, type) => this.addOperation(index, key, type)}
                    updateOperation={(key, opIndex, opKey, value) => this.updateOperation(index, key, opIndex, opKey, value)}
                    updateOperationDescription={(key, value) => this.updateOperationDescription(index, key, value)}
                    removeOperation={(key, opIndex) => this.removeOperation(index, key, opIndex)}
                    fileMetadataOptions={fileMetadataOptions}
                    tableMetadataOptions={tableMetadataOptions}
                  />
                </Card.Body>
              </Card>
            ))}

            <div className="mt-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => this.addTable()}
              >
                Add table
              </Button>
            </div>

            <Card className="mt-3">
              <Card.Header>Identifiers</Card.Header>
              <Card.Body>
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
                      fileMetadataOptions={fileMetadataOptions}
                      tableMetadataOptions={tableMetadataOptions}
                      inputTables={inputTables}
                      outputTables={profile.tables}
                      dataset={dataset}
                      addIdentifier={this.addIdentifier}
                      updateIdentifier={this.updateIdentifier}
                      removeIdentifier={this.removeIdentifier}
                      addIdentifierOperation={this.addIdentifierOperation}
                      updateIdentifierOperation={this.updateIdentifierOperation}
                      removeIdentifierOperation={this.removeIdentifierOperation}
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
              </Card.Body>
            </Card>

            { datasetList }

            <Card className="mt-3">
              <Card.Header>Metadata</Card.Header>
              <Card.Body>
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
                      fileMetadataOptions={fileMetadataOptions}
                      tableMetadataOptions={tableMetadataOptions}
                      inputTables={inputTables}
                      outputTables={profile.tables}
                      dataset={dataset}
                      addIdentifier={this.addIdentifier}
                      updateIdentifier={this.updateIdentifier}
                      removeIdentifier={this.removeIdentifier}
                      addIdentifierOperation={this.addIdentifierOperation}
                      updateIdentifierOperation={this.updateIdentifierOperation}
                      removeIdentifierOperation={this.removeIdentifierOperation}
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
              </Card.Body>
            </Card>

            <Button className="mt-3" variant="primary" onClick={this.onSubmit}>
              {status === 'create' && 'Create profile'}
              {status === 'update' && 'Update profile'}
            </Button>
          </div>
        </Col>
      </Row>
    )
  }

}

ProfileForm.propTypes = {
  status: PropTypes.string,
  profile: PropTypes.object,
  options: PropTypes.object,
  datasets: PropTypes.array,
  updateProfile: PropTypes.func,
  storeProfile: PropTypes.func
}

export default ProfileForm
