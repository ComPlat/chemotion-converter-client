import React, { Component } from "react"

class FirstRowIsHeaderEntry extends Component {

  constructor(props) {
    super(props)
    this.handleChangeChecked = this.handleChangeChecked.bind(this)
  }

  handleChangeChecked() {
    let checked = !this.props.checked
    let index = this.props.index
    this.props.updateFirstRowIsHeaderValue(index, checked)
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
          <div className="mb-3 form-check">
            <input type="checkbox" onChange={this.handleChangeChecked} defaultChecked={this.props.checked} className="form-check-input" />
            <label className="form-check-label">First Row is Header</label>
          </div>
        </div>
      </div>
    )
  }

}

export default FirstRowIsHeaderEntry