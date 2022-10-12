import React, { Component } from "react"
import PropTypes from 'prop-types';

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
        className="form-control input-sm"
        value={identifier.lineNumber || ''}
        onChange={(event) => updateLineNumber(event.target.value)}
      />
      <label className="mb-0" htmlFor={`lineNumberInput${index}`}><small>Line</small></label>
    </React.Fragment>
  )
}

LineNumberInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default LineNumberInput
