import React, { Component } from "react"

class RuleEntry extends Component {

  constructor(props) {
    super(props)
    this.updateTableIndex = this.updateTableIndex.bind(this)
    this.updateColumnIndex = this.updateColumnIndex.bind(this)
  }

  updateTableIndex (event) {
    let value = event.currentTarget.value
    this.props.updateRule(this.props.name, value, this.props.columnIndex)
  }

  updateColumnIndex (event) {
    let value = event.currentTarget.value
    this.props.updateRule(this.props.name, this.props.tableIndex, value)
  }

  render() {
    return (
      <div className="form-row">
        <div className="col-lg-2 mb-2">
          <input
            readOnly
            type="text"
            className="form-control form-control-sm"
            value={this.props.title}
          />
        </div>
        <div className="col-lg-2 mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={this.updateTableIndex}
            value={this.props.tableIndex}
          />
          <label><small>Table Index</small></label>
        </div>
        <div className="col-lg-2 mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={this.updateColumnIndex}
            value={this.props.columnIndex}
          />
          <label><small>Column Index</small></label>
        </div>
      </div>
    )
  }

}

export default RuleEntry