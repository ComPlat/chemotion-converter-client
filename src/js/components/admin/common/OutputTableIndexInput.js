import React, { Component } from "react"

const OutputTableIndexInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="number"
        id={`outputTableIndexInput${index}`}
        className="form-control form-control-sm"
        value={identifier.outputTableIndex}
        onChange={(event) => updateIdentifier(index, { outputTableIndex: parseInt(event.target.value, 10) })}
      />
      <label className="mb-0" htmlFor={`outputTableIndexInput${index}`}><small>Output table</small></label>
    </React.Fragment>
  )
}

export default OutputTableIndexInput
