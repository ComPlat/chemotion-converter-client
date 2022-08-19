import React, { Component } from "react"
import PropTypes from 'prop-types';
import Select from 'react-select';
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
    <React.Fragment>
      <select className="form-control form-control-sm" id={`matchSelect${index}`}
              value={identifier.match}
              onChange={(event) => updateIdentifier(index, { match: event.target.value })}>
        {
          options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))
        }
      </select>
      <label className="mb-0" htmlFor={`outputTableIndexSelect${index}`}><small>Match</small></label>
    </React.Fragment>
  )
}

MatchSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default MatchSelect
