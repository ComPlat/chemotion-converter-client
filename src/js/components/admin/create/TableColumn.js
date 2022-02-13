import React, { Component } from "react"

import ColumnSelect from '../common/ColumnSelect'
import OperatorSelect from '../common/OperatorSelect'


class TableColumn extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { table, label, columnKey, operationsKey, columnList, updateTable,
                      addOperation, updateOperation, removeOperation } = this.props

    return (
      <React.Fragment>
        <div className="form-group">
          <label>{label}</label>
          <ColumnSelect column={table[columnKey]}
                        columnList={columnList}
                        onChange={column => updateTable(columnKey, column)} />
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
                  <ColumnSelect column={operation.column}
                                columnList={columnList}
                                onChange={column => updateOperation(operationsKey, index, 'column', column)} />
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
              <div className="col-sm-2">
                <button type="button" className="btn btn-danger btn-sm" onClick={event => removeOperation(operationsKey, index)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        }
        <div className="mb-3">
          <button type="button" className="btn btn-success btn-sm mr-2" onClick={event => addOperation(operationsKey, 'column')}>
            Add column operation
          </button>
          <button type="button" className="btn btn-success btn-sm" onClick={event => addOperation(operationsKey, 'value')}>
            Add scalar operation
          </button>
        </div>
      </React.Fragment>
    )
  }
}

export default TableColumn