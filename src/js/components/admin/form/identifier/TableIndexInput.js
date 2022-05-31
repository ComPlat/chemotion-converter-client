import React, { Component } from "react"
import PropTypes from 'prop-types';

const TableIndexInput = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="number"
        id={`tableIndexInput${index}`}
        className="form-control form-control-sm"
        value={identifier.tableIndex || ''}
        onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}
      />
      <label className="mb-0" htmlFor={`tableIndexInput${index}`}><small>Input table</small></label>
    </React.Fragment>
  )
}

TableIndexInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default TableIndexInput
