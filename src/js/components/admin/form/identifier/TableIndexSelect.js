import React, { Component } from "react"
import PropTypes from 'prop-types';

const TableIndexSelect = ({ index, identifier, tables, updateIdentifier }) => {
  return (
    <React.Fragment>
      <select className="form-control input-sm" id={`tableIndexSelect${index}`}
              onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}>
        {
          tables.map((table, tableIndex) => <option key={tableIndex} value={tableIndex}>Input table #{tableIndex}</option>)
        }
      </select>
      <label className="mb-0" htmlFor={`tableIndexSelect${index}`}><small>Input table</small></label>
    </React.Fragment>
  )
}

TableIndexSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  tables: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default TableIndexSelect
