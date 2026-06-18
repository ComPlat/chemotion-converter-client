import React, {} from "react"
import PropTypes from 'prop-types';
import {Button, ListGroup} from 'react-bootstrap';

import { IdentifierInput } from './IdentifierInput'
import IdentifierWithHeader from './IdentifierHeader'


function IdentifierForm({
                          label, type, identifiers,
                          addIdentifier, updateIdentifier, removeIdentifier
                        }) {
  const optional = false;

  const isRelevantIdentifier = (identifier) => (identifier.type === type && identifier.optional === optional && identifier.editable)
  const hasIdentifiers = identifiers.some(isRelevantIdentifier)

  return (
    <div className="mb-3">
      <div className="fw-bold">{label}</div>
      {hasIdentifiers && (
        <ListGroup>
          {identifiers.map((identifier, index) => (
            isRelevantIdentifier(identifier) && ( <IdentifierWithHeader
                key={index}
                identifier={identifier}
                index={index}
                removeIdentifier={removeIdentifier}
                identifierInputTag={
                  <IdentifierInput
                    index={index}
                    identifier={identifier}
                    updateIdentifier={updateIdentifier}
                  />}/>
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
  addIdentifier: PropTypes.func,
  updateIdentifier: PropTypes.func,
  removeIdentifier: PropTypes.func
}

export default IdentifierForm
