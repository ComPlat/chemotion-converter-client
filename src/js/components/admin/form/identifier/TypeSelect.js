import React, { Component } from "react"
import PropTypes from 'prop-types';

const TypeSelect = ({ index, identifier, updateIdentifier }) => {
  return (
    <select className="form-control input-sm" value={identifier.type}
            onChange={(event) => updateIdentifier(index, { type: event.target.value })}>
      <option value="fileMetadata">Based on file metadata</option>
      <option value="tableMetadata">Based on table metadata</option>
      <option value="tableHeader">Based on table headers</option>
    </select>
  )
}

TypeSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default TypeSelect
