import React, { Component } from "react"

const KeyInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`keyInput${index}`}
        className="form-control form-control-sm"
        value={identifier.key}
        onChange={(event) => updateIdentifier(index, { key: event.target.value })}
      />
      <label className="mb-0" htmlFor={`keyInput${index}`}><small>Key</small></label>
    </React.Fragment>
  )
}

export default KeyInput
