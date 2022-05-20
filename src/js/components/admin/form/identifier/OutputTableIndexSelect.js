import React, { Component } from "react"

const OutputTableIndexSelect = ({ index, identifier, tables, updateIdentifier }) => {
  return (
    <React.Fragment>
      <select className="form-control form-control-sm" id={`outputTableIndexSelect${index}`}
              value={identifier.outputTableIndex}
              onChange={(event) => updateIdentifier(index, { outputTableIndex: parseInt(event.target.value, 10) })}>
        <option value="">---</option>
        {
          tables.map((outputTable, outputTableIndex) => (
            <option key={outputTableIndex} value={outputTableIndex}>Output table #{outputTableIndex}</option>
          ))
        }
      </select>
      <label className="mb-0" htmlFor={`outputTableIndexSelect${index}`}><small>Output table</small></label>
    </React.Fragment>
  )
}

export default OutputTableIndexSelect
