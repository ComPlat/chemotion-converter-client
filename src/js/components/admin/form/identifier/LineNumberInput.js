import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const LineNumberInput = ({ index, identifier, updateIdentifier }) => {

  const updateLineNumber = (value) => {
    if (value) {
      updateIdentifier(index, {
        lineNumber: parseInt(event.target.value, 10)
      })
    } else {
      updateIdentifier(index, {
        lineNumber: null
      })
    }
  }

  return (
    <Form.Group controlId={`lineNumberInput${index}`}>
      <Form.Label>Line</Form.Label>
      <Form.Control
        size="sm"
        value={identifier.lineNumber || ''}
        onChange={(event) => updateLineNumber(event.target.value)}
      />
    </Form.Group>
  )
}

LineNumberInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default LineNumberInput
