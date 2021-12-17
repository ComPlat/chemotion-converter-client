import React, { Component } from "react"

class TableForm extends Component {

  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(key, value) {
    if (value == 'default') {
      this.props.onChange(key, false)
    } else {
      this.props.onChange(key, this.props.columnList[value].value)
    }
  }

  render() {
    return (
      <div>
        <div>
          <label>Table columns</label>
        </div>

        <div className="form-group">
          <label htmlFor="x_column">Which column should be used as x-values?</label>
          <select className="form-control form-control-sm" id="x_column" onChange={event => this.handleChange('xColumn', event.target.value)}>
            <option value='default' >-----------</option>
            {this.props.columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="y_column">Which column should be used as y-values?</label>
          <select className="form-control form-control-sm" id="y_column" onChange={event => this.handleChange('yColumn', event.target.value)}>
            <option value='default' >-----------</option>
            {this.props.columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }
}

export default TableForm
