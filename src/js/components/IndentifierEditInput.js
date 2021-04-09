import React, { Component } from "react"

class IndentifierEditInput extends Component {

  constructor(props) {
    super(props)

    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.updateValue = this.updateValue.bind(this)
    this.toogleIsRegex = this.toogleIsRegex.bind(this)
  }

  updateValue(event) {
    let value = event.target.value
    let data = {
      value: value
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  toogleIsRegex(event) {
    let data = {}
    let isRegex = !this.props.isRegex
    data['isRegex'] = isRegex
    this.props.updateIdentifiers(this.props.id, data)
  }

  removeIdentifier() {
    this.props.removeIdentifier(this.props.id)
  }

  render() {
    return (
      <form>
        {this.props.type == 'metadata' &&
          <div className="form-row align-items-center">
            <div className="col-lg-2 mb-2">
              <label className="sr-only" htmlFor={"metadataKeySelect" + this.props.id}>Metadata</label>
              <input
                readOnly
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
              <div className="form-check">
                <input className="form-check-input"
                  type="checkbox" name="identifierInterpretOptions"
                  id={"isRegex" + this.props.id}
                  value="regex"
                  onChange={this.toogleIsRegex} checked={this.props.isRegex}
                />
                <label className="form-check-label" htmlFor={"isRegex" + this.props.id}>RegExp</label>
              </div>
            </div>
            <div className="col-lg-2 mb-2">
              <button type="button" className="btn btn-danger btn-sm btn-block" onClick={this.removeIdentifier}>Remove</button>
            </div>
          </div>
        }

        {this.props.type == 'metadata' &&
          <div className="form-row align-items-center"></div>
        }
      </form>
    )
  }
}

export default IndentifierEditInput