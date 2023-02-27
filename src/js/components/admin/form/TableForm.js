import React, { Component } from "react"
import PropTypes from 'prop-types';

import HeaderInput from './table/HeaderInput'
import TableColumn from './TableColumn'

class TableForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, inputColumns, options, updateTable, updateHeader, addOperation, updateOperation, removeOperation } = this.props

    return (
      <div>
        <div>
          <label>Table header</label>
        </div>

        {
          Object.keys(options).map((optionKey, index) => (
            <HeaderInput key={index} optionKey={optionKey} value={table.header[optionKey]} values={options[optionKey]} updateHeader={updateHeader} />
          ))
        }

        <div>
          <label>Table columns</label>
        </div>

        <TableColumn table={table.table} label="Which column should be used as x-values?"
                     columnKey="xColumn" operationsKey="xOperations" inputColumns={inputColumns} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
        <TableColumn table={table.table} label="Which column should be used as y-values?"
                     columnKey="yColumn" operationsKey="yOperations" inputColumns={inputColumns} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }

}

TableForm.propTypes = {
  table: PropTypes.object,
  inputColumns: PropTypes.array,
  options: PropTypes.object,
  updateTable: PropTypes.func,
  updateHeader: PropTypes.func,
  addOperation: PropTypes.func,
  updateOperation: PropTypes.func,
  removeOperation: PropTypes.func
}

export default TableForm
