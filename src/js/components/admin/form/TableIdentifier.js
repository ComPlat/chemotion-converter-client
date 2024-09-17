import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';

import TypeSelect from './identifier/TypeSelect'
import IdentifierInput from './IdentifierInput'


class TableIdentifier extends Component {

  constructor(props) {
    super(props)

    this.updateTableIdentifier = this.updateTableIdentifier.bind(this)
  }

  updateTableIdentifier(identifierIndex, data) {
    const { headerKey, table, updateHeader } = this.props
    const headerKeyIdentifier = Object.assign({}, table.header[headerKey], data)

    updateHeader(headerKey, headerKeyIdentifier)
  }

  render() {
    const {
      index, headerKey, table, inputTables,
      fileMetadataOptions, tableMetadataOptions
    } = this.props

    return (
      <div>
        <Form.Group as={Row}>
          <Form.Label as={Col} md={2} className="fw-bold">
            {headerKey}
          </Form.Label>
          <Col md={10}>
            <TypeSelect
              index={index}
              identifier={table.header[headerKey]}
              updateIdentifier={this.updateTableIdentifier} />
          </Col>
        </Form.Group>

        <IdentifierInput
          index={index}
          identifier={table.header[headerKey]}
          inputTables={inputTables}
          fileMetadataOptions={fileMetadataOptions}
          tableMetadataOptions={tableMetadataOptions}
          updateIdentifier={this.updateTableIdentifier}
        />
      </div>
    )
  }
}

TableIdentifier.propTypes = {
  index: PropTypes.number,
  headerKey: PropTypes.string,
  table: PropTypes.object,
  inputTables: PropTypes.array,
  updateHeader: PropTypes.func,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array
}

export default TableIdentifier
