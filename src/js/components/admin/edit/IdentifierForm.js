import React, { Component } from "react"

import IdentifierInput from './IdentifierInput'

class IdentifierForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { label, type, optional, identifiers, tableData, tables,
            addIdentifier, updateIdentifier, removeIdentifier } = this.props
    return (
      <div className="mb-20">
        <label>{label}</label>
        {
          identifiers.map((identifier, index) => {
            if (identifier.type === type && identifier.optional == optional) {
              return <IdentifierInput
                key={index}
                index={index}
                optional={optional}
                identifier={identifier}
                tableData={tableData}
                tables={tables}
                removeIdentifier={removeIdentifier}
                updateIdentifier={updateIdentifier}
              />
            }
          })
        }
        <form>
            <div className="form">
              <button type="button" className="btn btn-success btn-sm" onClick={event => addIdentifier(type, optional)}>
                {optional ? 'Add metadata' : 'Add Identifier'}
              </button>
            </div>
        </form>
      </div>
    )
  }
}

export default IdentifierForm
