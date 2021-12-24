import React, { Component } from "react"

import TableColumn from './TableColumn'

class TableForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, columnList, updateTable, addOperation, updateOperation, removeOperation } = this.props

    return (
      <div>
        <div>
          <label>Table columns</label>
        </div>

        <TableColumn table={table} label="Which column should be used as x-values?"
                     columnKey="xColumn" operationsKey="xOperations" columnList={columnList} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
        <TableColumn table={table} label="Which column should be used as y-values?"
                     columnKey="yColumn" operationsKey="yOperations" columnList={columnList} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }
}

export default TableForm
