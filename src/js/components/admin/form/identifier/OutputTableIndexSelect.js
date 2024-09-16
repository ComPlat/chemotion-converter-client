import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const OutputTableIndexSelect = ({ index, identifier, tables, updateIdentifier }) => {
  return (
    <Form.Group controlId={`outputTableIndexSelect${index}`}>
      <Form.Label>Output table</Form.Label>
      <Form.Select
        size="sm"
        value={identifier.outputTableIndex === null ? '' : identifier.outputTableIndex}
        onChange={(event) => updateIdentifier(index, { outputTableIndex: parseInt(event.target.value, 10) })}
      >
        <option value="">Add to all output tables</option>
        {tables.map((outputTable, outputTableIndex) => (
          <option key={outputTableIndex} value={outputTableIndex}>Output table #{outputTableIndex}</option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

OutputTableIndexSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  tables: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default OutputTableIndexSelect
