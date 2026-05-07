import React, {useEffect, useState} from "react"
import PropTypes from 'prop-types';
import {Button, Collapse, ListGroup} from 'react-bootstrap';

import { IdentifierInput } from './IdentifierInput'
import IdentifierHeader from './IdentifierHeader'


function IdentifierForm({
                          label, type, identifiers, fileMetadataOptions,
                          tableMetadataOptions, inputTables,
                          addIdentifier, updateIdentifier, removeIdentifier
                        }) {
  const optional = false;
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
                    <IdentifierInput
                      index={index}
                      identifier={identifier}
                      fileMetadataOptions={fileMetadataOptions}
                      tableMetadataOptions={tableMetadataOptions}
                      inputTables={inputTables}
                      updateIdentifier={updateIdentifier}
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

IdentifierForm.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  identifiers: PropTypes.array,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,
  addIdentifier: PropTypes.func,
  updateIdentifier: PropTypes.func,
  removeIdentifier: PropTypes.func
}

export default IdentifierForm
