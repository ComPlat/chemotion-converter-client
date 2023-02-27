import React, { Component } from "react"
import PropTypes from 'prop-types';

import IdentifierInput from './IdentifierInput'
import IdentifierHeader from './IdentifierHeader'

class IdentifierForm extends Component {

  render() {
    const { label, type, optional, identifiers, fileMetadataOptions,
            tableMetadataOptions, inputTables, outputTables, dataset,
            addIdentifier, updateIdentifier, removeIdentifier,
            addIdentifierOperation, updateIdentifierOperation, removeIdentifierOperation } = this.props

    const toggleIdentifier = (index) => {
      updateIdentifier(index, { show: !identifiers[index].show})
    }

    const hasIdentifiers = identifiers.some(identifier => (identifier.type === type && identifier.optional === optional))

      return (
      <div className="mb-10">
        <label>{label}</label>
        {
          hasIdentifiers &&
          <ul className="list-group mb-10">
            {
              identifiers.map((identifier, index) => {
                if (identifier.type === type && identifier.optional == optional) {
                  if (identifier.show) {
                    return (
                      <li className="list-group-item" key={index}>
                        <IdentifierHeader
                          identifier={identifier}
                          show={true}
                          onToggle={() => toggleIdentifier(index)}
                          onRemove={() => removeIdentifier(index)}
                        />
                        <IdentifierInput
                          key={index}
                          index={index}
                          optional={optional}
                          identifier={identifier}
                          fileMetadataOptions={fileMetadataOptions}
                          tableMetadataOptions={tableMetadataOptions}
                          inputTables={inputTables}
                          outputTables={outputTables}
                          dataset={dataset}
                          updateIdentifier={updateIdentifier}
                          removeIdentifier={removeIdentifier}
                          updateIdentifierOperation={updateIdentifierOperation}
                          removeIdentifierOperation={removeIdentifierOperation}
                        />
                        {
                          identifier.optional &&
                          <div className="mb-10">
                            <button type="button" className="btn btn-success btn-xs" onClick={event => addIdentifierOperation(index)}>
                              Add scalar operation
                            </button>
                          </div>
                        }
                      </li>
                    )
                  } else {
                    return (
                      <li key={index} className="list-group-item">
                        <IdentifierHeader
                          identifier={identifier}
                          show={false}
                          onToggle={() => toggleIdentifier(index)}
                          onRemove={() => removeIdentifier(index)}
                        />
                      </li>
                    )
                  }
                }
              })
            }
          </ul>
        }
        <form>
            <div className="form">
              <button type="button" className="btn btn-success btn-xs" onClick={event => addIdentifier(type, optional)}>
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
  removeIdentifier: PropTypes.func,
  addIdentifierOperation: PropTypes.func,
  updateIdentifierOperation: PropTypes.func,
  removeIdentifierOperation: PropTypes.func
}

export default IdentifierForm
