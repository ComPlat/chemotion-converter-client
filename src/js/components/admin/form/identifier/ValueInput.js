import React, { Component } from "react"
import PropTypes from 'prop-types';

const ValueInput = ({ index, identifier, updateIdentifier, disabled }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`valueInput${index}`}
        className="form-control input-sm"
        value={identifier.value || ''}
        onChange={(event) => updateIdentifier(index, { value: event.target.value })}
        disabled={disabled}
      />
      <label className="mb-0" htmlFor={`valueInput${index}`}><small>Value</small></label>
    </React.Fragment>
  )
}

ValueInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  disabled: PropTypes.bool
}

export default ValueInput
