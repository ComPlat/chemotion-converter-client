import React, { Component } from "react"
import IdentifierInput from './IdentifierInput'
import IndentifierEditInput from './IndentifierEditInput'

class IdentifierInputBox extends Component {

  constructor(props) {
    super(props)
    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.onAddIdentifier = this.onAddIdentifier.bind(this)
    this.updateIdentifiers = this.updateIdentifiers.bind(this)
  }

  onAddIdentifier() {
    this.props.addIdentifier(this.props.type)
  }

  updateIdentifiers(index, data) {
    this.props.updateIdentifiers(index, data)
  }

  removeIdentifier(index) {
    this.props.removeIdentifier(index)
  }

  render() {
    if (this.props.status == "create") {
      return (
        <div className="mb-4">
          {
            this.props.identifiers.map((identifier, i) => {
              if (identifier.type === this.props.type) {
                return <IdentifierInput
                  key={i}
                  id={i}
                  type={identifier.type}
                  tableIndex={identifier.tableIndex}
                  lineNumber={identifier.lineNumber}
                  metadataKey={identifier.metadataKey}
                  headerKey={identifier.headerKey}
                  value={identifier.value}
                  isRegex={identifier.isRegex}
                  options={this.props.data}
                  removeIdentifier={this.removeIdentifier}
                  updateIdentifiers={this.updateIdentifiers}
                />
              }
            }
            )
          }
          <form>
              <div className="form">
                <button type="button" className="btn btn-success btn-sm" onClick={this.onAddIdentifier}>Add Identifier</button>
              </div>
          </form>
        </div>
      )
    } else {
      return (
        <div className="mb-4">
          {
            this.props.identifiers.map((identifier, i) => {
              if (identifier.type === this.props.type) {
                return <IndentifierEditInput
                  key={i}
                  id={i}
                  type={identifier.type}
                  tableIndex={identifier.tableIndex}
                  lineNumber={identifier.lineNumber}
                  metadataKey={identifier.metadataKey}
                  headerKey={identifier.headerKey}
                  value={identifier.value}
                  isRegex={identifier.isRegex}
                  options={this.props.data}
                  removeIdentifier={this.removeIdentifier}
                  updateIdentifiers={this.updateIdentifiers}
                />
              }
            }
          )
          }
          <form>
              <div className="form">
                <button type="button" className="btn btn-success btn-sm" onClick={this.onAddIdentifier}>Add Identifier</button>
              </div>
          </form>
        </div>
      )
    }
  }
}

export default IdentifierInputBox