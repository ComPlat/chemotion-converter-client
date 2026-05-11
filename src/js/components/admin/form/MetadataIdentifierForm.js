import React, {useState} from "react"
import PropTypes from 'prop-types';
import {Button, Collapse, ListGroup} from 'react-bootstrap';

import { MetadataIdentifierInput } from './IdentifierInput';
import IdentifierHeader from './IdentifierHeader';


function MetadataIdentifierForm({
                          label, type, optional, identifiers, fileMetadataOptions,
                          tableMetadataOptions, inputTables, outputTables, dataset,
                          addIdentifier, updateIdentifier, removeIdentifier,
                          addIdentifierOperation, updateIdentifierOperation,
                           removeIdentifierOperation, updateIdentifierOntology, updateRegex
                        }) {
  const toggleIdentifier = (index) => {
    updateIdentifier(index, {show: !identifiers[index].show})
  }
  const [hovered, setHovered] = useState(-1);

  const isRelevantIdentifier = (identifier) => (identifier.type === type && identifier.optional === optional && identifier.editable)
  const hasIdentifiers = identifiers.some(isRelevantIdentifier)

  return (
    <div className="mb-3">
      <div className="fw-bold">{label}</div>
      {hasIdentifiers && (
        <ListGroup>
          {identifiers.map((identifier, index) => (
            isRelevantIdentifier(identifier) && (
              <ListGroup.Item key={index}
                              onMouseEnter={() => setHovered(index)}
                              onMouseLeave={() => setHovered(-1)}>
                <IdentifierHeader
                  identifier={identifier}
                  show={identifier.show}
                  onToggle={() => toggleIdentifier(index)}
                  onRemove={() => removeIdentifier(index)}
                />
                <Collapse in={identifier.show || hovered === index}>
                  <div>
                    <MetadataIdentifierInput
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
                      updateIdentifierOntology={updateIdentifierOntology}
                      removeIdentifierOperation={removeIdentifierOperation}
                      updateRegex={updateRegex}
                      addIdentifierOperation={addIdentifierOperation}
                    />
                  </div>
                </Collapse>
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

MetadataIdentifierForm.propTypes = {
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
  removeIdentifierOperation: PropTypes.func,
  updateIdentifierOntology: PropTypes.func,
  updateRegex: PropTypes.func
}

export default MetadataIdentifierForm
