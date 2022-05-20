import React, { Component } from "react"

const RegexCheckbox = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <div className="checkbox">
        <label htmlFor={`regexInput${index}`}>
          <input
            type="checkbox"
            id={`regexInput${index}`}
            checked={identifier.isRegex}
            onChange={(event) => updateIdentifier(index, { isRegex: !identifier.isRegex })}
          />
          RegEx
        </label>
      </div>
      <small>&nbsp;</small>
    </React.Fragment>
  )
}

export default RegexCheckbox
