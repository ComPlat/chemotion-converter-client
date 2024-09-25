import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { sortBy } from 'lodash';

const MatchSelect = ({ index, identifier, updateIdentifier }) => {

  const options = [
    {
      value: 'exact',
      label: 'Exact value'
    },
    {
      value: 'any',
      label: 'Any value'
    },
    {
      value: 'regex',
      label: 'RegEx'
    }
  ]

  return (
    <Form.Group controlId={`matchSelect${index}`}>
      <Form.Label>Match</Form.Label>
      <Form.Select
        size="sm"
        value={identifier.match}
        onChange={(event) => updateIdentifier(index, { match: event.target.value })}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

MatchSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default MatchSelect
