import React, { Component } from "react"

import TableColumn from './TableColumn'

class TableForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, columnList, headerOptions, updateTable, updateHeader, addOperation, updateOperation, removeOperation } = this.props

    return (
      <div>
        <div>
          <label>Table header</label>
        </div>
        {
          Object.keys(headerOptions).map((option, index) => {
            return (
              <div key={index} className="form-group row">
                <label htmlFor={option} className="col-sm-4 col-form-label">{option}</label>
                <div className="col-sm-8">
                  <select className="form-control form-control-sm" id={option} value={table.header[option]}
                          onChange={e => updateHeader(option, e.target.value)}>
                    {
                      headerOptions[option].map((select, selectIndex) => {
                        return <option value={select} key={selectIndex}>{select}</option>
                      })
                    }
                  </select>
                </div>
              </div>
            )
          }
        )}

        <div>
          <label>Table columns</label>
        </div>

        <TableColumn table={table.table} label="Which column should be used as x-values?"
                     columnKey="xColumn" operationsKey="xOperations" columnList={columnList} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
        <TableColumn table={table.table} label="Which column should be used as y-values?"
                     columnKey="yColumn" operationsKey="yOperations" columnList={columnList} updateTable={updateTable}
                     addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }

}

export default TableForm
