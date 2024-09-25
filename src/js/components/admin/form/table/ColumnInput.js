import React from "react"
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';

const ColumnInput = ({ column, onChange }) => {
  // a column list is not available
  const getIndex = (column, key) => {
    if (column !== undefined && typeof column[key] == 'number' && !isNaN(column[key])) {
      return column[key]
    } else {
      return null
    }
  }

  const getValue = (column, key) => {
    const index = getIndex(column, key)
    return index === null ? '' : index
  }

  return (
    <Row>
      <Form.Group as={Col} md={6}>
        <Form.Label>Table Index</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          onChange={event => onChange({
            tableIndex: parseInt(event.target.value),
            columnIndex: getIndex(column, 'columnIndex')
          })}
          value={getValue(column, 'tableIndex')}
        />
      </Form.Group>

      <Form.Group as={Col} md={6}>
        <Form.Label>Column Index</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          className="form-control input-sm"
          onChange={event => onChange({
            tableIndex: getIndex(column, 'tableIndex'),
            columnIndex: parseInt(event.target.value)
          })}
          value={getValue(column, 'columnIndex')}
        />
      </Form.Group>
    </Row>
  )
}

ColumnInput.propTypes = {
  column: PropTypes.object,
  onChange: PropTypes.func
}

export default ColumnInput
