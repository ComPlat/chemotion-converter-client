import React, { Component } from "react"
import PropTypes from 'prop-types';

const KeyInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`keyInput${index}`}
        className="form-control form-control-sm"
        value={identifier.key || ''}
        onChange={(event) => updateIdentifier(index, { key: event.target.value })}
      />
      <label className="mb-0" htmlFor={`keyInput${index}`}><small>Key</small></label>
    </React.Fragment>
  )
}

KeyInput.propTypes = {
  index: PropTypes.integer,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default KeyInput
