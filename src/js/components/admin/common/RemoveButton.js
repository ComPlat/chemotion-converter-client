import React, { Component } from "react"

const RemoveButton = ({ index, removeIdentifier }) => {
  return (
    <React.Fragment>
      <button type="button" className="btn btn-danger btn-sm btn-block"
              onClick={() => removeIdentifier(index)}>Remove</button>
      <small>&nbsp;</small>
    </React.Fragment>
  )
}

export default RemoveButton
