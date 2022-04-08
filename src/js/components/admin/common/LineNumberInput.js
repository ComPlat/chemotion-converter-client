import React, { Component } from "react"

const LineNumberInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="text"
        id={`lineNumberInput${index}`}
        className="form-control form-control-sm"
        value={identifier.lineNumber}
        onChange={(event) => updateIdentifier(index, { lineNumber: parseInt(event.target.value, 10) })}
      />
      <label className="mb-0" htmlFor={`lineNumberInput${index}`}><small>Line</small></label>
    </React.Fragment>
  )
}

export default LineNumberInput
