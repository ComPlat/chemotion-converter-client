import React, { Component } from "react"

class TableInput extends Component {

  constructor(props) {
    super(props)
    this.updateTableIndex = this.updateTableIndex.bind(this)
    this.updateColumnIndex = this.updateColumnIndex.bind(this)
  }

  updateTableIndex(event) {
    const value = event.currentTarget.value
    this.props.onChange(this.props.name, {
        tableIndex: value,
        columnIndex: this.props.columnIndex
    })
  }

  updateColumnIndex(event) {
    const value = event.currentTarget.value
    this.props.onChange(this.props.name, {
        tableIndex: this.props.tableIndex,
        columnIndex: value
    })
  }

  render() {
    return (
      <div className="form-row">
        <div className="col-lg-2 mb-2">
          <input
            readOnly
            type="text"
            className="form-control form-control-sm"
            value={this.props.name}
          />
        </div>
        <div className="col-lg-2 mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={this.updateTableIndex}
            value={this.props.tableIndex}
          />
          <label className="mb-0"><small>Table Index</small></label>
        </div>
        <div className="col-lg-2 mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={this.updateColumnIndex}
            value={this.props.columnIndex}
          />
          <label className="mb-0"><small>Column Index</small></label>
        </div>
      </div>
    )
  }
}

export default TableInput
