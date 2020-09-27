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
      <div className="pb-5">
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
        <form>
            <div className="form pt-3">
              <button type="button" className="btn btn-success btn-sm" onClick={this.onAddIdentifier}>Add Identifier</button>
            </div>
        </form>
      </div>
    )
  }
}

export default IdentifierInputBox