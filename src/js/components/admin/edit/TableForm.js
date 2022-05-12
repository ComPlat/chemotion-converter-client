import React, { Component } from "react"

import TableColumn from './TableColumn'

class TableForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, updateTable, addOperation, updateOperation, removeOperation } = this.props

    return (
      <div>
        <div>
          <label>Table columns</label>
        </div>
        <div className="row">
          <div className="col-md-6 mb-10">
            <TableColumn table={table} label="x-values"
                         columnKey="xColumn" operationsKey="xOperations" updateTable={updateTable}
                         addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
          </div>
          <div className="col-md-6 mb-10">
            <TableColumn table={table} label="y-values"
                         columnKey="yColumn" operationsKey="yOperations" updateTable={updateTable}
                         addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
          </div>
        </div>
        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }
}

export default TableForm
