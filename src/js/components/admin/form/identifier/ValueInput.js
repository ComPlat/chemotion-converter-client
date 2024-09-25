import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const ValueInput = ({ index, identifier, updateIdentifier, disabled }) => {
  return (
    <Form.Group controlId={`valueInput${index}`}>
      <Form.Label>Value</Form.Label>
      <Form.Control
        size="sm"
        value={identifier.value || ''}
        onChange={(event) => updateIdentifier(index, { value: event.target.value })}
        disabled={disabled}
      />
    </Form.Group>
  )
}

ValueInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  disabled: PropTypes.bool
}

export default ValueInput
