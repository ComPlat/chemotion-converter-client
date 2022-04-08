import React, { Component } from "react"

const TableIndexSelect = ({ index, identifier, updateIdentifier }) => {
  return (
    <React.Fragment>
      <input
        type="number"
        id={`tableIndexInput${index}`}
        className="form-control form-control-sm"
        value={identifier.tableIndex}
        onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}
      />
      <label className="mb-0" htmlFor={`tableIndexInput${index}`}><small>Input table</small></label>
    </React.Fragment>
  )
}

export default TableIndexSelect
