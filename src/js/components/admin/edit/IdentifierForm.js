import React, { Component } from "react"

import IndentifierInput from './IndentifierInput'

class IdentifierForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="mb-4">
        {
          this.props.identifiers.map((identifier, index) => {
            if (identifier.type === this.props.type) {
              return <IndentifierInput
                key={index}
                id={index}
                type={identifier.type}
                tableIndex={identifier.tableIndex}
                lineNumber={identifier.lineNumber}
                metadataKey={identifier.metadataKey}
                headerKey={identifier.headerKey}
                value={identifier.value}
                isRegex={identifier.isRegex}
                options={this.props.data}
                removeIdentifier={this.props.removeIdentifier}
                updateIdentifier={this.props.updateIdentifier}
              />
            }
          }
        )
        }
        <form>
            <div className="form">
              <button type="button" className="btn btn-success btn-sm" onClick={event => this.props.addIdentifier(this.props.type)}>
                Add Identifier
              </button>
            </div>
        </form>
      </div>
    )
  }
}

export default IdentifierForm