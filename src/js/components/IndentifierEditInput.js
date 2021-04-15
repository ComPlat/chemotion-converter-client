import React, { Component } from "react"

class IndentifierEditInput extends Component {

  constructor(props) {
    super(props)

    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.updateValue = this.updateValue.bind(this)
    this.toogleIsRegex = this.toogleIsRegex.bind(this)
    this.updateLinenumber = this.updateLinenumber.bind(this)
    this.updateHeaderKey = this.updateHeaderKey.bind(this)
  }

  updateValue(event) {
    let value = event.target.value
    let data = {
      value: value
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  updateLinenumber (event) {
    let lineNumber = event.target.value
    let data = {
      lineNumber: lineNumber
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

  updateHeaderKey (event) {
    let value = event.target.value
    let data = {
      headerKey: value
    }
    this.props.updateIdentifiers(this.props.id, data)
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

        {this.props.type == 'table' &&
          <div className="form-row align-items-center">
            <div className="col-lg-2 mb-2">
              <label className="sr-only">Metadata</label>
              <input
                readOnly
                className="form-control form-control-sm"
                value={"Table #" + this.props.tableIndex + 1}
              />
            </div>

            <div className="col-lg-2 mb-2">
              <label className="sr-only" htmlFor={"tabledataLineSelect" + this.props.id}>Line</label>
              <input
                onChange={this.updateLinenumber}
                type="text"
                placeholder={'# line'}
                className="form-control form-control-sm"
                id={"tabledataLineSelect" + this.props.id}
                value={this.props.lineNumber}
              />
            </div>

            <div className='col-lg-2 mb-2'>
              <label className="sr-only" htmlFor={"identifierValue" + this.props.id}>value</label>
              <div className="input-group">
                <input
                  onChange={this.updateValue}
                  type="text"
                  placeholder={'Value'}
                  className="form-control form-control-sm"
                  id={"identifierValue" + this.props.id}
                  disabled={this.props.type === 'metadata' && !this.props.isRegex}
                  value={this.props.value}
                />
              </div>
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
              <label className="sr-only" htmlFor={"identifierHeaderKey" + this.props.id}>Headerkey</label>
              <div className="input-group">
                <input
                  onChange={this.updateHeaderKey}
                  type="text"
                  placeholder={'Header key'}
                  className="form-control form-control-sm"
                  id={"identifierHeaderKey" + this.props.id}
                  value={this.props.headerKey}
                />
              </div>
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