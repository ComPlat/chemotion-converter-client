import React from "react"
import PropTypes from 'prop-types';
import {Col, Form, Row} from 'react-bootstrap';

import TypeSelect from '../../identifier/TypeSelect'
import { DatatableIdentifierInput } from '../../IdentifierInput'


function TableIdentifier({
                           index, headerKey, table,
                            updateHeader
                         }) {
  const updateTableIdentifier = (identifierIndex, data) => {
    const headerKeyIdentifier = Object.assign({}, table.header[headerKey], data);
    updateHeader(headerKey, headerKeyIdentifier);
  }

  return (
    <div>
      <Form.Group as={Row}>
        <Form.Label as={Col} md={2} className="fw-bold" column={"sm"}>
          {headerKey}
        </Form.Label>
        <Col md={10}>
          <TypeSelect
            index={index}
            identifier={table.header[headerKey]}
            updateIdentifier={updateTableIdentifier}/>
        </Col>
      </Form.Group>

      <DatatableIdentifierInput
        index={index}
        identifier={table.header[headerKey]}
        inputTables={inputTables}
        fileMetadataOptions={fileMetadataOptions}
        tableMetadataOptions={tableMetadataOptions}
        updateIdentifier={updateTableIdentifier}
      />
    </div>
  )
}

TableIdentifier.propTypes = {
  index: PropTypes.number.isRequired,
  headerKey: PropTypes.string.isRequired,
  table: PropTypes.shape({
    header: PropTypes.object
  }).isRequired,
  updateHeader: PropTypes.func.isRequired
}

export default TableIdentifier
