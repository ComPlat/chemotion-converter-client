import React, { Component } from "react"
import PropTypes from 'prop-types';

const OutputTableIndexSelect = ({ index, identifier, tables, updateIdentifier }) => {
  return (
    <React.Fragment>
      <select className="form-control input-sm" id={`outputTableIndexSelect${index}`}
              value={identifier.outputTableIndex === null ? '' : identifier.outputTableIndex}
              onChange={(event) => updateIdentifier(index, { outputTableIndex: parseInt(event.target.value, 10) })}>
        <option value="">Add to all output tables</option>
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

OutputTableIndexSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  tables: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default OutputTableIndexSelect
