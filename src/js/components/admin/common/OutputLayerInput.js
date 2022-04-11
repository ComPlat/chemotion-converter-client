import React, { Component } from "react"

const OutputLayerInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <label className="sr-only" htmlFor={`outputLayerInput${index}`}>Output layer</label>
      <input
        type="text"
        id={`outputLayerInput${index}`}
        className="form-control form-control-sm"
        value={identifier.outputLayer}
        onChange={(event) => updateIdentifier(index, { outputLayer: event.target.value })}
      />
      <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output layer</small></label>
    </React.Fragment>
  )
}

export default OutputLayerInput
