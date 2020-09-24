import React, { Component } from "react"
import IdentifierInput from './IdentifierInput'

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
    return (
      <div>
        {
          this.props.identifiers.map((identifier, i) => {
            if (identifier.type === this.props.type) {
              return <IdentifierInput
                key={i}
                id={i}
                type={identifier.type}
                table={identifier.table}
                linenumber={identifier.linenumber}
                metadataKey={identifier.metadataKey}
                value={identifier.value}
                isExact={identifier.isExact}
                isRegex={identifier.isRegex}
                options={this.props.data}
                removeIdentifier={this.removeIdentifier}
                updateIdentifiers={this.updateIdentifiers}
              />
            }
          }
          )
        }
        <div className="row justify-content-center pt-3">
          <form>
            <button type="button" className="btn btn-primary" onClick={this.onAddIdentifier}>Add Identifier</button>
          </form>
        </div>
      </div>
    )
  }
}

export default IdentifierInputBox