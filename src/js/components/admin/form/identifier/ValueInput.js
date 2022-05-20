import React, { Component } from "react"

const ValueInput = ({ index, identifier, updateIdentifier, disabled }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`valueInput${index}`}
        className="form-control form-control-sm"
        value={identifier.value || ''}
        onChange={(event) => updateIdentifier(index, { value: event.target.value })}
        disabled={disabled}
      />
      <label className="mb-0" htmlFor={`valueInput${index}`}><small>Value</small></label>
    </React.Fragment>
  )
}

export default ValueInput
