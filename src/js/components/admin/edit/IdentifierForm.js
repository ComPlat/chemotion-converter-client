import React, { Component } from "react"

import IndentifierInput from './IndentifierInput'

class IdentifierForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { type, identifiers, tableData, tables, addIdentifier, updateIdentifier, removeIdentifier } = this.props

    return (
      <div className="mb-4">
        {
          this.props.identifiers.map((identifier, index) => {
            if (identifier.type === type) {
              return <IndentifierInput
                key={index}
                index={index}
                type={type}
                identifier={identifier}
                tables={tables}
                removeIdentifier={removeIdentifier}
                updateIdentifier={updateIdentifier}
              />
            }
          }
        )
        }
        <form>
            <div className="form">
              <button type="button" className="btn btn-success btn-sm"
                      onClick={event => addIdentifier(this.props.type)}>
                Add Identifier
              </button>
            </div>
        </form>
      </div>
    )
  }
}

export default IdentifierForm