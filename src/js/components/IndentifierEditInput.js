import React, { Component } from "react"

class IndentifierEditInput extends Component {

  constructor(props) {
      super(props)

      this.removeIdentifier = this.removeIdentifier.bind(this)
      this.updateValue = this.updateValue.bind(this)
  }

  updateValue (event) {
    let value = event.target.value
    let data = {
      value: value
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  removeIdentifier() {
      this.props.removeIdentifier(this.props.id)
  }

  render () {
      return (
          <form>
              {this.props.type == 'metadata' &&
              <div className="form-row align-items-center">
                  <div className="col-lg-2 mb-2">
                      <label className="sr-only" htmlFor={"metadataKeySelect" + this.props.id}>Metadata</label>
                      <input
                          type="text"
                          className="form-control form-control-sm"
                          value={this.props.metadataKey}
                      />
                  </div>
                  <div className="col-lg-6 mb-2">
                      <label className="sr-only" htmlFor={"metadataKeySelect" + this.props.id}>Metadata</label>
                      <input
                          type="text"
                          onChange={this.updateValue}
                          className="form-control form-control-sm"
                          value={this.props.value}
                      />
                  </div>
                  <div className="col-lg-2 mb-2">
                      <button type="button" className="btn btn-danger btn-sm btn-block" onClick={this.removeIdentifier}>Remove</button>
                  </div>
              </div>
              }
          </form>
      )
  }
}

export default IndentifierEditInput