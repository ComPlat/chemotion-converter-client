import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const KeyInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <Form.Group controlId={`keyInput${index}`}>
      <Form.Label>Key</Form.Label>
      <Form.Control
        size="sm"
        value={identifier.key || ''}
        onChange={(event) => updateIdentifier(index, { key: event.target.value })}
      />
    </Form.Group>
  )
}

KeyInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default KeyInput
