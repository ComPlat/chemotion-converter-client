import React, { Component } from "react"

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
          Object.keys(options).map((option, index) => (
            <HeaderInput key={index} option={option} value={table.header[option]} values={options[option]} updateHeader={updateHeader} />
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

export default TableForm
