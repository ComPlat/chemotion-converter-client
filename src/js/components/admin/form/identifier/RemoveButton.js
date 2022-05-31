import React, { Component } from "react"
import PropTypes from 'prop-types';

const RemoveButton = ({ index, removeIdentifier }) => {
  return (
    <div className="text-right">
      <button type="button" className="btn btn-danger"
              onClick={() => removeIdentifier(index)}>&times;</button>
      <small>&nbsp;</small>
    </div>
  )
}

RemoveButton.propTypes = {
  index: PropTypes.number,
  removeIdentifier: PropTypes.func
}

export default RemoveButton
