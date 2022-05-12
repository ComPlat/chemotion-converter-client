import React, { Component } from "react"

const RemoveButton = ({ index, removeIdentifier }) => {
  return (
    <div className="text-right">
      <button type="button" className="btn btn-danger"
              onClick={() => removeIdentifier(index)}>&times;</button>
      <small>&nbsp;</small>
    </div>
  )
}

export default RemoveButton
