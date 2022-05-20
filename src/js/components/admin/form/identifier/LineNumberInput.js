import React, { Component } from "react"

const LineNumberInput = ({ index, identifier, updateIdentifier }) => {

  const updateLineNumber = (value) => {
    if (value) {
      updateIdentifier(index, {
        lineNumber: parseInt(event.target.value, 10)
      })
    } else {
      updateIdentifier(index, {
        lineNumber: null
      })
    }
  }

  return (
    <React.Fragment>
      <input
        type="text"
        id={`lineNumberInput${index}`}
        className="form-control form-control-sm"
        value={identifier.lineNumber || ''}
        onChange={(event) => updateLineNumber(event.target.value)}
      />
      <label className="mb-0" htmlFor={`lineNumberInput${index}`}><small>Line</small></label>
    </React.Fragment>
  )
}

export default LineNumberInput