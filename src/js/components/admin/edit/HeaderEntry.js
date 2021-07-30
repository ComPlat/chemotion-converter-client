import React, { Component } from "react"

class HeaderEntry extends Component {

  constructor(props) {
    super(props)
    this.updateHeaderValue = this.updateHeaderValue.bind(this)
  }

  updateHeaderValue (event) {
    let value = event.currentTarget.value
    this.props.updateHeaderValue(this.props.name, value)
  }

  render() {
    return (
      <div className="form-row align-items-center">
        <div className="col-lg-2 mb-2">
          <input
            readOnly
            type="text"
            className="form-control form-control-sm"
            value={this.props.name}
          />
        </div>
        <div className="col-lg-10 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            onChange={this.updateHeaderValue}
            value={this.props.value}
          />
        </div>
      </div>
    )
  }

}

export default HeaderEntry
