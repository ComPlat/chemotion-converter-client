import React, { Component } from "react"

import ColumnInput from './table/ColumnInput'
import ColumnSelect from './table/ColumnSelect'
import OperatorSelect from './table/OperatorSelect'


class TableColumn extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, label, columnKey, operationsKey, inputColumns, updateTable,
                      addOperation, updateOperation, removeOperation } = this.props

    return (
      <React.Fragment>
        <div className="form-group">
          <label>{label}</label>
          {
            inputColumns.length > 0 ? <ColumnSelect column={table[columnKey]}
                                                    columnList={inputColumns}
                                                    onChange={column => updateTable(columnKey, column)} />
                                    : <ColumnInput column={table[columnKey]}
                                                   onChange={column => updateTable(columnKey, column)} />
          }
        </div>
        {
          table[operationsKey] && table[operationsKey].map((operation, index) => (
            <div key={index} className="form-group row">
              <div className="col-sm-2">
                <OperatorSelect value={operation.operator}
                                onChange={value => updateOperation(operationsKey, index, 'operator', value)} />
              </div>
              {
                operation.type == 'column' &&
                <div className="col-sm-8">
                  {
                    inputColumns.length > 0 ? <ColumnSelect column={table[columnKey]}
                                                            columnList={inputColumns}
                                                            onChange={column => updateOperation(operationsKey, index, 'column', column)} />
                                            : <ColumnInput column={operation.column}
                                                           onChange={column => updateOperation(operationsKey, index, 'column', column)} />
                  }
                </div>
              }
              {
                operation.type == 'value' &&
                <div className="col-sm-8">
                  <input type="text" className="form-control form-control-sm" value={operation.value || ''}
                         onChange={event => updateOperation(operationsKey, index, 'value', event.target.value)}
                  />
                </div>
              }
              <div className="col-sm-2 text-right">
                <button type="button" className="btn btn-danger" onClick={event => removeOperation(operationsKey, index)}>
                  &times;
                </button>
              </div>
            </div>
          ))
        }
        <div className="mb-20">
          <button type="button" className="btn btn-success btn-xs mr-10" onClick={event => addOperation(operationsKey, 'column')}>
            Add column operation
          </button>
          <button type="button" className="btn btn-success btn-xs" onClick={event => addOperation(operationsKey, 'value')}>
            Add scalar operation
          </button>
        </div>
      </React.Fragment>
    )
  }

}

export default TableColumn
