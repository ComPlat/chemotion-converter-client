import React, {} from "react"
import PropTypes from 'prop-types';
import {Button, ListGroup} from 'react-bootstrap';

import { MetadataIdentifierInput} from './IdentifierInput';
import IdentifierWithHeader from './IdentifierHeader';


function MetadataIdentifierForm({
                                  label, type, optional, identifiers, outputTables, dataset,
                                  addIdentifier, updateIdentifier, removeIdentifier,
                                  addIdentifierOperation, updateIdentifierOperation,
                                  removeIdentifierOperation, updateIdentifierOntology, updateRegex
                                }) {

  const isRelevantIdentifier = (identifier) => (identifier.type === type && identifier.optional === optional && identifier.editable)
  const hasIdentifiers = identifiers.some(isRelevantIdentifier)

  return (
    <div className="mb-3">
      <div className="fw-bold">{label}</div>
      {hasIdentifiers && (
        <ListGroup>
          {identifiers.map((identifier, index) => (
            isRelevantIdentifier(identifier) && (
              <IdentifierWithHeader
                key={index}
                identifier={identifier}
                index={index}
                removeIdentifier={removeIdentifier}
                identifierInputTag={
                  <MetadataIdentifierInput
                    index={index}
                    optional={optional}
                    identifier={identifier}
                    outputTables={outputTables}
                    dataset={dataset}
                    updateIdentifier={updateIdentifier}
                    removeIdentifier={removeIdentifier}
                    updateIdentifierOperation={updateIdentifierOperation}
                    updateIdentifierOntology={updateIdentifierOntology}
                    removeIdentifierOperation={removeIdentifierOperation}
                    updateRegex={updateRegex}
                    addIdentifierOperation={addIdentifierOperation}
                  />}
              />
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

MetadataIdentifierForm.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  optional: PropTypes.bool,
  identifiers: PropTypes.array,
  outputTables: PropTypes.array,
  dataset: PropTypes.object,
  addIdentifier: PropTypes.func,
  updateIdentifier: PropTypes.func,
  removeIdentifier: PropTypes.func,
  addIdentifierOperation: PropTypes.func,
  updateIdentifierOperation: PropTypes.func,
  removeIdentifierOperation: PropTypes.func,
  updateIdentifierOntology: PropTypes.func,
  updateRegex: PropTypes.func
}

export default MetadataIdentifierForm
