import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Button, ListGroup } from 'react-bootstrap';

import IdentifierInput from './IdentifierInput'
import IdentifierHeader from './IdentifierHeader'

class IdentifierForm extends Component {

  render() {
    const {
      label, type, optional, identifiers, fileMetadataOptions,
      tableMetadataOptions, inputTables, outputTables, dataset,
      addIdentifier, updateIdentifier, removeIdentifier,
      addIdentifierOperation, updateIdentifierOperation, removeIdentifierOperation
    } = this.props

    const toggleIdentifier = (index) => {
      updateIdentifier(index, { show: !identifiers[index].show})
    }

    const isRelevantIdentifier = (identifier) => (identifier.type === type && identifier.optional == optional)
    const hasIdentifiers = identifiers.some(isRelevantIdentifier)

    return (
      <div className="mb-3">
        <div className="fw-bold">{label}</div>
        {hasIdentifiers && (
          <ListGroup>
            {identifiers.map((identifier, index) => (
              isRelevantIdentifier(identifier) && (
                <ListGroup.Item key={index}>
                  <IdentifierHeader
                    identifier={identifier}
                    show={identifier.show}
                    onToggle={() => toggleIdentifier(index)}
                    onRemove={() => removeIdentifier(index)}
                  />
                  {identifier.show && (
                    <>
                      <IdentifierInput
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
                      {identifier.optional && (
                        <Button
                          className="mt-1"
                          variant="success"
                          size="sm"
                          onClick={() => addIdentifierOperation(index)}
                        >
                          Add scalar operation
                        </Button>
                      )}
                    </>
                  )}
                </ListGroup.Item>
              )
            ))}
          </ListGroup>
        )}

        <Button
          className="mt-1"
          variant="success"
          size="sm"
          onClick={() => addIdentifier(type, optional)}
        >
          {optional ? 'Add metadata' : 'Add Identifier'}
        </Button>
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
