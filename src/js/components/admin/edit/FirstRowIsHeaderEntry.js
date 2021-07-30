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
    const htmlId = 'first-row-is-header-' + this.props.index;
    return (
      <div className="form-row">
        <div className="col-lg-2">
          <div className="mb-2 form-check">
            <input type="checkbox" id={htmlId} className="form-check-input"
                   onChange={this.handleChangeChecked} defaultChecked={this.props.checked} />
            <label className="form-check-label" htmlFor={htmlId}>{this.props.title}</label>
          </div>
        </div>
      </div>
    )
  }

}

export default FirstRowIsHeaderEntry