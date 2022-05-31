import React, { Component } from "react"
import PropTypes from 'prop-types';

import IdentifierInput from './IdentifierInput'

class IdentifierForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { label, type, optional, identifiers, fileMetadataOptions,
            tableMetadataOptions, inputTables, outputTables, dataset,
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
                fileMetadataOptions={fileMetadataOptions}
                tableMetadataOptions={tableMetadataOptions}
                inputTables={inputTables}
                outputTables={outputTables}
                dataset={dataset}
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

IdentifierForm.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  optional: PropTypes.bool,
  identifiers: PropTypes.array,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,
  outputTables: PropTypes.array,
  dataset: PropTypes.object,
  addIdentifier: PropTypes.func,
  updateIdentifier: PropTypes.func,
  removeIdentifier: PropTypes.func
}

export default IdentifierForm
