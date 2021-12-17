import React, { Component } from "react"

class IndentifierInput extends Component {

  constructor(props) {
    super(props)

    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.updateValue = this.updateValue.bind(this)
    this.toogleIsRegex = this.toogleIsRegex.bind(this)
    this.updateLinenumber = this.updateLinenumber.bind(this)
    this.updateHeaderKey = this.updateHeaderKey.bind(this)
    this.updateMetadataKey = this.updateMetadataKey.bind(this)
    this.updateTableIndex = this.updateTableIndex.bind(this)
  }

  updateValue(event) {
    let value = event.target.value
    let data = {
      value: value
    }
    this.props.updateIdentifier(this.props.id, data)
  }

  updateLinenumber (event) {
    let lineNumber = event.target.value
    let data = {
      lineNumber: lineNumber
    }
    this.props.updateIdentifier(this.props.id, data)
  }

  toogleIsRegex(event) {
    let data = {}
    let isRegex = !this.props.isRegex
    data['isRegex'] = isRegex
    this.props.updateIdentifier(this.props.id, data)
  }

  removeIdentifier() {
    this.props.removeIdentifier(this.props.id)
  }

  updateHeaderKey (event) {
    let value = event.target.value
    let data = {
      headerKey: value
    }
    this.props.updateIdentifier(this.props.id, data)
  }

  updateMetadataKey (event) {
    let value = event.target.value
    let data = {
      metadataKey: value
    }
    this.props.updateIdentifier(this.props.id, data)
  }

  updateTableIndex (event) {
    let value = event.target.value
    let data = {
      tableIndex: value
    }
    this.props.updateIdentifier(this.props.id, data)
  }

  render() {
    return (
      <form>
        {this.props.type == 'metadata' &&
          <div className="form-row">
            <div className="col-lg-2 mb-2">
              <input
                onChange={this.updateMetadataKey}
                className="form-control form-control-sm"
                value={this.props.metadataKey}
              />
              <label className="mb-0"><small>Key</small></label>
            </div>
            <div className="col-lg-6 mb-2">
              <input
                type="text"
                onChange={this.updateValue}
                className="form-control form-control-sm"
                value={this.props.value}
              />
              <label className="mb-0"><small>Value</small></label>
            </div>
            <div className="col-lg-2 mt-1 mb-2">
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

        {this.props.type == 'table' &&
          <div className="form-row">
            <div className="col-lg-2 mb-2">
              <input
                onChange={this.updateTableIndex}
                className="form-control form-control-sm"
                value={this.props.tableIndex}
              />
              <label className="mb-0"><small>Table Index</small></label>
            </div>

            <div className="col-lg-2 mb-2">
              <input
                onChange={this.updateLinenumber}
                type="text"
                placeholder="Line number"
                className="form-control form-control-sm"
                value={this.props.lineNumber}
              />
              <label className="mb-0"><small>Line number</small></label>
            </div>

            <div className='col-lg-2 mb-2'>
              <input
                onChange={this.updateValue}
                type="text"
                placeholder="Value"
                className="form-control form-control-sm"
                disabled={this.props.type === 'metadata' && !this.props.isRegex}
                value={this.props.value}
              />
              <label className="mb-0"><small>Value</small></label>
            </div>

            <div className="col-lg-2 mt-1 mb-2">
              <div className="form-check">
                <input className="form-check-input"
                  type="checkbox" name="identifierInterpretOptions"
                  id={"isRegex" + this.props.id}
                  value="RegExp"
                  onChange={this.toogleIsRegex} checked={this.props.isRegex}
                />
                <label className="form-check-label" htmlFor={"isRegex" + this.props.id}>RegExp</label>
              </div>
            </div>

            <div className="col-lg-2 mb-2">
              <input
                onChange={this.updateHeaderKey}
                type="text"
                placeholder="Header key"
                className="form-control form-control-sm"
                value={this.props.headerKey}
              />
              <label className="mb-0"><small>Header key</small></label>
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

export default IndentifierInput