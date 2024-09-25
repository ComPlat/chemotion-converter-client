import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const TableIndexSelect = ({ index, identifier, tables, updateIdentifier }) => {
  console.log(tables)
  return (
    <Form.Group controlId={`tableIndexSelect${index}`}>
      <Form.Label>Input table</Form.Label>
      <Form.Select
        size="sm"
        onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}
      >
        {tables.map((table, tableIndex) => (
          <option key={tableIndex} value={tableIndex}>Input table #{tableIndex}</option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

TableIndexSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  tables: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default TableIndexSelect
