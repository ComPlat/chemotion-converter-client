import React, { Component } from "react"

const TableIndexSelect = ({ index, identifier, tableData, updateIdentifier }) => {
  return (
    <React.Fragment>
      <select className="form-control form-control-sm" id={`tableIndexSelect${index}`}
              onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}>
        {
          tableData.tables.map((table, tableIndex) => <option key={tableIndex} value={tableIndex}>Input table #{tableIndex}</option>)
        }
      </select>
      <label className="mb-0" htmlFor={`tableIndexSelect${index}`}><small>Input table</small></label>
    </React.Fragment>
  )
}

export default TableIndexSelect
