import React, { Component } from "react"

import OperatorSelect from '../common/OperatorSelect'

class TableColumn extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, label, columnKey, operationsKey, updateTable,
            addOperation, updateOperation, removeOperation } = this.props
    return (
      <div>
        <label className="mb-2">{label}</label>
        <div className="form-group form-row">
          <div className="col-lg-6">
            <input
              type="number"
              className="form-control form-control-sm"
              onChange={event => updateTable(columnKey, {
                tableIndex: event.target.value,
                columnIndex: table[columnKey].columnIndex
              })}
              value={table[columnKey].tableIndex}
            />
            <small>Table Index</small>
          </div>
          <div className="col-lg-6">
            <input
              type="number"
              className="form-control form-control-sm"
              onChange={event => updateTable(columnKey, {
                tableIndex: table[columnKey].tableIndex,
                columnIndex: event.target.value
              })}
              value={table[columnKey].columnIndex}
            />
            <small>Column Index</small>
          </div>
        </div>
        {
          table[operationsKey] && table[operationsKey].map((operation, index) => (
            <div key={index} className="form-group form-row">
              <div className="col-sm-2">
                <OperatorSelect value={operation.operator}
                                onChange={value => updateOperation(operationsKey, index, 'operator', value)} />
              </div>
              {
                operation.type == 'column' &&
                <div className="col-sm-8">
                  <div className="form-row">
                    <div className="col-sm-6 mb-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        onChange={event => updateOperation(operationsKey, index, 'column', {
                          tableIndex: event.target.value,
                          columnIndex: operation.column.columnIndex
                        })}
                        value={operation.column.tableIndex || ''}
                      />
                      <small>Table Index</small>
                    </div>
                    <div className="col-sm-6 mb-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        onChange={event => updateOperation(operationsKey, index, 'column', {
                          tableIndex: operation.column.tableIndex,
                          columnIndex: event.target.value
                        })}
                        value={operation.column.columnIndex || ''}
                      />
                      <small>Column Index</small>
                    </div>
                  </div>
                </div>
              }
              {
                operation.type == 'value' &&
                <div className="col-sm-8">
                  <input type="text" className="form-control form-control-sm" value={operation.value || ''}
                         onChange={event => updateOperation(operationsKey, index, 'value', event.target.value)}
                  />
                  <small>Scalar value</small>
                </div>
              }
              <div className="col-sm-2">
                <button type="button" className="btn btn-danger btn-sm btn-block" onClick={event => removeOperation(operationsKey, index)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        }
        <div className="mb-2">
          <button type="button" className="btn btn-success btn-sm mr-2" onClick={event => addOperation(operationsKey, 'column')}>
            Add column operation
          </button>
          <button type="button" className="btn btn-success btn-sm" onClick={event => addOperation(operationsKey, 'value')}>
            Add scalar operation
          </button>
        </div>
      </div>
    )
  }
}

export default TableColumn
