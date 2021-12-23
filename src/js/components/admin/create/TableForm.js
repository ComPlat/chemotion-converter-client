import React, { Component } from "react"


const ColumnSelect = ({ column, columnList, onChange }) => {
  let value = false
  if (column) {
    value = columnList.reduce((agg, cur, idx) => {
      if (cur.value.tableIndex == column.tableIndex &&
          cur.value.columnIndex == column.columnIndex) {
        return idx
      } else {
        return agg
      }
    }, value)
  }

  const handleChange = event => {
    const index = event.target.value
    if (index) {
      onChange(columnList[index].value)
    } else {
      onChange(false)
    }
  }

  return (
    <select className="form-control form-control-sm" value={value} onChange={handleChange}>
      <option value={null}>-----------</option>
      {
        columnList.map((item, index) => {
          return <option value={index} key={index}>{item.label}</option>
        })
      }
    </select>
  )
}

const OperatorSelect = ({ value, onChange }) => (
  <select className="form-control form-control-sm" value={value} onChange={event => onChange(event.target.value)}>
    <option value="+">+</option>
    <option value="-">-</option>
    <option value="*">*</option>
    <option value=":">:</option>
  </select>
)

const ColumnForm = ({ table, label, columnKey, operationsKey, columnList, updateTable,
                      addOperation, updateOperation, removeOperation }) => {
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
      <div className="">
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

        <ColumnForm table={table} label="Which column should be used as x-values?"
                    columnKey="xColumn" operationsKey="xOperations" columnList={columnList} updateTable={updateTable}
                    addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>
        <ColumnForm table={table} label="Which column should be used as y-values?"
                    columnKey="yColumn" operationsKey="yOperations" columnList={columnList} updateTable={updateTable}
                    addOperation={addOperation} updateOperation={updateOperation} removeOperation={removeOperation}/>

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }
}

export default TableForm
