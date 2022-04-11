import React, { Component } from "react"

const RegexCheckbox = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <div className="form-check">
        <input className="form-check-input"
          type="checkbox"
          id={`regexInput${index}`}
          checked={identifier.isRegex}
          onChange={(event) => updateIdentifier(index, { isRegex: !identifier.isRegex })}
        />
        <label className="form-check-label" htmlFor={`regexInput${index}`}>Regex</label>
      </div>
      <small>&nbsp;</small>
    </React.Fragment>
  )
}

export default RegexCheckbox
