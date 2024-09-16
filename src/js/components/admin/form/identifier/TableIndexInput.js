import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const TableIndexInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <Form.Group controlId={`tableIndexInput${index}`}>
      <Form.Label>Input table</Form.Label>
      <Form.Control
        type="number"
        size="sm"
        value={identifier.tableIndex || ''}
        onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}
      />
    </Form.Group>
  )
}

TableIndexInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default TableIndexInput
