import React, { Component } from "react"

import TableInput from './TableInput'

class TableForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <div>
          <label>Table columns</label>
        </div>
        <TableInput
          name={'xColumn'}
          tableIndex={this.props.table.xColumn ? this.props.table.xColumn.tableIndex : ''}
          columnIndex={this.props.table.xColumn ? this.props.table.xColumn.columnIndex : ''}
          onChange={this.props.onChange}
        />
        <TableInput
          name={'yColumn'}
          tableIndex={this.props.table.yColumn ? this.props.table.yColumn.tableIndex : ''}
          columnIndex={this.props.table.yColumn ? this.props.table.yColumn.columnIndex : ''}
          onChange={this.props.onChange}
        />
        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }
}

export default TableForm
