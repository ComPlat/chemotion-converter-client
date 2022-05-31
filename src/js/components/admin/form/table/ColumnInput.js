import React, { Component } from "react"
import PropTypes from 'prop-types';

const ColumnInput = ({ column, onChange }) => {
  // a column list is not available
  const getIndex = (column, key) => {
    if (column !== undefined && typeof column[key] == 'number' && !isNaN(column[key])) {
      return column[key]
    } else {
      return null
    }
  }

  const getValue = (column, key) => {
    const index = getIndex(column, key)
    return index === null ? '' : index
  }

  return (
    <div className="row">
      <div className="col-md-6">
        <input
          type="number"
          className="form-control form-control-sm"
          onChange={event => onChange({
            tableIndex: parseInt(event.target.value),
            columnIndex: getIndex(column, 'columnIndex')
          })}
          value={getValue(column, 'tableIndex')}
        />
        <small>Table Index</small>
      </div>
      <div className="col-md-6">
        <input
          type="number"
          className="form-control form-control-sm"
          onChange={event => onChange({
            tableIndex: getIndex(column, 'tableIndex'),
            columnIndex: parseInt(event.target.value)
          })}
          value={getValue(column, 'columnIndex')}
        />
        <small>Column Index</small>
      </div>
    </div>
  )
}

ColumnInput.propTypes = {
  column: PropTypes.object,
  onChange: PropTypes.func
}

export default ColumnInput
