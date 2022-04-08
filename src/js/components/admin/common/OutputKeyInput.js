import React, { Component } from "react"

const OutputKeyInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`outputKeyInput${index}`}
        className="form-control form-control-sm"
        value={identifier.outputKey}
        onChange={(event) => updateIdentifier(index, { outputKey: event.target.value })}
      />
      <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output key</small></label>
    </React.Fragment>
  )
}

export default OutputKeyInput
